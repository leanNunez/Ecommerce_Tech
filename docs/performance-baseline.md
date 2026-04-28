# Performance Baseline — PremiumTech Frontend

> Static analysis as of 2026-04-28. Actual sizes require `vite build`.

## Code Splitting Status

All user-facing routes use `React.lazy` + dynamic `import()`. Each route is an isolated chunk.

| Route | Lazy? | Notes |
|-------|-------|-------|
| `/` (Home) | ✅ | `home-page` chunk |
| `/catalog` (PLP) | ✅ | `catalog-page` chunk |
| `/product/$slug` (PDP) | ✅ | `product-detail-page` chunk |
| `/search` | ✅ | `search-page` chunk |
| `/cart` | ✅ | `cart-page` chunk |
| `/checkout` | ✅ | `checkout-page` chunk |
| `/checkout/confirmation/$id` | ✅ | `confirmation-page` chunk |
| `/brands` | ✅ | `brands-page` chunk |
| `/brands/$slug` | ✅ | `brand-catalog-page` chunk |
| `/catalog/$category` | ✅ | reuses `catalog-page` chunk |
| `/login`, `/register`, `/forgot-password` | ✅ | separate auth chunks |
| `/account/*` (profile, orders, addresses…) | ✅ | per-page lazy chunks |
| `/admin/dashboard` | ✅ | fixed 2026-04-28 |
| `/admin/products` | ✅ | fixed 2026-04-28 |
| `/admin/orders` | ✅ | fixed 2026-04-28 |
| `/admin/brands` | ✅ | fixed 2026-04-28 |
| `/admin/categories` | ✅ | fixed 2026-04-28 |
| `/admin/users` | ✅ | fixed 2026-04-28 |

**Before fix**: 6 admin pages were eagerly imported. Admin code was bundled into the shared chunk, inflating load for all non-admin users.

## Budget Targets (from skill)

| Route | Max JS budget |
|-------|---------------|
| Home | 150 KB |
| PLP | 200 KB |
| PDP | 180 KB |
| Checkout | 250 KB |
| Admin | No cap (lazy-loaded, admin-only) |

## Prefetch Strategy

PLP → PDP: `preload="intent"` on `<Link>` + `queryClient.prefetchQuery` on `onMouseEnter/onFocus`.
Data is in cache before the user clicks — zero spinner on fast networks.

## Shared Chunk — Known Heavy Dependencies

| Library | Tree-shakeable | Notes |
|---------|---------------|-------|
| `lucide-react` | ✅ Yes | Named imports only — Vite dead-code eliminates unused icons |
| `@tanstack/react-query` | ✅ Yes | |
| `@tanstack/react-router` | ✅ Yes | |
| `react-hook-form` | ✅ Yes | |
| `zod` | ✅ Yes | |
| `axios` | ⚠️ Partial | Full bundle ~14 KB gzip. Consider `fetch` if budget is tight |
| `react-helmet-async` | ✅ Yes | ~3 KB gzip |
| `i18next` | ⚠️ ~13 KB gzip | Necessary for EN/ES |

## Vendor Chunk Strategy (implemented 2026-04-28)

`manualChunks` configured in `vite.config.ts`:

| Chunk | Contents | Why |
|-------|----------|-----|
| `vendor-react` | react, react-dom, scheduler | Rarely changes — long cache TTL |
| `vendor-tanstack` | @tanstack/react-query, @tanstack/react-router | Rarely changes |
| `vendor-ui` | @radix-ui/*, lucide-react | UI primitives — stable |
| `vendor-i18n` | i18next, react-i18next | Language pack — stable |

App code chunks get their own hash independent of vendor changes. A code change to `home-page.tsx` no longer invalidates the React bundle.

---

## API Latency Budgets (p95 targets)

Measured at the server boundary (no network). Semantic search includes Cohere round-trip (first request — cached on subsequent).

| Endpoint | p95 budget | Notes |
|----------|-----------|-------|
| `GET /health` | 50ms | Should be near-instant |
| `GET /api/categories` | 100ms | In-memory cache (TTL 5min) |
| `GET /api/brands` | 100ms | In-memory cache (TTL 5min) |
| `GET /api/products` (list) | 300ms | Neon cold query, no variants |
| `GET /api/search` (filter-only) | 300ms | Prisma query, paginated |
| `GET /api/search` (semantic, cached) | 500ms | Vector query, embedding cached |
| `GET /api/search` (semantic, cold) | 1500ms | Includes Cohere embed call |
| `GET /api/products/:slug` | 300ms | Single product with variants |
| `POST /api/assistant/chat` | 5000ms | LLM streaming, first token |

Run `bun run load-test [BASE_URL]` from `server/` to validate against these budgets.

---

## Backend Query Optimizations (implemented 2026-04-28)

### products.ts — split PRODUCT_INCLUDE

`GET /api/products` (list) now uses `PRODUCT_INCLUDE_LIST`:
- `images: { take: 1 }` — only the first image (was: all images)
- No `variants` — PLP never needs them (was: full variant rows per product)

`GET /api/products/:slug` (detail) keeps `PRODUCT_INCLUDE_DETAIL` (full: all images + variants).

### search.ts — embedding vector cache

`embedQuery` result is cached in memory by query string (TTL 1h). Same query string → zero Cohere round-trip on repeat requests. Cache key: `embed:<normalized-query>`.

---

## Next Steps

- [ ] Run `vite build` + `vite-bundle-visualizer` to confirm actual chunk sizes vs budgets
- [ ] If Home > 150 KB: audit `category-shelf.tsx` imports (has heavy animated sections)
- [ ] If PDP > 180 KB: consider splitting `ProductGallery` into its own chunk
