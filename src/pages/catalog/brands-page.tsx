import { Link } from '@tanstack/react-router'
import { ArrowRight, Package } from 'lucide-react'
import { useBrands } from '@/entities/brand'
import type { Brand } from '@/entities/brand'

function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link
      to="/brands/$brandSlug"
      params={{ brandSlug: brand.slug }}
      className="group overflow-hidden rounded-2xl bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
    >
      <div
        className="relative flex h-40 items-center justify-center"
        style={{ backgroundColor: brand.bgColor }}
      >
        {brand.logoUrl ? (
          <img src={brand.logoUrl} alt={brand.name} className="h-16 w-44 object-contain" />
        ) : (
          <span className="text-4xl font-bold text-white">{brand.name}</span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-text">{brand.name}</h3>
            <p className="mt-0.5 text-sm text-muted">{brand.tagline}</p>
          </div>
          <ArrowRight className="mt-1 h-5 w-5 flex-shrink-0 text-muted transition-all group-hover:translate-x-1 group-hover:text-primary" />
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-muted">
          <Package className="h-3.5 w-3.5" />
          {brand.productCount === 0
            ? 'Coming soon'
            : `${brand.productCount} product${brand.productCount > 1 ? 's' : ''}`}
        </div>
      </div>
    </Link>
  )
}

export function BrandsPage() {
  const { data, isLoading } = useBrands()
  const brands = data?.data ?? []

  return (
    <div>
      <section className="relative overflow-hidden bg-primary py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">500+ Brands</p>
          <h1 className="mt-2 text-4xl font-extrabold text-white md:text-5xl">Browse Brands</h1>
          <p className="mt-3 max-w-xl text-lg text-white/60">
            Shop from the world's leading tech manufacturers. Every brand, every product, one place.
          </p>
        </div>
      </section>

      <section className="bg-background py-14">
        <div className="mx-auto max-w-7xl px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-surface/60" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
