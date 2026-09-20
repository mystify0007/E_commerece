# JuttaX — AI-Powered Local Handmade Footwear Marketplace

JuttaX is a MERN-stack marketplace connecting local, handmade-footwear
artisans directly with customers — combining e-commerce, an artisan
marketplace, shoe customization, custom production tracking, and AI-assisted
discovery in one platform.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full system
architecture, user-role permission matrix, module breakdown, MongoDB
collection design, frontend/backend folder structures, API architecture,
development roadmap, and dependency list.

## Progress

- [x] **Phase 1** — Project setup (Express + MongoDB backend, React + Vite +
      Tailwind frontend, connected)
- [x] **Phase 2** — Database (all 19 Mongoose models, relationships, indexes)
- [x] **Phase 3** — Authentication & authorization (JWT, bcrypt, roles,
      protected routes, password reset)
- [ ] Phase 4 — Customer foundations
- [ ] Phase 5 — Product marketplace
- [ ] Phase 6 — Artisan marketplace
- [ ] Phase 7 — Cart & orders
- [ ] Phase 8 — Customization
- [ ] Phase 9 — Custom production tracking
- [ ] Phase 10 — AI (recommendations, sizing, listing assistant)
- [ ] Phase 11 — Reviews & notifications
- [ ] Phase 12 — Admin
- [ ] Phase 13 — Testing & deployment

## Project layout

```
server/   Express REST API + MongoDB (Mongoose)
client/   React 19 + Vite + Tailwind CSS v4
docs/     Architecture and planning documentation
```

## Getting started

### Backend

```bash
cd server
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET at minimum
npm install
npm run dev             # http://localhost:5000
```

`MONGO_URI` can point at a local `mongod`, a Docker container, or a free
MongoDB Atlas cluster — any standard MongoDB connection string works.

### Frontend

```bash
cd client
cp .env.example .env    # defaults already point at http://localhost:5000/api
npm install
npm run dev              # http://localhost:5173
```

### Running tests (backend)

```bash
cd server
npm run test:http   # HTTP/middleware layer — no database required
npm run test:db     # full integration suite against an in-memory MongoDB
npm test             # both
```

`test:db` uses `mongodb-memory-server`, which downloads a real `mongod`
binary the first time it runs — it needs outbound internet access to
`fastdl.mongodb.org` once. `test:http` never touches the network and
verifies routing, validation, and the JWT auth/RBAC guards directly.

## Security notes

- All prices are calculated and validated server-side — the client never
  dictates a persisted price.
- Every protected route enforces both authentication (valid JWT) and
  authorization (role + resource ownership).
- Secrets (JWT, MongoDB, Cloudinary, AI, payment) live only in `.env`, never
  in source. See `server/.env.example` and `client/.env.example`.
