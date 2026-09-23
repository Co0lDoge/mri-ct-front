@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

rem ---------------------------------------------------------------------------
rem  medml-front - установка зависимостей и запуск приложения на выбор.
rem
rem  Запускать двойным кликом из корня монорепозитория. Скрипт сам переходит
rem  в свой каталог, поэтому текущая директория оболочки роли не играет.
rem
rem  ВАЖНО про кодировку файла:
rem    - UTF-8 БЕЗ BOM. С BOM cmd.exe читает его как часть первой строки,
rem      из-за чего `@echo off` не срабатывает и в консоль сыплются все
rem      выполняемые команды.
rem    - переводы строк CRLF.
rem
rem  Рамки нарисованы обычным ASCII (+ - |), а не псевдографикой: так вывод
rem  не зависит от кодовой страницы консоли. Цветов нет намеренно - ANSI
rem  поддерживается не везде и при неудаче засоряет экран escape-кодами.
rem ---------------------------------------------------------------------------

cd /d "%~dp0"
title medml-front

rem --- Проверка окружения -----------------------------------------------------

cls
call :header

where node >nul 2>nul
if errorlevel 1 (
    echo    [!] Node.js не найден в PATH.
    echo.
    echo        Установите LTS-версию с https://nodejs.org
    echo        и запустите скрипт заново.
    echo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo    [!] npm не найден в PATH.
    echo.
    echo        Обычно npm ставится вместе с Node.js - переустановите Node.js.
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node --version') do set "NODE_VERSION=%%v"
echo    [ok] Node.js !NODE_VERSION!

rem --- Зависимости ------------------------------------------------------------
rem  npm workspaces ставит зависимости всех пакетов одной командой из корня,
rem  поэтому проверяем только корневой node_modules.

if not exist "node_modules" (
    echo    [..] Зависимости не найдены, устанавливаю
    echo.
    echo    Это займёт несколько минут.
    echo.
    call npm install
    if errorlevel 1 goto install_failed
    echo.
    echo    [ok] Зависимости установлены
) else (
    echo    [ok] Зависимости на месте
)

echo.
echo    Нажмите любую клавишу...
pause >nul

rem --- Меню -------------------------------------------------------------------

:menu
cls
call :header
echo    +----------------------------------------------+
echo    ^|                                              ^|
echo    ^|    [1]  Ultrasound      УЗИ                  ^|
echo    ^|         localhost:3002                       ^|
echo    ^|                                              ^|
echo    ^|    [2]  Cytology        Цитология            ^|
echo    ^|         localhost:3001                       ^|
echo    ^|                                              ^|
echo    ^|    [3]  CT              КТ                   ^|
echo    ^|         localhost:3004                       ^|
echo    ^|                                              ^|
echo    ^|    [4]  MRI             МРТ                  ^|
echo    ^|         localhost:3005                       ^|
echo    ^|                                              ^|
echo    +----------------------------------------------+
echo    ^|                                              ^|
echo    ^|    [5]  Переустановить зависимости           ^|
echo    ^|    [0]  Выход                                ^|
echo    ^|                                              ^|
echo    +----------------------------------------------+
echo.

set "CHOICE="
set /p "CHOICE=   Введите номер: "

rem Команды после `&` в одной строке с `if` выполняются безусловно,
rem поэтому каждый вариант - отдельный блок в скобках.
if "!CHOICE!"=="1" (
    set "TARGET=dev:ultrasound"
    set "LABEL=Ultrasound"
    set "URL=http://localhost:3002"
    goto run
)
if "!CHOICE!"=="2" (
    set "TARGET=dev:cytology"
    set "LABEL=Cytology"
    set "URL=http://localhost:3001"
    goto run
)
if "!CHOICE!"=="3" (
    set "TARGET=dev:ct"
    set "LABEL=CT"
    set "URL=http://localhost:3004"
    goto run
)
if "!CHOICE!"=="4" (
    set "TARGET=dev:mri"
    set "LABEL=MRI"
    set "URL=http://localhost:3005"
    goto run
)
if "!CHOICE!"=="5" goto reinstall
if "!CHOICE!"=="0" exit /b 0

echo.
echo    [!] Не понял выбор: "!CHOICE!". Нужна цифра от 0 до 5.
echo.
echo    Нажмите любую клавишу...
pause >nul
goto menu

rem --- Переустановка ----------------------------------------------------------

:reinstall
cls
call :header
echo    Удаляю node_modules...
if exist "node_modules" rmdir /s /q "node_modules"
echo    Устанавливаю заново...
echo.
call npm install
if errorlevel 1 goto install_failed
echo.
echo    [ok] Готово
echo.
echo    Нажмите любую клавишу...
pause >nul
goto menu

rem --- Запуск -----------------------------------------------------------------

:run
cls
call :header
echo    Запускаю: !LABEL!
echo    Адрес:    !URL!
echo.
echo    Открываю адрес в браузере.
echo    Если страница не загрузилась - обновите её через пару секунд,
echo    dev-серверу нужно время на старт.
echo.
echo    Остановить - Ctrl+C в этом окне.
echo.
echo    ------------------------------------------------
echo.

rem  Открываем браузером по умолчанию. Делаем это до `npm run`, потому что
rem  тот блокирует окно до остановки сервера.
start "" "!URL!"

call npm run !TARGET!

echo.
echo    ------------------------------------------------
echo    Процесс завершён.
echo.
echo    Нажмите любую клавишу для возврата в меню...
pause >nul
goto menu

rem --- Ошибки -----------------------------------------------------------------

:install_failed
echo.
echo    [!] npm install завершился с ошибкой.
echo.
echo        Что обычно помогает:
echo          - проверить доступ в интернет и настройки прокси;
echo          - удалить package-lock.json и запустить установку заново;
echo          - убедиться, что путь к проекту не содержит кириллицы.
echo.
pause
exit /b 1

rem --- Подпрограммы -----------------------------------------------------------

:header
echo.
echo    ================================================
echo.
echo             M E D M L  -  F R O N T
echo.
echo    ================================================
echo.
exit /b 0
