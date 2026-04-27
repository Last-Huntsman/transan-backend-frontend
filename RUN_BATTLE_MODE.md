# Transan Battle Mode

Полный локальный контур состоит из трёх частей:

- `llama.cpp` OpenAI-compatible server на `http://localhost:8000`;
- logic-core из `C:\Users\Ilya\student\transan`: Kafka, Redis, core Postgres, analyzer, observability;
- web-stack из этого репозитория: backend API, отдельный backend Postgres, frontend.

Postgres намеренно разделён:

- core Postgres: `localhost:5432`, база `transan`;
- backend Postgres: `localhost:5433`, база `transan_backend`.

## Важные порты

| Сервис | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:8080` |
| Logic-core health | `http://localhost:8082` |
| Llama API | `http://localhost:8000` |
| Kafka external | `localhost:29092` |
| Kafka UI | `http://localhost:8081` |
| Grafana | `http://localhost:3000` |

## 0. Проверить llama

```powershell
Invoke-RestMethod http://localhost:8000/v1/models
```

В `C:\Users\Ilya\student\transan\configs\app\transan.env` сейчас ожидается:

```env
LLM_MODEL_NAME=gemma-4-E4B-it-Q8_0.gguf
LLM_BASE_URL=http://host.docker.internal:8000/v1
```

Если GPU не нагружается, почти наверняка llama запущена CPU-only или без offload слоёв в GPU. Для llama.cpp обычно нужен CUDA/Vulkan/Metal build и параметр вроде `--n-gpu-layers -1` или конкретное число слоёв. Проверка NVIDIA:

```powershell
nvidia-smi
nvidia-smi -l 1
```

Если в `nvidia-smi` нет процесса llama и VRAM почти не занята, модель не использует NVIDIA GPU.

## 1. Поднять logic-core

```powershell
cd C:\Users\Ilya\student\transan
docker compose up -d --build
```

Проверка:

```powershell
Invoke-RestMethod http://localhost:8082/healthz
Invoke-RestMethod http://localhost:8082/readyz
```

Ожидаемо: `ok` и `ready`.

## 2. Поднять web-stack

Из корня этого репозитория:

```powershell
cd C:\Users\Ilya\student\transan-backend-frontend
docker compose up -d --build
```

Это поднимает:

- `transan-backend-postgres` на `5433`;
- `transan-backend-api` на `8080`;
- `transan-frontend-web` на `5173`.

Backend подключается к Kafka из logic-core через Docker-сеть `transan-core`.

## 3. Проверить API и UI

```powershell
Invoke-RestMethod http://localhost:8080/v3/api-docs | Select-Object -ExpandProperty openapi
Invoke-WebRequest http://localhost:5173 -UseBasicParsing
```

Открой в браузере:

```text
http://localhost:5173
```

## 4. Ручной smoke-test

1. Зарегистрируй нового пользователя.
2. Добавь несколько транзакций за текущий месяц.
3. Проверь таблицу, пагинацию, редактирование и удаление.
4. Импортируй CSV.
5. Открой прогноз. Локальная llama может отвечать долго, поэтому backend dev-timeout выставлен в `180` секунд.

## Логи

Frontend:

```powershell
cd C:\Users\Ilya\student\transan-backend-frontend
docker compose logs -f frontend
```

Backend:

```powershell
cd C:\Users\Ilya\student\transan-backend-frontend
docker compose logs -f backend-api
```

Logic-core:

```powershell
cd C:\Users\Ilya\student\transan
docker compose logs -f transan kafka
```

Kafka topics:

```powershell
cd C:\Users\Ilya\student\transan
docker compose exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
```

## Остановка

```powershell
cd C:\Users\Ilya\student\transan-backend-frontend
docker compose down

cd C:\Users\Ilya\student\transan
docker compose down
```

Чтобы удалить локальные volumes web-stack:

```powershell
cd C:\Users\Ilya\student\transan-backend-frontend
docker compose down -v
```
