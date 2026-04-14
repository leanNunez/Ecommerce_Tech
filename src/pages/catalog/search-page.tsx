import { useSearch } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { ProductCard } from '@/widgets/product-card'
import { useProducts } from '@/entities/product'

export function SearchPage() {
  const { q } = useSearch({ from: '/search' })
  const query = q?.trim() ?? ''

  const { data, isLoading } = useProducts({
    search: query,
    perPage: 50,
  })

  const results = data?.data ?? []
  const ready   = !isLoading && query.length >= 2

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        {query ? (
          <>
            <p className="text-sm text-muted">
              {ready && results.length === 0
                ? 'No results for'
                : ready
                  ? `${results.length} result${results.length !== 1 ? 's' : ''} for`
                  : 'Searching for'}
            </p>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-text">
              "{query}"
            </h1>
          </>
        ) : (
          <h1 className="text-2xl font-extrabold tracking-tight text-text">Search</h1>
        )}
      </div>

      {!query && (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Search className="h-10 w-10 text-secondary/40" />
          <p className="text-sm text-muted">Type at least 2 characters to search.</p>
        </div>
      )}

      {ready && results.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Search className="h-10 w-10 text-secondary/40" />
          <p className="text-base font-semibold text-text">No products found</p>
          <p className="text-sm text-muted">Try different keywords or browse the catalog.</p>
        </div>
      )}

      {isLoading && query.length >= 2 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-surface/60" />
          ))}
        </div>
      )}

      {ready && results.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
