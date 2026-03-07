# LARVIS Station Terminal

> LARVIS: Hell-O hoo-man! Zank yOu for fixing me!

A React frontend for the **LARVIS** station API — a space-terminal UI for viewing satellite ore acquisitions, crew directory, and generating reports for Space Command.

**Tech:** TypeScript · Vite · shadcn/ui · Tailwind CSS

---

## Table of Contents

- [Quick Start](#quick-start)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Project Structure](#project-structure)
- [Application Features](#application-features)
- [Backend Improvement Suggestions](#backend-improvement-suggestions)
- [Frontend Enhancements](#frontend-enhancements-future)

---

## Quick Start

**Prerequisites:** Node.js 20+, npm, Docker, Docker Compose

```bash
docker compose up
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5180        |
| Backend  | http://localhost:8080        |

> **Default credentials:** `alice` / `bob` / `charlie` — password `1234`

---

## Development

### Frontend (with backend running)

```bash
cd frontend
npm install
npm run dev
```

Opens at http://localhost:5173. Vite proxies `/api` to the backend.

If the backend runs elsewhere, set `VITE_API_URL` in `.env`.

### Backend only

```bash
./backend/larvis
# Custom port: ./backend/larvis -addr :9090
```

Default port: **8080**

---

## Production Deployment

**Docker Compose:**

```bash
docker compose up --build
```

- Frontend: nginx on port **5180**
- Backend: port **8080**
- `/api/` is proxied to the backend

**Manual frontend build:**

```bash
cd frontend
npm ci
npm run build
```

Output: `frontend/dist`. Serve with any static host and configure the API base URL if needed.

**Environment:**

- `VITE_API_URL` — API base URL (default: `/api`)

---

## Testing

### Unit tests (Jest)

```bash
cd frontend
npm test
```

- `npm run test:watch` — watch mode  
- `npm run test:coverage` — coverage report

### E2E tests (Playwright)

E2E tests mock the API — no backend required.

```bash
cd frontend
npx playwright install   # First time
npm run test:e2e
```

| Script                          | Purpose                          |
|---------------------------------|----------------------------------|
| `npm run test:e2e`              | All browsers                     |
| `npm run test:e2e:chromium`     | Chromium only (faster)           |
| `npm run test:e2e:ui`           | Interactive UI mode              |
| `npm run test:e2e:visual`       | Visual regression                |
| `npm run test:e2e:update-snapshots` | Update snapshots            |

Port: `PLAYWRIGHT_PORT` (default 5180). Dev server starts automatically.

---

## CI/CD Pipeline

**File:** `.github/workflows/ci.yml`  
**Triggers:** Push and PRs to `main` or `master`

| Step  | Command                       |
|-------|-------------------------------|
| Lint  | `npm run lint`                |
| Unit  | `npm test`                    |
| Build | `npm run build`               |
| E2E   | `npm run test:e2e:chromium`   |

All run in `frontend/` on Node 20.

---

## Project Structure

```
larvis/
├── .github/workflows/ci.yml
├── backend/
│   ├── Dockerfile
│   └── larvis                    # Pre-compiled API binary
├── frontend/
│   ├── e2e/                      # Playwright tests
│   │   ├── api-mock.ts
│   │   ├── auth-helper.ts
│   │   ├── auth.spec.ts
│   │   ├── forms.spec.ts
│   │   ├── mobile.spec.ts
│   │   ├── navigation.spec.ts
│   │   └── visual.spec.ts
│   ├── public/theme-init.js
│   ├── src/
│   │   ├── app/                  # Layout, providers, router
│   │   ├── features/             # auth, acquisitions, reports, settings, users
│   │   ├── pages/
│   │   └── shared/               # api, ui, hooks, utils, types
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

**Layers (simplified FSD):**

- **app/** — Layout, auth, theme, routing  
- **pages/** — Screen compositions  
- **features/** — Domain logic and UI (import only from `shared`)  
- **shared/** — API client, components, utilities

---

## Application Features

### Login

- Username + password form
- LARVIS greeting
- Redirect on success, error on invalid credentials
- Token in memory (XSS-safe, no localStorage)

### Dashboard (Activities)

- Summary cards: total scans, average ore sites, peak, trend, sparklines
- Line chart: ore sites over time, brush/zoom
- Histogram: distribution of ore counts
- Bar chart: daily aggregation
- Heatmap: GitHub-style calendar
- Data table: sort, search, paginate, CSV export
- Date range filter for all charts

### Crew Directory

- Crew list (cards/table)
- Profile view: read-only for others, editable for self
- Edit name and password on own profile

### Reports

- Print-friendly layout
- Stats, charts, trend analysis
- Auto-generated text summary
- Month selector, editable notes
- Export/print

### Settings

- Profile editing (name, password)
- Humor slider (LARVIS personality)
- Password validation

### Cross-cutting

Responsive layout · Dark theme · Toasts · Skeleton loaders · CSP · Sanitized chart rendering

### Tech stack

| Layer   | Technology              |
|---------|-------------------------|
| Framework | React 19 + TypeScript |
| Build   | Vite 7                  |
| UI      | shadcn/ui, Tailwind     |
| Charts  | Recharts                |
| Routing | React Router 7          |
| Tests   | Jest, Playwright        |

---

## Backend Improvement Suggestions

The LARVIS API is a pre-compiled binary. Suggestions for a production-ready version:

### Security

- **Passwords:** Don’t return plaintext; hash with bcrypt/argon2 and never expose in `GET /users/:id`
- **JWT:** Short expiry (15–30 min), refresh tokens, validate `sub` / `exp` / `iat`
- **Auth:** Per-user credentials, optional role-based access
- **CORS:** Explicit `Access-Control-Allow-Origin` for known frontends
- **Rate limiting:** On `/token`, `/users`, `/acquisitions`

### Validation & error handling

- **Input:** Validate body/query (length, format, types)
- **Errors:** Standard JSON `{ "error": "code", "message": "..." }` with correct HTTP status (400, 401, 403, 404, 500)
- **Messages:** Clear, safe, no internal details

### Schema & API design

- **Consistency:** Docs use `sites`, response uses `ore_sites` — align and document (e.g. OpenAPI)
- **Pagination:** Add `?limit`, `?offset` (or cursor) for `/acquisitions`
- **Filtering:** `?from=`, `?to=` for acquisitions; optional `?search=` for users
- **Versioning:** Path (`/v1/`) or header

### Operational

- **Health:** `GET /health` or `/ready`
- **Logging:** Structured logs (request id, user, status, duration)
- **Metrics:** Latency, error rate for monitoring

### Data & storage

- **Persistence:** Database (Postgres, SQLite) instead of in-memory
- **Idempotency:** Keys for `POST` updates where appropriate

---

## Frontend Enhancements (Future)

- UX polish: animations, accessibility (ARIA, keyboard)
- Mobile: better tap targets, layout
- Viz: more chart types, drill-down, zoom/pan
- State: TanStack Query if needed for caching/refetch
- Offline: PWA, service worker
- i18n
- E2E against real API (e.g. via `docker compose`)

---

## License

[LICENSE](LICENSE)
