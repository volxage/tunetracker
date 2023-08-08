import json
import curses
from curses import panel
from curses import textpad
import time
import math
import copy #For deep copy 
import csv
from fuzzywuzzy import fuzz
stdscr = curses.initscr()
curses.noecho()
curses.cbreak()
stdscr.clear()
stdscr.keypad(True)

term_log = []

with open("./songs.json", 'r+') as f:
    tunelist = json.load(f)

with open("./JazzStandards.csv", "r") as standards_file:
    all_standards = sorted(list(csv.DictReader(standards_file)), key=lambda tn: tn["Title"])
#     term_log.append(str(all_standards))



class Tune:
    default_d = {
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
    default_keys = list(default_d.keys())
    pretty_convert = {
            "title" : "Title: ",
            "alternative_title" : "Alternative title: ",
            "composers" : "Composers: ",
            "form" : "Form: ",
            "notable_recordings" : "Notable Recordings: ",
            "keys" : "Keys: ",
            "styles" : "Styles: ",
            "tempi" : "Tempi: ",
            "contrafacts" : "Contrafacts: ",
            "playthroughs" : "Playthroughs: ",
            "form_confidence" : "Form confidence: ",
            "melody_confidence" : "Melody confidence ",
            "solo_confidence" : "solo_confidence: ",
            "lyrics_confidence" : "Lyrics confidence: ",
            "played_at" : "Played at: ",
            }
    def __init__(self, d=None):
        if d != None:
            self.d = d
        else:
            self.d = {}
    def __getitem__(self, index):
        return self.d[index]
    def __setitem__(self, key, val):
        self.d[key] = val

def deets_str(tn: Tune):
    seperator = ", "
    outstrs = []
    for key in Tune.default_d:
        if key in tn.d:
            value = tn.d[key]
            if type(value) == list:
                outstrs.append(Tune.pretty_convert[key] + seperator.join(str(value)))
            else:
                outstrs.append(Tune.pretty_convert[key] + str(value))
    return outstrs

def term(error_message = ""):
    curses.nocbreak()
    stdscr.keypad(False)
    curses.echo()
    curses.endwin()
    with open("./songs.json", "w") as f:
        json.dump(tunelist, f)
    if error_message != "":
        print(error_message)
    if len(term_log) != 0:
        print("Log:")
        for s in term_log:
            print(s)
    exit()

class Canvas(object):
    def __init__(self, stdscr):
        self.screen = stdscr
        self.cols = []
        self.colwidth = 0
    def append_col(self, menu):
        self.cols.append(menu)
        self.colwidth = math.floor( (self.screen.getmaxyx()[1]) / len(self.cols) - 2)
        menu.canvas = self
        pass
    def resize_cols(self):
        try:
            for x, menu in enumerate(self.cols):
                menu.window.resize(menu.y_size(), self.colwidth)
                menu.window.mvwin(0, self.colwidth * x)
#                 if menu.hidden == False:
#                     menu.update()
        except:
            term("Not enough rows! Need to zoom out! (Or get a better screen, sweaty")

    def pop_up(self, win):
        win.window.resize(win.y_size(), win.x_size())
        win.set_canvas(self)
        y_pos = math.floor(self.screen.getmaxyx()[0] / 2) - math.floor(win.y_size() / 2)
        x_pos = math.floor(self.screen.getmaxyx()[1] / 2) - math.floor(win.x_size() / 2)
        win.window.mvwin(y_pos, x_pos)
        win.show()
        if type(win) == NaviMenu or type(win) == SearchMenu:
            win.active()
        else:
            time.sleep(2000)
            win.hide()
    def show_cols(self):
        for n in range(len(self.cols)):
            self.show_col(n)
    def replace_col(self, i:int, new_col):
        self.cols[i] = new_col
        new_col.canvas = self
    def show_col(self, n):
        self.cols[n].show()
    def hide_col(self, n):
        self.cols[n].hide()

class Textbox(object):
    def __init__(self, parent_win, ncols, y_pos):
        self.editwin = parent_win.derwin(1, ncols, y_pos, 1)
        self.editwin.erase()
        tb = textpad.Textbox(self.editwin)
        tb.stripspaces = True
        tb.edit()
        self.res = tb.gather()
    def result(self):
        return self.res


class Window(object):
    def __init__(self):
        self.window = curses.newwin(0,0)
        self.window.keypad(True)
        self.hidden = True
        self.panel = panel.new_panel(self.window)
        self.canvas: Canvas
    def set_canvas(self, canvas):
        self.canvas = canvas
    def show(self):
        self.hidden = False
        self.panel.show()
        self.update()
    def update(self):
        self.window.erase()
        self.draw()
    def draw(self):
        self.window.border()
        self.window.refresh()
        panel.update_panels()
    def hide(self):
        self.hidden = True
        self.window.clear()
        self.panel.hide()
        panel.update_panels()
    def toggle(self):
        if self.hidden:
            self.show()
        else:
            self.hide()

class Menu(Window):
    def __init__(self, items, label="Menu"):
        super().__init__()
        self.items = items
        self.position = 0
        self.label = label
    def render(self):
        self.window.addstr(1, 1, self.label, curses.A_BOLD)
        for index, choice in enumerate(self.items):
            self.window.addstr(2 + index, 1, choice, curses.A_NORMAL)
    def update_items(self, items):
        self.items = items
    def y_size(self):
        return 3 + len(self.items)
    def x_size(self):
        return 2 + len(max(self.items, key=len))
    def update(self):
        self.window.erase()
        self.render()
        self.draw()
    def toggle(self):
        if self.hidden:
            self.show()
        else:
            self.hide()
    def trim_text(self, text):
        if len(text) > self.canvas.colwidth - 2:
            text = text[0:self.canvas.colwidth - 5]
            text = text + "..."
        return text


class SearchMenu(Window):
    def __init__(self, label="Search tunes:"):
        self.label = label
        super().__init__()
    def active(self):
        self.update()
        self.window.addstr(1, 1, self.label, curses.A_BOLD)
        self.draw()
        tb = Textbox(self.window, self.x_size() - 2, 2)
        self.res = tb.result()
        self.hide()
    def result(self):
        return self.res
    def y_size(self):
        return 4
    def x_size(self):
        return len(self.label) * 2

class NaviMenu(Menu):
    def __init__(self, items, persists=True, label="NaviMenu"):
        super().__init__(items, label)
        if type(items) == dict:
            self.keys = list(items.keys())
        self.menu_keys = {
                curses.KEY_UP   : self.up,
                107             : self.up,
                curses.KEY_DOWN : self.down,
                106             : self.down,
                curses.KEY_ENTER : self.item_exec,
                10               : self.item_exec,
                13               : self.item_exec,
                }
        self.menu_keys.update(universal_keys)
        self.activated = False
        self.persists = persists
    def deactivate(self):
        self.activated = False
        self.hide()
    def navigate(self, n):
        first_item = self[self.position]
        self.draw_line(index=self.position, text=first_item, mode=curses.A_NORMAL)
        self.position += n
        if self.position < 0:
            self.position = len(self.items) - 1
        elif self.position >= len(self.items):
            self.position = 0
        next_item = self[self.position]
        self.draw_line(index=self.position, text=next_item, mode=curses.A_REVERSE)
        self.window.refresh()
    def draw_line(self, index: int, text: str, mode, offset=2):
        self.window.addstr(offset + index, 1, text, mode)
    def render(self):
        self.window.addstr(1, 1, self.label, curses.A_BOLD)
        for index, choice in enumerate(self.items):
            if index == self.position and self.activated:
                self.draw_line(index=index, text=choice, mode=curses.A_REVERSE)
            else:
                self.draw_line(index=index, text=choice, mode=curses.A_NORMAL)
    def up(self):
        self.navigate(-1)
    def down(self):
        self.navigate(1)
    def item_exec(self):
        self.activated = False
        if not self.persists:
            self.window.clear()
            self.deactivate
        self.items[self.keys[self.position]]()
    def __getitem__(self, index):
        return self.keys[index]
    def active(self):
        self.activated = True
        self.render() #Necessary to initialize the cursor?
        while self.activated:
            ky = self.window.getch()
            if ky in self.menu_keys:
                self.menu_keys[ky]()
                
    def update_items(self, items):
        self.items = items
        if type(items) == dict:
            self.keys = list(items.keys())
class MainMenu(NaviMenu):
    def __init__(self, items):
        super().__init__(items, label="Main Menu")
        self.items["Exit"] = term
        self.keys.append("Exit")
    def update_items(self, items):
        super().update_items(items)
        self.items.update({"Exit" : term})
        self.canvas.resize_cols()
    def item_exec(self):
        super().item_exec()
        self.activated = True


class Editor(NaviMenu):
    def __init__(self, items):
        self.changed = {}
        super().__init__(items)
        self.menu_keys[113] = self.deactivate
    def draw_line(self, index: int, text: str, mode, offset=2):
        self.window.addstr(offset + index * 2, 1, self.trim_text(text), mode)
    def render(self):
        self.window.addstr(1, 1, self.label, curses.A_BOLD)
        for index, choice in enumerate(Tune.default_d.keys()):
            if index == self.position and self.activated:
                self.draw_line(index=index, text=choice, mode=curses.A_REVERSE)
            else:
                self.draw_line(index=index, text=choice, mode=curses.A_ITALIC)
            val = self.items[choice]
            self.draw_line(index=index, text=str(val), mode=curses.A_NORMAL, offset=3)
    def navigate(self, n):
        first_item = self[self.position]
        self.draw_line(index=self.position, text=first_item, mode=curses.A_ITALIC)
        self.position += n
        if self.position < 0:
            self.position = len(self.items) - 1
        elif self.position >= len(self.items):
            self.position = 0
        next_item = self[self.position]
        self.draw_line(index=self.position, text=next_item, mode=curses.A_REVERSE)
        self.window.refresh()
    def item_exec(self):
        item = self[self.position]
        val = self.items[item]
        if type(val) == int or type(val) == str:
            tb = Textbox(self.window, self.canvas.colwidth - 2, 3+self.position*2)
            results = tb.result()
            if type(Tune.default_d[item]) == int:
                results = int(results)
            self.changed[item] = results
            self.items[item] = results
        else:
            #must be a list
            le = ListEdit(items=self.items[item], key=item, colwidth=self.canvas.colwidth)
            self.canvas.replace_col(2, le)
            self.activated = False
            le.active() 
            self.activated = True
            self.canvas.replace_col(2, self)
            self.show()
            self.changed[item] = le.items
            self.items[item] = le.items
    def y_size(self):
        return 3 + len(self.items) * 2
    def active(self):
        self.show()
        super().active()
    def add_placeholders(self, items):
        #This takes all keys without values and populates them with the default placeholders.
        diff_d = set(Tune.default_d.keys()) - set(items.keys())
        diff_d = {k: copy.deepcopy(Tune.default_d)[k] for k in diff_d}
        diff_d.update(items.copy()) #Copy or not?
        self.items = dict(diff_d)
        self.canvas.resize_cols()
    def update_items(self, items):
        self.add_placeholders(items)
        self.position = 0
        self.keys = list(self.items.keys())
        self.changed.clear()
    def __getitem__(self, index):
        return Tune.default_keys[index]

class ListEdit(NaviMenu):
    def __init__(self, items:list, key: str, colwidth: int):
        super().__init__(items)
        self.menu_keys[113] = self.deactivate
        self.key = key
        self.colwidth = colwidth
        self.items.append("(New)")
        self.label = "Edit: " + key.capitalize()
    def render(self):
        super().render()
        self.window.addstr(1, 1, self.label, curses.A_BOLD)
        self.window.addstr(1, 1, "EDIT: " + self.key, curses.A_BOLD)
    def item_exec(self):
        tb = Textbox(self.window, self.colwidth - 2, self.position + 2)
        result = tb.result()
        self[self.position] = tb.result()
        if result == "":
            self.items.remove("")
        if "(New)" not in self.items:
            self.items.append("(New)")
            self.show()
    def draw_line(self, index: int, text: str, mode):
        self.window.addstr(2 + index, 1, self.trim_text(text), mode)
    def y_size(self):
        return 3 + len(self.items)
    def __getitem__(self, index):
        return self.items[index]
    def __setitem__(self, index, val):
        self.items[index] = val
    def show(self):
        super().show()
        self.position = 0
    def active(self):
        self.show()
        super().active()
    def deactivate(self):
        self.activated = False
        if "(New)" in self.items:
            self.items.pop(len(self.items) - 1)

class TuneList(NaviMenu):
    def __init__(self, items:list[dict]):
        self.all_items = items
        super().__init__(items)
        self.menu_keys[113] = self.deactivate
        self.menu_keys[curses.KEY_BACKSPACE] = self.delete
        self.start_pos = 0
        self.sort_peek = SortPeek(self.items)
        self.sort_key = "title"
        self.sl_options = {
                "Search" : lambda: self.sl.search(),
                "Sort By Title" : lambda: self.sl.sort_by("Title"),
                "Sort by JazzStandards.com rating" : lambda: self.sl.sort_by("Rank"),
                "Sort by Composers" : lambda: self.sl.sort_by("Composer(s)"),
                "Sort by Lyricist(s)" : lambda: self.sl.sort_by("Lyricist(s)"),
                "Sort by Year" : lambda: self.sl.sort_by("Year"),
        }
        self.delete_confirmation = False
        self.label = "Tune List"
    def assign_editor(self, editor:Editor):
        self.editor = editor
        self.sl = StandardsList(all_standards)
    def delete(self):
        warning_dict = {"Yes, delete " + self[self.position]["title"] : self.__warning_confirm__,
                        "No, don't delete it!" : self.__warning_deny__} 
        warning = NaviMenu(warning_dict, persists=False)
        warning.canvas = self.canvas
        warning.show()
        warning.active()
        if self.delete_confirmation:
            self.all_items.remove(self[self.position])
            self.sort_by(self.sort_key)
    def __warning_confirm__(self):
        self.delete_confirmation = True
    def __warning_deny__(self):
        self.delete_confirmation = False
    def render(self):
        self.window.addstr(1, 1, self.label, curses.A_BOLD)
        for index in range(self.start_pos, min(self.start_pos + self.y_size() - 2, len(self.items))):
            choice = self[index]
            screen_index = index - self.start_pos
            try:
                if index == self.position and self.activated:
                    self.draw_line(index=screen_index, text=choice["title"], mode=curses.A_REVERSE)
                else:
                    self.draw_line(index=screen_index, text=choice["title"], mode=curses.A_NORMAL)
            except:
                term("\n Error on: " + str(choice))
    def navigate(self, n):
        usable_space = self.y_size() - 3
        self.position += n
        if self.position == self.start_pos + usable_space - 1:
            #If the screen now contains the last element of the list
            if self.position < len(self.items) - 1:
                self.start_pos += n
            #Else: position movesm but start_pos remains the same.
        if self.position >= len(self.items) or self.start_pos >= len(self.items):
            self.position = 0
            self.start_pos = 0
        if self.position < self.start_pos:
            if self.position < 0:
                self.position = len(self.items) - 1
                self.start_pos = max( len(self.items) - usable_space, 0)
            else:
                self.start_pos += (self.position - self.start_pos)
        self.update()
    def standard_extract(self):
        self.canvas.replace_col(2, self.sl)
        sort_menu = NaviMenu(self.sl_options, persists=False)
        self.canvas.pop_up(sort_menu)
        tn = self.sl.to_tune()
        self.all_items.append(tn)
        self.editor.update_items(tn)
        return tn
    def item_exec(self):
        if self[self.position]["title"] == "(From Standards)":
            prev_dict = self.standard_extract()
        else:
            self.editor.update_items(self[self.position])
            prev_dict = self[self.position]
            self.canvas.replace_col(2, self.editor)
            self.canvas.resize_cols()
            self.editor.active()
        if self[self.position]["title"] == "(New)":
            self.all_items.append(self.editor.changed)
        else:
            prev_dict.update(self.editor.changed)
        self.sort_by(self.sort_key)
    def active(self):
        self.activated = True
        self.show()
        super().active()
    def __getitem__(self, index):
        return self.items[index]
    def __setitem__(self, index, item):
        self.items[index] = item
    def __newitem__(self):
        if {"title" : "(New)"} not in self.items:
            self.items.append({"title" : "(New)"})
        if {"title" : "(From Standards)"} not in self.items:
            self.items.append({"title" : "(From Standards)"})
    def deactivate(self):
        self.activated = False
        self.render()
        self.editor.hide()
    def remove_placeholders(self):
        if "(New)" in self.items and "(From Standards)" in self.items:
            self.items.pop(len(self.items) - 1)
            self.items.pop(len(self.items) - 1)
        if "(From Standards)" in self.items or "(New)" in self.items:
            self.items.pop(len(self.items) - 1)
    def update_items(self, items):
        super().update_items(items)
        self.__newitem__()
    def y_size(self):
        return min(super().y_size(), self.canvas.screen.getmaxyx()[0] - 3)
    def sort_by(self, key, reversed=False):
        self.sort_key = key
        self.items = [d for d in self.all_items if key in d]
        self.items = sorted(self.items, key=lambda tn: tn[key], reverse=reversed)
        self.position = min( len(self.items) - 1, self.position)
        if len(self.items) == 0:
            self.items = self.all_items
            self.canvas.pop_up(Menu(label="ERROR: No matching tunes!", items="Add some!"))
            #TODO: Define an error window!
        if type(self.canvas.cols[2]) == Editor:
            self.canvas.replace_col(2, self.editor)
            self.editor.hide()
        self.sort_peek.new_key(key, self.items)
        self.__newitem__()
        self.canvas.replace_col(2, self.sort_peek)
        self.canvas.resize_cols() #implies that all columns are shown
        self.active()
class SortPeek(Menu):
    def __init__(self, tunelist : list[dict]):
        self.tunelist = tunelist
        self.items = [str(song["composers"]) if "composers" in song else "none" for song in self.tunelist]
        super().__init__(self.items)
    def new_key(self, key, items):
        if key == "title":
            key = "composers"
        self.items = [str(song[key]) if key in song else "none" for song in items]
        self.label = key.title()
class StandardsList(TuneList):
    def item_exec(self):
        self.deactivate()
    def render(self):
        flag = self.activated
        for index in range(self.start_pos, min(self.start_pos + self.y_size() - 3, len(self.items))):
            choice = self[index]
            screen_index = index - self.start_pos
            try:
                if index == self.position and self.activated:
                     self.draw_line(index=screen_index, text=choice["Title"], mode=curses.A_REVERSE)
                     flag = False
                else:
                     self.draw_line(index=screen_index, text=choice["Title"], mode=curses.A_NORMAL)
            except:
                term_log.append(str(self.y_size()))
                term("\n SL Error on: " + str(choice))
        if flag:
            term_log.append("range: " + str(self.start_pos) + " to " + str( min(self.start_pos + self.y_size() - 2, len(self.items))))
            term("No match found for position " + str(self.position))
    def active(self):
        self.activated = True
        self.render() #Necessary to initialize the cursor?
        while self.activated:
            ky = self.window.getch()
            if ky in self.menu_keys:
                self.menu_keys[ky]()
    def deactivate(self):
        self.activated = False
        self.hide()
    def __try_int__(self, val:str):
        if val.isdigit():
            return int(val)
        return val
    def sort_by(self, key, reversed=False):
        self.sort_key = key
        self.items = sorted(self.items, key=lambda tn: self.__try_int__(tn[key]), reverse=reversed)

        self.position = min( len(self.items) - 2, self.position)
        if len(self.items) == 0:
            self.items = self.all_items
            #TODO: Define an error window!
#         if type(self.canvas.cols[2]) == Editor:
#             self.canvas.replace_col(2, self.editor)
#             self.editor.hide()
        self.show()
        self.active()
    def search(self):
        sm = SearchMenu("Search in Standards List")
        self.canvas.pop_up(sm)
        res = sm.result()
        self.items = sorted(self.items, key=lambda tn: fuzz.partial_ratio(res, tn), reverse=True)
        self.position = 0
        if type(self.canvas.cols[2]) == Editor:
            self.canvas.replace_col(2, self.editor)
            self.editor.hide()
        self.show()
        self.active()
    def to_tune(self):
        stnd = self[self.position]
        tn = Tune.default_d
        tn["title"] = stnd["Title"]
        tn["composers"] = stnd["Composer(s)"].split(", ")
        return tn

canv = Canvas(stdscr)
universal_keys = {
    curses.KEY_RESIZE : canv.resize_cols,
    113 : term,
    81  : term,
}

def main(stdscr):
    curses.curs_set(0)
    tl = TuneList(tunelist)
    edit = Editor({})
    tl.assign_editor(edit)
    sort_items = {
        "Sort by Composers" : lambda: tl.sort_by("composers"),
        "Sort by Keys" : lambda: tl.sort_by("keys"),
        "Sort by Styles" : lambda: tl.sort_by("styles"),
        "Sort by Tempi" : lambda: tl.sort_by("tempi"),
        "Sort by Playthroughs" : lambda: tl.sort_by("playthroughs"),
        "Sort by Form Confidence" : lambda: tl.sort_by("form_confidence"),
        "Sort by Melody Confidence" : lambda: tl.sort_by("melody_confidence"),
        "Sort by Solo Confidence" : lambda: tl.sort_by("solo_confidence"),
        "Sort by Lyrics Confidence" : lambda: tl.sort_by("lyrics_confidence"),
        "Sort by Date Played" : lambda: tl.sort_by("played_at"),
    }
    sort_menu = NaviMenu(sort_items, persists=False)
    items = {
        "Tune List": lambda: tl.sort_by("title"),
        "Tune Sort": lambda: canv.pop_up(sort_menu),
        }
    menu = MainMenu(items)
    canv.append_col(menu)
    canv.append_col(tl)
    canv.append_col(edit)
    canv.resize_cols()
    canv.show_col(0)
    panel.update_panels()
    menu.show()
    menu.active()
curses.wrapper(main)
term("Done")
