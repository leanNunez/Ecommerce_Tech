import { useEffect } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { RegisterForm } from '@/features/authenticate'
import { useAuthStore } from '@/features/authenticate'

export function RegisterPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { returnUrl?: string }
  const returnUrl = search.returnUrl ?? '/'

  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: returnUrl })
    }
  }, [isAuthenticated, navigate, returnUrl])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">Create your account</h1>
        <p className="mt-1 text-sm text-secondary">Join thousands of tech enthusiasts today.</p>
      </div>

      <RegisterForm onSuccess={() => void navigate({ to: returnUrl })} />

      <p className="mt-6 text-center text-sm text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
