# LARVIS Station Terminal

> LARVIS: Hell-O hoo-man! Zank yOu for fixing me!

A React frontend for the LARVIS station API — a space-terminal UI for viewing satellite ore acquisitions, crew directory, and generating reports for Space Command. Built with TypeScript, Vite, shadcn/ui, and Tailwind CSS.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Development](#development)
3. [Production Deployment](#production-deployment)
4. [Testing](#testing)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Project Structure](#project-structure)
7. [Application Features](#application-features)
8. [Backend Improvement Suggestions](#backend-improvement-suggestions)
9. [Frontend Enhancements (Future)](#frontend-enhancements-future)

---

## Quick Start

### Prerequisites

1. Node.js 20+ and npm
2. Docker and Docker Compose (for production / full stack)
3. Playwright browsers for E2E tests: `npx playwright install`

### Clone and checkout

```bash
git clone <repo-url>
cd larvis
git checkout main
```

### Run the full stack (backend + frontend)

```bash
docker compose up
```

Frontend: [http://localhost:5180](http://localhost:5180)
Backend API: [http://localhost:8080](http://localhost:8080)

Default credentials: `alice` / `bob` / `charlie` — password `1234`.

---

## Development

### Frontend only (API proxied to backend)

If the backend is running separately (e.g. via `docker compose up backend`):

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` to the backend.

API base URL: Set `VITE_API_URL` in `.env` (e.g. `http://localhost:8080`) if the backend is not on the same origin.

### Backend only

```bash
./backend/larvis
# Or custom port: ./backend/larvis -addr :9090
```

Backend listens on port 8080 by default.

---

## Production Deployment

### Docker Compose

```bash
docker compose up --build
```

1. Frontend: Served by nginx on port 5180
2. Backend: Runs on port 8080
3. Frontend nginx proxies `/api/` to `http://backend:8080/`

### Manual build (frontend)

```bash
cd frontend
npm ci
npm run build
```

Output: `frontend/dist`. Serve with any static file server (e.g. nginx) and configure the API base URL if needed.

### Environment variables

1. VITE_API_URL — API base URL (dev / preview), default /api

In production (Docker), /api is resolved by nginx and proxied to the backend.

---

## Testing

### Unit tests (Jest)

```bash
cd frontend
npm test
```

1. npm test — Run unit tests
2. npm run test:watch — Watch mode
3. npm run test:coverage — Coverage report

### E2E tests (Playwright)

E2E tests mock the LARVIS API; no backend required.

```bash
cd frontend
npx playwright install   # First time: install browsers
npm run test:e2e
```

1. npm run test:e2e — All browsers (Chromium, Firefox, WebKit, Mobile)
2. npm run test:e2e:chromium — Chromium only (faster)
3. npm run test:e2e:ui — Interactive UI mode
4. npm run test:e2e:visual — Visual regression tests only
5. npm run test:e2e:update-snapshots — Update visual snapshots

Port: `PLAYWRIGHT_PORT` (default 5180). Playwright starts the dev server automatically.

Coverage: Auth (login, logout, validation), form validation, navigation, API mocking, visual regression, mobile (Pixel 5).

---

## CI/CD Pipeline

GitHub Actions workflow: `.github/workflows/ci.yml`

Triggers: Push and pull requests to `main`

Steps:

| Step   | Command                     | Purpose              |
|--------|-----------------------------|----------------------|
| Lint   | `npm run lint`              | ESLint               |
| Unit   | `npm test`                  | Jest unit tests      |
| Build  | `npm run build`             | TypeScript + Vite    |
| E2E    | `npm run test:e2e:chromium` | Playwright (Chromium)|

All run in `frontend/` on Node 20. E2E uses Playwright’s built-in dev server and mocked API.

---

## Project Structure

```
larvis/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI
├── backend/
│   ├── Dockerfile              # Minimal image (scratch + larvis binary)
│   └── larvis                  # Pre-compiled HTTP API binary (linux-amd64)
├── frontend/
│   ├── e2e/                    # Playwright E2E tests
│   │   ├── api-mock.ts         # API request mocking
│   │   ├── auth-helper.ts      # loginAs() helper
│   │   ├── auth.spec.ts        # Login, logout
│   │   ├── forms.spec.ts       # Settings, Reports forms
│   │   ├── mobile.spec.ts      # Mobile viewport tests
│   │   ├── navigation.spec.ts  # Routing
│   │   └── visual.spec.ts      # Visual regression
│   ├── public/
│   │   └── theme-init.js       # Theme flash prevention
│   ├── src/
│   │   ├── app/                # App-level setup
│   │   │   ├── layout/         # MainLayout, AuthLayout, Sidebar
│   │   │   ├── providers/      # AuthProvider, ThemeProvider
│   │   │   └── router/         # Routes, ProtectedRoute
│   │   ├── features/           # Feature modules (FSD)
│   │   │   ├── acquisitions/   # Dashboard: charts, stats, table, heatmap
│   │   │   ├── auth/           # Login, useAuth
│   │   │   ├── reports/        # Report page, monthly stats, notes
│   │   │   ├── settings/       # Profile, password change
│   │   │   └── users/          # Crew directory, profiles
│   │   ├── pages/              # Page compositions
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ActivitiesPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── ...
│   │   └── shared/
│   │       ├── api/            # client, endpoints, api-config
│   │       ├── ui/             # shadcn components
│   │       ├── hooks/          # useDebounce, useTheme, etc.
│   │       ├── utils/          # cn, date formatting
│   │       └── types/
│   ├── Dockerfile              # Multi-stage: Node build → nginx serve
│   ├── nginx.conf              # SPA + /api proxy
│   ├── playwright.config.ts
│   ├── jest.config.cjs
│   ├── vite.config.ts
│   └── package.json
├── docker-compose.yml          # backend + frontend services
├── frontend-assignment.md      # Original assignment
└── README.md
```

### Folder structure notes

1. app/ — Layout, auth context, theme, routing; runs once at app startup.
2. pages/ — Compositions that arrange features into screens.
3. features/ — Business logic and UI per domain (auth, acquisitions, reports, users, settings). Follows simplified Feature-Sliced Design; features only import from shared.
4. shared/ — Reusable UI, API client, utils, types; no business logic.
5. e2e/ — Playwright specs and helpers; API is mocked.

---

## Application Features

### Login

1. Username + password form
2. LARVIS greeting: “Hell-O hoo-man!”
3. Redirect to dashboard on success
4. Error message on invalid credentials
5. Token stored in memory (no localStorage, XSS-safe)

### Dashboard (Activities)

1. Summary cards: Total scans, average ore sites, peak detection, trend (increasing/decreasing), sparklines
2. Ore sites over time: Line/area chart with hover tooltips, brush/zoom for date range
3. Histogram: Distribution of ore site counts
4. Daily aggregation bar chart: Per-day totals or averages
7. Date range filter: Shared across charts and table


### Settings

1. Humor slider (LARVIS personality setting)
2. Password validation and change flow

### UX

1. Responsive: Sidebar on desktop, hamburger/bottom nav on mobile
2. Dark theme: Space-terminal look
5. Skeleton loaders while data loads
6. CSP meta tag for XSS mitigation
7. Sanitized chart rendering (no dangerouslySetInnerHTML)

### Tech stack

1. Framework — React 19 + TypeScript
2. Build — Vite 7
3. UI — shadcn/ui, Tailwind CSS
4. Charts — Recharts
5. Routing — React Router 7
6. Tests — Jest (unit), Playwright (E2E)

---

## Backend Improvement Suggestions

The LARVIS API is provided as a pre-compiled binary. The following improvements would make it more production-ready and secure:

### Security

1. Password storage: Plaintext passwords returned in GET /users/:id. Recommendation: Never return passwords; store and compare using bcrypt/argon2. Hash on create/update.
2. JWT: Likely minimal claims and long expiry. Recommendation: Short expiry (15–30 min), refresh tokens, include sub, exp, iat; validate signature and claims server-side.
3. Auth model: Single shared secret for all users. Recommendation: Per-user credentials, role-based access if needed.
4. HTTPS/SSL: Service runs over HTTP. Recommendation: Use HTTPS in production; terminate TLS at load balancer or reverse proxy, or enable SSL/TLS on the service.
5. CORS: Unknown. Recommendation: Explicit Access-Control-Allow-Origin for known frontend origins.
6. Rate limiting: None. Recommendation: Rate limit /token, /users, /acquisitions to reduce brute-force and abuse.

### Validation & error handling

1. Input validation: Minimal. Recommendation: Validate body/query; enforce length, format, types; reject invalid input early.
2. Error responses: Likely inconsistent. Recommendation: Standard JSON errors with correct HTTP status codes (400, 401, 403, 404, 500).
3. Validation messages: Unclear. Recommendation: Clear, safe messages for clients; avoid leaking internals.

### Schema & API design

1. Field naming: sites in docs vs ore_sites in response. Recommendation: Align docs and response schema; use OpenAPI/Swagger for source of truth.
2. Pagination: /acquisitions returns ~300 items. Recommendation: Add limit and offset (or cursor) for scalability.
3. Filtering: None. Recommendation: Add from and to for acquisitions; search for users if needed.
4. Versioning: None. Recommendation: Path prefix or header versioning for backward compatibility.

### Operational

1. Health checks: Unknown. Recommendation: GET /health or /ready for liveness/readiness probes.
2. Logging: Unknown. Recommendation: Structured logs (request id, user, status, duration) without sensitive data.
3. Metrics: None. Recommendation: Basic metrics (latency, error rate) for monitoring and alerting.

### Data & storage

1. Persistence: Likely in-memory. Recommendation: Use a database (Postgres, SQLite) for users and acquisitions.
2. Idempotency: Unknown. Recommendation: Idempotency keys for POST updates where applicable.

### Scaling and high-volume data

As satellites and data volume grow, the current design (unknown) may hit limits. Possible improvements, assuming typical constraints:

1. Async ingestion via message queue (Kafka, RabbitMQ)
2. Time-series storage (TimescaleDB, InfluxDB, ClickHouse)
3. Partitioning and retention policies
4. Separate transactional DB for users vs time-series for acquisitions
5. Pagination, cursors, range filters, streaming for exports
6. Caching (e.g. Redis) for pre-computed stats
7. Read/write separation and replicas
8. Event-driven model, optional CQRS
9. Observability: tracing, metrics, structured logging
10. Backpressure and rate limiting at ingest

---

## Frontend Enhancements (Future)

If there were more time, the frontend could be improved with:

1. UX polish: Better animations, transitions, accessibility (ARIA, keyboard nav)
2. Responsiveness: Further mobile layout tuning, larger tap targets
3. Advanced viz: More chart types, drill-downs, zoom/pan
4. State management: TanStack Query if more complex data flows or caching are needed
5. Offline / PWA: Service worker, basic offline support
6. i18n: Localization for multiple languages
7. E2E against real API: Optional job using docker compose to test against the real backend

---

## License

See [LICENSE](LICENSE).
