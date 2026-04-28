/**
 * Smoke load test — measures p50/p95/p99 for critical endpoints.
 * Usage: bun run load-test [BASE_URL]
 * Example: bun run load-test https://api.premiumtech.com
 */
export {}

const BASE_URL = process.argv[2] ?? 'http://localhost:3000'
const ITERATIONS = 20
const CONCURRENCY = 4

type Result = { endpoint: string; p50: number; p95: number; p99: number; errors: number }

async function time(fn: () => Promise<Response>): Promise<number | null> {
  const start = performance.now()
  try {
    const res = await fn()
    if (!res.ok) return null
    await res.json()
    return performance.now() - start
  } catch {
    return null
  }
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return Math.round(sorted[Math.max(0, idx)])
}

async function bench(label: string, fn: () => Promise<Response>): Promise<Result> {
  const batches = Math.ceil(ITERATIONS / CONCURRENCY)
  const timings: number[] = []
  let errors = 0

  for (let b = 0; b < batches; b++) {
    const batch = Array.from({ length: Math.min(CONCURRENCY, ITERATIONS - b * CONCURRENCY) }, fn)
    const results = await Promise.all(batch.map(p => time(() => p)))
    for (const t of results) {
      if (t === null) errors++
      else timings.push(t)
    }
  }

  timings.sort((a, b) => a - b)
  return {
    endpoint: label,
    p50: percentile(timings, 50),
    p95: percentile(timings, 95),
    p99: percentile(timings, 99),
    errors,
  }
}

const ENDPOINTS: Array<{ label: string; url: string }> = [
  { label: 'GET /health',                  url: `${BASE_URL}/health` },
  { label: 'GET /api/products (PLP)',       url: `${BASE_URL}/api/products?page=1&perPage=12` },
  { label: 'GET /api/categories',          url: `${BASE_URL}/api/categories` },
  { label: 'GET /api/brands',              url: `${BASE_URL}/api/brands` },
  { label: 'GET /api/search (filter-only)',url: `${BASE_URL}/api/search?category=laptops&inStock=true` },
  { label: 'GET /api/search (semantic)',   url: `${BASE_URL}/api/search?q=laptop+gaming+rtx` },
]

console.log(`\nSmoke load test — ${BASE_URL}`)
console.log(`Iterations: ${ITERATIONS} | Concurrency: ${CONCURRENCY}\n`)

const results: Result[] = []
for (const { label, url } of ENDPOINTS) {
  process.stdout.write(`  ${label} ... `)
  const result = await bench(label, () => fetch(url))
  results.push(result)
  console.log(`p50=${result.p50}ms  p95=${result.p95}ms  p99=${result.p99}ms  errors=${result.errors}`)
}

console.log('\n── Latency Budget Check ──────────────────────────────────────────\n')
const BUDGETS: Record<string, { p95: number }> = {
  'GET /health':                  { p95: 50 },
  'GET /api/products (PLP)':      { p95: 300 },
  'GET /api/categories':          { p95: 100 },
  'GET /api/brands':              { p95: 100 },
  'GET /api/search (filter-only)':{ p95: 300 },
  'GET /api/search (semantic)':   { p95: 1500 },
}

let allPass = true
for (const r of results) {
  const budget = BUDGETS[r.endpoint]
  if (!budget) continue
  const pass = r.p95 <= budget.p95
  if (!pass) allPass = false
  console.log(`  ${pass ? '✅' : '❌'} ${r.endpoint} — p95 ${r.p95}ms (budget ${budget.p95}ms)`)
}

console.log(allPass ? '\n✅ All endpoints within budget.\n' : '\n❌ Some endpoints exceeded budget.\n')
process.exit(allPass ? 0 : 1)
