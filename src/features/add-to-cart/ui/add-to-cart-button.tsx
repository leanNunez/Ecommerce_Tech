import { useState } from 'react'
import { Button } from '@/shared/ui'
import { useCartStore } from '@/entities/cart'
import { useAuthStore } from '@/features/authenticate'
import type { Product } from '@/entities/product'

interface AddToCartButtonProps {
  product: Product
  variantId?: string
  quantity?: number
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function AddToCartButton({ product, variantId, quantity = 1, className, size }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem)
  const role = useAuthStore((s) => s.role)
  const [added, setAdded] = useState(false)

  if (role === 'admin') return null

  if (product.stock === 0) {
    return (
      <Button disabled variant="secondary" size={size}>
        Out of stock
      </Button>
    )
  }

  function handleClick() {
    addItem({
      productId: product.id,
      variantId,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.images[0]?.url ?? '',
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1000)
  }

  return (
    <Button onClick={handleClick} className={className} size={size}>
      {added ? 'Added!' : 'Add to cart'}
    </Button>
  )
}
