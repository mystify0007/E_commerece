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
- [x] **Phase 4** — Customer foundations (dashboard shell, profile, browsing)
- [x] **Phase 5** — Product marketplace (categories, product CRUD with admin
      approval, server-side search/filter/sort/pagination, product details,
      same-category "similar products")
- [x] **Phase 6** — Artisan marketplace (public artisan listing + profile
      with reviews, shop-profile editing, admin verification workflow)
- [x] **Phase 7** — Cart & checkout: server-priced cart, transactional order
      creation (Mongo session + `withTransaction`) with atomic stock
      decrement, pluggable payment adapter (working `cod`/`mock` providers;
      `esewa`/`khalti` scaffolded but honestly disabled until real sandbox
      credentials + verified API docs are added), order tracking for
      customer/artisan/admin with per-artisan data isolation on shared orders
- [x] **Phase 8** — Shoe customizer: artisan-managed customization options
      (style/color/material/sole/personalization) per product, live-priced
      customizer UI, server-authoritative pricing shared by cart, checkout,
      and a public price-preview endpoint
- [x] **Phase 9** — Custom shoe requests: request → artisan proposal →
      accept/reject/request-changes → 10-stage production timeline, with the
      request locked to whichever verified artisan responds first and stage
      transitions enforced by a guard (no skipping ahead)
- [x] **Phase 10** — AI: content-based "Recommended For You" (built from real
      purchase history, category/material/color/price/artisan affinity, with
      a popular-products fallback for new customers), wishlist-based
      recommendations, smart size estimator (documented formula + fit/width
      adjustment + closest-available-size matching, with the required
      disclaimer), and an artisan listing assistant (heuristic category/
      material/color/tag/description suggestions — never auto-published,
      always reviewed by the artisan before applying). Also includes a real
      Wishlist module (spec Module 14), added because recommendations needed
      it.
- [x] **Phase 11** — Reviews & real-time notifications: product/artisan
      reviews gated by actual delivered-order eligibility (server-verified,
      not just a form anyone logged in could submit), rating aggregation,
      admin moderation endpoint; notifications listed/marked read via the
      API and pushed live over Socket.IO (bell icon with unread badge)
- [x] **Phase 12** — Admin dashboard: platform stats, user management,
      artisan verification queue, product moderation queue, category CRUD,
      audit logging on every moderation action
- [x] **Phase 13** — Hardening pass: full authorization-matrix review across
      every route (see below), dependency audits (0 vulnerabilities on both
      client and server), no committed secrets, no stray debug output

### Known, intentional gaps

- **eSewa / Khalti** are wired into the same `PaymentProvider` interface as
  the working `cod`/`mock` providers, but fail closed with a clear "not
  configured" error rather than shipping guessed request/response field
  names as if they were a verified integration. Add real sandbox
  credentials and finish `services/paymentService/providers/{esewa,khalti}Provider.js`
  against each gateway's current docs to go live.
- **Admin review moderation** has a working API
  (`PATCH /api/reviews/:id/moderate`) but no dedicated admin UI page yet —
  everything else in the admin panel (users, artisans, products, categories)
  does.
- No route-based code-splitting yet (Vite prints a bundle-size advisory,
  not an error) — the SPA is a single bundle.
- Saved multi-address address books (the `Address` model) aren't wired into
  checkout yet; checkout takes a shipping address inline per order.

## Project layout

```
server/   Express REST API + MongoDB (Mongoose)
client/   React 19 + Vite + Tailwind CSS v4
docs/     Architecture and planning documentation
```

## Getting started

### MongoDB (via Docker)

A `docker-compose.yml` is provided at the repo root:

```bash
docker compose up -d mongo   # starts MongoDB on localhost:27017, persisted in a named volume
docker compose ps            # confirm it's running
docker compose logs -f mongo # tail logs if something looks wrong
docker compose down          # stop it (data persists in the volume)
```

With this running, `MONGO_URI=mongodb://localhost:27017/juttax` (already the
default in `server/.env.example`) will work as-is. No local MongoDB install
needed. `MONGO_URI` can also point at a native `mongod` install or a free
MongoDB Atlas cluster instead — any standard MongoDB connection string works.

### Backend

```bash
cd server
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET at minimum
npm install
npm run dev             # http://localhost:5000
npm run seed             # creates a demo admin account + starter categories
```

`npm run seed` prints the demo admin's email/password to the console. Log in
with those credentials to reach `/admin` and verify artisans, approve
products, and manage categories.

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
npm run test:db     # full integration suite against an in-memory MongoDB (replica set, for transactions)
npm test             # both
```

`test:db` uses `mongodb-memory-server`, which downloads a real `mongod`
binary the first time it runs — it needs outbound internet access to
`fastdl.mongodb.org` once. `test:http` never touches the network and
verifies routing, validation, and the JWT auth/RBAC guards directly.

## Security notes

- All prices (product, customization, checkout total) are calculated and
  validated server-side from the current database state — the client never
  dictates a persisted price.
- Every protected route enforces both authentication (valid JWT) and
  authorization (role + resource ownership) — reviewed route-by-route as
  part of the Phase 13 hardening pass.
- An artisan can never read or mutate another artisan's products, orders
  (even within a shared multi-vendor cart, they only ever see their own
  line items), or customization options.
- Secrets (JWT, MongoDB, Cloudinary, AI, payment) live only in `.env`, never
  in source. See `server/.env.example` and `client/.env.example`.
- `npm audit` reports 0 vulnerabilities on both `server/` and `client/`.
