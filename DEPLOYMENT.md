# IssueFlow Enterprise — Deployment Guide (SQLite Demo)

Production stack: **Render** (backend + SQLite) · **Vercel** (frontend)

> **Demo setup — SQLite on Render's ephemeral disk.**
> This is the right choice for a quick demo. See the [SQLite limitations](#sqlite-limitations-on-render) section before inviting permanent users.

---

## Table of Contents

1. [Local Development](#1-local-development)
2. [Seed Demo Users](#2-seed-demo-users)
3. [Deploy Backend to Render](#3-deploy-backend-to-render)
4. [Deploy Frontend to Vercel](#4-deploy-frontend-to-vercel)
5. [Wire the Two Services Together](#5-wire-the-two-services-together)
6. [SQLite Limitations on Render](#6-sqlite-limitations-on-render)
7. [Environment Variable Reference](#7-environment-variable-reference)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Local Development

### Prerequisites

- Node.js ≥ 18

### Configure the backend

```bash
cd backend
cp .env.example .env
```

`backend/.env` should contain:

```env
PORT=5000
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="<generate: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\">"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

### Apply schema to the local database

```bash
cd backend
npx prisma db push
```

### Start the dev server

```bash
npm run dev
```

---

## 2. Seed Demo Users

```bash
cd backend
npm run prisma:seed
```

> **Warning:** The seed script deletes all existing data before inserting.

Demo accounts (all passwords: `password123`):

| Role     | Email                     | Name           |
|----------|---------------------------|----------------|
| Admin    | admin@issueflow.com       | Alex Morgan    |
| Manager  | manager@issueflow.com     | Sarah Chen     |
| Employee | john@issueflow.com        | John Doe       |
| Employee | emily@issueflow.com       | Emily Davis    |
| Employee | marcus@issueflow.com      | Marcus Vance   |

---

## 3. Deploy Backend to Render

### Step 1 — Create a Web Service

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo `gokimakannan-coder/issue-management`
3. Render auto-detects `render.yaml` — confirm the settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`

### Step 2 — Set environment variables on Render

Render fills most env vars from `render.yaml`. You must set one manually:

| Key           | Value                                                      |
|---------------|------------------------------------------------------------|
| `CORS_ORIGIN` | Your Vercel frontend URL (set after frontend is deployed)  |

Generate the `JWT_SECRET` automatically — `render.yaml` has `generateValue: true`.

### Step 3 — Deploy

Push to `main`. Render will:
1. Run `npm install && npm run build` (includes `prisma generate && tsc`)
2. Start with `npm run start:prod`:
   - `prisma db push` — creates/updates the SQLite schema on disk
   - `npm run prisma:seed` — seeds demo users and sample issues
   - `node dist/server.js` — starts the API server

Verify the health check after deploy:

```
https://issueflow-backend.onrender.com/api/health
```

Expected:
```json
{ "status": "ok", "timestamp": "..." }
```

---

## 4. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import `gokimakannan-coder/issue-management`
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_URL` = `https://issueflow-backend.onrender.com` (no trailing slash)
5. Click **Deploy**

---

## 5. Wire the Two Services Together

1. **Render** → Environment → Set `CORS_ORIGIN` to your Vercel URL:
   ```
   https://your-frontend.vercel.app
   ```
2. Redeploy the Render service so the env var takes effect.

### How the API URL is resolved

| Environment | `VITE_API_URL`      | Effective `baseURL`                          |
|-------------|---------------------|----------------------------------------------|
| Local dev   | *(not set)*         | `/api` → proxied by Vite to `localhost:5000` |
| Production  | `https://…render…` | `https://…render….onrender.com/api`          |

---

## 6. SQLite Limitations on Render

**Render's free web service disk is ephemeral.** This means:

| Event                        | What happens to the SQLite database        |
|------------------------------|--------------------------------------------|
| New deploy / restart         | Database file is recreated from scratch     |
| Service goes to sleep        | Database file survives until next deploy    |
| Scale-out (multiple instances) | Each instance has its own separate database |

### Practical impact for your demo

- Every time Render deploys (you push to `main`) or restarts the service, `start:prod` runs `prisma db push` and `prisma:seed` — the database is wiped and rebuilt with demo data.
- **Any data your friend creates during the demo will be lost on the next deploy or Render restart.**
- This is fine for a short-lived demo. It is NOT suitable for real users or persistent data.

### When you're ready to go beyond a demo

Switch to PostgreSQL (a persistent external database):

1. Revert `schema.prisma` provider back to `postgresql`.
2. Create a Render PostgreSQL database (free tier available).
3. Add a proper `prisma migrate deploy` migration flow.
4. See git history for the previous PostgreSQL setup, or re-run the migration setup steps.

---

## 7. Environment Variable Reference

### Backend (`backend/.env`)

| Variable         | Required | Description                                                |
|------------------|----------|------------------------------------------------------------|
| `PORT`           | No       | HTTP port (default 5000; Render injects 10000)             |
| `DATABASE_URL`   | Yes      | SQLite file path, e.g. `file:./prisma/dev.db`              |
| `JWT_SECRET`     | Yes      | Random secret ≥ 32 chars for signing JWTs                  |
| `JWT_EXPIRES_IN` | No       | Token lifetime (default `7d`)                              |
| `CORS_ORIGIN`    | No       | Allowed origin (default `*`; set to Vercel URL in prod)    |

### Frontend (`frontend/.env.local`)

| Variable       | Required in prod | Description                                     |
|----------------|------------------|-------------------------------------------------|
| `VITE_API_URL` | Yes              | Backend base URL without trailing slash         |

---

## 8. Troubleshooting

### CORS errors in the browser

Confirm `CORS_ORIGIN` on Render exactly matches your Vercel URL — no trailing slash, correct protocol (`https://`). Update it and redeploy.

### Free tier cold starts on Render

Render free web services spin down after 15 minutes of inactivity. The first request after a cold start takes ~30 seconds. Upgrade to a paid plan or use an uptime monitor (e.g. UptimeRobot pinging `/api/health` every 5 minutes) to keep it warm.

### `Cannot find module '@prisma/client'`

The `build` script runs `prisma generate` before `tsc`. If you bypassed it, run:

```bash
cd backend && npx prisma generate
```

### Demo data missing after deploy

`start:prod` always re-seeds the database. If the seed fails, check Render logs for errors in `prisma:seed`. The seed script requires all models to exist — make sure `prisma db push` ran first (it does, earlier in `start:prod`).
