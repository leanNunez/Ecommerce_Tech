import { RouterProvider } from '@tanstack/react-router'
import { HelmetProvider } from 'react-helmet-async'
import { QueryProvider } from '@/app/providers/query-provider'
import { router } from '@/app/router'

export function App() {
  return (
    <HelmetProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </HelmetProvider>
  )
}
