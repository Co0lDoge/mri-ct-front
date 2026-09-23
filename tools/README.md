# tools

Служебные скрипты монорепозитория.

| Скрипт | Команда | Назначение |
|--------|---------|------------|
| `check-boundaries.mjs` | `npm run check:boundaries` | Проверка правил зависимостей между пакетами |
| `list-workspaces.mjs` | `npm run workspaces:list` | Список workspaces и их `@medml/*` зависимостей |

Скрипты запускаются из **корня** репозитория (Node.js 18+).
