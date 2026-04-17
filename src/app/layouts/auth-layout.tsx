import { Suspense } from 'react'
import { Outlet, Link } from '@tanstack/react-router'
import { RefreshCw, ShieldCheck, Truck } from 'lucide-react'

const PERKS = [
  { Icon: Truck,       title: 'Free shipping',    sub: 'On orders over $99' },
  { Icon: ShieldCheck, title: '2-year warranty',  sub: 'On all products' },
  { Icon: RefreshCw,   title: '30-day returns',   sub: 'No questions asked' },
]

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">

      {/* ── Left panel — brand (desktop only) ── */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-primary p-12 lg:flex">
        {/* Background gradient blobs */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />

        {/* Logo */}
        <Link to="/" className="relative z-10 text-3xl font-extrabold tracking-tight text-white">
          Premium<span className="text-accent">Tech</span>
        </Link>

        {/* Center copy */}
        <div className="relative z-10 flex flex-col gap-10">
          <div>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
              Your premium<br />
              <span className="text-accent">tech destination.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              Top-tier products, unbeatable prices, and a seamless shopping experience built for tech enthusiasts.
            </p>
          </div>

          <ul className="flex flex-col gap-4">
            {PERKS.map(({ Icon, title, sub }) => (
              <li key={title} className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-white/50">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 text-xs text-white/30">
          © {new Date().getFullYear()} PremiumTech. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile-only logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="text-2xl font-extrabold tracking-tight text-primary">
              Premium<span className="text-accent">Tech</span>
            </Link>
          </div>

          <div className="rounded-2xl bg-surface p-8 shadow-sm ring-1 ring-secondary/10">
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>

    </div>
  )
}
