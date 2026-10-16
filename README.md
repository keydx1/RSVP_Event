# RSVP

Monorepo for the RSVP app.

| Folder     | Stack                                                     |
| ---------- | --------------------------------------------------------- |
| `backend`  | Laravel 12 (PHP 8.3, MySQL 8.0, Sanctum, CORS configured) |
| `frontend` | React 19.3 + TypeScript + Vite 8                          |

Location: `C:\laragon\www\RSVP`

## Requirements

Already provided by Laragon on this machine:

- PHP 8.3 (`C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64`)
- Composer 2.10
- Node 25 / npm 11
- MySQL 8.0.30 (Laragon's default `[mysql] Version`)

## Database

The app uses **MySQL**, not SQLite.

| Setting   | Value       |
| --------- | ----------- |
| Host      | `127.0.0.1` |
| Port      | `3306`      |
| Database  | `rsvp`      |
| Username  | `root`      |
| Password  | *(empty — Laragon default)* |

The `rsvp` database has already been created and migrated (10 tables:
`users`, `sessions`, `cache`, `jobs`, `personal_access_tokens`, …).

**Start MySQL before using the app.** In the Laragon window click **Start All**
(or just **MySQL**). Without it, the API returns a database error and
`/api/health` reports `"connected": false`.

To create extra databases or inspect data, use Laragon's bundled client:

```bash
"C:/laragon/bin/mysql/mysql-8.0.30-winx64/bin/mysql.exe" -u root rsvp
```

## Running the backend

```bash
cd C:\laragon\www\RSVP\backend
php artisan serve            # http://localhost:8000
```

Other useful commands:

```bash
php artisan migrate          # run migrations against MySQL
php artisan migrate:status   # show which migrations have run
php artisan test             # run the test suite
php artisan route:list --path=api
```

### API endpoints

| Method | Path          | Notes                                     |
| ------ | ------------- | ----------------------------------------- |
| GET    | `/api/health` | App/DB/version info, no auth. Used by the UI |
| GET    | `/api/user`   | Requires a Sanctum token (`auth:sanctum`) |
| GET    | `/up`         | Laravel health probe                      |

## Running the frontend

```bash
cd C:\laragon\www\RSVP\frontend
npm run dev                  # http://localhost:5173
```

Other useful commands:

```bash
npm run build                # type-check + production build into dist/
npm run preview              # serve the production build
npm run lint                 # oxlint
```

Vite proxies `/api` and `/sanctum` to `http://127.0.0.1:8000`, so the browser
only ever talks to port 5173 during development — no CORS issues.

Open http://localhost:5173 with the backend running and the page reports the
live Laravel version **and** the database connection, confirming all three
layers are wired together.

## Configuration

`backend/.env`:

```
APP_NAME=RSVP
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173   # used by config/cors.php

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rsvp
DB_USERNAME=root
DB_PASSWORD=
```

If you set a MySQL root password, put it in `DB_PASSWORD` and re-run
`php artisan config:clear`.

CORS (`backend/config/cors.php`) allows the `FRONTEND_URL` origin with
credentials. Sanctum is installed and `User` uses the `HasApiTokens` trait, so
token-based API auth is ready to use.

### Tests

`phpunit.xml` keeps `DB_CONNECTION=sqlite` / `DB_DATABASE=:memory:` so the test
suite runs fast and needs no MySQL server. Change those if you want the tests to
hit MySQL instead.

### Production

For a production build, point the frontend at the real API:

```
# frontend/.env.production
VITE_API_URL=https://api.example.com
```

If `VITE_API_URL` is unset, requests go to the same origin (the dev proxy).

## Using it through Laragon

The whole app lives in `C:\laragon\www\RSVP`, so Laragon's auto virtual host
`rsvp.test` points at the *repo root*, not at Laravel's entry point. Either:

- keep using `php artisan serve` + `npm run dev` (recommended for development), or
- add a custom Laragon vhost whose document root is
  `C:\laragon\www\RSVP\backend\public`.

To serve the built frontend from Laravel, run `npm run build` and copy
`frontend/dist` into `backend/public`.
