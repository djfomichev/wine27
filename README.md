# Белый мыс · Календарь команды 2027

https://wine27.ru/ показывает весь событийный сценарий: фестивали, уикенды, резиденции, регулярную программу и ритуалы. Даты, которые ещё не закреплены, отмечены как предварительные. Каталога проектов и процессов подготовки в этой версии нет. Режимы просмотра: весь год, календарь и месяц; по дню открывается полная программа.

https://wine27.ru/work/ содержит рабочие детали и открывается персональным ключом. Ключ не хранится на сайте или в репозитории. Рабочая страница и исходные данные зашифрованы; простой скрытой ссылки недостаточно. Ранее опубликованная история репозитория остаётся публичной.

## Работа с исходниками

Локальные исходники находятся в private-work/ и исключены из публикации. В новом рабочем окружении их восстанавливают из work/payload.json скриптом scripts/unlock-work.py с приватным файлом ключа. Процедура сборки, проверок и публикации описана в AGENTS.md. Не публикуйте private-work/, файл ключа или личную ссылку доступа.

Основная версия формируется scripts/build-public.py. Идентификаторы, даты и исходный состав программы сохраняются. scripts/stamp-version.py выпускает общий номер версии, scripts/protect-work.py создаёт зашифрованный рабочий пакет. GitHub Pages публикует main из корня репозитория.

Открытые вкладки автоматически получают обновления. Рабочий ключ сохраняется только в текущей сессии вкладки; кнопка «Закрыть доступ» удаляет его. Расчёты команды по-прежнему сохраняются в браузере и передаются через JSON. Совместного редактирования нет.

## Program source and v15 build

Edit `private-work/program.json`, recovered by `python3 scripts/unlock-work.py --key-file PATH` with the existing owner key. Do not edit generated data files. Validate and build all editions locally on macOS:

```sh
python3 scripts/build-release.py --key-file PATH
```

Requires Python jsonschema, Pillow, cryptography; node, pdfinfo, and Swift/CoreGraphics for a changed deck. `presentation.buildSource` points to the preserved approved v15 renderer/assets bundle; it is excluded from contentRevision for portable recovery. Public repository contains only derived calendar data, schema/code, approved PDF/previews and encrypted working payload. Future content changes require accepted source edits; no chat polling exists. Calendar and presentation share contentRevision/releaseId; `/names/` keeps its separate version. Unknown dates and labor hours remain unknown. Legacy local scenario IDs/values stay intact and exportable; schedule changes are marked for review.
