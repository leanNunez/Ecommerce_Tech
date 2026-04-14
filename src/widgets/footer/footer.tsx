import { Link } from '@tanstack/react-router'

const LINK_GROUPS = [
  {
    title: 'Company',
    links: [
      { label: 'About us', to: '/' },
      { label: 'Careers', to: '/' },
      { label: 'Press', to: '/' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help center', to: '/' },
      { label: 'Contact us', to: '/' },
      { label: 'Returns', to: '/' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', to: '/' },
      { label: 'Terms of service', to: '/' },
      { label: 'Cookie policy', to: '/' },
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="bg-primary text-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-xl font-bold text-white">
              Ecommerce
            </Link>
            <p className="mt-3 text-sm text-white/70">
              Premium tech, delivered fast.
            </p>
          </div>

          {/* Link groups */}
          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/50">
          © {new Date().getFullYear()} Ecommerce. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
