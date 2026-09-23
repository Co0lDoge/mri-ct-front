# medml-front

Монорепозиторий для медицинских приложений (УЗИ, КТ, МРТ, Цитология)

## Структура проекта

```
medml-front/
├── apps/                    # Прикладные приложения (УЗИ, КТ, МРТ, цитология)
├── domains/                 # Доменные пакеты (auth, patients, layout, …)
├── lib/                     # Инфраструктура и модули визуализации
├── configs/                 # Общие пресеты TypeScript, Vite, ESLint
├── docs/                    # Архитектурная документация платформы
├── tools/                   # Скрипты проверки границ и workspaces
├── build/                   # Docker, Nginx, поставка
└── .github/workflows/       # CI (lint, check:boundaries)
```

Подробнее: [docs/architecture/overview.md](docs/architecture/overview.md).

## Установка

```bash
npm install
```

## Разработка

Запуск отдельного приложения в режиме разработки:

```bash
npm run dev:ultrasound
npm run dev:ct
npm run dev:mri
npm run dev:cytology
```

## Сборка

Сборка отдельного приложения:

```bash
npm run build:ultrasound
npm run build:ct
npm run build:mri
npm run build:cytology
```

Docker-образ со статикой и прокси `/api` на бэкенд: см. [build/README.md](build/README.md) (`API_BACKEND_URL`).

## Workspaces

Проект использует npm workspaces для управления зависимостями между пакетами.

Все модули доступны через алиасы:

**Домены:**
- `@medml/patients`
- `@medml/auth`

**Технические пакеты:**
- `@medml/shared`
- `@medml/ui`
- `@medml/viewers`

## Turborepo

Для управления задачами используется Turborepo с кэшированием сборок.

## Качество и границы пакетов

```bash
npm run check:boundaries   # проверка правил зависимостей apps → domains → lib
npm run workspaces:list    # карта @medml/* зависимостей
npm run lint
```


