"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { User } from "@/lib/types"
import { MOCK_USERS } from "@/lib/data"

interface AuthContextValue {
  currentUser: User | null
  isLoggedIn: boolean
  login: (userId: string) => void
  logout: () => void
  setCurrentUser: (user: User) => void
  allUsers: User[]
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  function login(userId: string) {
    const user = MOCK_USERS.find((u) => u.id === userId)
    if (user) setCurrentUser(user)
  }

  function logout() {
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoggedIn: !!currentUser,
      login,
      logout,
      setCurrentUser,
      allUsers: MOCK_USERS,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
