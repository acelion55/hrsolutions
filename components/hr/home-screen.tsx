"use client"

import { PlusCircle, LayoutDashboard, BarChart2, LogOut, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "./auth-context"
import type { Role } from "@/lib/types"

const ROLE_COLORS: Record<Role, string> = {
  EMPLOYEE:       "bg-gray-500/20 text-gray-300 border-gray-500/30",
  HR_COORDINATOR: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  HR_SPECIALIST:  "bg-purple-500/20 text-purple-300 border-purple-500/30",
  HR_MANAGER:     "bg-green-500/20 text-green-300 border-green-500/30",
  SYSTEM_ADMIN:   "bg-orange-500/20 text-orange-300 border-orange-500/30",
}

const ROLE_BADGE_SOLID: Record<Role, string> = {
  EMPLOYEE:       "bg-gray-600",
  HR_COORDINATOR: "bg-blue-600",
  HR_SPECIALIST:  "bg-purple-600",
  HR_MANAGER:     "bg-green-600",
  SYSTEM_ADMIN:   "bg-orange-600",
}

interface Props {
  onCreateTask: () => void
  onAdvanced: () => void
  onUsageReport: () => void
}

export function HomeScreen({ onCreateTask, onAdvanced, onUsageReport }: Props) {
  const { currentUser, logout } = useAuth()
  if (!currentUser) return null

  const cards = [
    {
      icon: <PlusCircle className="h-10 w-10" />,
      label: "Create Task",
      description: "Raise a new ticket — report a bug or submit a service request",
      color: "from-blue-600 to-indigo-600",
      border: "border-blue-500/30 hover:border-blue-400/60",
      glow: "hover:shadow-blue-500/20",
      onClick: onCreateTask,
    },
    {
      icon: <LayoutDashboard className="h-10 w-10" />,
      label: "Advanced",
      description: "Manage tickets, assign tasks, view audit logs and role settings",
      color: "from-purple-600 to-violet-600",
      border: "border-purple-500/30 hover:border-purple-400/60",
      glow: "hover:shadow-purple-500/20",
      onClick: onAdvanced,
    },
    {
      icon: <BarChart2 className="h-10 w-10" />,
      label: "Usage Report",
      description: "Department-wise analytics, ticket trends and resolution stats",
      color: "from-emerald-600 to-teal-600",
      border: "border-emerald-500/30 hover:border-emerald-400/60",
      glow: "hover:shadow-emerald-500/20",
      onClick: onUsageReport,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">HR Ticket Portal</p>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white", ROLE_BADGE_SOLID[currentUser.role])}>
              {currentUser.avatar}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-gray-300">{currentUser.name}</p>
              <span className={cn("text-xs px-1.5 py-0.5 rounded border", ROLE_COLORS[currentUser.role])}>
                {currentUser.role.replace(/_/g, " ")}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 border border-gray-700 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {currentUser.name.split(" ")[0]} 👋</h1>
          <p className="text-gray-500 text-sm">What would you like to do today?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
          {cards.map((card) => (
            <button
              key={card.label}
              onClick={card.onClick}
              className={cn(
                "group relative flex flex-col items-center text-center p-8 rounded-2xl border bg-gray-900 transition-all duration-200 hover:shadow-xl hover:-translate-y-1",
                card.border, card.glow
              )}
            >
              <div className={cn("h-20 w-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-5 shadow-lg", card.color)}>
                {card.icon}
              </div>
              <h2 className="text-lg font-bold text-white mb-2">{card.label}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
