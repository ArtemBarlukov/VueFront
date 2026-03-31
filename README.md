# Инструменты для обработки открытых данных студентов ИРНИТУ

Фронтенд-приложение на Vue 3 для анализа академических данных студентов ИРНИТУ: статистика оценок, академический отпуск, предметная аналитика, рейтинг студентов и ML-аналитика (прогнозы и кластеризация).

---

## Оглавление

- [1. О проекте](#1-о-проекте)
- [2. Ключевые возможности](#2-ключевые-возможности)
- [3. Что обновлено в последних коммитах](#3-что-обновлено-в-последних-коммитах)
- [4. Технологический стек](#4-технологический-стек)
- [5. Требования](#5-требования)
- [6. Быстрый старт](#6-быстрый-старт)
- [7. Полная настройка backend + frontend](#7-полная-настройка-backend--frontend)
- [8. Скрипты npm](#8-скрипты-npm)
- [9. Архитектура приложения](#9-архитектура-приложения)
- [10. Навигация и разделы интерфейса](#10-навигация-и-разделы-интерфейса)
- [11. Детализация view-модулей](#11-детализация-view-модулей)
- [12. Переиспользуемые компоненты](#12-переиспользуемые-компоненты)
- [13. API-интеграция](#13-api-интеграция)
- [14. Авторизация и безопасность](#14-авторизация-и-безопасность)
- [15. Тестирование](#15-тестирование)
- [16. Структура проекта](#16-структура-проекта)
- [17. Конфигурация](#17-конфигурация)
- [18. Производственная сборка и деплой](#18-производственная-сборка-и-деплой)
- [19. Диагностика и типовые проблемы](#19-диагностика-и-типовые-проблемы)
- [20. Рекомендации по развитию](#20-рекомендации-по-развитию)
- [21. Связанные репозитории](#21-связанные-репозитории)
- [22. Лицензия](#22-лицензия)
- [23. Техническая карта модулей](#23-техническая-карта-модулей)
- [24. Каталог функций по файлам](#24-каталог-функций-по-файлам)
- [25. Контракты данных и модели API](#25-контракты-данных-и-модели-api)
- [26. Runtime-потоки и сценарии работы](#26-runtime-потоки-и-сценарии-работы)
- [27. Onboarding для нового разработчика](#27-onboarding-для-нового-разработчика)

---

## 1. О проекте

Приложение предназначено для визуализации и аналитики учебных данных студентов ИРНИТУ в формате единой веб-панели. Проект ориентирован на сотрудников, преподавателей и аналитиков, которым требуется:

- видеть оперативную статистику по успеваемости;
- фильтровать данные по курсам, группам, дисциплинам;
- оценивать риски отчисления и проблемные зоны;
- анализировать данные в разрезе групп и отдельных студентов;
- использовать результаты ML-подсистемы (прогнозы и кластерный анализ).

Основная идея: объединить разрозненные академические метрики в понятный интерфейс с наглядной визуализацией и быстрыми фильтрами.

---

## 2. Ключевые возможности

- Статистика оценок с агрегатами и графиками.
- Анализ студентов в академическом отпуске (успеваемость).
- Статистика по дисциплинам.
- Рейтинг студентов с фильтрами и сортировкой.
- Аналитические карточки и статусные срезы по студентам.
- Групповая аналитика с рисками и детализацией по выбранной группе.
- Отдельная вкладка ML-аналитики:
  - прогноз оценок;
  - кластеризация студентов;
  - просмотр данных по конкретному студенту (кластер/метрики).
- JWT-аутентификация с автоматическим refresh токена.
- Unit-тесты ключевых views и UI-компонентов.

---

## 3. Что обновлено в последних коммитах

Ниже перечислены ключевые улучшения, добавленные в диапазоне от базового коммита до текущей версии ветки:

### 3.1 Новый функционал

- Добавлена новая view-вкладка `ML АНАЛИТИКА` (`src/views/StudentAnalyticsView.vue`).
- Реализованы сценарии:
  - обучение/получение прогноза;
  - запуск кластеризации;
  - получение кластерных данных и поиск по ID студента.

### 3.2 Улучшения аналитики

- `StatisticsView` расширен блоком аналитики по группам:
  - сводные KPI-карточки;
  - инсайты;
  - табличная сводка с рисковыми индикаторами;
  - детализация выбранной группы.
- `StudentRatingView` дополнен:
  - аналитическими карточками статусов;
  - фильтрацией по статусам;
  - отображением долгов;
  - пакетной (batch) догрузкой больших наборов данных.

### 3.3 UX/A11y и стабильность

- Улучшены доступность и навигация:
  - ARIA-атрибуты;
  - улучшенное мобильное меню;
  - доработки адаптивного поведения вкладок.
- Оптимизирована обработка ошибок API, убраны лишние консольные логи.

### 3.4 Тестирование

- Добавлена тестовая инфраструктура Vitest.
- Подключены `@vue/test-utils`, `happy-dom`, coverage (`@vitest/coverage-v8`).
- Добавлены unit-тесты (`src/__tests__`) для ключевых модулей.

---

## 4. Технологический стек

### 4.1 Frontend

- `Vue 3` — базовый UI-фреймворк.
- `Vite` — dev-сервер и сборка в текущем процессе разработки.
- `Bootstrap 5` — адаптивная сетка и базовые UI-классы.
- `Chart.js` — диаграммы и графики.
- `@mdi/font`, `Material Icons` — иконки.

### 4.2 Управление приложением

- `Composition API` для реактивного состояния.
- `provide/inject` для передачи API-утилит в дочерние modules.
- `localStorage` для хранения токенов и данных пользователя.

### 4.3 Тестирование

- `Vitest` — запуск unit-тестов.
- `@vue/test-utils` — тестирование Vue-компонентов.
- `happy-dom` — браузероподобная среда для тестов.

### 4.4 Примечание по toolchain

В проекте присутствуют конфигурации как Vite (`vite.config.js`), так и Vue CLI (`vue.config.js`, `@vue/cli-service` в `package.json`). Для основной разработки используется `npm run dev` (Vite). Скрипты `serve`/`build` привязаны к Vue CLI и сохранены для совместимости.

---

## 5. Требования

### 5.1 Локальная среда

- `Node.js` 16+ (рекомендуется 18+).
- `npm` 8+.

### 5.2 Внешние сервисы

- Django backend с API (по умолчанию: `http://127.0.0.1:8000`).
- База данных backend: PostgreSQL или SQL Server.
- Пользователь backend (обычно superuser) для авторизации во frontend.

---

## 6. Быстрый старт

Если backend уже работает локально:

```bash
npm install
npm run dev
```

После запуска frontend доступен по адресу `http://localhost:5173`.

---

## 7. Полная настройка backend + frontend

## 7.1 Backend (Django)

1. Клонировать backend-репозиторий:

```bash
git clone https://github.com/kopikou/IRNTU-Dashboard_django_backend-main.git
cd IRNTU-Dashboard_django_backend-main
```

2. Создать виртуальное окружение:

Windows (PowerShell):
```bash
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
```

Linux/macOS:
```bash
python3.12 -m venv venv
source venv/bin/activate
```

3. Установить зависимости backend:

```bash
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

4. Настроить БД в `app/settings.py` (PostgreSQL или SQL Server).

5. Выполнить миграции:

```bash
python manage.py makemigrations
python manage.py migrate
```

6. Создать пользователя:

```bash
python manage.py createsuperuser
```

7. Запустить backend:

```bash
python manage.py runserver
```

Backend по умолчанию будет доступен на `http://127.0.0.1:8000`.

## 7.2 Frontend

1. Установить зависимости:

```bash
npm install
```

2. Убедиться в прокси-настройке (`vite.config.js`):

- префикс: `/api`
- target: `http://127.0.0.1:8000`

3. Запустить dev-режим:

```bash
npm run dev
```

4. Открыть `http://localhost:5173` и выполнить вход.

---

## 8. Скрипты npm

В `package.json` доступны:

- `npm run dev` — запуск Vite dev-сервера.
- `npm run test` — запуск Vitest в watch-режиме.
- `npm run test:coverage` — запуск тестов с покрытием.
- `npm run serve` — запуск через Vue CLI (legacy/совместимость).
- `npm run build` — production-сборка через Vue CLI (legacy/совместимость).

---

## 9. Архитектура приложения

### 9.1 Основная схема

- `src/app.vue`:
  - управление верхнеуровневой навигацией;
  - авторизация;
  - общая обработка API-запросов;
  - provide зависимостей (`fetchData`, `API_BASE_URL`);
  - динамическая подгрузка views через `defineAsyncComponent`.

- `src/views/*.vue`:
  - разделы бизнес-логики и визуализации.

- `src/components/*`:
  - переиспользуемые графические и UI-компоненты.

### 9.2 Поток данных

1. Пользователь авторизуется.
2. `app.vue` сохраняет токены и предоставляет `fetchData`.
3. View-компоненты получают `fetchData` через `inject`.
4. Компоненты запрашивают API и строят таблицы/диаграммы.
5. При `401` выполняется refresh токена и повтор запроса.

### 9.3 Навигационная модель

Маршрутизация реализована не через URL-router, а через табовую навигацию и переключение `activeTab` в `app.vue`.

---

## 10. Навигация и разделы интерфейса

Верхнее меню (desktop + mobile) содержит вкладки:

- `СТАТИСТИКА ОЦЕНОК`
- `АКАДЕМИЧЕСКИЙ ОТПУСК`
- `СТАТИСТИКА ПО ПРЕДМЕТАМ`
- `РЕЙТИНГ СТУДЕНТОВ`
- `ML АНАЛИТИКА`

Для мобильной версии реализовано отдельное выпадающее меню с синхронизацией активной вкладки.

---

## 11. Детализация view-модулей

## 11.1 `StatisticsView.vue`

Назначение: сводная статистика оценок, таблицы и графики по учебным данным.

Основные возможности:
- фильтры по курсу/семестру/группе/дисциплине;
- summary-панель (средний балл, распределения оценок);
- визуализация через Chart.js;
- расширенный блок аналитики по группам:
  - рейтинг групп;
  - индикаторы рисков;
  - инсайты;
  - детализация выбранной группы.

Ключевые API:
- `GET /api/statistics/marks/`
- `GET /api/student-rating/` (для enrichment посещаемости по группам)

## 11.2 `AcademicLeaveView.vue`

Назначение: анализ данных студентов в академическом отпуске.

Основные возможности:
- вкладка успеваемости в академическом отпуске;
- сводные показатели и таблицы;
- подготовленная структура под вкладку возвратов (backend-эндпоинт временно отключен).

Ключевые API:
- `GET /api/academic/performance/`
- `GET /api/academic/returns/` (временно недоступен на backend)

## 11.3 `SubjectStatsView.vue`

Назначение: аналитика по дисциплинам.

Основные возможности:
- фильтрация по учебным параметрам;
- сортировка дисциплин;
- метрики по успеваемости и распределению оценок.

Ключевой API:
- `GET /api/statistics/subject/`

## 11.4 `StudentRatingView.vue`

Назначение: рейтинг студентов с метриками успеваемости.

Основные возможности:
- фильтры (курс, группа, предмет);
- сортировка (рейтинг, успеваемость, посещаемость, активность);
- график топ-студентов;
- таблица с пагинацией;
- аналитические карточки статусов:
  - отличники;
  - зона риска;
  - хорошая посещаемость;
- отображение долгов и статусов;
- догрузка данных по батчам для больших объемов.

Ключевой API:
- `GET /api/student-rating/`

## 11.5 `StudentAnalyticsView.vue`

Назначение: ML-аналитика по студентам.

Сценарии:
- прогнозирование:
  - обучение модели прогноза;
  - получение прогнозов;
  - фильтрация и сортировка прогнозных результатов;
- кластеризация:
  - запуск обучения кластерной модели;
  - загрузка кластерных данных;
  - выбор группы;
  - просмотр кластера конкретного студента по ID.

Ключевые API:
- `POST /api/predictions/train/`
- `GET /api/predictions/data/`
- `POST /api/analytics/train/`
- `GET /api/analytics/data/`
- `GET /api/analytics/data/{studentId}/`
- `GET /api/groups/`

---

## 12. Переиспользуемые компоненты

### 12.1 Визуализация и фильтры

- `ChartComponent.vue` — обертка над Chart.js.
- `ChartFilter.vue` — фильтры для графиков.
- `Pagination.vue` — пагинация таблиц.
- `PerPageSelector.vue` — выбор размера страницы.

### 12.2 UI-компоненты

- `UI/MyButton.vue`
- `UI/MyInput.vue`
- `UI/MySelect.vue`
- `UI/MyDialog.vue`

### 12.3 Дополнительные

- `PostForm.vue`, `PostItem.vue`, `PostList.vue` — вспомогательные/демонстрационные компоненты.

---

## 13. API-интеграция

### 13.1 Базовая конфигурация

- Базовый URL внутри фронтенда: `API_BASE_URL = '/api'` (в `src/app.vue`).
- Проксирование настроено в `vite.config.js`:
  - `/api` -> `http://127.0.0.1:8000`.

### 13.2 Универсальный HTTP-слой

В `app.vue` реализована функция `fetchData(url, options, isRetry)`:

- добавляет `Authorization: Bearer <accessToken>`, если пользователь авторизован;
- обрабатывает ошибки HTTP и сообщения backend;
- при `401` пытается обновить токен;
- после успешного refresh повторяет исходный запрос;
- при неуспехе refresh выполняет logout и повторный вход.

### 13.3 Основные endpoint-группы

Авторизация:
- `POST /api/login/`
- `POST /api/auth/token/refresh/`

Справочники:
- `GET /api/groups/`
- `GET /api/disciplines/`

Аналитика/статистика:
- `GET /api/statistics/marks/`
- `GET /api/statistics/subject/`
- `GET /api/student-rating/`

Академический отпуск:
- `GET /api/academic/performance/`
- `GET /api/academic/returns/` (backend может быть отключен)

ML:
- `POST /api/predictions/train/`
- `GET /api/predictions/data/`
- `POST /api/analytics/train/`
- `GET /api/analytics/data/`
- `GET /api/analytics/data/{studentId}/`

### 13.4 Форматы запросов

- `Content-Type: application/json`
- `Accept: application/json`
- `Authorization: Bearer <token>` для защищенных endpoint.

---

## 14. Авторизация и безопасность

### 14.1 JWT-схема

Используется пара токенов:

- `accessToken` — короткоживущий;
- `refreshToken` — для обновления `accessToken`.

### 14.2 Хранение данных на клиенте

- `localStorage.accessToken`
- `localStorage.refreshToken`
- `localStorage.userData`

### 14.3 Поведение при истечении сессии

1. API возвращает `401`.
2. Клиент вызывает refresh endpoint.
3. При успехе повторяет исходный запрос.
4. При неуспехе — сбрасывает сессию и открывает окно логина.

---

## 15. Тестирование

### 15.1 Текущий тестовый стек

- `vitest.config.js`:
  - среда `happy-dom`;
  - глобальные API тестов;
  - `setupFiles: ./src/__tests__/setup.js`;
  - alias `@` -> `src`.

### 15.2 Что покрыто unit-тестами

View-тесты:
- `AcademicLeaveView.spec.js`
- `StatisticsView.spec.js`
- `SubjectStatsView.spec.js`
- `StudentRatingView.spec.js`

Компоненты:
- `ChartComponent.spec.js`
- `ChartFilter.spec.js`
- `Pagination.spec.js`
- `PerPageSelector.spec.js`
- `MyButton.spec.js`
- `MyInput.spec.js`
- `MySelect.spec.js`
- `MyDialog.spec.js`
- `PostForm.spec.js`
- `PostItem.spec.js`

### 15.3 Запуск тестов

```bash
npm run test
```

Покрытие:

```bash
npm run test:coverage
```

---

## 16. Структура проекта

```text
VueFront/
├── public/
│   ├── datasets/
│   └── favicon.ico
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── UI/
│   │   │   ├── MyButton.vue
│   │   │   ├── MyInput.vue
│   │   │   ├── MySelect.vue
│   │   │   └── MyDialog.vue
│   │   ├── ChartComponent.vue
│   │   ├── ChartFilter.vue
│   │   ├── Pagination.vue
│   │   ├── PerPageSelector.vue
│   │   ├── PostForm.vue
│   │   ├── PostItem.vue
│   │   └── PostList.vue
│   ├── views/
│   │   ├── StatisticsView.vue
│   │   ├── AcademicLeaveView.vue
│   │   ├── SubjectStatsView.vue
│   │   ├── StudentRatingView.vue
│   │   └── StudentAnalyticsView.vue
│   ├── __tests__/
│   │   ├── *.spec.js
│   │   └── setup.js
│   ├── app.vue
│   └── main.js
├── index.html
├── vite.config.js
├── vitest.config.js
├── vue.config.js
├── package.json
└── README.md
```

---

## 17. Конфигурация

### 17.1 `vite.config.js`

- dev-сервер:
  - `host: 0.0.0.0`
  - `port: 5173`
  - `open: true`
- proxy:
  - `/api` -> `http://127.0.0.1:8000`
- alias:
  - `@` -> `./src`

### 17.2 `vitest.config.js`

- test environment: `happy-dom`
- setup file: `src/__tests__/setup.js`
- alias `@` для импортов в тестах.

### 17.3 `vue.config.js`

Содержит legacy-конфигурацию `@vue/cli-service` и define-переменные Vue runtime. Используется при запуске CLI-скриптов `serve/build`.

---

## 18. Производственная сборка и деплой

### 18.1 Сборка

Сейчас в `package.json` production-сборка завязана на Vue CLI:

```bash
npm run build
```

### 18.2 Что проверить перед деплоем

- Backend доступен из production-среды.
- Настроен CORS на backend.
- Корректно настроен путь API (`/api` + proxy/reverse proxy).
- Включены мониторинг ошибок и логи backend.

### 18.3 Варианты хостинга

- Nginx / Apache (статическая раздача + проксирование API).
- Облачные статические платформы (при наличии корректного backend URL и CORS).

---

## 19. Диагностика и типовые проблемы

### 19.1 `401 Unauthorized`

Проверьте:
- корректность логина/пароля;
- наличие `refreshToken` в `localStorage`;
- доступность `POST /api/auth/token/refresh/`;
- срок действия токенов на backend.

### 19.2 Данные не загружаются

Проверьте:
- backend реально запущен на `127.0.0.1:8000`;
- proxy в `vite.config.js`;
- endpoint существует и доступен;
- права пользователя backend.

### 19.3 Неполные таблицы/графики

Проверьте:
- выбранные фильтры (курс/группа/предмет);
- сортировку и лимиты;
- реальные данные в backend по выбранному диапазону.

### 19.4 Тесты не стартуют

Проверьте:
- установлены ли зависимости (`npm install`);
- версии Node/npm;
- наличие `vitest.config.js` и `src/__tests__/setup.js`.

---

## 20. Рекомендации по развитию

- Вынести API base URL и параметры окружения в `.env` (dev/stage/prod).
- Унифицировать build-toolchain (Vite-only) для исключения двойной конфигурации.
- Добавить e2e-тесты (например, Playwright/Cypress) для критических сценариев.
- Расширить покрытие unit-тестами `StudentAnalyticsView`.
- Ввести централизованный error boundary и уведомления.

---

## 21. Связанные репозитории

- Django backend:
  - [https://github.com/kopikou/IRNTU-Dashboard_django_backend-main](https://github.com/kopikou/IRNTU-Dashboard_django_backend-main)

Без backend фронтенд не сможет загрузить рабочие данные.

---

## 22. Лицензия

Проект разработан в учебно-прикладных целях для ИРНИТУ.

---

## 23. Техническая карта модулей

Этот раздел описывает архитектуру уже на уровне инженерной реализации: где живет логика, какие зависимости используются, и как в рантайме движутся данные.

### 23.1 Слой `app-shell` (`src/app.vue`)

`app.vue` выполняет роль orchestration-layer:

- хранит состояние сессии (`accessToken`, `refreshToken`, `userData`, `isAuthenticated`);
- содержит единый API-шлюз `fetchData`;
- управляет верхнеуровневой навигацией (`activeTab`);
- загружает справочники фильтров (`groups`, `disciplines`);
- провайдит `fetchData` и `API_BASE_URL` в дочерние views через `provide/inject`.

### 23.2 Слой view-аналитики (`src/views/*.vue`)

Каждый view-экран инкапсулирует:

- собственные фильтры и local state;
- отдельный fetch-цикл API;
- computed-подготовку данных под графики/таблицы;
- сортировку/пагинацию;
- пользовательские интеракции (поиск, click по диаграммам, reset).

### 23.3 Слой общих компонентов (`src/components`)

- `ChartComponent.vue` — единый адаптер Chart.js + нормализованный `chartClick` event.
- `Pagination.vue` — стандартный контрол пагинации с эллипсисами.
- `PerPageSelector.vue` — контроль размера страницы.
- `UI/*` — базовые UI-компоненты (часть исторического слоя).

### 23.4 Ключевые технические особенности

- Архитектурно проект придерживается Composition API для views, но содержит legacy-компоненты в Options API.
- В проекте смешанный toolchain (Vite + Vue CLI legacy).
- Вся серверная коммуникация проходит через `fetchData`, что упрощает контроль авторизации и ошибок.

---

## 24. Каталог функций по файлам

Ниже приведен практический справочник по основным функциям. Это не просто перечень имен — это "что делает функция и зачем она нужна".

## 24.1 `src/app.vue`

### Константы и состояние

- `API_BASE_URL`, `LOGIN_PATH`, `TOKEN_REFRESH_PATH` — центральные URL-константы API.
- `activeTab` — текущий раздел интерфейса.
- `filterOptions` — справочные данные для селектов (курсы/семестры/группы/предметы).
- `chartOptions`, `ratingChartOptions` — базовые options Chart.js для дочерних views.
- auth-state: `isAuthenticated`, `accessToken`, `refreshToken`, `userData`, `loginForm`.

### Функции

- `fetchData(url, options, isRetry)`
  - единая обертка над `fetch`;
  - проставляет JSON headers;
  - добавляет Bearer token;
  - на `401` запускает refresh сценарий;
  - при успешном refresh повторяет исходный запрос;
  - на критических auth-ошибках инициирует logout.

- `setActiveTab(tabName)`
  - переключает активную вкладку (desktop-flow).

- `toggleMobileMenu()`, `setActiveTabMobile(tabName)`
  - управление мобильным меню и синхронный переход во view.

- `openLoginModal()`
  - чистит форму и открывает Bootstrap Modal входа.

- `login()`
  - выполняет `POST /api/login/`;
  - сохраняет токены и профиль в `localStorage`;
  - запускает `loadFilterOptions()` после успешного входа.

- `logout()`
  - очищает auth/localStorage;
  - очищает кэш фильтров;
  - перезагружает страницу.

- `logoutAndShowLogin(message)`
  - композиция logout + alert + повторное окно логина.

- `refreshAccessToken()`
  - выполняет `POST /api/auth/token/refresh/`;
  - обновляет `accessToken` (и optionally `refreshToken`).

- `loadFilterOptions()`
  - запрашивает группы и дисциплины;
  - нормализует/сортирует списки;
  - пишет ошибки в `globalError`.

### Computed

- `currentViewComponent` — маппинг `activeTab` -> async view-component.
- `formattedUserName` — форматирование ФИО в короткий вид.

### Lifecycle

- `onMounted()`
  - инициализирует Bootstrap Modal;
  - восстанавливает auth из localStorage;
  - запускает `loadFilterOptions()`.

## 24.2 `src/views/StatisticsView.vue`

### Назначение

Главная статистическая витрина по оценкам + расширенный аналитический блок по группам.

### Функции ядра

- `fetchStatisticsMarks()`
  - строит query из фильтров;
  - вызывает `GET /api/statistics/marks/`;
  - подготавливает таблицу `allStudentsData` через `processStudentData()`;
  - запускает построение групповой аналитики `buildGroupAnalyticsFromMarks()`.

- `resetFilters()`
  - очищает фильтры и перезапрашивает данные.

- `processStudentData(students)`
  - разворачивает вложенную структуру `student -> subjects -> grades` в плоскую таблицу строк;
  - нормализует строки оценок (`зачет`, `незачет`, `неявка`);
  - сохраняет исходный student ID для строк таблицы.

- `sortBy(key)`
  - сортировка таблицы по выбранной колонке;
  - отдельная логика для сортировки оценок (число/текст).

- `debouncedSearch()`, `clearSearch()`
  - отложенный поиск с `setTimeout` и очистка состояния поиска.

- `handleGradeDistributionClick(data)`
  - drill-down: клик по сегменту диаграммы -> временный grade-фильтр таблицы.

- `clearGradeFilter()`
  - снимает временный фильтр по оценке.

- `onPageChange(page)`, `resetPagination()`
  - стандартный page-flow таблицы.

### Функции групповой аналитики

- `buildGroupAnalyticsFromMarks()`
  - агрегирует данные по группам;
  - считает средний балл и количество студентов;
  - запускает enrichment посещаемостью.

- `fetchGroupAttendance()`
  - догружает посещаемость групп через `GET /api/student-rating/`;
  - рассчитывает риск-группы (`avgGrade < 3.5` или `attendance < 60`).

- `selectGroup(groupName)`
  - включает/выключает выбранную группу для детализации.

- `parseGradeToNumeric(grade)`, `isFailGrade(grade)`
  - сервисные функции для унификации расчетов.

- `gradeBarClass(grade)`, `attendanceBarClass(pct)`
  - маппинг метрик в CSS-классы прогресс-баров.

### Computed ключевые

- `gradeSummaryChartData`, `gradeDistributionChartData`
- `filteredStudents`, `paginatedStudents`, `totalPages`
- `sortedGroupFull`, `bestGroup`, `groupsAtRiskCount`, `overallAvgGrade`
- `selectedGroupStudents`, `selectedGroupAvgGrade`, `selectedGroupFailRate`
- `selectedGroupSubjectIssues`, `selectedGroupCriticalSubjects`
- `groupInsights`

### Watches

- watch на изменение базовых фильтров (`course`, `semester`, `group`, `subject`) -> `fetchStatisticsMarks()`.

## 24.3 `src/views/StudentRatingView.vue`

### Назначение

Рейтинг студентов с аналитическими статусами и постепенной загрузкой больших наборов.

### Функции загрузки

- `buildBaseParams()`
  - формирует query-параметры по фильтрам.

- `fetchRatingBatch(baseParams, offset, limit)`
  - batch-запрос части данных рейтинга.

- `loadRemainingBatches(baseParams, token, initialOffset, total)`
  - последовательная догрузка следующих порций;
  - поддерживает отмену устаревшего запроса через `activeLoadToken`.

- `fetchStudentRating()`
  - основной orchestrator загрузки:
    - сброс состояния;
    - загрузка первого батча;
    - запуск фоновой догрузки остатка;
    - пересчет аналитических статусов.

### Аналитика статусов

- `deriveAnalyticsFromStudents()`
  - классифицирует студентов в категории:
    - top (`avgGrade >= 4.5` и `riskLevel=низкий`);
    - risk (`riskLevel=высокий`);
    - good attendance (`attendance >= 80` без высокого риска).

- `getStudentStatus(studentId)`, `getStudentStatusClass(studentId)`
  - статус и его визуальный class для строки таблицы.

- `setStatusFilter(status)`
  - включает/выключает фильтр по категории статуса.

### Форматирование и UI-функции

- `formatRatingAttendance(p)`
- `formatDropoutRisk(r)`
- `getDropoutRiskClass(r)`
- `formatDebtsTooltip(debtsDetails)`

### Computed

- `analyticsSummary` — total/count/percent по статусам.
- `chartData` — top N (по `filters.limit`) для графика.
- `ratingChartData` — stacked-dataset (успеваемость, активность, посещаемость).
- `filteredStudents`, `paginatedStudents`, `totalPages`.

### Watch/Lifecycle

- watch базовых фильтров -> `fetchStudentRating()`.
- `onMounted` -> первичная загрузка рейтинга.

## 24.4 `src/views/StudentAnalyticsView.vue`

### Назначение

ML-экран: прогнозирование и кластерный анализ.

### Prediction-flow (прогноз)

- `extractGroupBase(name)`
  - нормализует базу названия группы (без завершающих чисел потока).

- `trainAndFetchPredictions()`
  - `POST /api/predictions/train/`;
  - после обучения автоматически вызывает `fetchPredictions()`.

- `fetchPredictions()`
  - `GET /api/predictions/data/` по текущим параметрам формы;
  - обновляет `predictions`.

- `onFacultyChange()`
  - сбрасывает зависимые поля формы и текущие результаты.

### Prediction computed

- `faculties`, `filteredGroupBases`, `canSubmitPrediction`
- `sortedPredictions` (сортировки + фильтр направления изменений)
- `predSummary` (средние/positive/negative/neutral)
- `predChartData` (bar-график сравнения текущей и прогнозной оценки)

### Clustering-flow

- `trainClustering()`
  - `POST /api/analytics/train/`;
  - после тренировки загружает кластерные данные.

- `fetchClusteringData()`
  - `GET /api/analytics/data/` (+ optional `?group=...`).

- `fetchStudentCluster()`
  - `GET /api/analytics/data/{studentId}/`.

### Clustering computed

- `clusterStudents`
- `clusterGroupStats`
- `clusterChartData` (scatter-график: `x=avg_grade`, `y=attendance%`).

### Shared helpers

- `formatGrade`, `gradeClass`
- `changeTextClass`, `directionBadgeClass`, `directionLabel`
- `formatChangePercent`
- `clusterBadgeClass`

### Lifecycle

- `onMounted` загружает группы (`GET /api/groups/`) для формы прогноза.

## 24.5 `src/views/AcademicLeaveView.vue`

### Назначение

Аналитика академического отпуска: успеваемость и (архитектурно подготовленная) вкладка возвратов.

### API-функции

- `fetchAcademicPerformance()` -> `GET /api/academic/performance/`.
- `fetchAcademicReturns()` -> в текущей версии endpoint отключен backend, функция возвращает информативную ошибку.

### Табличные и фильтрующие функции

- `sortTable(key)`, `getSortIcon(key)`
- `getDebtBadgeClass(debts)`
- `debouncedSearch()`, `debouncedReturnsSearch()`
- `clearSearch()`, `clearChartFilter()`
- `onPageChange(page)`, `resetPagination()`

### Drill-down интеракции по диаграммам

- `handlePerformanceChartClick(data)` — фильтр по числу долгов.
- `handleGroupDistributionClick(data)` — фильтр по группе.
- `handleReturnDatesClick(data)` — фильтр по месяцу возврата.
- `handleStatusChartClick(data)` — фильтр по статусу возврата.

### Вычисления

- `debtsChartData`, `groupAverageDebtsChartData`, `statusChartData`
- `sortedPerformanceStudents`, `filteredReturnsStudents`
- `paginatedStudents`, `paginatedReturnsStudents`
- `uniqueStatuses`

### Watches / Lifecycle

- watch `academicSubTab` для ленивой загрузки данных вкладки.
- watch `filtersPerformance` с debounce-fetch.
- `onMounted` инициализирует первый fetch + Bootstrap Dropdown.

## 24.6 `src/views/SubjectStatsView.vue`

### Назначение

Аналитика дисциплин по фильтрам и сортировкам.

### Функции

- `fetchSubjectStats()`
  - формирует query по фильтрам;
  - запрашивает `GET /api/statistics/subject/`.

- `resetFilters()`
  - сброс фильтров в дефолты.

- `selectAllGroups()`
  - массовый выбор всех доступных групп.

- `getSemesterName(value)`
  - преобразование значения семестра в label.

- `getSortByLabel(sortBy)`
  - text-label активной сортировки.

- `onPageChange(page)`, `resetPagination()`

### Computed

- `gradeDistributionBarData`
- `bestSubjectsChartData`
- `allStudents`, `paginatedStudents`, `totalPages`

### Watches / Lifecycle

- watch `filters` -> `fetchSubjectStats()`.
- `onMounted` -> первичный fetch + инициализация Dropdown.

## 24.7 `src/components/ChartComponent.vue`

### Назначение

Единый wrapper для Chart.js с корректным lifecycle.

### Функции

- `destroyChart()` — безопасно уничтожает текущий экземпляр графика.
- `createOrUpdateChart()`:
  - уничтожает предыдущий инстанс;
  - строит новый Chart;
  - проксирует клики из Chart.js в Vue-event `chartClick`.

### Lifecycle

- `onMounted` -> initial render.
- `watch(props.chartData, deep=true)` -> rerender.
- `onBeforeUnmount` -> `destroyChart()`.

## 24.8 `src/components/Pagination.vue`

- `onPageChange(page)` — валидирует границы и эмитит `page-change`.
- `displayedPages` — вычисление центрального окна страниц.
- `showFirstButton`, `showLastButton`, `showLeftEllipsis`, `showRightEllipsis` — computed-флаги визуальной логики.

## 24.9 `src/components/PerPageSelector.vue`

- `onChange()` — эмитит `update:modelValue` и `change`.
- watch `props.modelValue` синхронизирует внутренний `perPage`.

## 24.10 Legacy UI/Posts-компоненты

`UI/MyButton.vue`, `UI/MyInput.vue`, `UI/MySelect.vue`, `UI/MyDialog.vue`, `PostForm.vue`, `PostItem.vue`, `PostList.vue`, `ChartFilter.vue` — исторический слой переиспользуемых/учебных компонентов (частично не задействован в текущем аналитическом потоке).

Из практических нюансов:
- эти компоненты написаны в Options API;
- `PostList.vue` содержит import `@/comp/PostItem.vue` — путь требует проверки при реиспользовании.

---

## 25. Контракты данных и модели API

Раздел помогает новичку быстро понять структуру payload без чтения всего frontend-кода.

## 25.1 Авторизация

### Request: `POST /api/login/`

```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

### Response (ожидаемо)

```json
{
  "access": "jwt-access",
  "refresh": "jwt-refresh",
  "name": "Иванов Иван Иванович",
  "email": "user@example.com"
}
```

## 25.2 Статистика оценок (`/api/statistics/marks/`)

Ожидаемые ключи:
- `summary` (агрегаты);
- `students` (массив студентов со вложенными предметами/оценками).

Типовая структура студента:

```json
{
  "id": 12345,
  "group": "ИВТ-21-1",
  "subjects": [
    {
      "subject": "Математика",
      "grades": [5, 4, "зачет"]
    }
  ]
}
```

## 25.3 Рейтинг студентов (`/api/student-rating/`)

Ключи:
- `students` — детализированные метрики;
- `chartData` — данные для chart;
- `pagination` — total/hasMore для batch-подгрузки.

Ожидаемые поля студента:
- `id`, `group`, `course`
- `avgGrade`, `attendancePercent`, `activity`
- `dropoutRisk`, `riskLevel`
- `rating`
- `debtCount`, `debtsDetails`

## 25.4 Статистика по предметам (`/api/statistics/subject/`)

Ключи:
- `gradeDistributionBar`
- `bestSubjects`
- `students`

## 25.5 Academic (`/api/academic/performance/`, `/api/academic/returns/`)

Performance-ответ обычно содержит:
- `students`
- `debtsDistribution`
- `groupAverages`

Returns-ответ (если endpoint включен):
- `students`
- `statusDistribution`

## 25.6 ML endpoint-ы

Prediction:
- `POST /api/predictions/train/`
- `GET /api/predictions/data/`

Clustering:
- `POST /api/analytics/train/`
- `GET /api/analytics/data/`
- `GET /api/analytics/data/{studentId}/`

---

## 26. Runtime-потоки и сценарии работы

## 26.1 Auth + protected request flow

1. Пользователь логинится (`login()`).
2. Токены сохраняются в localStorage.
3. View вызывает `fetchData()`.
4. `fetchData` добавляет Bearer token.
5. При `401` выполняется `refreshAccessToken()`.
6. Исходный запрос повторяется.
7. Если refresh неуспешен -> logout.

## 26.2 Flow загрузки статистики

1. Пользователь меняет фильтр в `StatisticsView`.
2. Watch триггерит `fetchStatisticsMarks()`.
3. Данные нормализуются `processStudentData()`.
4. Одновременно строится групповая аналитика и таблица.
5. Отображаются графики + пагинация.

## 26.3 Flow загрузки рейтинга (batch)

1. `fetchStudentRating()` запрашивает первый batch.
2. Данные доступны сразу для UI.
3. Фоново `loadRemainingBatches()` догружает остаток.
4. После каждого батча пересчитываются аналитические статусы.
5. UI отображает прогресс догрузки.

## 26.4 Flow ML-аналитики

Prediction:
1. Выбор faculty/group/course.
2. `trainAndFetchPredictions()` (тренировка).
3. `fetchPredictions()` (получение прогнозов).
4. Сортировки/фильтры/график.

Clustering:
1. `trainClustering()`.
2. `fetchClusteringData()`.
3. Фильтр по группе / поиск студента по ID через `fetchStudentCluster()`.

---

## 27. Onboarding для нового разработчика

Этот чеклист позволяет быстро влиться в проект без потери контекста.

## 27.1 Первые 30 минут

1. Запусти backend и frontend.
2. Войди через JWT-форму.
3. Пройди все вкладки вручную.
4. Запусти `npm run test`.

## 27.2 Что читать в коде в первую очередь

1. `src/app.vue` — понять auth + fetchData + provide/inject.
2. `src/views/StatisticsView.vue` — понять шаблон аналитического view.
3. `src/views/StudentRatingView.vue` — понять batch-load паттерн.
4. `src/views/StudentAnalyticsView.vue` — понять ML flows.
5. `src/components/ChartComponent.vue` — общий chart lifecycle.

## 27.3 Где обычно вносят изменения

- Новые фильтры/таблицы: соответствующий `src/views/*.vue`.
- Новые API-параметры: сначала query-builder в view, затем UI.
- Новые диаграммы: computed chartData + `ChartComponent`.
- Новые auth-правила: только `app.vue` (`fetchData`, `refreshAccessToken`, `login/logout`).

## 27.4 Правила безопасного изменения

- Не обходить `fetchData` прямыми `fetch` внутри views.
- Не хранить auth-логику локально во view.
- При добавлении фильтров проверять:
  - reset;
  - watch;
  - пагинацию;
  - пустые состояния.
- Любое изменение таблиц/графиков сопровождать обновлением unit-тестов.

## 27.5 Минимальный Definition of Done

- Функционал работает во всех затронутых вкладках.
- Нет runtime-ошибок в консоли при основных сценариях.
- Unit-тесты проходят (`npm run test`).
- README обновлен (если изменены API/флоу/модель данных).
