"use client"

import { useState } from "react"
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react"
import { useAuth } from "./auth-context"
import { MOCK_USERS } from "@/lib/data"
import { cn } from "@/lib/utils"

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    setTimeout(() => {
      const success = login(email, password)
      if (!success) setError("Invalid email or password.")
      setLoading(false)
    }, 500)
  }

  function quickLogin(userEmail: string) {
    login(userEmail, "password")
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-600 mb-4">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">HR Ticket Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 pr-10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Quick login for demo */}
        <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-3 text-center">Demo accounts (any password works)</p>
          <div className="space-y-1.5">
            {MOCK_USERS.filter((u) => ["EMPLOYEE", "HR_COORDINATOR", "HR_SPECIALIST", "HR_MANAGER", "SYSTEM_ADMIN"].includes(u.role))
              .filter((u, idx, arr) => arr.findIndex((x) => x.role === u.role) === idx)
              .map((u) => (
              <button
                key={u.id}
                onClick={() => quickLogin(u.email)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                    {u.avatar}
                  </div>
                  <div>
                    <p className="text-xs text-gray-300 font-medium">{u.name}</p>
                    <p className="text-xs text-gray-600">{u.email}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-md border",
                  u.role === "SYSTEM_ADMIN" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                  u.role === "HR_MANAGER" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                  u.role === "HR_SPECIALIST" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  u.role === "HR_COORDINATOR" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" :
                  "bg-gray-500/10 text-gray-400 border-gray-500/20"
                )}>
                  {u.role.replace(/_/g, " ")}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
