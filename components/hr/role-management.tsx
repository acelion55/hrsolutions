"use client"

import { useState } from "react"
import { Shield, ChevronDown } from "lucide-react"
import type { User, Role } from "@/lib/types"
import { MOCK_USERS, addAuditLog } from "@/lib/data"
import { ROLE_HIERARCHY } from "@/lib/permissions"
import { useAuth } from "./auth-context"
import { cn } from "@/lib/utils"

const ROLE_COLORS: Record<Role, string> = {
  EMPLOYEE:       "bg-yellow-50 text-yellow-800 border-yellow-300",
  HR_COORDINATOR: "bg-blue-50 text-blue-700 border-blue-200",
  HR_SPECIALIST:  "bg-purple-50 text-purple-700 border-purple-200",
  HR_MANAGER:     "bg-green-50 text-green-700 border-green-200",
  SYSTEM_ADMIN:   "bg-orange-50 text-orange-700 border-orange-200",
}

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  EMPLOYEE:       "Can only see/edit their own tickets",
  HR_COORDINATOR: "First responder — view & assign tickets",
  HR_SPECIALIST:  "Case owner — full access to assigned tickets",
  HR_MANAGER:     "Overseer — view all tickets, analytics, delete",
  SYSTEM_ADMIN:   "Technical lead — roles, configs, audit logs",
}

export function RoleManagement() {
  const { currentUser } = useAuth()
  const user = currentUser!
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [editingId, setEditingId] = useState<string | null>(null)
  if (!currentUser) return null

  function handleRoleChange(userId: string, newRole: Role) {
    const user = users.find((u) => u.id === userId)
    if (!user) return
    const updated = users.map((u) => u.id === userId ? { ...u, role: newRole } : u)
    setUsers(updated)
    addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      actionType: "ROLE_CHANGED",
      ticketId: null,
      ticketTitle: null,
      oldValue: user.role,
      newValue: newRole,
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.100",
    })
    setEditingId(null)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-gray-900">Role Management</h2>
      </div>

      {/* Role hierarchy legend */}
      <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-4 space-y-2">
        <p className="text-xs font-medium text-gray-500 mb-3">Role Hierarchy (lowest → highest)</p>
        <div className="flex flex-wrap gap-2">
          {ROLE_HIERARCHY.map((role, i) => (
            <div key={role} className="flex items-center gap-1.5">
              <span className={cn("text-xs px-2.5 py-1 rounded-lg border font-medium", ROLE_COLORS[role])}>
                {role.replace("_", " ")}
              </span>
              {i < ROLE_HIERARCHY.length - 1 && (
                <span className="text-gray-400 text-xs">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User list */}
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-yellow-200 hover:border-yellow-300 hover:shadow-sm transition-all"
          >
            <div className="h-9 w-9 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email} · {user.department}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400 hidden sm:block max-w-[160px] truncate">
                {ROLE_DESCRIPTIONS[user.role]}
              </p>
              {editingId === user.id ? (
                <select
                  autoFocus
                  defaultValue={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                  onBlur={() => setEditingId(null)}
                  className="rounded-lg bg-white border border-yellow-300 text-gray-800 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {ROLE_HIERARCHY.map((r) => (
                    <option key={r} value={r}>{r.replace("_", " ")}</option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={() => setEditingId(user.id)}
                  className={cn(
                    "flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors hover:opacity-80",
                    ROLE_COLORS[user.role]
                  )}
                >
                  {user.role.replace("_", " ")}
                  <ChevronDown className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
