import { createFileRoute, redirect } from '@tanstack/react-router'
import { CheckoutLayout } from '@/app/layouts/checkout-layout'
import { useAuthStore } from '@/features/authenticate'
import { RouteErrorFallback } from '@/shared/ui'

export const Route = createFileRoute('/checkout')({
  errorComponent: RouteErrorFallback,
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/login', search: { returnUrl: location.href } })
    }
  },
  component: CheckoutLayout,
})
