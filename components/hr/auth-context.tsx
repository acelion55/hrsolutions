"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { User } from "@/lib/types"
import { MOCK_USERS } from "@/lib/data"

interface AuthContextValue {
  currentUser: User
  setCurrentUser: (user: User) => void
  allUsers: User[]
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0])

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, allUsers: MOCK_USERS }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
