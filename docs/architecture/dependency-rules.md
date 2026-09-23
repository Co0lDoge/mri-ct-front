# Правила зависимостей

Направление зависимостей - **только сверху вниз**:

```
apps  →  domains, lib
domains  →  lib (shared, ui, store)
lib (infra)  →  lib (shared)
lib (viewers | ct-mri-viewer)  →  lib (shared), внешние SDK
```

## Запрещено

| От | К | Причина |
|----|---|---------|
| `domains/*` | `apps/*` | Домен не знает о приложении |
| `domains/*` | `@medml/viewers`, `@medml/ct-mri-viewer` | Визуализация - в приложении |
| `lib/*` | `domains/*`, `apps/*` | Инфраструктура не тянет предметную логику |

**Исключение:** `@medml/ui` может зависеть от `@medml/layout` для композиции общего каркаса страниц.

Домен `@medml/cytology_upload` использует `@medml/cytology-upload` (интеграция загрузки, не визуализация).
| `lib/shared` | любой пакет кроме внешних | Базовый слой без циклов |

## Проверка

```bash
npm run check:boundaries
```

Скрипт `tools/scripts/check-boundaries.mjs` анализирует `package.json` всех workspaces.
