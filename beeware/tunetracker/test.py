import toga
from toga.style.pack import Pack

history_data = [
    {
        'icon': toga.Icon.DEFAULT_ICON,
        'title': 'Foo',
        'subtitle': 'Bar',
        'pk': 100,
    },
]


def build(app):
    history = toga.DetailedList(
        id='foo',
        data=history_data,
        on_select=selection_handler,
    )

    history_box = toga.Box()
    history_box.add(history)

    box = toga.Box(style=Pack(padding=(5, 5)))

    box.add(history_box)

    return box


def main():
    return toga.App('DetailedList test', 'foo.bar', startup=build)


def selection_handler(widget, row):
    print('Row {} of widget {} was selected'.format(row, widget))


if __name__ == '__main__':
    main().main_loop()
