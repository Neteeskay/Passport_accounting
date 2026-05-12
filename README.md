# Passport Accounting

Базовая backend-структура проекта на `Python + FastAPI` для системы учета паспортных данных граждан.

## Что входит в T06

- каркас приложения `FastAPI`;
- конфигурация через переменные окружения;
- базовая структура пакетов для `api`, `core`, `db`, `models`, `schemas`, `services`;
- системные маршруты для проверки доступности сервиса;
- подготовка директории `storage/uploads`.

## Что входит в T07

- проектирование структуры базы данных `SQLite`;
- автоматическое создание файла БД при первом запуске;
- инициализация таблиц `users`, `citizens`, `stamps`;
- создание базовых индексов и ограничений целостности.

## Что входит в последние доработки

- подключение `CORS`-middleware для фронтенда с отдельного origin;
- admin-only endpoint-ы для получения списка, создания, редактирования и удаления пользователей системы.

## Структура проекта

```text
app/
  api/
    routes/
  core/
  db/
    schema.py
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

При первом запуске приложение автоматически создаст файл базы данных:

```text
storage/passport_accounting.db
```

## Настройка CORS

Если frontend и backend работают на разных портах или доменах, backend уже отдаёт CORS-заголовки.

По умолчанию в `.env` можно оставить:

```env
CORS_ALLOW_ORIGINS=*
CORS_ALLOW_CREDENTIALS=false
```

Если хотите ограничить доступ только фронтендом, укажите origins через запятую:

```env
CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Структура базы данных

- `users` — учетные записи сотрудников и администраторов
- `citizens` — карточки граждан с персональными и паспортными данными
- `stamps` — история штампов, привязанная к карточкам граждан

## Полезные маршруты

- `GET /` — краткая информация о сервисе
- `GET /health` — быстрая проверка доступности
- `GET /api/v1/system/health` — системный health-check
- `GET /api/v1/system/session` — доступно авторизованным `admin` и `operator`
- `GET /api/v1/system/admin` — доступно только `admin`
- `POST /api/v1/auth/login` — вход пользователя по логину и паролю
- `GET /api/v1/auth/users` — получение списка пользователей, доступно только `admin`
- `POST /api/v1/auth/users` — создание нового пользователя, доступно только `admin`
- `PUT /api/v1/auth/users/{user_id}` — редактирование пользователя, доступно только `admin`
- `DELETE /api/v1/auth/users/{user_id}` — удаление пользователя, доступно только `admin`
- `GET /api/v1/auth/me` — данные текущего авторизованного пользователя
- `POST /api/v1/auth/logout` — завершение текущего пользовательского сеанса
- `GET /api/v1/citizens` — поиск, фильтрация и сортировка списка граждан
- `GET /api/v1/citizens/{citizen_id}/pdf` — экспорт карточки гражданина в PDF
- `POST /api/v1/citizens` — создание новой карточки гражданина
- `PUT /api/v1/citizens/{citizen_id}` — редактирование существующей карточки гражданина
- `DELETE /api/v1/citizens/{citizen_id}` — полное удаление карточки гражданина и связанных записей
- `GET /api/v1/citizens/{citizen_id}/stamps` — выдача истории штампов гражданина
- `POST /api/v1/citizens/{citizen_id}/stamps` — добавление нового штампа
- `PUT /api/v1/citizens/{citizen_id}/stamps/{stamp_id}` — изменение существующего штампа
- `DELETE /api/v1/citizens/{citizen_id}/stamps/{stamp_id}` — удаление штампа
- `GET /docs` — Swagger UI

## Разграничение прав

- `admin` имеет доступ к разделам администрирования и ко всем рабочим разделам API
- `admin` может получать список, создавать, редактировать и удалять пользователей через `GET/POST/PUT/DELETE /api/v1/auth/users...`
- `operator` имеет доступ к рабочим разделам, связанным с гражданами и штампами
- маршруты `citizens` и `stamps` требуют авторизации и доступны ролям `admin` и `operator`
- маршрут `system/admin` доступен только роли `admin`

## Поиск граждан

Маршрут `GET /api/v1/citizens` поддерживает:

- `search` — поиск по ФИО, серии и номеру паспорта
- `birth_date` — фильтр по дате рождения
- `registration_address` — фильтр по адресу регистрации
- `passport_series` — фильтр по серии паспорта
- `passport_number` — фильтр по номеру паспорта
- `sort_by` — сортировка по `full_name`, `birth_date`, `created_at`, `updated_at`, `passport_series`
- `sort_order` — порядок `asc` или `desc`
- `limit`, `offset` — ограничение и смещение для списка

## Экспорт в PDF

Маршрут `GET /api/v1/citizens/{citizen_id}/pdf` формирует PDF-документ карточки гражданина и включает:

- основные персональные и паспортные данные;
- адрес регистрации;
- заметки;
- сведения о штампах;
- фотографию, если путь к файлу существует и изображение доступно.

## Структурированные штампы

Маршруты `stamps` теперь поддерживают несколько категорий записей через поле `stamp_category`:

- `history`
- `registration`
- `children`
- `marriage`
- `military`
- `foreign_passport`
- `name_change`

Базовый формат payload:

```json
{
  "stamp_category": "history",
  "stamp_type": "Первичный (14 лет)",
  "stamp_placed_at": "2026-03-28",
  "stamp_authority": "ОВД Октябрьского района",
  "stamp_note": "Первичная выдача паспорта",
  "is_active": true,
  "details": {
    "series": "4510",
    "number": "123456",
    "department_code": "770-001"
  }
}
```

Для выборки только одной вкладки можно использовать фильтр:

```text
GET /api/v1/citizens/{citizen_id}/stamps?stamp_category=registration
```

Удаление карточки гражданина через `DELETE /api/v1/citizens/{citizen_id}` очищает и связанные записи в `stamps`, потому что между `citizens` и `stamps` настроен `ON DELETE CASCADE`.

## Ближайшие шаги

- расширить управление пользователями;
- защитить дополнительные предметные разделы по ролям;
- добавить предметные маршруты и серверную валидацию данных.

## Тестовые учетные записи

- `admin / admin123`
- `operator / operator123`

## Frontend-Oriented API

- `GET /api/v1/auth/users` -> user management list
- `POST /api/v1/auth/users` -> create user by admin
- `PUT /api/v1/auth/users/{user_id}` -> partial or full user update
- `DELETE /api/v1/auth/users/{user_id}` -> delete user
- `GET /api/v1/citizens` -> frontend-shaped citizen list
- `GET /api/v1/citizens/{citizen_id}` -> detailed citizen card
- `GET /api/v1/citizens/stats` -> total, male, female counters
- `POST /api/v1/citizens/photo` -> upload photo and get `photoUrl`
- `GET /api/v1/citizens/registry/pdf` -> registry PDF export
- `GET /api/v1/citizens/{citizen_id}/pdf` -> single citizen PDF export

Supported list filters:

- `query`
- `gender`
- `birthDateFrom`
- `birthDateTo`
- `passport`
- `address`

Citizen payload sections:

- `registrationStamps`
- `children`
- `marriageRecords`
- `militaryRecords`
- `foreignPassports`
- `nameChanges`
- `historyRecords`

The citizen create/update payload accepts dates both in ISO format and in `dd.mm.yyyy`.
