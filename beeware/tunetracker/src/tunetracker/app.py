"""
Tune Tracker
"""
from types import NoneType
from typing import Any, List
import toga
from toga.sources.list_source import ListSource, Row
from toga.style.pack import Pack
from toga.style.pack import COLUMN, HIDDEN, ROW, VISIBLE

import json
import csv
from datetime import date

from fuzzywuzzy import fuzz

from pathlib import Path

#TODO: Make code readable, make interface more legible, add search functionality

type_dict = {
                    "title" : str,
                    "alternative_title" : str,
                    "composers" : List[str],
                    "form" : str,
                    "notable_recordings" : List[str],
                    "keys" : List[str],
                    "styles" : List[str],
                    "tempi" : List[int],
                    "contrafacts" : List[str],
                    "playthroughs" : int,
                    "form_confidence" : int,
                    "melody_confidence" : int,
                    "solo_confidence" : int,
                    "lyrics_confidence" : int,
                    "played_at" : List[str],
        }

class TuneTracker(toga.App):

    def startup(self):
        self.default_tune = {
                    "title" : "unknown",
                    "alternative_title" : "unknown",
                    "composers" : [],
                    "form" : "unknown",
                    "notable_recordings" : [],
                    "keys" : [],
                    "styles" : [],
                    "tempi" : [],
                    "contrafacts" : [],
                    "playthroughs" : 0,
                    "form_confidence" : -1,
                    "melody_confidence" : -1,
                    "solo_confidence" : -1,
                    "lyrics_confidence" : -1,
                    "played_at" : [],
                    }
        self.miniedit_keys = {
                    "form_confidence" : -1,
                    "melody_confidence" : -1,
                    "solo_confidence" : -1,
                    "lyrics_confidence" : -1,
                }
        """
        Construct and show the Toga application.

        Usually, you would add your application to a main content box.
        We then create a main window (with a name matching the app), and
        show the main window.
        """
        self.current_tune = {}
        self.unchecked_icon = toga.Icon("./resources/unchecked-mark.png")
        self.open_files()
        self._init_tune_dlist()
        self._init_editor()
        self._init_miniedit()
        self._init_slist()

        self.main_window = toga.MainWindow(title=self.formal_name)
        self.main_window : toga.MainWindow
        self.main_window.content = self.main_box
        self.main_window.show()
        return self.main_window
    
    

        
    def _init_tune_dlist(self, sort_key="title", search=""):
        self._subtitle_key = "composers"
        self.main_box = toga.Box(style=Pack(direction="column"))
        selection_items = self._prettify(list(self.default_tune.keys()))
        self.selection = toga.Selection("sort_key_selection", items = selection_items, on_change=self._sort_key_selection_handler)
        source = TunelistSource(accessors=["icon", "title", "subtitle"], data=self.tunelist)
        source.set_subtitle_key("title")
        self.tune_dlist = toga.DetailedList(
                style=Pack(flex=1),
                on_select = self._tune_dlist_selection_handler,
                data=source,
                primary_action="Delete (PERMANENT!)",
                on_primary_action=self._are_you_sure,
                secondary_action="Edit",
                on_secondary_action=self._edit_handler)
        #self.tune_dlist = toga.DetailedList(data=self.tunelist, accessors=("title", "composers", "icon"), on_select=self._tune_dlist_selection_handler, missing_value="oops") #Size is explicit because of quirk of toga
        bottom_box = toga.Box(style=Pack(direction="row"))
        obj_list = [
            self.selection,
            toga.TextInput(id="search_input", placeholder="Search", on_change=self.__search_handler__),
            self.tune_dlist,
        ]
        for obj in obj_list:
            self.main_box.add(obj)
        bottom_box_obj_list = [
            toga.Button("I Just Played This!", on_press=self._played_handler, style=Pack(flex=2)),
            #toga.Button("Edit Tune", on_press=self._edit_handler)
            toga.Button("Import tune from JazzStandards.com", on_press=self.switch_to_standards, style=Pack(flex=1)),
            toga.Button("Add Empty Tune", on_press=self._new_tune_handler, style=Pack(flex=2)),
            #toga.Button("Delete Tune (Permenant!)", on_press=self._delete_selected_handler),
                ]
        for obj in bottom_box_obj_list:
            bottom_box.add(obj)
        self.main_box.add(bottom_box)
        self.sort_tunelist(search)
    def _init_editor(self):
        self.editor= toga.ScrollContainer(style=Pack(padding=80))
        self.editor_contents = toga.Box(style=Pack(direction="column"))
        self.editor_contents.add(toga.Label("*: List format supported. Separate with a comma and space."))
        for key, val in self.default_tune.items():
            title = key.title()
            title = title.replace("_", " ")
            if type(val) == list:
                l = toga.Label("*"+title, id=key+"_label")
            else:
                l = toga.Label(title, id=key+"_label")
            self.editor_contents.add(l)
            if type(val) == int:
                if key.endswith("confidence"):
                    i = toga.Slider(id=key+"_ninput", min=-1, max=100)
                else:
                    i = toga.NumberInput(id=key+"_ninput")
            else:
                i = toga.TextInput(id=key+"_tinput")
            self.editor_contents.add(i)
        bottom_box = toga.Box(style=Pack(direction="row"))
        bottom_box.add(toga.Button(text="Cancel edits", id="cancel_btn", on_press=self.switch_to_tunelist, style=Pack(flex=1)))
        bottom_box.add(toga.Button(text="Confirm edits", id="confirm_btn", on_press=self.switch_to_tunelist, style=Pack(flex=1)))
        self.editor_contents.add(bottom_box)
        self.editor.content = self.editor_contents
    def _init_slist(self):
        self.sl_box = toga.Box(style=Pack(direction="column"))
        self.sl_data = []
        self.sort_standards()
#         self.prepare_standards()
        source = StandardslistSource(accessors=["icon", "title", "subtitle"], data=self.all_standards)
        self.standards_list = toga.DetailedList(data=source, style=Pack(flex=1))
        self.sl_box.add(self.standards_list)
        bottom_box = toga.Box(style=Pack(direction="row"))
        bottom_box.add(toga.Button(text="Cancel import", id="cancel_btn", on_press=self.switch_to_tunelist, style=Pack(flex=1)))
        bottom_box.add(toga.Button(text="Import standard", id="import_confirm_btn", on_press=self._import_standard_handler, style=Pack(flex=1)))
        self.sl_box.add(bottom_box)
    def _init_miniedit(self):
        self.minieditor = toga.ScrollContainer(style=Pack(padding=80))
        self.miniedit_contents = toga.Box(style=Pack(direction="column"))

        # Assume all keys correspond to confidence.
        for key, val in self.miniedit_keys.items():
            title = key.title()
            title = title.replace("_", " ")
            l = toga.Label(title, id=key+"_label")
            self.miniedit_contents.add(l)
            i = toga.Slider(id=key+"_ninput", min=-1, max=100)
            self.miniedit_contents.add(i)
        bottom_box = toga.Box(style=Pack(direction="row"))
        bottom_box.add(toga.Button(text="Confirm edits", id="mini_confirm_btn", on_press=self.switch_to_tunelist))
        bottom_box.add(toga.Button(text="Cancel edits", id="cancel_btn", on_press=self.switch_to_tunelist))
        self.miniedit_contents.add(bottom_box)
        self.minieditor.content = self.miniedit_contents


    def _prettify(self, data):
        if type(data) == list:
            self.miniedit_data = []
            for i in range(len(data)):
                data[i] = data[i].replace("_", " ")
                data[i] = data[i].title()
        else:
            data = data.replace("_", " ")
            data = data.title()
        return data
    def update_editor_contents(self, tune):
        content = self.editor_contents
        for child in content.children:
            if child.id.endswith("input"):
                if child.id.endswith("_tinput"):
                    key = child.id.removesuffix("_tinput")
                    try:
                        val = tune[key]
                        if type(val) == list:
                            val = ", ".join(val)
                        child.value = val
                    except:
                        child.value = ""
                else:
                    key = child.id.removesuffix("_ninput")
                    try:
                        child.value = tune[key]
                    except:
                        child.value = -1
    def update_minieditor(self, tune):
        content = self.miniedit_contents
        for child in content.children:
            if child.id.endswith("input"):
                key = child.id.removesuffix("_ninput")
                try:
                    child.value = tune[key]
                except:
                    child.value = -1
    def _sort_key_selection_handler(self, widget):
        value = widget.value
        value = value.lower()
        value = value.replace(" ", "_")
        self._subtitle_key = value
        getattr(self.tune_dlist.data, "set_subtitle_key")(value)
        #print("Sorting by {}".format(value))
        #self.sort_tunelist()
    def _tune_dlist_selection_handler(self, widget):
        if self.tune_dlist.selection:
            self.current_tune = getattr(self.tune_dlist.selection, "tune")

    def sort_standards(self, sort_key = "Title", search=""):
        pass
        #self.all_standards.sort(key = lambda st: st[sort_key])
    def sort_tunelist(self, search=""):
        getattr(self.tune_dlist.data, "sort")(search)
    def prepare_standards(self, subtitle_key="Title"):
        self.sl_data.clear()
        for standard in self.all_standards:
            row = {}
            row["title"] = standard["Title"]
            row["subtitle"] = standard["Composer(s)"]
            row["standard"] = standard
            row["icon"] = None
            self.sl_data.append(row)
    def _import_standard_handler(self, widget: toga.Button, **kwargs):
        standard = getattr(self.standards_list.selection, "standard")
        tune = self.convert_std_to_tune(standard)
        self.update_editor_contents(tune)
        self.switch_to_editor(None)

    def _new_tune_handler(self, widget: toga.Button, **kwargs):
        new_tune = {}
        self.tunelist.append(new_tune)
        new_row = getattr(self.tune_dlist.data, "prepend_new")(new_tune)
        if type(widget) == toga.Button:
            self.tune_dlist.scroll_to_top()
        return new_row
    def convert_std_to_tune(self, std):
        tune_conversion = {}
        tune_conversion["title"] = std["Title"]
        tune_conversion["composers"] = std["Composer(s)"]
        return tune_conversion
    def update_tune(self, content):
        #content = self.editor_contents
        for child in content.children:
            if child.id.endswith("input"):
                key = child.id.removesuffix("_tinput")
                key = key.removesuffix("_ninput")
                val = child.value
                if val != "" and val != "unknown" and val != "-1":
                    if type(self.default_tune[key]) == list:
                        self.current_tune[key] = val.split(", ")
                    elif type(self.default_tune[key]) == int:
                        self.current_tune[key] = int(val)
                    else:
                        self.current_tune[key] = val
                    if val == "title":
                        setattr(self.tune_dlist.selection, "title", self.current_tune["title"])
                    if val == self._subtitle_key:
                        setattr(self.tune_dlist.selection, "subtitle", self.current_tune[self._subtitle_key])
                    self.tune_dlist.data.notify("change", item=self.tune_dlist.selection)
                else:
                    if key in self.current_tune:
                        self.current_tune.pop(key)
        if "title" not in self.current_tune:
            setattr(self.tune_dlist.selection, "title", "(No title supplied!)")
        else:
            setattr(self.tune_dlist.selection, "title", self.current_tune["title"])
        if self._subtitle_key not in self.current_tune:
            setattr(self.tune_dlist.selection, "subtitle", "(No " + self._subtitle_key + " supplied!)")
        else:
            if isinstance(self.current_tune[self._subtitle_key], list):
                setattr(self.tune_dlist.selection, "subtitle", ", ".join(self.current_tune[self._subtitle_key]))
            else:
                setattr(self.tune_dlist.selection, "subtitle", self.current_tune[self._subtitle_key])
        self.save()
    def _delete_selected_handler(self, widget: toga.Button, **kwargs):
        row = self.tune_dlist.selection
        print("Deleting " + str(self.tunelist.remove(getattr(row, "tune"))))
        if row:
            self.tune_dlist.data.remove(row)
            self.save()
    def __search_handler__(self, widget):
        self.sort_tunelist(search=widget.value)
    def _played_handler(self, widget: toga.Button, **kwargs):
        if self.tune_dlist.selection:
            date_str = date.today().isoformat()
            if "played_at" in self.current_tune and self.current_tune["played_at"] != [] and self.current_tune["played_at"][0] == date_str:
                print("unplaying")
                self.tune_dlist.selection.icon = toga.Icon("./resources/unchecked-mark.png")
                self.current_tune["played_at"].pop()
                self.current_tune["playthroughs"] = int(self.current_tune["playthroughs"]) - 1
                print(self.current_tune)
                self.sort_tunelist()
            elif "played_at" not in self.current_tune or self.current_tune["played_at"] == []:
                self.tune_dlist.selection.icon = toga.Icon("./resources/check-mark.png")
                self.current_tune["played_at"] = []
                self.current_tune["played_at"].append(date_str)
                if "playthoughs" in self.current_tune:
                    self.current_tune["playthroughs"] = int(self.current_tune["playthroughs"]) + 1
                else:
                    self.current_tune["playthroughs"] = 1
                self._miniedit_handler(None)
            else:
                self.tune_dlist.selection.icon = toga.Icon("./resources/check-mark.png")
                if self.current_tune["played_at"][0] != date_str:
                    self.current_tune["played_at"].insert(0,date_str)
                    self.current_tune["playthroughs"] = int(self.current_tune["playthroughs"]) + 1
                self._miniedit_handler(None)
        self.save()
    def _edit_handler(self, widget: toga.Button, **kwargs):
        self.switch_to_editor(None)
        self.update_editor_contents(self.current_tune)
    def _miniedit_handler(self, widget, **kwargs):
        self.switch_to_minieditor(None)
        self.update_minieditor(self.current_tune)
    def switch_to_editor(self, widget, **kwargs):
        print(self.current_tune)
        self.main_window.content = self.editor
    def switch_to_minieditor(self, widget, **kwargs):
        self.main_window.content = self.minieditor
    def switch_to_tunelist(self, widget: toga.Button, **kwargs):
        if widget.id == "confirm_btn":
            self.update_tune(self.editor_contents)
        elif widget.id == "mini_confirm_btn":
            self.update_tune(self.miniedit_contents)
        elif widget.id == "confirm_delete_btn":
            self._delete_selected_handler(widget)
        self.main_window.content = self.main_box
        self.sort_tunelist()
    def switch_to_standards(self, widget: toga.Button, **kwargs):
        self.main_window.content = self.sl_box
    # Replaces Tune-List with "Are you sure you want to delete?"
    def _are_you_sure(self, widget, **kwargs):
        box = toga.Box(style=Pack(direction="column"))
        title = self.current_tune.get("title", "this untitled song")
        obj_list = [
            toga.Label("Are you sure you want to delete {}? This is permanent!"
                       .format(title)),
            toga.Button(text="Yes, delete {}!".format(title), id="confirm_delete_btn", on_press=self.switch_to_tunelist),
            toga.Button(text="Cancel".format(title), id=("cancel_btn"), on_press=self.switch_to_tunelist)
        ]
        for obj in obj_list:
            box.add(obj)
        self.main_window.content = box
    def open_files(self):
        src = Path(__file__).resolve()
        src_dir = src.parent
        with open(src_dir / "./resources/songs.json", "r+") as f:
            self.tunelist = json.load(f)
            self.tunelist: list[dict]
        with open(src_dir / "./resources/JazzStandards.csv", "r") as standards_file:
            self.all_standards = sorted(list(csv.DictReader(standards_file)), key=lambda tn: tn["Title"])
    def save(self):
#        print("Save disabled")
         try:
             src = Path(__file__).resolve()
             src_dir = src.parent
             with open(src_dir / "./resources/songs.json", "w") as f:
                 json.dump(self.tunelist, f)
                 print("Wrote to ./songs.json")

         except:
             print("Write failed")

         print(self.tunelist)



class TunelistSource(ListSource):
    def __init__(self, accessors: list[str], data: list[Any] | None = None, subtitle_key="title"):
        self.subtitle_key = subtitle_key
        super().__init__(accessors=accessors, data=data)
    def prepend_new(self, tune):
        self.insert(0, tune)
    def _create_row(self, data: Any):
        if isinstance(data, dict):
        # Transform TUNE (with name data) into row data, then continue with original function

            data = self._data_to_row(data)
            super()._create_row(data)
        #Lifted directly from ListSource. but super()._create_row breaks for some reason.
        if isinstance(data, dict):
            row = Row(**data)
        elif hasattr(data, "__iter__") and not isinstance(data, str):
            row = Row(**dict(zip(self._accessors, data)))
        else:
            row = Row(**{self._accessors[0]: data})
        row._source = self
        return row
    def _data_to_row(self, tune: dict):
        if "title" in tune:
            title = tune["title"]
        else:
            title = "(No title supplied!)"
        if self.subtitle_key in tune and tune[self.subtitle_key] != []:
            if isinstance(tune[self.subtitle_key], list):
                subtitle = ", ".join(tune[self.subtitle_key])
            else:
                subtitle = tune[self.subtitle_key]
        else:
            subtitle = "(No " + self.subtitle_key + " provided!)"
        if "played_at" in tune and tune["played_at"] != [] and tune["played_at"][0] == date.today().isoformat():
            icon = toga.Icon("./resources/check-mark.png")
            print(tune)
        else:
            icon = toga.Icon("./resources/unchecked-mark.png")
        return {"title": title,
               "subtitle": subtitle,
               "tune": tune,
               "icon": icon
               } 
    def set_subtitle_key(self, sub_key):
        self.subtitle_key = sub_key
#        self._accessors[2] = sub_key
        #Ignore subtitle key for title.
        print(sub_key)
        if sub_key == "title":
            sub_key = "composers"
#            self.subtitle_key = "composers"
#            self._accessors[2] = "composers"
        for row in self._data:
            if sub_key in row.tune:
                value = row.tune[sub_key]
                if isinstance(value, list):
                    row.subtitle = ", ".join(row.tune[sub_key])
                elif isinstance(value, int):
                   row.subtitle = str(row.tune[sub_key])
                else:
                   row.subtitle = row.tune[sub_key]
            else:
                row.subtitle = "No " + sub_key + " provided!"
            self.notify("change", item=row)
        self.sort()
    def _row_is_sortable(self, row):
        return (self.subtitle_key in getattr(row, "tune")) and (getattr(row, "tune")[self.subtitle_key] != [])
#   def _swap(self, left, right):
#       self._data[left], self._data[right] = self._data[right], self._data[left]
#       self.notify("change", item=self._data[left])
#       self.notify("change", item=self._data[right])
        #self.notify("insert", index=left, item=self[left])
#       self.notify("remove", index=left, item=self[right])
#       self.notify("insert", index=left, item=self[left])
#       self.notify("remove", index=right, item=self[right])
#       self.notify("insert", index=left, item=self[left])
    def sort(self, search=""):
        #print("Sorting by {}:".format(self.subtitle_key))
        #self._quicksort(0, len(self) - 1, self.subtitle_key)
        search = search.lower()
        values_for_sorting = [row for row in self._data if self._row_is_sortable(row)]
        end_values = [row for row in self._data if self.subtitle_key if not self._row_is_sortable(row)]
        if search == "":
            if type_dict[self.subtitle_key] is str:
                self._data = sorted(values_for_sorting, key=lambda row: getattr(row,"tune").get(self.subtitle_key, "{Missing}").lower())
            elif type_dict[self.subtitle_key] is List[str]:
                self._data = sorted(values_for_sorting, key=lambda row: getattr(row,"tune").get(self.subtitle_key, ["{Missing}"])[0].lower())
            elif type_dict[self.subtitle_key] is List[int]:
                self._data = sorted(values_for_sorting, key=lambda row: int(getattr(row,"tune").get(self.subtitle_key, [-1])[0]))
            elif type_dict[self.subtitle_key] is int:
                self._data = sorted(values_for_sorting, key=lambda row: int(getattr(row,"tune").get(self.subtitle_key, "{Missing}")))
            self._data.extend(end_values)
        else:
            if type_dict[self.subtitle_key] is str:
                self._data = sorted(values_for_sorting, key=lambda row: fuzz.partial_ratio(getattr(row,"tune").get(self.subtitle_key, "{Missing}").lower(), search), reverse=True)
            elif type_dict[self.subtitle_key] is List[str]:
                self._data = sorted(values_for_sorting, key=lambda row: fuzz.partial_ratio(getattr(row,"tune").get(self.subtitle_key, ["{Missing}"])[0].lower(), search), reverse=True)
            elif type_dict[self.subtitle_key] is List[int]:
                self._data = sorted(values_for_sorting, key=lambda row: int(getattr(row,"tune").get(self.subtitle_key, [-1])[0]))
            elif type_dict[self.subtitle_key] is int:
                self._data = sorted(values_for_sorting, key=lambda row: int(getattr(row,"tune").get(self.subtitle_key, "{Missing}")))
        self.notify("clear")
        for i, row in enumerate(self._data):
            #print(getattr(row, "title"))
            self.notify("insert", index=i, item=row)
        #values_for_sorting = [row for row in self._data if self._row_is_sortable(row)]
        #end_values = [row for row in self._data if self.subtitle_key if not self._row_is_sortable(row)]
        #if search == "":
        #    values_for_sorting.sort(key=lambda row: getattr(row, "tune")[self.subtitle_key])
        #else:
        #    values_for_sorting.sort(key=lambda row: fuzz.partial_ratio(getattr(row, "tune")[self.subtitle_key], search), reverse=True)
        #values_for_sorting.extend(end_values)
        #self._data = values_for_sorting
        #tmp = zip(range(len(self._data)), self._data)
   #def _quicksort(self, start:int, end:int, attr:str):
   #    # Sorts based on attribute, or based on search relevance.
   #    if end - start < 2:
   #        return
   #    pivot = start + ( (end - start) // 2)
   #    left = start
   #    right = end
   #    while left < right:
   #        #If there's no left attribute, immediately swap left and right.
   #        while not hasattr(self._data[left], attr):
   #            if left > right:
   #                return
   #            self._swap(left, right)
   #            left += 1
   #            right -= 1
   #        #print(left)
   #        left_attr = getattr(self._data[left], attr)

   #        #If there's no right attribute, just move the right "pointer" left.
   #        while not hasattr(self._data[right], attr):
   #            if left > right:
   #                return
   #            right -= 1
   #        right_attr = getattr(self._data[right], attr)
   #        
   #        #If there's no pivot, swap pivot and right.
   #        if not hasattr(self._data[pivot], attr):
   #            self._swap(pivot, right)
   #            right -= 1
   #        pivot_attr = getattr(self[pivot], attr)

   #        if left_attr < pivot_attr:
   #            left += 1
   #        elif right_attr > pivot_attr:
   #            right -= 1
   #        elif left_attr > pivot_attr and right_attr < pivot_attr:
   #            self._swap(left, right)
   #            left += 1
   #            right -= 1
   #        elif left_attr == pivot_attr:
   #            right -= 1
   #        elif right_attr == pivot_attr:
   #            right -= 1
            
    #       print("while iter end, left={}, right={}".format(left, right))
    #       if hasattr(self._data[left], attr) and hasattr(self._data[right], attr):
    #           print(getattr(self._data[left], attr))
    #           print(getattr(self._data[right], attr))
    #           print(getattr(self._data[pivot], attr))
    #   self._quicksort(start, pivot, attr)
    #   self._quicksort(pivot + 1, end, attr)


class StandardslistSource(TunelistSource):
    def __init__(self, accessors: list[str], data: list[Any] | None = None, subtitle_key="Title"):
        #Just changing the default subtitle key from composers to Composer(s)
        super().__init__(accessors=accessors, data=data, subtitle_key=subtitle_key)
    def _data_to_row(self, standard: dict):
        title = standard["Title"]
        if self.subtitle_key in standard and standard[self.subtitle_key] != []:
            subtitle = standard[self.subtitle_key]
        else:
            subtitle = "(No " + self.subtitle_key + " provided!)"
        return {"title": title,
               "subtitle": subtitle,
               "standard": standard,
               "icon": None
               }
    def set_subtitle_key(self, sub_key):
        self.subtitle_key = sub_key
        #Ignore subtitle key for title.
        if sub_key == "Title":
            sub_key = "Composer(s)"
        for row in self._data:
            if sub_key in row.standard:
                value = row.standard[sub_key]
                row.subtitle = str(row.standard[sub_key])
            else:
                row.subtitle = "No " + sub_key + " provided!"
        self.sort()






def main():
    return TuneTracker()


