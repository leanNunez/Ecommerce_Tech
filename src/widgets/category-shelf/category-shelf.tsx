import { useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react'
import { Button } from '@/shared/ui'
import { ProductCard } from '@/widgets/product-card'
import { useInView } from '@/shared/hooks/use-in-view'
import { useProducts } from '@/entities/product'

interface PromoBanner {
  headline: string
  body: string
  cta: string
  gradient: string
  accentColor: string
}

interface CategoryShelfProps {
  slug: string
  label: string
  Icon: LucideIcon
  promo: PromoBanner
}

const CARD_WIDTH = 220

export function CategoryShelf({ slug, label, Icon, promo }: CategoryShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [sectionRef, inView] = useInView()

  const { data, isLoading } = useProducts({ category: slug, perPage: 8 })
  const products = data?.data ?? []

  function scroll(direction: 'left' | 'right') {
    scrollRef.current?.scrollBy({
      left: direction === 'right' ? CARD_WIDTH * 2 : -CARD_WIDTH * 2,
      behavior: 'smooth',
    })
  }

  if (!isLoading && products.length === 0) return null

  return (
    <section ref={sectionRef} className="bg-background border-b border-secondary/10">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Section header */}
        <div
          className={`mb-6 flex items-center justify-between ${inView ? 'animate-slide-right' : 'opacity-0'}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text">{label}</h2>
          </div>
          <Link
            to="/catalog/$categorySlug"
            params={{ categorySlug: slug }}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver todos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Promo banner */}
        <div
          className={`mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r ${promo.gradient} p-6 md:p-8 ${inView ? 'animate-fade-up' : 'opacity-0'}`}
          style={{ animationDelay: '100ms' }}
        >
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 right-32 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-lg">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/50">
                Oferta destacada · {label}
              </p>
              <h3 className="mt-1 text-xl font-extrabold leading-snug text-white md:text-2xl">
                {promo.headline}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{promo.body}</p>
            </div>
            <Button
              asChild
              className={`shrink-0 ${promo.accentColor} font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:scale-[1.03]`}
            >
              <Link to="/catalog/$categorySlug" params={{ categorySlug: slug }}>
                {promo.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Scrollable product row */}
        <div
          className={`relative ${inView ? 'animate-fade-up' : 'opacity-0'}`}
          style={{ animationDelay: '200ms' }}
        >
          {isLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-52 shrink-0 rounded-xl bg-surface/60 animate-pulse" style={{ height: 280 }} />
              ))}
            </div>
          ) : (
            <>
              <button
                onClick={() => scroll('left')}
                aria-label="Scroll izquierda"
                className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-md ring-1 ring-secondary/20 transition-all hover:bg-primary hover:text-white hover:shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none' }}
              >
                {products.map((product) => (
                  <div key={product.id} className="w-52 shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              <button
                onClick={() => scroll('right')}
                aria-label="Scroll derecha"
                className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-md ring-1 ring-secondary/20 transition-all hover:bg-primary hover:text-white hover:shadow-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
