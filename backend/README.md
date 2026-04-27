# Transan Backend

Spring Boot 3 backend for the Transan spending tracker application.

## Prerequisites

- Java 21
- Maven 3.9+
- PostgreSQL 15+
- Apache Kafka

## Setup

### 1. Create PostgreSQL database

```bash
createdb transan
```

### 2. Set environment variables

```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/transan
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=postgres
export JWT_SECRET=your-very-long-secret-key-at-least-32-chars
export JWT_EXPIRATION_MS=3600000
export JWT_REFRESH_EXPIRATION_MS=604800000
export KAFKA_BROKERS=localhost:29092
export KAFKA_FORECAST_PRODUCER_TOPIC=transan.forecast.input
export KAFKA_FORECAST_CONSUMER_TOPIC=transan.forecast.output
export KAFKA_CONSUMER_GROUP=user-backend
```

### 3. Build and run

```bash
mvn clean install
mvn spring-boot:run
```

The application starts on port 8080. Flyway will automatically run database migrations on startup.

## API Examples

### Register

```bash
curl -X POST http://localhost:8080/auth/registration \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "monthly_budget": 50000,
    "is_male": true
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

Save the `access_token` from the response for subsequent requests.

### Get spendings (paginated)

```bash
curl http://localhost:8080/spendings?page=0&size=20&sort=date,desc \
  -H "Authorization: Bearer <access_token>"
```

### Get spending by ID

```bash
curl http://localhost:8080/spendings/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <access_token>"
```

### Create spending

```bash
curl -X POST http://localhost:8080/spendings/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sum": -37.0,
    "date": "2026-04-08",
    "bank_category": "Транспорт",
    "bank_description": "Операция по карте...",
    "currency": "RUR",
    "category_name": "Транспорт",
    "category_description": "Проезд"
  }'
```

### Update spending

```bash
curl -X PUT http://localhost:8080/spendings/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sum": -50.0,
    "date": "2026-04-08",
    "bank_category": "Транспорт",
    "bank_description": "Updated description",
    "currency": "RUR",
    "category_name": "Транспорт",
    "category_description": "Проезд"
  }'
```

### Delete spending

```bash
curl -X DELETE http://localhost:8080/spendings/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <access_token>"
```

### Import CSV (Sberbank format)

```bash
curl -X POST http://localhost:8080/spendings/import \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@sberbank_export.csv"
```

### Get spending forecast

```bash
curl http://localhost:8080/spendings/forecast?page=0&size=20 \
  -H "Authorization: Bearer <access_token>"
```

## Project Structure

```
src/main/java/com/transan/
├── TransanApplication.java
├── config/          - SecurityConfig, JwtConfig, KafkaTopicConfig
├── controller/      - AuthController, SpendingController
├── service/         - AuthService, SpendingService, ForecastService
├── repository/      - UserRepository, SpendingRepository, RefreshTokenRepository
├── entity/          - User, Spending, RefreshToken
├── dto/             - Request and response DTOs
├── security/        - JwtTokenProvider, JwtAuthenticationFilter, SecurityUtils
├── kafka/           - ForecastKafkaProducer, ForecastKafkaListener
├── mapper/          - SpendingMapper (MapStruct)
└── exception/       - GlobalExceptionHandler, ResourceNotFoundException
```
