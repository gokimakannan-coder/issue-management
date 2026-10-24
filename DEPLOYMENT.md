# IssueFlow Enterprise — Deployment Guide

Production stack: **Render** (backend + PostgreSQL) · **Vercel** (frontend)

---

## Table of Contents

1. [Local Development with PostgreSQL](#1-local-development-with-postgresql)
2. [Apply Migrations](#2-apply-migrations)
3. [Seed Demo Users](#3-seed-demo-users)
4. [Deploy Backend to Render](#4-deploy-backend-to-render)
5. [Deploy Frontend to Vercel](#5-deploy-frontend-to-vercel)
6. [Wire the Two Services Together](#6-wire-the-two-services-together)
7. [Environment Variable Reference](#7-environment-variable-reference)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Local Development with PostgreSQL

### Prerequisites

- Node.js ≥ 18
- PostgreSQL 14+ running locally (or use Docker)

### Quick start with Docker

```bash
docker run --name issueflow-pg \
  -e POSTGRES_USER=issueflow_user \
  -e POSTGRES_PASSWORD=localpassword \
  -e POSTGRES_DB=issueflow_dev \
  -p 5432:5432 -d postgres:16
```

### Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
DATABASE_URL="postgresql://issueflow_user:localpassword@localhost:5432/issueflow_dev"
JWT_SECRET="<generate: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\">"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

### Configure the frontend (optional for local dev)

In local dev the Vite proxy forwards `/api` to `localhost:5000`, so no frontend env var is needed. If you want to override:

```bash
cd frontend
cp .env.example .env.local
# Leave VITE_API_URL blank for local dev
```

---

## 2. Apply Migrations

### First time (fresh database)

```bash
cd backend
npx prisma migrate deploy
```

This applies `prisma/migrations/20261024000000_init/migration.sql` and records it in the `_prisma_migrations` table.

### During development (schema changes)

```bash
# Create a new migration for your schema change
npx prisma migrate dev --name describe_your_change
```

> **Never** run `prisma migrate dev` against the Render production database. Use `prisma migrate deploy` in production.

### Re-generate the Prisma client after schema changes

```bash
npx prisma generate
```

---

## 3. Seed Demo Users

After migrations are applied, seed the database with example data:

```bash
cd backend
npm run prisma:seed
```

This creates the following accounts (all with password `password123`):

| Role     | Email                     | Name           |
|----------|---------------------------|----------------|
| Admin    | admin@issueflow.com       | Alex Morgan    |
| Manager  | manager@issueflow.com     | Sarah Chen     |
| Employee | john@issueflow.com        | John Doe       |
| Employee | emily@issueflow.com       | Emily Davis    |
| Employee | marcus@issueflow.com      | Marcus Vance   |

> **Warning:** The seed script deletes all existing data before inserting. Only run it on a fresh or non-critical database.

---

## 4. Deploy Backend to Render

### Step 1 — Create a PostgreSQL database on Render

1. Go to [render.com](https://render.com) → **New** → **PostgreSQL**
2. Name: `issueflow-db`
3. Plan: **Free** (or higher for production)
4. Click **Create Database**
5. Wait for it to become available, then note:
   - **Internal Database URL** — used inside Render services
   - **External Database URL** — used from your local machine to inspect production data

### Step 2 — Create a Web Service for the backend

**Option A — Use `render.yaml` (recommended)**

The `render.yaml` file at the repo root declares the service and database. Render will auto-detect it when you connect your repository.

1. Go to **New** → **Blueprint**
2. Connect your GitHub repo `gokimakannan-coder/issue-management`
3. Render reads `render.yaml` and creates the service + database automatically
4. Set `CORS_ORIGIN` manually in the dashboard (see Step 3)

**Option B — Manual setup**

1. Go to **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`

### Step 3 — Set environment variables on Render

In the Web Service dashboard → **Environment**:

| Key             | Value                                                  |
|-----------------|--------------------------------------------------------|
| `NODE_ENV`      | `production`                                           |
| `PORT`          | `10000`                                                |
| `DATABASE_URL`  | Paste the **Internal Database URL** from Step 1        |
| `JWT_SECRET`    | A random 48+ char hex string (generate locally)        |
| `JWT_EXPIRES_IN`| `7d`                                                   |
| `CORS_ORIGIN`   | Your Vercel frontend URL, e.g. `https://yourapp.vercel.app` |

Generate a secure JWT secret locally:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Step 4 — Deploy

Push your changes to `main`. Render will:
1. Run `npm install && npm run build` (includes `prisma generate && tsc`)
2. Start with `npm run start:prod` (runs `prisma migrate deploy` then `node dist/server.js`)

Verify the health check endpoint:

```
https://issueflow-backend.onrender.com/api/health
```

Expected response:
```json
{ "status": "ok", "timestamp": "..." }
```

### Step 5 — Seed production data (optional)

To populate the production database with demo data, connect via the **External Database URL** locally:

```bash
cd backend
DATABASE_URL="<external-db-url-from-render>" npm run prisma:seed
```

---

## 5. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import `gokimakannan-coder/issue-management`
3. Set **Root Directory** to `frontend`
4. Build settings (Vercel auto-detects Vite):
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add environment variable:
   - `VITE_API_URL` = `https://issueflow-backend.onrender.com` (your Render service URL, **no trailing slash**)
6. Click **Deploy**

---

## 6. Wire the Two Services Together

After both services are live:

1. **Render backend** → Environment → Set `CORS_ORIGIN` to your Vercel URL:
   ```
   https://your-frontend.vercel.app
   ```
2. **Vercel frontend** → Settings → Environment Variables → Confirm:
   ```
   VITE_API_URL=https://issueflow-backend.onrender.com
   ```
3. Trigger a redeploy on both services for the env vars to take effect.

### How the API URL is resolved

| Environment | `VITE_API_URL`      | Effective `baseURL`                              |
|-------------|---------------------|--------------------------------------------------|
| Local dev   | *(not set)*         | `/api` → proxied by Vite to `localhost:5000`     |
| Production  | `https://…render…` | `https://…render….onrender.com/api`              |

No `localhost` is ever used in a production build.

---

## 7. Environment Variable Reference

### Backend (`backend/.env`)

| Variable         | Required | Description                                          |
|------------------|----------|------------------------------------------------------|
| `PORT`           | No       | HTTP port (default 5000; Render injects 10000)       |
| `DATABASE_URL`   | Yes      | Full PostgreSQL connection string                    |
| `JWT_SECRET`     | Yes      | Random secret ≥ 32 chars for signing JWTs            |
| `JWT_EXPIRES_IN` | No       | Token lifetime (default `7d`)                        |
| `CORS_ORIGIN`    | No       | Allowed origin (default `*`; set to Vercel URL in prod) |

### Frontend (`frontend/.env.local`)

| Variable       | Required in prod | Description                                          |
|----------------|------------------|------------------------------------------------------|
| `VITE_API_URL` | Yes              | Backend base URL without trailing slash              |

---

## 8. Troubleshooting

### `prisma migrate deploy` fails on first deploy

Ensure `DATABASE_URL` is set before the start command runs. With `render.yaml` the database link is automatic; with manual setup you must add the env var before the first deploy.

### CORS errors in the browser

- Confirm `CORS_ORIGIN` on Render exactly matches your Vercel URL (no trailing slash, correct protocol).
- If you changed the Vercel domain, update `CORS_ORIGIN` on Render and redeploy.

### `Cannot find module '@prisma/client'`

The `build` script now runs `prisma generate` before `tsc`. If you bypassed the build script, run:

```bash
cd backend && npx prisma generate
```

### Free tier cold starts on Render

Render free web services spin down after 15 minutes of inactivity. The first request after a cold start takes ~30 seconds. Upgrade to a paid plan to avoid this.

### Check migration status

```bash
# From your local machine using the External DB URL
DATABASE_URL="<external-url>" npx prisma migrate status
```
