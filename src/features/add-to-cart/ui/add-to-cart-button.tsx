import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui'
import { useCartStore, cartServerApi } from '@/entities/cart'
import { useAuthStore } from '@/features/authenticate'
import type { Product } from '@/entities/product'

interface AddToCartButtonProps {
  product: Product
  variantId?: string
  quantity?: number
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'outline' | 'secondary'
}

export function AddToCartButton({ product, variantId, quantity = 1, className, size, variant }: AddToCartButtonProps) {
  const { t } = useTranslation()
  const addItem = useCartStore((s) => s.addItem)
  const role = useAuthStore((s) => s.role)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  const [isPending, setIsPending] = useState(false)
  const [added, setAdded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (role === 'admin') return null

  if (product.stock === 0) {
    return (
      <Button disabled variant="secondary" size={size}>
        {t('productCard.outOfStock')}
      </Button>
    )
  }

  async function handleClick() {
    if (!isAuthenticated) {
      void navigate({ to: '/login' })
      return
    }

    const item = {
      productId: product.id,
      variantId,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.images[0]?.url ?? '',
    }
    addItem(item)

    setIsPending(true)
    try {
      const updatedItem = useCartStore.getState().items.find(
        (i) => i.productId === item.productId && i.variantId === item.variantId,
      )
      await cartServerApi.upsertItem(updatedItem ?? item)
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    } catch {
      setFailed(true)
      setTimeout(() => setFailed(false), 2000)
    } finally {
      setIsPending(false)
    }
  }

  function getLabel() {
    if (isPending) return <Loader2 className="h-4 w-4 animate-spin" />
    if (added) return t('productCard.added')
    if (failed) return t('productCard.addFailed')
    return t('productCard.addToCart')
  }

  return (
    <Button
      onClick={() => void handleClick()}
      disabled={isPending}
      className={className}
      size={size}
      variant={variant}
      aria-live="polite"
    >
      {getLabel()}
    </Button>
  )
}
