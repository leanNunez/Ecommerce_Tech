import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const UsersPage = lazy(() => import('@/pages/admin/users-page').then((m) => ({ default: m.UsersPage })))

export const Route = createFileRoute('/admin/users')({
  component: UsersPage,
})
