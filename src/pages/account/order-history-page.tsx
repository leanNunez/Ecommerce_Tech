import { Link } from '@tanstack/react-router'
import { Package } from 'lucide-react'
import { Button, EmptyState, PageTitle, Spinner } from '@/shared/ui'
import { formatCurrency } from '@/shared/lib/format-currency'
import { formatDate } from '@/shared/lib/format-date'
import { useOrders } from '@/entities/order'
import type { OrderStatus } from '@/entities/order'

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'bg-amber-500/10 text-amber-600' },
  processing: { label: 'Processing', className: 'bg-blue-500/10 text-blue-600' },
  shipped:    { label: 'Shipped',    className: 'bg-indigo-500/10 text-indigo-600' },
  delivered:  { label: 'Delivered',  className: 'bg-emerald-500/10 text-emerald-600' },
  cancelled:  { label: 'Cancelled',  className: 'bg-destructive/10 text-destructive' },
}

export function OrderHistoryPage() {
  const { data: orders = [], isLoading } = useOrders()

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div>
        <PageTitle className="mb-6">My Orders</PageTitle>
        <EmptyState
          message="No orders yet"
          description="Your orders will appear here once you make a purchase."
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
    <div>
      <PageTitle className="mb-6">My Orders</PageTitle>

      <ul className="flex flex-col gap-3">
        {orders.map((order) => {
          const status = STATUS_CONFIG[order.status]
          const itemCount = order.items.reduce((s, i) => s + i.quantity, 0)

          return (
            <li key={order.id} className="rounded-xl border border-secondary/20 bg-surface">
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-text truncate max-w-[160px]">
                      {order.id.slice(0, 8)}…
                    </p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-secondary">
                    {formatDate(order.createdAt)} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <p className="text-sm font-bold text-primary">{formatCurrency(order.total)}</p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/account/orders/$orderId" params={{ orderId: order.id }}>
                      View order
                    </Link>
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
