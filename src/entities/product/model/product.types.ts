export interface ProductImage {
  id: string
  url: string
  altText?: string
}

export interface ProductVariant {
  id: string
  sku: string
  name: string
  price: number
  stock: number
  imageUrl?: string | null
  attributes: Record<string, string>
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  images: ProductImage[]
  variants: ProductVariant[]
  categoryId: string
  brandId: string
  stock: number
  isActive: boolean
  createdAt: string
}

export interface ProductFilters {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  page?: number
  perPage?: number
  sortBy?: 'price_asc' | 'price_desc' | 'newest'
}
