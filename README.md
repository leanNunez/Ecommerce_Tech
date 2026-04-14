# PremiumTech — E-commerce SPA

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

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

## Architecture

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
├── routes/       # Express routers (products, orders, auth, users, addresses…)
├── middleware/   # Auth (JWT), error handler
└── lib/          # Prisma client
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
| Deploy | Vercel (frontend) + Railway (backend) |

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
```

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

## Deploy

- **Frontend** → Vercel. Config in `vercel.json`. Set `VITE_API_URL` in Vercel environment variables.
- **Backend** → Railway. Config in `server/railway.json`. Set all backend environment variables in Railway dashboard.
