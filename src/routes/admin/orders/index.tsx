import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const AdminOrdersPage = lazy(() => import('@/pages/admin/admin-orders-page').then((m) => ({ default: m.AdminOrdersPage })))

export const Route = createFileRoute('/admin/orders/')({
  component: AdminOrdersPage,
})
