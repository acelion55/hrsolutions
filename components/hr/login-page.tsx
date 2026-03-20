"use client"

import { useState } from "react"
import { Ticket, Eye, EyeOff, LogIn } from "lucide-react"
import { useAuth } from "./auth-context"

const MAIN_USERS = [
  { id: "u1", username: "alice.johnson", password: "alice123" },
  { id: "u2", username: "bob.martinez",  password: "bob123"   },
  { id: "u3", username: "carol.white",   password: "carol123" },
  { id: "u4", username: "david.lee",     password: "david123" },
  { id: "u5", username: "eva.chen",      password: "eva123"   },
  { id: "u6", username: "frank.admin",   password: "frank123" },
]

export function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    setTimeout(() => {
      const trimUser = username.trim().toLowerCase()
      const match = MAIN_USERS.find((u) => u.username === trimUser)
      if (!match) { setError("Username not found."); setLoading(false); return }
      if (password !== match.password) { setError("Incorrect password."); setLoading(false); return }
      login(match.id)
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg mb-3">
            <Ticket className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">HR Ticket System</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Username</label>
              <input
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError("") }}
                placeholder="e.g. alice.johnson"
                autoComplete="username"
                required
                className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:bg-white transition-colors"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-white text-sm font-bold transition-colors shadow-sm"
            >
              {loading
                ? <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <LogIn className="h-4 w-4" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
