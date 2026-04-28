import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const ProductsListPage = lazy(() => import('@/pages/admin/products-list-page').then((m) => ({ default: m.ProductsListPage })))

export const Route = createFileRoute('/admin/products/')({
  component: ProductsListPage,
})
