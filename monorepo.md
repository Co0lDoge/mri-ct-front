# medml-front

Монорепозиторий медицинской фронтенд-платформы для работы с различными диагностическими контурными сценариями: УЗИ, цитология, КТ и МРТ.

## Что это за проект

Проект представляет собой модульную клиентскую платформу, где:

- приложения выступают как тонкие оболочки над общей бизнес-логикой;
- доменные сценарии переиспользуются между несколькими приложениями;
- общий UI, состояние, утилиты и визуализационные модули вынесены в отдельные пакеты;
- архитектура строится по принципу «приложения → домены → инфраструктура/визуализация».

Это отражено в документации архитектуры: [docs/architecture/overview.md](docs/architecture/overview.md), [docs/architecture/dependency-rules.md](docs/architecture/dependency-rules.md) и [docs/architecture/packages.md](docs/architecture/packages.md).

---

### Уровни архитектуры

```text
apps/       → прикладные приложения (маршруты, композиция, модально-специфичный UI)
domains/    → общие предметные контексты (пациенты, auth, layout, загрузка)
lib/        → инфраструктура, store, shared, UI, viewers
configs/    → общие пресеты TypeScript, Vite, ESLint
tools/      → скрипты для контроля workspaces и зависимостей
build/      → Docker, Nginx, сборка и доставка статики
docs/       → архитектурная и проектная документация
```

### Ключевые принципы

- приложения не должны знать о внутренней логике других приложений;
- домены не должны зависеть от конкретного приложения;
- инфраструктура и визуализация живут в слоях lib;
- правила зависимостей идут сверху вниз: apps → domains → lib.

---

## Структура репозитория

```text
monorepo/
├── apps/                  # SPA/приложения по модальностям
├── domains/               # общие доменные пакеты
├── lib/                   # инфраструктура, UI, viewers, shared
├── configs/               # общие конфигурации TS/Vite/ESLint
├── docs/                  # архитектурная документация
├── tools/                 # служебные скрипты и проверки
├── build/                 # docker/nginx/production bundle
├── OLD-PROJECTS/          # legacy-проекты (отмечены как OLD)
└── package.json           # workspaces, scripts, зависимости
```

---

## Приложения (apps)

Каждое приложение — это тонкая оболочка, которая содержит маршрутизацию, конфигурацию сборки и модально-специфичный код.

| Каталог         | npm name       | Модальность | Контур |
| --------------- | -------------- | ----------- | ------ |
| apps/ultrasound | ultrasound-app | УЗИ         | 2D     |
| apps/cytology   | cytology-app   | Цитология   | 2D     |
| apps/ct         | ct-app         | КТ          | DICOM  |
| apps/mri        | mri-app        | МРТ         | DICOM  |

### Команды запуска

```bash
npm run dev:ultrasound
npm run dev:cytology
npm run dev:ct
npm run dev:mri
```

### Команды сборки

```bash
npm run build:ultrasound
npm run build:cytology
npm run build:ct
npm run build:mri
```

---

## Доменные пакеты (domains)

Доменные пакеты содержат сценарии и UI, общие для нескольких приложений, но без логики DICOM и тайлового просмотра.

| Пакет                  | Назначение                     |
| ---------------------- | ------------------------------ |
| @medml/auth            | вход, refresh, обработка 401   |
| @medml/layout          | общая оболочка страниц, header |
| @medml/patients        | типы и API пациентов           |
| @medml/patient_list    | таблица пациентов              |
| @medml/patient_create  | создание карты пациента        |
| @medml/patient_view    | профиль пациента               |
| @medml/cytology_upload | UI загрузки слайда             |

---

## Библиотеки и инфраструктура (lib)

### Инфраструктура

| Пакет         | Назначение                                 |
| ------------- | ------------------------------------------ |
| @medml/shared | типы, утилиты, helpers                     |
| @medml/store  | Redux, RTK Query, auth slice               |
| @medml/ui     | базовые UI-компоненты и обвязка Ant Design |
| @medml/config | общая конфигурация Next/Webpack для КТ/МРТ |

### Визуализация

| Пакет                  | Контур              | Стек                        |
| ---------------------- | ------------------- | --------------------------- |
| @medml/viewers         | 2D                  | Annotorious, OpenSeadragon  |
| @medml/ct-mri-viewer   | DICOM               | Cornerstone3D               |
| @medml/cytology-upload | интеграция загрузки | chunked upload, Vite plugin |

---

## Рабочие инструменты и управление зависимостями

Проект использует:

- npm workspaces для управления пакетами;
- Turborepo для запуска и кэширования задач;
- ESLint и кастомные проверки границ пакетов.

### Основные команды

```bash
npm install
npm run lint
npm run lint:fix
npm run check:boundaries
npm run workspaces:list
```

### Правила зависимостей

Схема зависимостей строится по направлению сверху вниз:

```text
apps → domains, lib
domains → lib
lib (infra) → lib (shared)
```

Запрещено, например:

- домены зависеть от приложений;
- домены зависеть от viewers/ct-mri-viewer;
- инфраструктура тянуть предметную логику приложений.

---

## Docker и сборка для продакшена

Платформа поддерживает контейнеризацию через build/ с nginx и проксированием API.

Сборка и запуск SPA через Docker описаны в [build/README.md](build/README.md).

Ключевая идея:

- фронтенд отдает запросы на относительные `/api/...` пути;
- nginx переправляет их на соответствующие backend URL через переменные окружения.

---

## Документация

Основные документы:

- [docs/architecture/overview.md](docs/architecture/overview.md) — обзор архитектуры
- [docs/architecture/dependency-rules.md](docs/architecture/dependency-rules.md) — правила зависимостей
- [docs/architecture/packages.md](docs/architecture/packages.md) — карта пакетов @medml/\*
- [apps/README.md](apps/README.md) — описание приложений
- [domains/README.md](domains/README.md) — описание доменов
- [lib/README.md](lib/README.md) — описание библиотек
- [build/README.md](build/README.md) — Docker / nginx / deployment
- [configs/README.md](configs/README.md) — общие настройки
- [tools/README.md](tools/README.md) — служебные скрипты

---

## OLD-проекты (legacy)

В каталоге [OLD-PROJECTS](OLD-PROJECTS) находятся старые проекты, которые стоит рассматривать как legacy:

- [OLD-PROJECTS/CYTO](OLD-PROJECTS/CYTO) — старый Next.js-проект, шаблонный README без привязки к текущей архитектуре
- [OLD-PROJECTS/UZI](OLD-PROJECTS/UZI) — аналогичный старый Next.js-проект

Эти папки не являются основой текущей платформы и могут использоваться только как исторический или резервный материал.

---

## Краткое резюме

Проект medml-front — это современный фронтенд-монорепозиторий для медицинских приложений, который разделяет:

1. приложения по модальностям;
2. общие доменные сценарии;
3. инфраструктурные и визуализационные библиотеки;
4. общую сборочную и контейнерную инфраструктуру.

Цель платформы — обеспечить переиспользуемую, масштабируемую и поддерживаемую архитектуру для нескольких медицинских интерфейсов без дублирования логики.
