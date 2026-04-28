import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const CategoriesPage = lazy(() => import('@/pages/admin/categories-page').then((m) => ({ default: m.CategoriesPage })))

export const Route = createFileRoute('/admin/categories')({
  component: CategoriesPage,
})
