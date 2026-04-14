import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import type { ProductImage } from '@/entities/product'

interface ProductGalleryProps {
  images: ProductImage[]
  name?: string
  activeVariantImageUrl?: string | null
}

export function ProductGallery({ images, name = '', activeVariantImageUrl }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = images[activeIndex]

  // When a variant with its own image is selected, show it as the main image
  const mainImageUrl = activeVariantImageUrl ?? active?.url
  const mainImageAlt = active?.altText ?? name

  if (!mainImageUrl && images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-background text-secondary/40">
        No images
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="aspect-square overflow-hidden rounded-xl bg-background">
        <img
          src={mainImageUrl}
          alt={mainImageAlt}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                i === activeIndex
                  ? 'border-primary'
                  : 'border-transparent hover:border-secondary/40',
              )}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={img.url}
                alt={img.altText ?? `${name} ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
