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

## Next Steps

- [ ] Run `vite build` + `vite-bundle-visualizer` to confirm actual chunk sizes vs budgets
- [ ] If Home > 150 KB: audit `category-shelf.tsx` imports (has heavy animated sections)
- [ ] If PDP > 180 KB: consider splitting `ProductGallery` into its own chunk
- [ ] Consider `manualChunks` in Vite config to group vendor libs separately from app code
