#!/usr/bin/env bash
#
# medml-front — установка зависимостей и запуск приложения на выбор.
#
# Аналог start.bat для Linux и macOS.
#
#   chmod +x start.sh
#   ./start.sh
#
# Скрипт сам переходит в свой каталог, поэтому откуда его вызывать — неважно.

set -uo pipefail

cd "$(dirname "$(readlink -f "$0" 2>/dev/null || echo "$0")")" || exit 1

# --- Вспомогательное ---------------------------------------------------------

header() {
    clear
    echo
    echo "   ================================================"
    echo
    echo "            M E D M L  -  F R O N T"
    echo
    echo "   ================================================"
    echo
}

pause_any() {
    echo
    echo "   Нажмите Enter..."
    read -r _
}

# Открыть URL браузером по умолчанию.
#
# xdg-open есть в большинстве десктопных дистрибутивов, open — в macOS.
# Если ни того, ни другого нет (например, работа по SSH), молча пропускаем:
# адрес всё равно напечатан на экране.
open_url() {
    local url="$1"

    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$url" >/dev/null 2>&1 &
    elif command -v open >/dev/null 2>&1; then
        open "$url" >/dev/null 2>&1 &
    fi
}

# --- Проверка окружения ------------------------------------------------------

header

if ! command -v node >/dev/null 2>&1; then
    echo "   [!] Node.js не найден в PATH."
    echo
    echo "       Установите LTS-версию с https://nodejs.org"
    echo "       или через пакетный менеджер (nvm, brew, apt)."
    echo
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "   [!] npm не найден в PATH."
    echo
    echo "       Обычно npm ставится вместе с Node.js — переустановите Node.js."
    echo
    exit 1
fi

echo "   [ok] Node.js $(node --version)"

# --- Зависимости -------------------------------------------------------------
# npm workspaces ставит зависимости всех пакетов одной командой из корня,
# поэтому проверяем только корневой node_modules.

install_deps() {
    npm install
    if [ $? -ne 0 ]; then
        echo
        echo "   [!] npm install завершился с ошибкой."
        echo
        echo "       Что обычно помогает:"
        echo "         - проверить доступ в интернет и настройки прокси;"
        echo "         - удалить package-lock.json и запустить установку заново;"
        echo "         - убедиться, что версия Node.js — LTS."
        echo
        exit 1
    fi
}

if [ ! -d node_modules ]; then
    echo "   [..] Зависимости не найдены, устанавливаю"
    echo
    echo "   Это займёт несколько минут."
    echo
    install_deps
    echo
    echo "   [ok] Зависимости установлены"
else
    echo "   [ok] Зависимости на месте"
fi

pause_any

# --- Запуск ------------------------------------------------------------------

run_app() {
    local target="$1" label="$2" url="$3"

    header
    echo "   Запускаю: $label"
    echo "   Адрес:    $url"
    echo
    echo "   Открываю адрес в браузере."
    echo "   Если страница не загрузилась - обновите её через пару секунд,"
    echo "   dev-серверу нужно время на старт."
    echo
    echo "   Остановить - Ctrl+C в этом окне."
    echo
    echo "   ------------------------------------------------"
    echo

    open_url "$url"

    npm run "$target"

    echo
    echo "   ------------------------------------------------"
    echo "   Процесс завершён."
    pause_any
}

reinstall() {
    header
    echo "   Удаляю node_modules..."
    rm -rf node_modules
    echo "   Устанавливаю заново..."
    echo
    install_deps
    echo
    echo "   [ok] Готово"
    pause_any
}

# --- Меню --------------------------------------------------------------------

while true; do
    header
    echo "   +----------------------------------------------+"
    echo "   |                                              |"
    echo "   |    [1]  Ultrasound      УЗИ                  |"
    echo "   |         localhost:3002                       |"
    echo "   |                                              |"
    echo "   |    [2]  Cytology        Цитология            |"
    echo "   |         localhost:3001                       |"
    echo "   |                                              |"
    echo "   |    [3]  CT              КТ                   |"
    echo "   |         localhost:3004                       |"
    echo "   |                                              |"
    echo "   |    [4]  MRI             МРТ                  |"
    echo "   |         localhost:3005                       |"
    echo "   |                                              |"
    echo "   +----------------------------------------------+"
    echo "   |                                              |"
    echo "   |    [5]  Переустановить зависимости           |"
    echo "   |    [0]  Выход                                |"
    echo "   |                                              |"
    echo "   +----------------------------------------------+"
    echo

    printf "   Введите номер: "
    read -r choice

    case "$choice" in
        1) run_app dev:ultrasound Ultrasound http://localhost:3002 ;;
        2) run_app dev:cytology   Cytology   http://localhost:3001 ;;
        3) run_app dev:ct         CT         http://localhost:3004 ;;
        4) run_app dev:mri        MRI        http://localhost:3005 ;;
        5) reinstall ;;
        0) exit 0 ;;
        *)
            echo
            echo "   [!] Не понял выбор: \"$choice\". Нужна цифра от 0 до 5."
            pause_any
            ;;
    esac
done
