import { Link } from '@tanstack/react-router'
import { Button, EmptyState, PageTitle } from '@/shared/ui'
import { formatCurrency } from '@/shared/lib/format-currency'
import { OrderSummary } from '@/widgets/order-summary'
import { useCartStore } from '@/entities/cart'
import { Minus, Plus, Trash2 } from 'lucide-react'

export function CartPage() {
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <EmptyState
          message="Your cart is empty"
          description="Looks like you haven't added anything yet."
          action={
            <Button asChild>
              <Link to="/catalog">Browse products</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageTitle className="mb-8">Your Cart</PageTitle>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <ul className="flex flex-col divide-y divide-secondary/10">
            {items.map((item) => (
              <li key={`${item.productId}-${item.variantId ?? ''}`} className="flex gap-4 py-5">
                <img
                  src={item.imageUrl || 'https://placehold.co/80x80/F9FAFB/6B7280?text=...'}
                  alt={item.name}
                  className="h-20 w-20 rounded-lg object-cover bg-background shrink-0"
                />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-text">{item.name}</p>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-secondary hover:text-destructive transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity selector */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          if (item.quantity === 1) {
                            removeItem(item.productId, item.variantId)
                          } else {
                            updateQuantity(item.productId, item.quantity - 1, item.variantId)
                          }
                        }}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-4">
          <OrderSummary items={items} />
          <Button asChild size="lg" className="w-full">
            <Link to="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
