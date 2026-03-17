"use client"

import { useMemo } from "react"
import { TrendingUp, Ticket, Clock, CheckCircle2, AlertTriangle, Users } from "lucide-react"
import type { Ticket as TicketType } from "@/lib/types"
import { filterTicketsForUser } from "@/lib/permissions"
import { useAuth } from "./auth-context"
import { MOCK_USERS } from "@/lib/data"

interface Props {
  tickets: TicketType[]
}

export function Analytics({ tickets }: Props) {
  const { currentUser } = useAuth()
  const visible = filterTicketsForUser(currentUser, tickets).filter((t) => !t.deletedAt)

  const stats = useMemo(() => {
    const byStatus = visible.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byCategory = visible.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byPriority = visible.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)

    const unassigned = visible.filter((t) => !t.assigneeId).length
    const critical = visible.filter((t) => t.priority === "CRITICAL").length
    const resolved = visible.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length
    const resolutionRate = visible.length > 0 ? Math.round((resolved / visible.length) * 100) : 0

    return { byStatus, byCategory, byPriority, unassigned, critical, resolutionRate, total: visible.length }
  }, [visible])

  const topCategories = Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const maxCategoryCount = topCategories[0]?.[1] ?? 1

  const STATUS_COLORS: Record<string, string> = {
    OPEN: "bg-blue-500",
    IN_PROGRESS: "bg-amber-500",
    PENDING: "bg-purple-500",
    RESOLVED: "bg-green-500",
    CLOSED: "bg-gray-500",
  }

  const PRIORITY_COLORS: Record<string, string> = {
    LOW: "bg-gray-500",
    MEDIUM: "bg-blue-500",
    HIGH: "bg-orange-500",
    CRITICAL: "bg-red-500",
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-5 w-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Analytics Overview</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Tickets", value: stats.total, icon: <Ticket className="h-4 w-4" />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Unassigned", value: stats.unassigned, icon: <Clock className="h-4 w-4" />, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          { label: "Critical", value: stats.critical, icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
          { label: "Resolution Rate", value: `${stats.resolutionRate}%`, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-4 ${bg}`}>
            <div className={`flex items-center gap-1.5 mb-2 ${color}`}>
              {icon}
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By Status */}
        <div className="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Tickets by Status</h3>
          <div className="space-y-2">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-24 shrink-0">{status.replace("_", " ")}</span>
                <div className="flex-1 bg-gray-700/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${STATUS_COLORS[status] ?? "bg-gray-500"}`}
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Priority */}
        <div className="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Tickets by Priority</h3>
          <div className="space-y-2">
            {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => {
              const count = stats.byPriority[p] ?? 0
              return (
                <div key={p} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-16 shrink-0">{p}</span>
                  <div className="flex-1 bg-gray-700/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${PRIORITY_COLORS[p]}`}
                      style={{ width: stats.total > 0 ? `${(count / stats.total) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* By Category */}
        <div className="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Top Categories</h3>
          <div className="space-y-2">
            {topCategories.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-24 shrink-0">{cat.replace("_", " ")}</span>
                <div className="flex-1 bg-gray-700/50 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HR Team Workload */}
        <div className="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Users className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-300">HR Team Workload</h3>
          </div>
          <div className="space-y-2">
            {MOCK_USERS.filter((u) => ["HR_COORDINATOR", "HR_SPECIALIST", "HR_MANAGER"].includes(u.role)).map((u) => {
              const assigned = visible.filter((t) => t.assigneeId === u.id).length
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {u.avatar}
                  </div>
                  <span className="text-xs text-gray-400 flex-1 truncate">{u.name}</span>
                  <span className="text-xs font-medium text-gray-300 bg-gray-700/50 px-2 py-0.5 rounded-md">
                    {assigned} ticket{assigned !== 1 ? "s" : ""}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
