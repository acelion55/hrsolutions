"use client"

import { PlusCircle, LayoutDashboard, BarChart2, LogOut, Ticket } from "lucide-react"
import { useAuth } from "./auth-context"
import { cn } from "@/lib/utils"
import type { Role } from "@/lib/types"

const ROLE_BADGE: Record<Role, string> = {
  EMPLOYEE:       "bg-yellow-400",
  HR_COORDINATOR: "bg-blue-500",
  HR_SPECIALIST:  "bg-purple-500",
  HR_MANAGER:     "bg-green-500",
  SYSTEM_ADMIN:   "bg-orange-500",
}

const ROLE_COLORS: Record<Role, string> = {
  EMPLOYEE:       "bg-yellow-50 text-yellow-800 border-yellow-300",
  HR_COORDINATOR: "bg-blue-50 text-blue-700 border-blue-200",
  HR_SPECIALIST:  "bg-purple-50 text-purple-700 border-purple-200",
  HR_MANAGER:     "bg-green-50 text-green-700 border-green-200",
  SYSTEM_ADMIN:   "bg-orange-50 text-orange-700 border-orange-200",
}

interface Props {
  onCreateTask: () => void
  onAdvanced: () => void
  onUsageReport: () => void
}

export function HomeScreen({ onCreateTask, onAdvanced, onUsageReport }: Props) {
  const { currentUser, logout } = useAuth()
  if (!currentUser) return null

  const options = [
    {
      label: "Create Task",
      description: "Raise a new support ticket — fill in details, attach files, and assign to a team member.",
      icon: <PlusCircle className="h-8 w-8" />,
      color: "from-yellow-400 to-yellow-500",
      border: "border-yellow-300 hover:border-yellow-400",
      bg: "hover:bg-yellow-50",
      textColor: "text-yellow-700",
      onClick: onCreateTask,
    },
    {
      label: "Advanced",
      description: "Full ticket management dashboard — view, filter, assign, comment, and manage all tickets.",
      icon: <LayoutDashboard className="h-8 w-8" />,
      color: "from-blue-500 to-indigo-600",
      border: "border-blue-200 hover:border-blue-400",
      bg: "hover:bg-blue-50",
      textColor: "text-blue-700",
      onClick: onAdvanced,
    },
    {
      label: "Usage Report",
      description: "Analytics overview — department-wise ticket summary, charts, and team workload.",
      icon: <BarChart2 className="h-8 w-8" />,
      color: "from-green-500 to-emerald-600",
      border: "border-green-200 hover:border-green-400",
      bg: "hover:bg-green-50",
      textColor: "text-green-700",
      onClick: onUsageReport,
    },
  ]

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-yellow-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-sm">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">HR Ticket System</p>
            <p className="text-xs text-gray-400">Management Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white", ROLE_BADGE[currentUser.role])}>
              {currentUser.avatar}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
              <span className={cn("text-xs px-1.5 py-0.5 rounded-md border font-medium", ROLE_COLORS[currentUser.role])}>
                {currentUser.role.replace(/_/g, " ")}
              </span>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 overflow-y-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {currentUser.name.split(" ")[0]}!</h1>
          <p className="text-gray-500 text-sm">What would you like to do today?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
          {options.map((opt) => (
            <button key={opt.label} onClick={opt.onClick}
              className={cn("group flex flex-col items-center text-center p-8 bg-white rounded-2xl border-2 shadow-sm transition-all duration-200 hover:shadow-md", opt.border, opt.bg)}>
              <div className={cn("h-16 w-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform", opt.color)}>
                {opt.icon}
              </div>
              <h2 className={cn("text-lg font-bold mb-2", opt.textColor)}>{opt.label}</h2>
              <p className="text-xs text-gray-500 leading-relaxed">{opt.description}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
