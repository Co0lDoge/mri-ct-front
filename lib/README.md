# lib

Технические библиотеки платформы.

## Инфраструктура

| Пакет | Назначение |
|-------|------------|
| `@medml/shared` | Типы, утилиты, upload-хелперы |
| `@medml/store` | Redux store, RTK Query, auth slice |
| `@medml/ui` | Ant Design, Loading/Message/Modal |
| `@medml/config` | Общий webpack для Next (КТ/МРТ) |

## Визуализация

| Пакет | Контур | Стек |
|-------|--------|------|
| `@medml/viewers` | 2D | Annotorious, OpenSeadragon |
| `@medml/ct-mri-viewer` | DICOM | Cornerstone3D |
| `@medml/cytology-upload` | Интеграция | Chunked upload, Vite plugin |

Пакеты `lib` не зависят от `domains/*` и `apps/*`.
