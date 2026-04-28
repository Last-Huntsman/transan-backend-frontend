# Transan Frontend

Web-first frontend for spending analytics. Built with React, TypeScript, Vite,
Bun, TanStack Router, TanStack Query, Tailwind CSS, Radix primitives, Framer
Motion, Recharts, and Zod.

## Run Without Backend

The repository includes mock mode for design and manual checks. It is enabled in
`.env` by default:

```env
VITE_USE_MOCKS=true
VITE_API_URL=http://localhost:8080
```

Start the app:

```bash
bun install
bun dev
```

Open `http://localhost:5173` and log in with any non-empty credentials, for
example `demo / demo`.

## Run With Backend

```bash
VITE_USE_MOCKS=false
VITE_API_URL=http://localhost:8080
```

Then restart `bun dev`.

## Scripts

```bash
bun test
bun run lint
bun run build
```

## API Contract

- `POST /auth/login` with `{ username, password }` -> `{ access_token }`
- `POST /auth/registration` with `{ username, password }` -> `{ access_token }`
- `GET /spendings?page=&size=` -> `{ items, total, page, size }`
- `GET /spendings/{id}`
- `POST /spendings`
- `PUT /spendings/{id}`
- `DELETE /spendings/{id}`
- `POST /spendings/import` multipart CSV field `file`
- `GET /spendings/forecast?page=&size=` -> `{ items, total, page, size }`

## Platform Direction

The first release is web-only. Platform-specific pieces are isolated in
`src/api`, `src/state`, and `src/lib/storage` so Tauri can later wrap the same
frontend for Windows, Linux, and Android.
