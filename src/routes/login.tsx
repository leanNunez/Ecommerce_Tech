import { createFileRoute, redirect } from '@tanstack/react-router'
import { lazy } from 'react'
import { useAuthStore } from '@/features/authenticate'

const LoginPage = lazy(() => import('@/pages/auth/login-page').then((m) => ({ default: m.LoginPage })))

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) throw redirect({ to: '/' })
  },
  component: LoginPage,
})
