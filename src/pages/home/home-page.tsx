import { useRef } from 'react'
import { useInView } from '@/shared/hooks/use-in-view'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Headphones,
  Laptop,
  Monitor,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Tablet,
  Truck,
  Zap,
} from 'lucide-react'
import { Button } from '@/shared/ui'
import { useBrands } from '@/entities/brand'
import { useProducts } from '@/entities/product'
import { CategoryShelf } from '@/widgets/category-shelf'
import { formatCurrency } from '@/shared/lib/format-currency'

// ─── Static config (no data dependency) ──────────────────────────────────────

const CATEGORY_SHELVES = [
  {
    slug: 'laptops',
    label: 'Laptops',
    Icon: Laptop,
    promo: {
      headline: 'Llevá la PC de tus sueños al mejor precio',
      body: 'MacBooks, Dell XPS, Surface y más. Financiación sin interés y envío gratis en todos los modelos.',
      cta: 'Ver laptops',
      gradient: 'from-slate-900 via-blue-950 to-slate-900',
      accentColor: 'bg-blue-500 hover:bg-blue-600',
    },
  },
  {
    slug: 'smartphones',
    label: 'Smartphones',
    Icon: Smartphone,
    promo: {
      headline: 'El smartphone que siempre quisiste, ahora al alcance',
      body: 'iPhone, Galaxy, Pixel y más. Hasta 36 cuotas sin interés con tarjeta seleccionada.',
      cta: 'Ver smartphones',
      gradient: 'from-purple-950 via-fuchsia-950 to-purple-950',
      accentColor: 'bg-fuchsia-600 hover:bg-fuchsia-700',
    },
  },
  {
    slug: 'headphones',
    label: 'Headphones',
    Icon: Headphones,
    promo: {
      headline: 'Sonido que te envuelve. Escuchá diferente.',
      body: 'Sony, Bose, Apple y Sennheiser. Noise cancelling premium para trabajo y viajes.',
      cta: 'Ver auriculares',
      gradient: 'from-emerald-950 via-teal-950 to-emerald-950',
      accentColor: 'bg-emerald-500 hover:bg-emerald-600',
    },
  },
  {
    slug: 'monitors',
    label: 'Monitors',
    Icon: Monitor,
    promo: {
      headline: 'Tu workspace merece la mejor pantalla',
      body: '4K, ultrawide, gaming y profesional. Productividad y entretenimiento en otro nivel.',
      cta: 'Ver monitores',
      gradient: 'from-orange-950 via-amber-950 to-orange-950',
      accentColor: 'bg-orange-500 hover:bg-orange-600',
    },
  },
  {
    slug: 'tablets',
    label: 'Tablets',
    Icon: Tablet,
    promo: {
      headline: 'La potencia de una PC, la portabilidad de un tablet',
      body: 'iPad Pro, Galaxy Tab y Surface Go. Creá, estudiá y trabajá desde cualquier lugar.',
      cta: 'Ver tablets',
      gradient: 'from-rose-950 via-pink-950 to-rose-950',
      accentColor: 'bg-rose-500 hover:bg-rose-600',
    },
  },
  {
    slug: 'components',
    label: 'Components',
    Icon: Cpu,
    promo: {
      headline: 'Armá la PC que siempre soñaste',
      body: 'GPUs, CPUs, RAM y motherboards de las mejores marcas. Tu configuración ideal a un clic.',
      cta: 'Ver componentes',
      gradient: 'from-cyan-950 via-sky-950 to-cyan-950',
      accentColor: 'bg-cyan-500 hover:bg-cyan-600',
    },
  },
] as const

const STATS_KEYS = [
  { valueKey: 'home.stats.productsValue', labelKey: 'home.stats.productsLabel' },
  { valueKey: 'home.stats.brandsValue',   labelKey: 'home.stats.brandsLabel' },
  { valueKey: 'home.stats.satisfactionValue', labelKey: 'home.stats.satisfactionLabel' },
  { valueKey: 'home.stats.supportValue',  labelKey: 'home.stats.supportLabel' },
  { valueKey: 'home.stats.customersValue', labelKey: 'home.stats.customersLabel' },
  { valueKey: 'home.stats.shippingValue', labelKey: 'home.stats.shippingLabel' },
] as const

const CATEGORIES = [
  { label: 'Laptops',     slug: 'laptops',     Icon: Laptop },
  { label: 'Smartphones', slug: 'smartphones', Icon: Smartphone },
  { label: 'Headphones',  slug: 'headphones',  Icon: Headphones },
  { label: 'Monitors',    slug: 'monitors',    Icon: Monitor },
  { label: 'Tablets',     slug: 'tablets',     Icon: Tablet },
  { label: 'Components',  slug: 'components',  Icon: Cpu },
] as const

const VALUE_PROPS = [
  { Icon: Truck,       titleKey: 'home.valueProps.freeShipping',  descKey: 'home.valueProps.freeShippingDesc', iconClass: 'group-hover:animate-truck-start group-active:animate-truck-start' },
  { Icon: ShieldCheck, titleKey: 'home.valueProps.warranty',       descKey: 'home.valueProps.warrantyDesc',     iconClass: 'group-hover:scale-125 group-active:scale-125 transition-transform duration-300' },
  { Icon: RefreshCw,   titleKey: 'home.valueProps.returns',        descKey: 'home.valueProps.returnsDesc',      iconClass: 'group-hover:rotate-180 group-active:rotate-180 transition-transform duration-500' },
]

const MARQUEE_STATS_KEYS = [...STATS_KEYS, ...STATS_KEYS]

// ─── Component ────────────────────────────────────────────────────────────────

export function HomePage() {
  const { t } = useTranslation()
  const brandsScrollRef = useRef<HTMLDivElement>(null)
  const [pillsRef, pillsInView] = useInView()
  const [brandsRef, brandsInView] = useInView()
  const [valueRef, valueInView] = useInView()

  const { data: brandsData } = useBrands()
  const { data: flashData } = useProducts({ perPage: 3, sortBy: 'newest' })

  const brands     = brandsData?.data ?? []
  const flashDeals = flashData?.data ?? []

  function scrollBrands(dir: 'left' | 'right') {
    brandsScrollRef.current?.scrollBy({ left: dir === 'right' ? 480 : -480, behavior: 'smooth' })
  }

  return (
    <div>
      {/* Hero */}
      <section
        className="relative flex flex-col overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-accent"
        style={{ height: 'calc(100svh - 100px)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative mx-auto flex w-full flex-1 max-w-7xl items-center px-6 py-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left: copy */}
            <div>
              <span className="inline-flex animate-fade-up items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 ring-1 ring-white/20">
                {t('home.hero.badge')}
              </span>
              <h1
                className="mt-4 animate-fade-up text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl"
                style={{ animationDelay: '100ms' }}
              >
                {t('home.hero.title1')}
                <br />
                <span className="text-accent">{t('home.hero.title2')}</span>
              </h1>
              <p
                className="mt-5 animate-fade-up max-w-xl text-lg leading-relaxed text-white/65"
                style={{ animationDelay: '200ms' }}
              >
                {t('home.hero.subtitle')}
              </p>
              <div
                className="mt-8 flex animate-fade-up flex-wrap gap-4"
                style={{ animationDelay: '300ms' }}
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-accent font-semibold text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent-dark hover:scale-[1.03]"
                >
                  <Link to="/catalog">
                    {t('home.hero.shopNow')} <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/brands">{t('home.hero.browseBrands')}</Link>
                </Button>
              </div>
            </div>

            {/* Right: Flash Deals panel */}
            <div className="animate-fade-up hidden lg:block" style={{ animationDelay: '250ms' }}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-sm font-bold uppercase tracking-widest text-white/90">
                      {t('home.flashDeals.label')}
                    </span>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">
                      {t('home.flashDeals.badge')}
                    </span>
                  </div>
                  <Link
                    to="/catalog"
                    className="text-xs font-medium text-white/50 underline-offset-2 hover:text-white/80 hover:underline"
                  >
                    {t('home.flashDeals.seeAll')}
                  </Link>
                </div>

                <div className="flex flex-col gap-2">
                  {flashDeals.map((product) => (
                    <Link
                      key={product.slug}
                      to="/product/$productSlug"
                      params={{ productSlug: product.slug }}
                      className="group flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-white/10"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/10">
                        <img
                          src={product.images[0]?.url ?? ''}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white/90 group-hover:text-white">
                          {product.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-lg font-extrabold text-accent">
                            {formatCurrency(Math.round(product.price * 0.6))}
                          </span>
                          <span className="text-xs text-white/40 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-lg bg-amber-400/20 px-2 py-1 text-xs font-bold text-amber-200 ring-1 ring-amber-300/40">
                        −40%
                      </span>
                    </Link>
                  ))}
                </div>

                <Link
                  to="/catalog"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-white/70 transition-all hover:border-white/20 hover:bg-white/5 hover:text-white"
                >
                  {t('home.flashDeals.viewAllDeals')} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Marquee */}
        <div className="mt-auto animate-fade-up border-t border-white/10" style={{ animationDelay: '400ms' }}>
          <div className="relative overflow-hidden py-4">
            <div className="flex w-max animate-marquee items-center gap-12 hover:[animation-play-state:paused]">
              {MARQUEE_STATS_KEYS.map(({ valueKey, labelKey }, i) => (
                <div key={i} className="flex flex-shrink-0 items-center gap-3">
                  <span className="text-lg font-extrabold text-white">{t(valueKey)}</span>
                  <span className="text-xs text-white/50">{t(labelKey)}</span>
                  <span className="ml-3 text-white/15 text-lg">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <section ref={pillsRef} className="border-b border-secondary/15 bg-background">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES.map(({ label, slug, Icon }, i) => (
              <Link
                key={label}
                to="/catalog/$categorySlug"
                params={{ categorySlug: slug }}
                className={`flex shrink-0 items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-sm font-medium text-text shadow-sm ring-1 ring-secondary/20 transition-all duration-200 hover:-translate-y-1 hover:bg-primary hover:text-white hover:shadow-lg hover:ring-primary ${pillsInView ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Shelves */}
      {CATEGORY_SHELVES.map((shelf) => (
        <CategoryShelf key={shelf.slug} {...shelf} />
      ))}

      {/* Featured Brands */}
      <section ref={brandsRef} className="bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className={`mb-8 ${brandsInView ? 'animate-slide-right' : 'opacity-0'}`}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{t('home.brands.trustedPartners')}</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-text lg:text-4xl">
              {t('home.brands.topBrands')}{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('home.brands.topBrandsHighlight')}
              </span>
            </h2>
          </div>

          <div className="relative">
            <button
              onClick={() => scrollBrands('left')}
              aria-label={t('home.brands.scrollLeft')}
              className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-md ring-1 ring-secondary/20 transition-all hover:bg-primary hover:text-white hover:shadow-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div
              ref={brandsScrollRef}
              className="flex gap-3 overflow-x-auto scroll-smooth py-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {brands.map((brand, i) => (
                <Link
                  key={brand.id}
                  to="/brands/$brandSlug"
                  params={{ brandSlug: brand.slug }}
                  className={`group flex w-36 shrink-0 flex-col items-center gap-3 rounded-2xl border border-secondary/15 bg-surface p-5 transition-all duration-200 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg ${brandsInView ? 'animate-fade-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${100 + i * 50}ms` }}
                >
                  {brand.logoUrl && (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="h-10 w-full object-contain transition-all duration-300 group-hover:scale-110"
                    />
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted/70 transition-colors group-hover:text-primary">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>

            <button
              onClick={() => scrollBrands('right')}
              aria-label={t('home.brands.scrollRight')}
              className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-md ring-1 ring-secondary/20 transition-all hover:bg-primary hover:text-white hover:shadow-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section ref={valueRef} className="bg-gradient-to-r from-primary-dark via-primary to-accent">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {VALUE_PROPS.map(({ Icon, titleKey, descKey, iconClass }, i) => (
              <div
                key={titleKey}
                className={`group flex items-center gap-4 ${valueInView ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Icon className={`h-6 w-6 text-accent ${iconClass}`} />
                </div>
                <div>
                  <p className="font-semibold text-white">{t(titleKey)}</p>
                  <p className="text-sm text-white/55">{t(descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
