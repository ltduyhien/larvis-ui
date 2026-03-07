Main feature work:

- Build UI flows around these endpoints:
    - POST /token: Login with alice/bob/charlie + password 1234 to obtain an access token.
    - GET /users: List all users (requires Authorization: Bearer <token>).
    - GET /users/<user_id>: View a user profile including password (for yourself).
    - POST /users/<user_id>: Update your own profile (name and password).
    - GET /acquisitions: List last month’s satellite acquisitions (timestamp, sites), ideal for charts/histograms to visualize ore sites over time.
- Reporting / analysis:
    - In your README, discuss possible backend improvements (e.g., security, validation, error handling, schema design, auth model) and what you would enhance in the frontend if you had more time (UX polish, responsiveness, accessibility, advanced data viz, state management, etc.).

## E2E Tests (Playwright)

End-to-end tests run with Playwright and mock the LARVIS API, so no backend is required. Tests use port 5180 by default (set `PLAYWRIGHT_PORT` to override).

```bash
cd frontend
npm run test:e2e
```

Playwright starts the dev server automatically if nothing is listening.

| Script | Description |
|--------|-------------|
| `test:e2e` | Run all tests (Chromium, Firefox, WebKit, Mobile) |
| `test:e2e:chromium` | Run in Chromium only (faster) |
| `test:e2e:ui` | Interactive UI mode |
| `test:e2e:visual` | Run visual regression tests only |
| `test:e2e:update-snapshots` | Generate visual snapshots (run once before visual tests) |

**Coverage:**
- Authentication: login, logout, validation, redirect
- Reusing auth: `loginAs()` helper (app uses in-memory token, so login per test)
- Form validation: Settings (password change, humor slider), Reports (notes)
- Navigation and routing
- API mocking: token, users, acquisitions, change password
- Waiting: Playwright auto-waits; explicit `expect` timeouts
- Visual regression: `toHaveScreenshot` for login, activities, settings
- Mobile: Pixel 5 viewport; cross-browser (Firefox, WebKit)

Install browsers: `npx playwright install` (or `npx playwright install chromium` for Chromium only)


