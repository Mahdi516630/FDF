## Render deployment (single service)

This repo is set up to deploy as **one Render Web Service**:

- Backend: `server/` (Express + SQLite on disk)
- Frontend: Vite build served by the backend

### 1) Create the Web Service

- **Root Directory**: `my-app`
- **Build Command**:

```bash
npm run build:full
```

- **Start Command**:

```bash
npm run start:full
```

### 2) Add a persistent disk (required)

Create a **Persistent Disk** and mount it to:

- **Mount path**: `/var/data`

### 3) Environment variables

Set these env vars in Render:

- **`NODE_ENV`**: `production`
- **`PORT`**: `10000` (Render sets `PORT` automatically; keep if you want explicit)
- **`DB_PATH`**: `/var/data/fdf.sqlite`
- **`JWT_SECRET`**: a long random secret (>= 16 chars)
- **`CORS_ORIGIN`**: `*` (or your real domain once you know it)

### 4) First login

Seeded admin account:

- `admin@fdf.dj`
- `admin123`

After deployment, **change the admin password** by registering a new account and disabling the default (optional improvement).

