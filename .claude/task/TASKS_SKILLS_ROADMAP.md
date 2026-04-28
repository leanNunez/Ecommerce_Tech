# Ecommerce_Tech — Roadmap de Ejecución con Skills

> Objetivo: ejecutar mejoras del proyecto de forma ordenada usando las skills ya definidas.

## Reglas de ejecución
- PRs atómicas con alcance claro.
- Cada PR: tests mínimos (happy path + error path) + checklist según corresponda.
- No mezclar refactors con features.
- Priorizar riesgos de seguridad y estabilidad primero.

---

## Fase 0 — Baseline y diagnóstico

- ⏭ **0.1 Auditoría del repositorio** — SKIP: el conocimiento ya existe en `TASKS_AI_ECOMMERCE.md` y memoria de sesiones. Generar `tech-baseline.md` no agrega información nueva; sí agrega tokens de mantenimiento.
- ⏭ **0.2 Skill compliance matrix** — SKIP: overhead puro. Este mismo roadmap es el tracking.
- ⏭ **0.3 KPIs formales** — SKIP: latencia y error rate ya cubiertos por `GET /metrics`. Bundle y UX coverage se miden en las fases correspondientes, no en un doc separado.

---

## Fase 1 — Seguridad y estabilidad

- ✅ **1.1 JWT hardening** — HECHO: `auth.ts:12-16` lanza en producción si faltan secrets. Tokens: access 15m, refresh 7d, HttpOnly cookie, sameSite correcto por env.
- ✅ **1.2 Rate limiting en login** — HECHO: `loginLimiter` 10 req/15min, `registerLimiter` 5/hora, `forgotPasswordLimiter` 5/15min.
- ✅ **1.3 Roles** — HECHO: registro siempre crea `customer`. No hay promoción automática.
- ✅ **1.4 Price manipulation** — HECHO: `orders.ts:62-77` recalcula precios desde DB en cada orden. Cliente solo manda `productId` + `variantId` + `quantity`.
- ✅ **1.5 Upload robusto** — HECHO: `CLOUDINARY_URL` validada en runtime, fix de FormData documentado en `ecommerce-gotchas`.

---

## Fase 2 — Testing de flujos críticos

- ✅ **2.1 Ampliar test matrix** — HECHO: tests de orders (GET/POST), checkout stepper (validación por paso), AddToCartButton (pending/added/outOfStock/admin). 70 tests backend + frontend pasando en CI.
- ✅ **2.2 Contract tests con factories tipadas** — HECHO inline en 2.1: mocks tipados con `vi.hoisted`, `baseProduct` factory en add-to-cart tests, `VALID_ADDRESS` en orders tests.
- ⏭ **2.3 Factories como tarea separada** — SKIP como ítem independiente: se hace inline al escribir los tests de 2.1/2.2.

---

## Fase 3 — UX frontend

- ✅ **3.1 Filtros URL-first en PLP** — HECHO: `useCatalogFilters` usa `useSearch`/`useNavigate` de TanStack Router. `clearFilters()` existe. `page` se resetea a 1 al cambiar filtros.
- ✅ **3.2 Estados visuales consistentes** — HECHO: `ProductCardSkeleton` con `animate-pulse bg-surface/60`, error states con retry en PLP y PDP, empty states con CTA.
- ✅ **3.3 Add to Cart feedback en PDP** — HECHO: botón con estados pending/added/failed, sync optimista + server async, `cartServerApi.upsertItem`.
- ✅ **3.4 Checkout UX robusto** — HECHO: stepper visual (Shipping → Payment), validación por paso con `form.trigger(SHIPPING_FIELDS)`, confirmación con order ID.

---

## Fase 4 — Performance

- ✅ **4.1 Cloudinary transforms por contexto** — HECHO: helper `src/shared/lib/cloudinary.ts` con sizes `plp` (400x400), `pdp` (800x800), `thumb` (80x80), `og` (1200x630). Aplicado en product-card, product-gallery (hero + thumbs + lightbox), cart-sidebar, cart-page, order-detail-page.
- ✅ **4.2 React Query staleTime** — HECHO: `staleTime: 5min`, `gcTime: 30min`, `refetchOnWindowFocus: false` configurados globalmente en `query-client.ts`.
- ✅ **4.3 Prefetch PLP→PDP** — HECHO: `preload="intent"` en `<Link>` + `queryClient.prefetchQuery` en `onMouseEnter/onFocus` de `ProductCard`. Datos en cache antes del click.
- ✅ **4.4 Bundle audit por ruta** — HECHO: 6 rutas admin sin lazy detectadas y corregidas. Documentado en `docs/performance-baseline.md` con budgets, estrategia de prefetch y dependencias pesadas.

---

## Fase 5 — SEO técnico

- ✅ **5.1 Metadata por tipo de página** — HECHO: componente `PageSeo` con `react-helmet-async`. Titles y descriptions dinámicos en Home, PLP, PDP, Search, BrandCatalog. Keys i18n EN/ES.
- ✅ **5.2 Canonical en URLs filtradas** — HECHO: canonical en PLP preserva solo `/catalog/${category}`, ignorando brand/precio/sort/page. PDP usa `/product/${slug}`. BrandCatalog usa `/brands/${slug}`.
- ⏭ **5.3 hreflang EN/ES** — SKIP: el i18n existe pero el tráfico SEO bilingüe real no justifica la complejidad en un portfolio.
- ✅ **5.4 JSON-LD Product + Breadcrumb en PDP** — HECHO: schema `Product` con rating, stock, precio real + `BreadcrumbList` con categoría. Ambos via `PageSeo` `jsonLd` prop.

---

## Fase 6 — Refactor técnico

- ✅ **6.1 Eliminar `any` en backend** — HECHO: `where: Prisma.ProductWhereInput`, `orderBy: Prisma.ProductOrderByWithRelationInput` en `products.ts`. `safeUser(u: User)` tipado en `users.ts`.
- ✅ **6.2 Pendientes de código** (de `PENDING_FIXES.md`):
  - `req.params.id as string` en 6 rutas → tipados con `Request<{ id: string }>` en `orders.ts`, `addresses.ts`, `products.ts`, `users.ts`, `brands.ts`, `categories.ts`.
  - `react-hooks/set-state-in-effect` re-habilitada globalmente + `eslint-disable` localizado en `search-bar.tsx`, `chat-widget.tsx`, `category-shelf.tsx`.
- ⏭ **6.2 React 19 patterns audit** — SKIP como tarea: React 19 ya está en uso y el compiler no está activo. Sin Compiler no tiene sentido auditar `useMemo`/`useCallback`. Evaluar cuando se active.
- ⏭ **6.3 Tailwind 4 consistency pass** — SKIP: riesgo de regresiones visuales sin ganancia clara si el sistema ya es funcional. Solo aplicar si aparece inconsistencia concreta.

---

## Fase 7 — Operación continua

- ✅ **7.1 PR template** — HECHO: `.github/PULL_REQUEST_TEMPLATE.md` con checklist de seguridad/testing/performance.
- ✅ **7.2 CI quality gates** — HECHO: lint + typecheck + tests en frontend y backend CI con Bun.
- ⏭ **7.3 ADRs** — SKIP: `CHANGELOG.md` y `DEPLOY.md` ya documentan las decisiones relevantes. Carpeta `docs/adr/` sería overhead por ahora.

---

## Orden de ejecución recomendado

1. ✅ **PENDING_FIXES** — deuda técnica rápida (6.2)
2. ✅ **Fase 4.1** — Cloudinary transforms (mayor gain de performance inmediato)
3. ✅ **Fase 3.2 + 3.3** — Estados visuales + Add to Cart feedback (portfolio demo)
4. ✅ **Fase 2.1** — Ampliar tests (cart, checkout, admin)
5. ✅ **Fase 5.1 + 5.4** — Metadata + JSON-LD (SEO básico para portfolio)
6. ✅ **Fase 6.1** — Eliminar `any` en backend
7. ✅ **Fase 3.4 + 4.3 + 4.4** — Checkout UX, prefetch, bundle audit
8. ✅ **Fase 5.2** — Canonical URLs

---

## Definition of Done del roadmap

- ✅ Riesgos críticos de seguridad mitigados.
- ✅ Flujos ecommerce críticos cubiertos por pruebas mínimas.
- ✅ UX consistente en PLP/PDP/Cart/Checkout/Search.
- ✅ Performance y SEO implementados en páginas clave.
- ✅ Estándares técnicos sostenibles por CI.
