import { create } from "zustand"
import { api } from "./api"

export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string | null
  createdAt: string
  updatedAt: string
}

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth-token")
}

function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return
  if (token) {
    localStorage.setItem("auth-token", token)
  } else {
    localStorage.removeItem("auth-token")
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getStoredToken(),
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const res = await api.post<{ accessToken: string; user: User }>(
      "/auth/login",
      { email, password },
    )
    setStoredToken(res.accessToken)
    set({ token: res.accessToken, user: res.user, isAuthenticated: true })
  },

  register: async (email: string, password: string) => {
    const res = await api.post<{ accessToken: string; user: User }>(
      "/auth/register",
      { email, password },
    )
    setStoredToken(res.accessToken)
    set({ token: res.accessToken, user: res.user, isAuthenticated: true })
  },

  logout: () => {
    setStoredToken(null)
    set({ token: null, user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    const token = getStoredToken()
    if (!token) {
      set({ isLoading: false, isAuthenticated: false })
      return
    }
    try {
      const user = await api.get<User>("/auth/me")
      set({ user, token, isAuthenticated: true, isLoading: false })
    } catch {
      setStoredToken(null)
      set({ token: null, user: null, isAuthenticated: false, isLoading: false })
    }
  },

  updateUser: (updates: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }))
  },
}))
