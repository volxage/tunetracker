"""
My first application
"""
from types import NoneType
from typing import Any
import toga
from toga.sources.list_source import ListSource, Row
from toga.style.pack import Pack
from toga.style.pack import COLUMN, HIDDEN, ROW, VISIBLE

import json
import csv
from datetime import date

from fuzzywuzzy import fuzz

from pathlib import Path


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
        source = TunelistSource(accessors=["icon", "title", "composers"], data=self.tunelist)
        self.tune_dlist = toga.DetailedList(style=Pack(width=400, height=400), data=source, on_select=self._tune_dlist_selection_handler) #Size is explicit because of quirk of toga
        #self.tune_dlist = toga.DetailedList(data=self.tunelist, accessors=("title", "composers", "icon"), on_select=self._tune_dlist_selection_handler, missing_value="oops") #Size is explicit because of quirk of toga
        obj_list = [
            self.selection,
            toga.TextInput(id="search_input", placeholder="Search", on_change=self.__search_handler__),
            self.tune_dlist,
            toga.Button("I Just Played This!", on_press=self._played_handler),
            toga.Button("Edit Tune", on_press=self.__edit_handler__),
            toga.Button("Import tune from JazzStandards.com", on_press=self.switch_to_standards),
            toga.Button("Add Empty Tune", on_press=self.new_tune),
            toga.Button("Delete Tune (Permenant!)", on_press=self.delete_selected),
        ]
        for obj in obj_list:
            self.main_box.add(obj)
        self.sort_tunelist(search)
    def _init_editor(self):
        self.editor= toga.ScrollContainer(style=Pack(padding=80))
        self.editor_contents = toga.Box(style=Pack(direction="column"))
        self.editor_contents.add(toga.Label("*: List format supported. Separate with a comma and space."))
        for key, val in self.default_tune.items():
            if key != "icon" and key != "subtitle":
                title = key.title()
                title = title.replace("_", " ")
                if type(val) == list:
                    l = toga.Label("*"+title, id=key+"_label")
                else:
                    l = toga.Label(title, id=key+"_label")
                self.editor_contents.add(l)
                if type(val) == int:
                    if key.endswith("confidence"):
                        i = toga.Slider(id=key+"_ninput", range=(-1, 100))
                    else:
                        i = toga.NumberInput(id=key+"_ninput")
                else:
                    i = toga.TextInput(id=key+"_tinput")
                self.editor_contents.add(i)
        bottom_box = toga.Box(style=Pack(direction="row"))
        bottom_box.add(toga.Button(text="Confirm edits", id="confirm_btn", on_press=self.switch_to_tunelist))
        bottom_box.add(toga.Button(text="Cancel edits", id="cancel_btn", on_press=self.switch_to_tunelist))
        self.editor_contents.add(bottom_box)
        self.editor.content = self.editor_contents
    def _init_slist(self, search=""):
        self.sl_box = toga.Box()
        self.sl_data = []
        self.sort_standards()
#         self.prepare_standards()
        source = StandardslistSource(accessors=["icon", "title", "subtitle"], data=self.all_standards)
        self.standards_list = toga.DetailedList(data=source, style=Pack(width=400, height=400))
        self.sl_box.add(self.standards_list)
        bottom_box = toga.Box(style=Pack(direction="row"))
        bottom_box.add(toga.Button(text="Import standard", id="import_confirm_btn", on_press=self.import_standard))
        bottom_box.add(toga.Button(text="Cancel import", id="import_cancel_btn", on_press=self.switch_to_tunelist))
        self.sl_box.add(bottom_box)
    def _prettify(self, data):
        if type(data) == list:
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
                
    def _sort_key_selection_handler(self, widget):
        value = widget.value
        value = value.lower()
        value = value.replace(" ", "_")
        self._subtitle_key = value
        self.tune_dlist.data.set_subtitle_key(value)
        self.sort_tunelist()

    def sort_standards(self, sort_key = "Title", search=""):
        pass
        #self.all_standards.sort(key = lambda st: st[sort_key])
    def sort_tunelist(self, search=""):
        self.tune_dlist.data.sort(search)
    def prepare_standards(self, subtitle_key="Title"):
        self.sl_data.clear()
        for standard in self.all_standards:
            row = {}
            row["title"] = standard["Title"]
            row["subtitle"] = standard["Composer(s)"]
            row["standard"] = standard
            row["icon"] = None
            self.sl_data.append(row)
    def import_standard(self, widget):
        standard = getattr(self.standards_list.selection, "standard")
        tune = self.convert_std_to_tune(standard)
        self.update_editor_contents(tune)
        self.switch_to_editor(None)
        
        self.current_row = self.new_tune(None)
        self.current_tune = getattr(self.current_row, "tune")

    def new_tune(self, widget):
        new_tune = {}
        self.tunelist.append(new_tune)
        new_row = self.tune_dlist.data.prepend(title="New Tune", subtitle="New Tune Composer(s)", tune=new_tune)
        if type(widget) == toga.Button:
            self.tune_dlist.scroll_to_top()
        return new_row
    def _tune_dlist_selection_handler(self, widget, row):
        #Need to ignore some strange selection cases
        if type(row) != NoneType:
            self.current_row = row
            self.current_tune = getattr(row, "tune")
    def convert_std_to_tune(self, std):
        tune_conversion = {}
        tune_conversion["title"] = std["Title"]
        tune_conversion["composers"] = std["Composer(s)"]
        return tune_conversion
    def update_tune(self):
        content = self.editor_contents
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
                        setattr(self.current_row, "title", self.current_tune["title"])
                    if val == self._subtitle_key:
                        setattr(self.current_row, "subtitle", self.current_tune[self._subtitle_key])
                else:
                    if key in self.current_tune:
                        self.current_tune.pop(key)
        if "title" not in self.current_tune:
            setattr(self.current_row, "title", "(No title supplied!)")
        else:
            setattr(self.current_row, "title", self.current_tune["title"])
        if self._subtitle_key not in self.current_tune:
            setattr(self.current_row, "subtitle", "(No " + self._subtitle_key + " supplied!)")
        else:
            if isinstance(self.current_tune[self._subtitle_key], list):
                setattr(self.current_row, "subtitle", ", ".join(self.current_tune[self._subtitle_key]))
            else:
                setattr(self.current_row, "subtitle", self.current_tune[self._subtitle_key])
        self.save()
    def delete_selected(self, widget):
        row = self.tune_dlist.selection
        if row is Row:
            print("Deleting " + str(self.tunelist.remove(getattr(row, "tune"))))
    #        self.tune_dlist.data.remove(row)
            self.tune_dlist.remove(row)
            self.save()
    def __search_handler__(self, widget):
        self.sort_tunelist(search=widget.value)
    def _played_handler(self, widget):
        if self.tune_dlist.selection:
            tune = self.tune_dlist.selection.tune
            self.tune_dlist.selection.icon = toga.Icon("./resources/check-mark.png")
            date_str = date.today().isoformat()
            if "played_at" not in tune or tune["played_at"] == []:
                tune["played_at"] = [date_str]
                tune["playthroughs"] = int(tune["playthroughs"]) + 1
            else:
                if tune["played_at"][0] != date_str:
                    tune["played_at"].insert(0, date_str)
                    tune["playthroughs"] = int(tune["playthroughs"]) + 1
        self.sort_tunelist()
    def __edit_handler__(self, widget):
        self.switch_to_editor(None)
        self.update_editor_contents(self.current_tune)
    def switch_to_editor(self, widget):
        self.main_window.content = self.editor
    def switch_to_tunelist(self, widget):
        if widget.id == "confirm_btn":
            self.update_tune()
        self.main_window.content = self.main_box
        self.sort_tunelist()
    def switch_to_standards(self, widget):
        self.main_window.content = self.sl_box
    def open_files(self):
        src = Path(__file__).resolve()
        src_dir = src.parent
        with open(src_dir / "songs.json", "r+") as f:
            self.tunelist = json.load(f)
            self.tunelist: list[dict]
        with open(src_dir / "JazzStandards.csv", "r") as standards_file:
            self.all_standards = sorted(list(csv.DictReader(standards_file)), key=lambda tn: tn["Title"])
    def save(self):
        print("Save disabled")
#         try:
#             src = Path(__file__).resolve()
#             src_dir = src.parent
#             with open(src_dir / "songs.json", "w") as f:
#                 json.dump(self.tunelist, f)
#                 print("Wrote to ./songs.json")
#         except:
#             print("Write failed")

#         print(self.tunelist)


class TunelistSource(ListSource):
    def __init__(self, accessors: list[str], data: list[Any] | None = None, subtitle_key="title"):
        self.subtitle_key = subtitle_key
        super().__init__(accessors=accessors, data=data)
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
        else:
            icon = toga.Icon("./resources/unchecked-mark.png")
        return {"title": title,
               "subtitle": subtitle,
               "tune": tune,
               "icon": icon
               } 
    def set_subtitle_key(self, sub_key):
        self.subtitle_key = sub_key
        self._accessors[2] = sub_key
        #Ignore subtitle key for title.
        if sub_key == "title":
            sub_key = "composers"
            self.subtitle_key = "composers"
            self._accessors[2] = "composers"
        for row in self:
            if hasattr(row, "composers"):
                print(row.composers)
            else:
                print("No composer")
                print(row)
            break
      # for row in self._data:
      #     if sub_key in row.tune:
      #         value = row.tune[sub_key]
      #         if isinstance(value, list):
      #             row.subtitle = ", ".join(row.tune[sub_key])
      #         elif isinstance(value, int):
      #             row.subtitle = str(row.tune[sub_key])
      #         else:
      #             row.subtitle = row.tune[sub_key]
      #     else:
      #         row.subtitle = "No " + sub_key + " provided!"
    def _row_is_sortable(self, row):
        return (self.subtitle_key in getattr(row, "tune")) and (getattr(row, "tune")[self.subtitle_key] != [])
    def sort(self, search=""):
        values_for_sorting = [row for row in self._data if self._row_is_sortable(row)]
        end_values = [row for row in self._data if self.subtitle_key if not self._row_is_sortable(row)]
        if search == "":
            values_for_sorting.sort(key=lambda row: getattr(row, "tune")[self.subtitle_key])
        else:
            values_for_sorting.sort(key=lambda row: fuzz.partial_ratio(getattr(row, "tune")[self.subtitle_key], search), reverse=True)
        values_for_sorting.extend(end_values)
        self._data = values_for_sorting

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






def main():
    return TuneTracker()


