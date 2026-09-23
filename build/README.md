# Docker / nginx — цитология и УЗИ в одном образе

Один nginx отдаёт оба SPA и проксирует их API. Фронты ходят на относительные
`/api/...`, nginx пересылает запросы на бэкенды.

Приложения разведены **по портам**:

| Порт в контейнере | Приложение | Порт на хосте (compose) |
| ----------------- | ---------- | ----------------------- |
| 80                | Цитология  | 3001                    |
| 81                | УЗИ        | 3002                    |

## Сборка

Образ статику **не** собирает — её нужно подготовить заранее:

```bash
npm run build:cytology
npm run build:ultrasound

# Windows
xcopy /E /I /Y apps\cytology\dist   build\dist\cytology
xcopy /E /I /Y apps\ultrasound\dist build\dist\ultrasound

# Linux / macOS
mkdir -p build/dist
cp -r apps/cytology/dist   build/dist/cytology
cp -r apps/ultrasound/dist build/dist/ultrasound
```

Перед сборкой проверьте, на какой бэкенд собирается каждое приложение:

- `apps/cytology/.env.production` — для Go-шлюза нужно
  `VITE_CYTOLOGY_BACKEND=go` и `VITE_API_BASE_URL=/api/v1`;
- `apps/ultrasound/.env.production` — `VITE_API_BACKEND=thyroid` для Django
  либо `med` для Go.

## Запуск

Проще всего через `docker-compose.yml` в корне монорепозитория — он поднимает
фронт вместе с сервисом загрузки и подключается к сети Go-стека:

```bash
docker compose up -d --build
```

Вручную:

```bash
docker build -t medml-front ./build
docker run --rm -p 3001:80 -p 3002:81 \
  -e API_BACKEND_URL=http://host.docker.internal:8080 \
  -e UZI_API_BACKEND_URL=http://host.docker.internal:8000 \
  -e UZI_BILLING_BACKEND_URL=http://host.docker.internal:8080 \
  -e UPLOAD_BACKEND_URL=http://host.docker.internal:8090 \
  medml-front
```

## Переменные

| Переменная                | Куда идёт                          |
| ------------------------- | ---------------------------------- |
| `API_BACKEND_URL`         | API цитологии                      |
| `DZI_BACKEND_URL`         | тайлер (DZI)                       |
| `UPLOAD_BACKEND_URL`      | сервис чанковой загрузки           |
| `UZI_API_BACKEND_URL`     | основной API УЗИ (Django или шлюз) |
| `UZI_BILLING_BACKEND_URL` | биллинг УЗИ                        |

## Загрузка снимков цитологии

Пути `/api/upload/start`, `/chunk`, `/complete` и `/create-cytology` в разработке
поднимает плагин dev-сервера Vite. В собранном образе Node рядом нет, поэтому их
обслуживает отдельный сервис — `services/cytology-upload`, собранный на тех же
обработчиках (`lib/cytology-upload/src/server/handlers.ts`).

Без него загрузка `.svs` вернёт 404..

## Две тонкости конфига

**Адреса в `proxy_pass` подставляются через переменные** (`set $api_backend ...`),
а не литералами. С литеральным именем nginx резолвит апстрим при старте и падает
с `host not found in upstream`, если контейнер бэкенда ещё не поднят — фронт
тогда не запускается вовсе. С переменной и `resolver 127.0.0.11` резолв
откладывается до запроса: статика отдаётся всегда, а недоступный бэкенд даёт 502.
Обратная сторона: при переменной nginx не подставляет исходный путь
автоматически, поэтому он дописан явно — `proxy_pass $api_backend$request_uri;`.

**`NGINX_ENVSUBST_FILTER`** ограничивает подстановку только нашими переменными.
Иначе `envsubst` из образа nginx заменит все переменные окружения, какие найдёт,
включая совпадающие по имени с переменными самого nginx (`$host`, `$uri`).
