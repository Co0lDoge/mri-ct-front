# Карта пакетов `@medml/*`

## apps

| Пакет | Модальность | Стек |
|-------|-------------|------|
| `ultrasound-app` | УЗИ | Vite + React Router |
| `cytology-app` | Цитология | Vite + React Router |
| `ct-app` | КТ | Next.js |
| `mri-app` | МРТ | Next.js |

## domains

| Пакет | Назначение |
|-------|------------|
| `@medml/auth` | Аутентификация, ошибки доступа |
| `@medml/layout` | Каркас страниц, header |
| `@medml/patients` | API и типы пациентов |
| `@medml/patient_list` | Список пациентов |
| `@medml/patient_create` | Создание карты |
| `@medml/patient_view` | Карточка пациента |
| `@medml/cytology_upload` | UI загрузки слайда |

## lib

| Пакет | Назначение |
|-------|------------|
| `@medml/shared` | Типы, утилиты, константы |
| `@medml/store` | Redux, RTK Query, auth slice |
| `@medml/ui` | Ant Design, провайдеры |
| `@medml/viewers` | 2D-просмотр, Annotorious |
| `@medml/ct-mri-viewer` | DICOM, Cornerstone |
| `@medml/cytology-upload` | Chunked upload |
| `@medml/config` | Webpack/Next для КТ/МРТ |
