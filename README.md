# Passport Accounting

Базовая backend-структура проекта на `Python + FastAPI` для системы учета паспортных данных граждан.

## Что входит в T06

- каркас приложения `FastAPI`;
- конфигурация через переменные окружения;
- базовая структура пакетов для `api`, `core`, `db`, `models`, `schemas`, `services`;
- системные маршруты для проверки доступности сервиса;
- подготовка директорий `storage/uploads` и `storage/backups`.

## Структура проекта

```text
app/
  api/
    routes/
  core/
  db/
  models/
  schemas/
  services/
planning/
storage/
```

## Установка зависимостей

```bash
py -m pip install -r requirements.txt
```

Если у вас используется команда `python`, можно выполнить:

```bash
python -m pip install -r requirements.txt
```

## Запуск проекта

```bash
py -m uvicorn app.main:app --reload
```

После запуска сервис будет доступен по адресу:

```text
http://127.0.0.1:8000
```

## Полезные маршруты

- `GET /` — краткая информация о сервисе
- `GET /health` — быстрая проверка доступности
- `GET /api/v1/system/health` — системный health-check
- `GET /docs` — Swagger UI

## Ближайшие шаги

- добавить аутентификацию и роли пользователей;
- подключить базу данных;
- реализовать сущности граждан, пользователей и штампов;
- добавить файловое хранилище и резервные копии.
