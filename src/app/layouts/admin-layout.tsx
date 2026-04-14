import { Outlet, Link } from '@tanstack/react-router'
import { useAuthStore } from '@/features/authenticate'
import { LogoutButton } from '@/features/logout'

const NAV_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/users', label: 'Users' },
] as const

export function AdminLayout() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-secondary/20 bg-primary md:flex">
        <div className="px-6 py-5">
          <Link to="/" className="text-lg font-bold text-white">
            Premium<span className="text-accent">Tech</span>
            <span className="ml-1.5 text-xs font-normal text-white/40">Admin</span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white [&.active]:bg-white/10 [&.active]:text-white"
              activeProps={{ className: 'active' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-secondary/20 bg-surface px-6 py-3">
          <span className="text-sm font-medium text-secondary md:hidden">Admin</span>
          <div className="flex items-center gap-3 ml-auto">
            {user && (
              <span className="text-sm text-secondary">
                {user.firstName} {user.lastName}
              </span>
            )}
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
