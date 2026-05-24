import { RouterProvider } from '@tanstack/react-router'
import { HelmetProvider } from 'react-helmet-async'
import { QueryProvider } from '@/app/providers/query-provider'
import { router } from '@/app/router'
import { ErrorBoundary } from '@/shared/ui'

export function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryProvider>
          <RouterProvider router={router} />
        </QueryProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}
