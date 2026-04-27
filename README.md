# PremiumTech — E-commerce SPA

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing_Library-E33332?style=for-the-badge&logo=testing-library&logoColor=white)
![Supertest](https://img.shields.io/badge/Supertest-000000?style=for-the-badge&logoColor=white)

[![Frontend CI](https://github.com/leanNunez/Ecommerce_Tech/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/leanNunez/Ecommerce_Tech/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/leanNunez/Ecommerce_Tech/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/leanNunez/Ecommerce_Tech/actions/workflows/backend-ci.yml)

Full-stack e-commerce SPA for technology products. React 19 frontend with Feature-Sliced Design architecture, Node.js + Express REST API, and PostgreSQL on Neon.

## Features

- Product catalog with filters, search, sorting, and pagination
- Product detail with image gallery and variant selection (color, storage, etc.)
- Shopping cart with persistent state
- Wishlist
- Full checkout flow with address selection
- Order history and order detail
- Auth — register, login, JWT refresh token, forgot/reset password
- Admin panel — products (CRUD with image upload), orders, users, categories
- Product variants with per-variant image upload (Cloudinary)
- Role-based access control (customer / admin)
- Responsive design
- **Semantic search** — hybrid keyword + vector similarity (Cohere embeddings + pgvector)
- **AI shopping assistant** — streaming chat with tool-calling via Groq LLM
- Prompt injection guard with keyword filter and strike/ban system

## AI Features

### Semantic Search — `GET /api/search`

Queries are embedded at runtime using Cohere `embed-multilingual-v3.0` and matched against product vectors stored in PostgreSQL via pgvector. Results are ranked by a hybrid score:

```
score = 0.4 × full_text_rank + 0.6 × cosine_similarity
```

Supports filters: `category`, `brand`, `minPrice`, `maxPrice`, `inStock`, `sort` (`relevance` | `price_asc` | `price_desc` | `newest`), `page`, `perPage`.

### Similar Products — `GET /api/products/:id/similar`

Returns products ranked by cosine similarity to the target product's embedding. Excludes the product itself and out-of-stock items. Falls back to top-rated products in the same category if no embedding is available.

### AI Shopping Assistant — `POST /api/assistant/chat`

Streaming conversational assistant (SSE) powered by Groq `llama-3.3-70b-versatile` with tool-calling. The assistant can search and recommend products, compare them, add items to cart, and answer catalog questions grounded in real data — it never makes up prices or stock.

```
POST /api/assistant/chat
Content-Type: application/json

{ "message": "I need a laptop under $1000 for gaming", "history": [] }

→ text/event-stream
data: {"type":"chunk","content":"Here are some options..."}
data: {"type":"done"}
```

Rate-limited to 20 req/min. Input sanitized with a prompt injection guard (keyword filter + strike/ban). Auth is optional — guests can chat, authenticated users can add to cart.

### AI Architecture

See the [system diagram](#architecture) above for the full component overview.

**Search flow:** query → Cohere embed (1024 dims) → RRF(pgvector cosine + tsvector FTS) → ranked results with `why_matched: "semantic" | "text" | "semantic+text"`

**Assistant flow:** message → injection guard → Groq tool-calling loop (max 8 rounds) → SSE stream. Available tools:

| Tool | Description |
|---|---|
| `searchProducts(query, filters)` | Hybrid search against the live catalog |
| `getProductDetails(productId)` | Full specs, price, stock, variants |
| `compareProducts(productIds[])` | Side-by-side comparison |
| `addToCart(productId, variantId, qty)` | Requires auth |
| `getCartSummary()` | Current cart totals |

### Known Tradeoffs

| Decision | Tradeoff |
|---|---|
| Cohere free tier for embeddings | 1 000 req/month shared with indexing — sufficient for demo; swap for paid plan in production |
| Groq free tier for LLM | 14 400 req/day — no monthly cap, zero cold start |
| Exact vector search (no IVFFlat) | Linear scan — correct at any dataset size, but `CREATE INDEX USING ivfflat` is needed beyond ~100k products |
| Ephemeral chat history | History lives client-side per session — no DB persistence, no cross-device continuity |

## Architecture

```mermaid
graph TD
    Browser["🌐 Browser\nReact 19 · FSD · TanStack Router"]

    subgraph api["Express API  —  Node.js + Bun"]
        Routes["REST Routes\n/api/products · /api/orders · /api/cart\n/api/auth · /api/search · /api/assistant"]
        Guard["Injection Guard\n+ Rate Limit + requestId"]
        Search["Hybrid Search\nvector RRF + full-text → why_matched"]
        Orch["Assistant Orchestrator\ntool-calling loop · SSE stream"]
    end

    subgraph ext["External Services"]
        Cohere["Cohere\nembed-multilingual-v3.0\n1024 dims · ⏱ 10 s"]
        Groq["Groq  llama-3.3-70b-versatile\ntool-calling · ⏱ 30 s · retry ×3"]
        Cloudinary["Cloudinary\nimage upload · ⏱ 30 s"]
    end

    subgraph db["Neon PostgreSQL"]
        PGV["pgvector\ncosine similarity"]
        FTS["Full-text\ntsvector"]
        ORM["Prisma 7\npg adapter"]
    end

    Browser -- "REST · SSE · HttpOnly cookie" --> Routes
    Routes --> Guard
    Guard --> Search
    Guard --> Orch
    Search -- "embed query" --> Cohere
    Cohere -- "float[1024]" --> Search
    Search -- "vector scan" --> PGV
    Search -- "plainto_tsquery" --> FTS
    Orch -- "tool-calling" --> Groq
    Orch -- "searchProducts · addToCart ..." --> Routes
    Routes -- "CRUD" --> ORM
    ORM --> PGV
    ORM --> FTS
    Routes -- "upload_stream" --> Cloudinary
```

### Frontend — Feature-Sliced Design (FSD)

```
src/
├── app/          # Providers, router, global styles
├── pages/        # Page components (one per route)
├── widgets/      # Composite UI blocks (header, cart sidebar, product gallery)
├── features/     # User interactions (add to cart, authenticate, filter catalog)
├── entities/     # Domain models + API + React Query hooks (product, order, user…)
└── shared/       # UI primitives, axios client, types, utils
```

### Backend — REST API

```
server/src/
├── routes/       # Express routers (products, orders, auth, search, assistant…)
├── middleware/   # Auth (JWT), injection guard, error handler
├── lib/          # Prisma client, embeddings (Cohere), assistant orchestrator (Groq)
└── scripts/      # index-products — batch embedding pipeline
```

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4, Shadcn UI |
| Routing | TanStack Router v1 (file-based) |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| Forms | React Hook Form + Zod |
| Backend | Node.js, Express, Bun |
| ORM | Prisma 7 (pg adapter) |
| Database | PostgreSQL — Neon (serverless) |
| Auth | JWT (access + refresh token, HttpOnly cookie) |
| File upload | Cloudinary |
| Deploy | Vercel (frontend) + Render (backend) |
| Testing | Vitest · React Testing Library · Supertest |
| Embeddings | Cohere `embed-multilingual-v3.0` (1024 dims) |
| Vector store | pgvector (cosine similarity, exact search) |
| LLM | Groq `llama-3.3-70b-versatile` (tool-calling + SSE) |

## Testing

```bash
# Frontend unit + component tests
npm run test

# Backend integration tests (requires .env with real DATABASE_URL)
cd server && bun run test
```

| Type | What's covered |
|---|---|
| Unit | Zustand store — cart logic (add, remove, quantity, totals) |
| Component | `AddToCartButton` — renders, interactions, mocked i18n / router / auth |
| Integration | REST endpoints `/auth` and `/products` against real Neon PostgreSQL |

## Local Setup

### Prerequisites

- Node.js 20+
- Bun
- A [Neon](https://neon.tech) database
- A [Cloudinary](https://cloudinary.com) account

### Frontend

```bash
# Install dependencies
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:3001" > .env.local

# Start dev server
npm run dev
```

### Backend

```bash
cd server

# Install dependencies
bun install

# Create .env (see server/env.example)
cp env.example .env
# Fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, CLOUDINARY_*

# Generate Prisma client
bun prisma generate

# Run migrations
bun prisma migrate deploy

# (Optional) Seed the database
bun prisma db seed

# Start dev server
bun run dev

# Index product embeddings (required for semantic search)
bun run index:full
```

### Embedding Index Commands

| Command | Description |
|---|---|
| `bun run index:full` | Embed all active products (run once after setup) |
| `bun run index:changed` | Embed only products created/updated since last run |
| `bun run index:product -- --id <id>` | Embed a single product by ID |

## Demo

> Full step-by-step walkthrough: [`docs/DEMO.md`](docs/DEMO.md)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@premiumtech.com` | `password123` |
| Customer | `sofia.martin@gmail.com` | `password123` |

A runnable HTTP collection for all AI endpoints is at [`server/api.http`](server/api.http) (VS Code REST Client or JetBrains HTTP Client).

**3-minute demo flow:**

1. Open the live demo and type a natural language query in the search bar (e.g. *"gaming laptop under $1000"* or *"auriculares inalámbricos"*)
2. Notice results blend keyword matches and semantic similarity — a query for *"headphones"* also surfaces *"auriculares"*
3. Open a product page → scroll to "Similar Products" (vector-ranked recommendations)
4. Click the chat bubble → ask the assistant to *"compare the two cheapest laptops"*
5. Ask it to *"add the cheaper one to my cart"* (log in first as Sofia to persist the cart)
6. Log in as `admin@premiumtech.com` to explore the admin panel (product CRUD, image upload, order management)

## Environment Variables

### Frontend (`.env.local`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL |

### Backend (`.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `CLIENT_ORIGIN` | Frontend URL (for CORS) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `COHERE_API_KEY` | Cohere API key (embeddings) — [dashboard.cohere.com](https://dashboard.cohere.com/api-keys) |
| `GROQ_API_KEY` | Groq API key (LLM) — [console.groq.com](https://console.groq.com/keys) |
| `HEALTH_TOKEN` | Secret for `/health` endpoint (optional, recommended in prod) |

## Deploy

- **Frontend** → Vercel. Config in `vercel.json`. Set `VITE_API_URL` in Vercel environment variables.
- **Backend** → Render. Set all backend environment variables in Render dashboard (note: `server/railway.json` can be ignored).
