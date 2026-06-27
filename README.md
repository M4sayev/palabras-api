# palabras-api

A small full-stack app for learning Spanish vocabulary, built primarily as a backend learning project. The focus is on the Node.js API — auth, database access, caching, validation — with a minimal vanilla JS frontend on top.

This is a work in progress. The plan is to keep expanding it (reverse proxy, more infra) as I learn more.

## Stack

- **Monorepo:** Turborepo
- **Frontend:** Vite + vanilla JS, plain HTML/CSS (no framework)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Cache:** Redis
- **Validation:** Zod, shared between frontend and backend via an internal package
- **Local services:** run through WSL (Postgres, Redis)
- **API docs:** Swagger / OpenAPI (swagger-jsdoc + swagger-ui-express)

## Repo structure

```
apps/
  backend/
    config/         # swagger, redis, logger, mailer setup
    controllers/     # request handlers
    db/              # db connection pool
    errors/          # error helpers (e.g. not found)
    logs/            # winston log output
    middleware/       # auth, validation, async wrapper, error handler
    migrations/       # db migrations
    repositories/     # data access layer (queries live here)
    routes/          # express routers + swagger annotations
    templates/        # static email templates (password reset)
    utils/           # misc helpers (cache invalidation, etc.)
  frontend/
    src/
      auth/
        scripts/      # login, register, forgot/reset password logic
        utils/        # form validation helpers
      account/
        scripts/      # account menu (logout, delete account)
    *.html             # pages, outside src/
packages/
  shared-validation/   # Zod schemas shared across apps
```

## Features

### Auth

- Register / login with bcrypt password hashing
- JWT access tokens (short-lived) + refresh tokens (rotated, stored in Postgres, sent as an HTTP-only cookie)
- Refresh endpoint to silently renew access tokens
- Logout (revokes the refresh token)
- Delete account (revokes all refresh tokens for the user, deletes the user row)
- Forgot / reset password flow with a hashed, time-limited token, emailed via a fake SMTP service (Ethereal) for local testing

### Dictionary

- Words belong to a category and have a definition + example sentence
- CRUD on words, with category and free-text search filtering
- Bulk delete by ID list
- List categories (used to populate filters and the add/edit form)

### Cross-cutting

- Centralized error handling middleware, with validation errors surfaced separately from generic errors
- Request logging with Morgan piped into Winston
- Redis caching on word list queries, keyed by category + search, invalidated on writes
- Validation schemas defined once in `shared-validation` and reused on both frontend (live field-level feedback) and backend (request body parsing)
- Swagger docs available once the server is running

## Running locally

Services (Postgres, Redis) are expected to be running, typically via WSL.

```bash
# install (installs in all apps and packages)
npm install

# run everything (frontend + backend) via Turborepo
npx turbo dev
```

Environment variables expected by the backend (`.env`):

```
PORT=5000
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
NODE_ENV=development
EMAIL_USER=
EMAIL_PASS=
```

Database connection and Redis connection settings are read from wherever `db/connect.js` and `config/redis.js` expect them — check those files for the exact variable names.

## API docs

Once the backend is running, Swagger UI is available at:

```
http://localhost:3000/api-docs
```

(Adjust the port if you've changed it.)

## TODO

- No automated tests yet.
- No rate limiting on auth endpoints.
- Reverse proxy, containerization, and CI are not set up yet — planned next.

## Notes

- Email sending is wired through Ethereal (a fake SMTP catcher) for local development — no real emails are sent.
- The frontend is intentionally minimal: no framework, no bundler magic beyond Vite's defaults, so the backend stays the focus.
