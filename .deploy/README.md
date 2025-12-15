# Yakyn Mini App - Docker Deployment

Унифицированная структура развертывания для проекта Yakyn Mini App (Telegram Mini App).

## Структура

```
.deploy/
├── _shared/           # Общие файлы для всех окружений
│   ├── Dockerfile     # Базовый Dockerfile для development
│   ├── configs/       # Конфигурации
│   │   └── nginx/     # Nginx конфигурация
│   │       └── default.conf
│   └── scripts/       # Скрипты развертывания
│       ├── entrypoint.sh      # Entrypoint для dev контейнера
│       ├── deploy-local.sh    # Запуск local окружения
│       ├── deploy-dev.sh      # Запуск dev окружения
│       ├── deploy-prod.sh     # Запуск prod окружения
│       ├── deploy-stage.sh    # Запуск stage окружения
│       └── stop-all.sh        # Остановка всех контейнеров
├── local/             # Локальная разработка с hot reload
├── dev/               # Dev окружение (GitHub Registry)
├── stage/             # Stage окружение (GitHub Registry)
└── prod/              # Production окружение (GitHub Registry)
```

## Окружения

### Local (Port: 10310)
**Для локальной разработки с hot reload**

```bash
./.deploy/_shared/scripts/deploy-local.sh
```

Или вручную:
```bash
cd .deploy/local
docker-compose up --build -d
```

- Container: `yakyn-mini-app-local`
- Build: Собирается локально из Dockerfile
- Volumes: Монтируется код для hot reload
- URL: http://localhost:10310

### Dev (Port: 10311)
**Development окружение из GitHub Registry**

```bash
./.deploy/_shared/scripts/deploy-dev.sh
```

- Container: `yakyn-mini-app-dev`
- Image: `ghcr.io/YOUR_ORG/yakyn-mini-app:dev-latest`
- Auto-update: Watchtower enabled
- URL: http://localhost:10311

### Stage (Port: 10313)
**Staging окружение из GitHub Registry**

```bash
./.deploy/_shared/scripts/deploy-stage.sh
```

- Container: `yakyn-mini-app-stage`
- Image: `ghcr.io/YOUR_ORG/yakyn-mini-app:stage-latest`
- Auto-update: Watchtower enabled
- URL: http://localhost:10313

### Production (Port: 10312)
**Production окружение из GitHub Registry**

```bash
./.deploy/_shared/scripts/deploy-prod.sh
```

- Container: `yakyn-mini-app-prod`
- Image: `ghcr.io/YOUR_ORG/yakyn-mini-app:prod-latest`
- Auto-update: Watchtower enabled
- URL: http://localhost:10312

## Остановка контейнеров

```bash
./.deploy/_shared/scripts/stop-all.sh
```

## Environment Variables

Для Vite приложений переменные окружения должны начинаться с `VITE_`:

```
VITE_API_URL=http://localhost:10300  # URL до yakyn-bot API
VITE_BOT_USERNAME=yakynn_bot          # Username Telegram бота
```

## Требования

1. **Docker Network**: Автоматически создается скриптами
   ```bash
   docker network create yakyn_network
   ```

2. **.env файл**: Для local окружения нужен .env в корне проекта
   ```bash
   cp .env.example .env
   # Отредактируйте .env с вашими credentials
   ```

3. **Backend**: yakyn-bot должен быть запущен для полноценной работы приложения

## Полезные команды

```bash
# Просмотр логов
docker logs -f yakyn-mini-app-local
docker logs -f yakyn-mini-app-dev
docker logs -f yakyn-mini-app-prod

# Войти в контейнер
docker exec -it yakyn-mini-app-local sh

# Проверка статуса
docker ps | grep yakyn-mini-app
```

## Порты

| Окружение | Container Name         | Port  |
|-----------|------------------------|-------|
| Local     | yakyn-mini-app-local   | 10310 |
| Dev       | yakyn-mini-app-dev     | 10311 |
| Prod      | yakyn-mini-app-prod    | 10312 |
| Stage     | yakyn-mini-app-stage   | 10313 |

## Связь с Backend

Mini App общается с yakyn-bot API. Убедитесь, что:
- yakyn-bot запущен на соответствующем порту
- `VITE_API_URL` указывает на правильный адрес API

| Frontend Port | Backend Port | Environment |
|---------------|--------------|-------------|
| 10310         | 10300        | Local       |
| 10311         | 10301        | Dev         |
| 10312         | 10302        | Prod        |
| 10313         | 10303        | Stage       |

## Технический стек

- **Base Image**: node:20-alpine (build), nginx:alpine (production)
- **Package Manager**: npm
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Runtime Port**: 80 (внутри контейнера, nginx)
