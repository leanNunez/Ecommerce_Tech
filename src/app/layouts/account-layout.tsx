import { Outlet, Link } from '@tanstack/react-router'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { useOrderStatusSync } from '@/entities/order'

const NAV_LINKS = [
  { to: '/account/profile', label: 'Profile' },
  { to: '/account/addresses', label: 'Addresses' },
  { to: '/account/password', label: 'Password' },
  { to: '/account/orders', label: 'Orders' },
  { to: '/account/wishlist', label: 'Wishlist' },
  { to: '/account/notifications', label: 'Notifications' },
] as const

export function AccountLayout() {
  useOrderStatusSync()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-6 py-8">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-secondary hover:bg-background hover:text-text [&.active]:bg-background [&.active]:text-primary"
                activeProps={{ className: 'active' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="w-full md:hidden">
          <nav className="mb-14 flex gap-2 overflow-x-auto pb-2 border-b border-secondary/15">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="shrink-0 rounded-full border border-secondary/30 px-4 py-1.5 text-sm [&.active]:border-primary [&.active]:text-primary"
                activeProps={{ className: 'active' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>

        <main className="hidden flex-1 min-w-0 md:block">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  )
}
