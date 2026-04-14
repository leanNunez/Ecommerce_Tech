import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Bell, Heart, LayoutDashboard, LogOut, MapPin, Menu, Package, ShoppingCart, User } from 'lucide-react'
import {
  Avatar, AvatarFallback,
  Button,
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/shared/ui'
import { SearchBar } from '@/features/search-products'
import { useAuthStore } from '@/features/authenticate'
import { LogoutButton, useLogout } from '@/features/logout'
import { useCartStore } from '@/entities/cart'
import { useAddresses } from '@/entities/address'

function LogoutDesktopButton() {
  const { mutate: logout, isPending } = useLogout()
  return (
    <button
      type="button"
      onClick={() => logout()}
      disabled={isPending}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sign out
    </button>
  )
}

export function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const cartCount = useCartStore((s) => s.cartCount)
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdmin = role === 'admin'
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : ''
  const firstName = user?.firstName ?? ''

  const { data: addresses = [] } = useAddresses({ enabled: isAuthenticated })
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0]
  const deliveryLabel = defaultAddress
    ? `${defaultAddress.city}, ${defaultAddress.zipCode}`
    : 'ZIP code'

  return (
    <header className="sticky top-0 z-40">

      {/* ── Row 1: Logo / Search / User ── */}
      <div className="bg-primary">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6">

          {/* Logo */}
          <Link to="/" className="shrink-0 text-xl font-extrabold tracking-tight text-white">
            Premium<span className="text-accent">Tech</span>
          </Link>

          {/* Search bar */}
          <div className="hidden flex-1 md:block">
            <SearchBar />
          </div>

          {/* User section */}
          <div className="hidden shrink-0 md:block">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to={isAdmin ? '/admin/dashboard' : '/account/profile'} className="group flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-accent text-xs text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left leading-tight">
                    <p className="text-xs text-white/50">{isAdmin ? 'Admin' : 'Hello,'}</p>
                    <p className="text-sm font-semibold text-white group-hover:text-accent">
                      {firstName}
                    </p>
                  </div>
                </Link>
                <LogoutDesktopButton />
              </div>
            ) : (
              <div className="text-right leading-tight">
                <Link to="/login" className="block text-xs text-white/60 hover:text-white">
                  Sign in
                </Link>
                <Link to="/register" className="block text-sm font-semibold text-white hover:text-accent">
                  Create account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: hamburger */}
          <div className="ml-auto md:hidden">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>
                    Premium<span className="text-accent">Tech</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  <div className="mb-3">
                    <SearchBar onSearch={() => setMenuOpen(false)} />
                  </div>

                  <Link
                    to={isAuthenticated ? '/account/addresses' : '/login'}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-secondary hover:bg-background"
                  >
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{defaultAddress ? `Envíos a ${deliveryLabel}` : 'Send to ZIP code'}</span>
                  </Link>

                  <Link to="/catalog" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-background">
                    Categories
                  </Link>
                  <Link to="/catalog" search={{ sortBy: 'price_asc' }} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-background">
                    Offers
                  </Link>

                  <div className="mt-3 border-t border-secondary/20 pt-3">
                    {isAuthenticated ? (
                      <>
                        {isAdmin ? (
                          <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-accent hover:bg-background">
                            <LayoutDashboard className="h-4 w-4" /> Admin Panel
                          </Link>
                        ) : (
                          <>
                            <Link to="/account/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-background">
                              <User className="h-4 w-4" /> My Profile
                            </Link>
                            <Link to="/account/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-background">
                              <Package className="h-4 w-4" /> My Orders
                            </Link>
                            <Link to="/account/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-background">
                              <Heart className="h-4 w-4" /> Favorites
                            </Link>
                            <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-background">
                              <ShoppingCart className="h-4 w-4" />
                              Cart {cartCount > 0 && <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 text-xs font-bold text-white">{cartCount}</span>}
                            </Link>
                          </>
                        )}
                        <div className="px-3 pt-2">
                          <LogoutButton />
                        </div>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm font-semibold text-primary">
                          Sign in
                        </Link>
                        <Link to="/register" onClick={() => setMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-background">
                          Create account
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* ── Row 2: Location / Nav / Quick links ── */}
      <div className="hidden border-t border-white/10 bg-primary/90 backdrop-blur-sm md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center gap-0.5 px-4 md:px-6">

          {!isAdmin && (
            <>
              <Link
                to={isAuthenticated ? '/account/addresses' : '/login'}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {defaultAddress ? 'Envíos a' : 'Send to'}{' '}
                <span className="font-semibold text-white/85">{deliveryLabel}</span>
              </Link>
              <span className="mx-1.5 select-none text-white/15">|</span>
            </>
          )}

          <Link to="/catalog" className="rounded-md px-3 py-1 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white">
            Categories
          </Link>
          <Link to="/catalog" search={{ sortBy: 'price_asc' }} className="rounded-md px-3 py-1 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white">
            Offers
          </Link>

          <div className="flex-1" />

          {isAuthenticated && (
            isAdmin ? (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-accent transition-colors hover:bg-white/10 hover:text-accent/80"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Admin Panel
              </Link>
            ) : (
              <>
                <Link to="/account/profile" className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                  <User className="h-3.5 w-3.5" />
                  My Profile
                </Link>
                <Link to="/account/orders" className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                  <Package className="h-3.5 w-3.5" />
                  My Orders
                </Link>
                <Link to="/account/wishlist" className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                  <Heart className="h-3.5 w-3.5" />
                  Favorites
                </Link>
                <Link to="/account/orders" className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                  <Bell className="h-3.5 w-3.5" />
                  Notifications
                </Link>
              </>
            )
          )}

          {/* Cart — solo para customers */}
          {!isAdmin && (
            <Link
              to="/cart"
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Cart
              {cartCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>

    </header>
  )
}
