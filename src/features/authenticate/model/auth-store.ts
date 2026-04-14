import { create } from 'zustand'
import { registerRefreshFailureHandler, setAccessToken } from '@/shared/api/axios-instance'
import type { User, UserRole } from '@/entities/user'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  role: UserRole | null
  setUser: (user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  role: null,

  setUser: (user) => set({ user, isAuthenticated: true, role: user.role }),
  clearAuth: () => set({ user: null, isAuthenticated: false, role: null }),
}))

// Register the refresh failure handler so axios-instance can clear auth
// without importing from this feature (FSD boundary compliance).
registerRefreshFailureHandler(() => {
  setAccessToken(null)
  useAuthStore.getState().clearAuth()
  window.location.href = '/login'
})
