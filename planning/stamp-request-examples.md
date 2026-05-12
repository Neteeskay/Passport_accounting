# Примеры запросов для вкладок со штампами и связанными записями

Этот файл нужен как быстрый контракт между фронтендом и backend.

Все записи по вкладкам создаются через один и тот же набор маршрутов:

- `GET /api/v1/citizens/{citizen_id}/stamps`
- `POST /api/v1/citizens/{citizen_id}/stamps`
- `PUT /api/v1/citizens/{citizen_id}/stamps/{stamp_id}`
- `DELETE /api/v1/citizens/{citizen_id}/stamps/{stamp_id}`

Для выборки только одной вкладки можно передавать:

```text
GET /api/v1/citizens/{citizen_id}/stamps?stamp_category=<category>
```

Поддерживаемые категории:

- `history`
- `registration`
- `children`
- `marriage`
- `military`
- `foreign_passport`
- `name_change`

## 1. История паспорта

Маршрут:

```http
POST /api/v1/citizens/{citizen_id}/stamps
```

Body:

```json
{
  "stamp_category": "history",
  "stamp_type": "Первичный (14 лет)",
  "stamp_placed_at": "2026-03-28",
  "stamp_authority": "ОВД Октябрьского района",
  "stamp_note": "Первичная выдача паспорта",
  "is_active": true,
  "details": {
    "history_kind": "primary_14",
    "series": "4510",
    "number": "123456",
    "department_code": "770-001"
  }
}
```

Допустимые значения `history_kind`:

- `primary_14`
- `replace_20`
- `replace_45`
- `lost`
- `damaged`
- `other`

Примеры `stamp_type`:

- `Первичный (14 лет)`
- `Замена (20 лет)`
- `Замена (45 лет)`
- `Утерян`
- `Испорчен`
- `Иное`

## 2. Регистрация

Маршрут:

```http
POST /api/v1/citizens/{citizen_id}/stamps
```

Body:

```json
{
  "stamp_category": "registration",
  "stamp_type": "Снят с регистрационного учёта",
  "stamp_placed_at": "2026-03-28",
  "stamp_authority": "Отдел по вопросам миграции МВД г. Донецка",
  "stamp_note": "Основание для снятия с регистрации",
  "is_active": false,
  "details": {
    "registration_kind": "removed",
    "region": "Ростовская область",
    "district": "Октябрьский район",
    "locality": "г. Донецк",
    "settlement": "р.п. Шолоховский",
    "street": "ул. Пушкина",
    "house": "30",
    "apartment": "30",
    "migration_department": "Отдел по вопросам миграции МВД г. Донецка",
    "department_code": "460-026",
    "certified_by": "Подпись / должность"
  }
}
```

Допустимые значения `registration_kind`:

- `registered`
- `removed`

Примеры `stamp_type`:

- `Зарегистрирован`
- `Снят с регистрационного учёта`

## 3. Дети

Маршрут:

```http
POST /api/v1/citizens/{citizen_id}/stamps
```

Body:

```json
{
  "stamp_category": "children",
  "stamp_type": "Ребёнок",
  "stamp_placed_at": "2018-05-16",
  "stamp_authority": "Подпись/штамп",
  "stamp_note": "Ребёнок внесён в сведения о гражданине",
  "is_active": true,
  "details": {
    "last_name": "Иванов",
    "first_name": "Мария",
    "middle_name": "Ивановна",
    "sex": "male",
    "birth_date": "2018-05-16",
    "personal_code": "Подпись/штамп"
  }
}
```

Допустимые значения `sex`:

- `male`
- `female`

## 4. Брак

Маршрут:

```http
POST /api/v1/citizens/{citizen_id}/stamps
```

Body:

```json
{
  "stamp_category": "marriage",
  "stamp_type": "Зарегистрирован брак",
  "stamp_placed_at": "2024-04-15",
  "stamp_authority": "Отдел ЗАГС Октябрьского района",
  "stamp_note": "Семейное положение обновлено",
  "is_active": true,
  "details": {
    "marriage_kind": "registered",
    "spouse_last_name": "Петрова",
    "spouse_first_name": "Анна",
    "spouse_middle_name": "Сергеевна",
    "spouse_birth_date": "1998-09-10",
    "act_record_number": "740-240-019",
    "authority_name": "Отдел ЗАГС Октябрьского района",
    "certified_by": "Подпись / должность"
  }
}
```

Допустимые значения `marriage_kind`:

- `registered`
- `dissolved`

Примеры `stamp_type`:

- `Зарегистрирован брак`
- `Брак расторгнут`

## 5. Воинская обязанность

Маршрут:

```http
POST /api/v1/citizens/{citizen_id}/stamps
```

Body:

```json
{
  "stamp_category": "military",
  "stamp_type": "Обязан(а) исполнять воинскую обязанность",
  "stamp_placed_at": "2022-02-11",
  "stamp_authority": "Военный комиссариат г. Донецка",
  "stamp_note": "Статус воинского учёта зафиксирован",
  "is_active": true,
  "details": {
    "military_status": "active",
    "military_authority": "Военный комиссариат г. Донецка",
    "signed_by": "Подпись, ФИО, должность"
  }
}
```

Допустимые значения `military_status`:

- `active`
- `exempted`

Примеры `stamp_type`:

- `Обязан(а) исполнять воинскую обязанность`
- `Освобожден(а) от исполнения`

## 6. Загранпаспорт

Маршрут:

```http
POST /api/v1/citizens/{citizen_id}/stamps
```

Body:

```json
{
  "stamp_category": "foreign_passport",
  "stamp_type": "Загранпаспорт",
  "stamp_placed_at": "2024-03-18",
  "stamp_authority": "МВД России",
  "stamp_note": "Дополнительная информация о выдаче загранпаспорта",
  "is_active": true,
  "details": {
    "series": "72",
    "number": "1234567",
    "issuing_authority": "МВД России"
  }
}
```

## 7. Смена ФИО

Маршрут:

```http
POST /api/v1/citizens/{citizen_id}/stamps
```

Body:

```json
{
  "stamp_category": "name_change",
  "stamp_type": "Смена ФИО",
  "stamp_placed_at": "2023-07-20",
  "stamp_authority": "Отдел ЗАГС Центрального района",
  "stamp_note": "Вступление в брак",
  "is_active": true,
  "details": {
    "reason": "Вступление в брак",
    "previous_last_name": "Иванова",
    "previous_first_name": "Мария",
    "previous_middle_name": "Сергеевна",
    "new_last_name": "Петрова",
    "new_first_name": "Мария",
    "new_middle_name": "Сергеевна",
    "registry_office": "Отдел ЗАГС Центрального района",
    "document_number": "123456"
  }
}
```

## Получение записей по конкретной вкладке

Примеры:

```http
GET /api/v1/citizens/{citizen_id}/stamps?stamp_category=history
GET /api/v1/citizens/{citizen_id}/stamps?stamp_category=registration
GET /api/v1/citizens/{citizen_id}/stamps?stamp_category=children
GET /api/v1/citizens/{citizen_id}/stamps?stamp_category=marriage
GET /api/v1/citizens/{citizen_id}/stamps?stamp_category=military
GET /api/v1/citizens/{citizen_id}/stamps?stamp_category=foreign_passport
GET /api/v1/citizens/{citizen_id}/stamps?stamp_category=name_change
```

## Обновление записи

Для обновления используется тот же payload, что и для создания:

```http
PUT /api/v1/citizens/{citizen_id}/stamps/{stamp_id}
```

## Удаление записи

```http
DELETE /api/v1/citizens/{citizen_id}/stamps/{stamp_id}
```
