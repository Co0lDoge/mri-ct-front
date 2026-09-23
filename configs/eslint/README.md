# ESLint

Единая конфигурация линтинга для всего монорепозитория задаётся в корневом файле `eslint.config.mjs`.

Запуск из корня репозитория:

```bash
npm run lint
npm run lint:fix
```

Правила распространяются на `apps/*`, `domains/*` и `lib/*`. Каталоги `OLD-PROJECTS`, `dist`, `.next` и `node_modules` исключены.
