import { Link } from '@tanstack/react-router'
import { formatCurrency } from '@/shared/lib/format-currency'
import { AddToCartButton } from '@/features/add-to-cart'
import { WishlistToggleButton } from '@/features/add-to-wishlist'
import { useBrands } from '@/entities/brand'
import type { Product } from '@/entities/product'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { data } = useBrands()
  const brands = data?.data ?? []
  const image = product.images[0]
  const brandName = brands.find((b) => b.id === product.brandId)?.name ?? ''
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null
  const isLowStock = product.stock > 0 && product.stock <= 5

  return (
    <article className="group relative flex h-full flex-col rounded-xl bg-surface overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Badges */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
        {discount && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            -{discount}%
          </span>
        )}
        {isLowStock && (
          <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            Low Stock
          </span>
        )}
      </div>

      {/* Wishlist */}
      <div className="absolute right-1.5 top-1.5 z-10">
        <WishlistToggleButton productId={product.id} />
      </div>

      {/* Image */}
      <Link to="/product/$productSlug" params={{ productSlug: product.slug }}>
        <div className="aspect-[4/3] overflow-hidden bg-background">
          {image ? (
            <img
              src={image.url}
              alt={image.altText ?? product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
              <span className="text-4xl opacity-30">📦</span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          {brandName && (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{brandName}</p>
          )}
          <Link
            to="/product/$productSlug"
            params={{ productSlug: product.slug }}
            className="mt-0.5 line-clamp-2 text-xs font-semibold text-text transition-colors hover:text-primary"
          >
            {product.name}
          </Link>
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-primary">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
          <AddToCartButton product={product} className="w-full" size="sm" />
        </div>
      </div>
    </article>
  )
}
