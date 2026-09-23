# Один образ на оба фронта: цитология на порту 80, УЗИ на 81.
#
# Статика берётся уже собранной — образ её не собирает. Ожидаемая раскладка:
#
#   build/dist/cytology/    <- apps/cytology/dist
#   build/dist/ultrasound/  <- apps/ultrasound/dist
#
# Как её подготовить — см. README.md рядом.

FROM nginx:alpine

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY ./dist /usr/share/nginx/html

# --- Цитология (порт 80) ---
ENV API_BACKEND_URL=http://composition_api:50055
ENV DZI_BACKEND_URL=http://tiler_service:50055
# Сервис чанковой загрузки (services/cytology-upload).
ENV UPLOAD_BACKEND_URL=http://cytology_upload:8090

# --- УЗИ (порт 81) ---
# Основной бэкенд: Django при VITE_API_BACKEND=thyroid, Go-шлюз при med.
ENV UZI_API_BACKEND_URL=http://composition_api:50055
# Биллинг всегда в Go-шлюзе, даже когда остальное приложение смотрит на Django.
ENV UZI_BILLING_BACKEND_URL=http://composition_api:50055

# Подставлять только наши переменные.
#
# Скрипт `20-envsubst-on-templates.sh` из образа nginx по умолчанию заменяет
# ВСЕ переменные окружения, какие найдёт. В шаблоне рядом живут переменные
# самого nginx — $host, $uri, $scheme и прочие. Стоит завестись переменной
# окружения с таким же именем, и конфиг молча испортится. Фильтр это исключает.
ENV NGINX_ENVSUBST_FILTER=^(API_BACKEND_URL|DZI_BACKEND_URL|UPLOAD_BACKEND_URL|UZI_API_BACKEND_URL|UZI_BILLING_BACKEND_URL)$

EXPOSE 80 81

CMD ["nginx", "-g", "daemon off;"]
