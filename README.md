# Pairgo

Job swap platform for backpackers & employers in Australia. Product vision and roadmap: [PAIRGO_README.md](PAIRGO_README.md).

## Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 19 + Vite, Tailwind v4, framer-motion |
| Backend  | Express 5 (`server.js`) |
| Database | MongoDB + Mongoose (`models.js`) |
| Auth     | bcrypt + JWT in httpOnly cookies |
| Hosting  | Render (Express serves `dist/` in production) |

## Setup

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, ADMIN_PASSWORD, VITE_GOOGLE_MAPS_API_KEY
npm run dev            # API on :3001 + Vite on :5173 (proxies /api)
```

## Production

```bash
npm run build
npm start              # NODE_ENV=production — refuses to start without JWT_SECRET and ADMIN_PASSWORD
```

## Data model

- **User** — `role: backpacker | manager`, profile fields for each role
- **Position** — opening posted by a manager
- **SwapRequest** — links a backpacker to a manager's position. Created by either side (`initiator`), status `pending → active → completed` (or `declined`); the manager rates the worker once completed.

## Admin

`/admin` — password from `ADMIN_PASSWORD`. Lists users and basic stats.
