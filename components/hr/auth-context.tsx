"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { User } from "@/lib/types"
import { MOCK_USERS } from "@/lib/data"

interface AuthContextValue {
  currentUser: User | null
  isLoggedIn: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  allUsers: User[]
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  function login(email: string, password: string): boolean {
    // Mock: any non-empty password works, match by email
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user || !password.trim()) return false
    setCurrentUser(user)
    return true
  }

  function logout() {
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, isLoggedIn: !!currentUser, login, logout, allUsers: MOCK_USERS }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
