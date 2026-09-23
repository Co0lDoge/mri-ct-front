# Сервис чанковой загрузки цитологии.
#
# Контекст сборки — КОРЕНЬ монорепозитория, а не эта папка: сервис собирается
# из исходников `lib/cytology-upload`, которые лежат выше.
#
#   docker build -f services/cytology-upload/Dockerfile -t medml-cytology-upload .

FROM node:20-alpine AS builder

WORKDIR /repo

# Только сам сборщик. Устанавливать воркспейсы монорепозитория не нужно:
# esbuild не проверяет типы, ему достаточно найти исходники, а найти их мы
# поможем алиасами ниже. Раньше здесь стоял npm install по трём воркспейсам —
# он требовал согласованный package-lock.json на весь монорепозиторий и
# ронял сборку, а `--omit=optional` вдобавок выкидывал бинарник платформы,
# который esbuild-у как раз и нужен.
RUN npm install -g --no-audit --no-fund esbuild@0.25.10

COPY lib/cytology-upload lib/cytology-upload
COPY services/cytology-upload services/cytology-upload

# Алиас вместо node_modules: пакет монорепозитория резолвится прямо в исходники.
#
# Алиас ровно один и на точный подпуть. Более общий `@medml/cytology-upload`
# добавлять нельзя: esbuild матчит алиасы и по префиксу, и такой перехватил бы
# `@medml/cytology-upload/server`, склеив путь неправильно.
#
# form-data и formidable оставляем внешними: у formidable динамические require,
# бандлер их не разрешает. Оба ставятся в рантайм-стадии.
RUN esbuild services/cytology-upload/src/server.ts \
      --bundle --platform=node --target=node20 --format=cjs \
      --alias:@medml/cytology-upload/server=./lib/cytology-upload/src/server/index.ts \
      --external:form-data --external:formidable \
      --outfile=/build/server.cjs

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Только два внешних пакета из бандла.
#
# Манифест пишем минимальный, а не копируем из сервиса: в том числится
# workspace-зависимость `@medml/cytology-upload` версии `*`, и npm пошёл бы
# искать её в публичном реестре, где её, разумеется, нет.
RUN printf '{"name":"cytology-upload-runtime","private":true}\n' > package.json \
    && npm install --no-audit --no-fund form-data@^4.0.2 formidable@^3.5.4 \
    && npm cache clean --force

COPY --from=builder /build/server.cjs ./server.cjs

# Чанки и собранные файлы. В compose поверх монтируется том — иначе
# незавершённая загрузка пропадёт при перезапуске контейнера.
ENV UPLOAD_ROOT=/data/uploads
RUN mkdir -p /data/uploads

ENV PORT=8090
ENV HOST=0.0.0.0
EXPOSE 8090

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||8090)+'/healthz',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.cjs"]
