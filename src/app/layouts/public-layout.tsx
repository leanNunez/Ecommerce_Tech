import { Outlet } from '@tanstack/react-router'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
