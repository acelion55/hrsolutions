"use client"

import { useState } from "react"
import { Shield, Search, Eye, Edit2, UserCheck, Trash2, Plus, MessageSquare, Lock } from "lucide-react"
import type { AuditLog, ActionType } from "@/lib/types"
import { cn } from "@/lib/utils"

const ACTION_CONFIG: Record<ActionType, { label: string; icon: React.ReactNode; color: string }> = {
  TICKET_CREATED:      { label: "Ticket Created",      icon: <Plus className="h-3 w-3" />,        color: "text-green-400 bg-green-500/10 border-green-500/20" },
  STATUS_CHANGED:      { label: "Status Changed",      icon: <Edit2 className="h-3 w-3" />,        color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  ASSIGNED:            { label: "Assigned",            icon: <UserCheck className="h-3 w-3" />,    color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  COMMENT_ADDED:       { label: "Comment Added",       icon: <MessageSquare className="h-3 w-3" />, color: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
  INTERNAL_NOTE_ADDED: { label: "Internal Note",       icon: <Lock className="h-3 w-3" />,         color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  TICKET_DELETED:      { label: "Ticket Deleted",      icon: <Trash2 className="h-3 w-3" />,       color: "text-red-400 bg-red-500/10 border-red-500/20" },
  TICKET_VIEWED:       { label: "Ticket Viewed",       icon: <Eye className="h-3 w-3" />,          color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  ROLE_CHANGED:        { label: "Role Changed",        icon: <Shield className="h-3 w-3" />,       color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
}

interface Props {
  logs: AuditLog[]
}

export function AuditLogViewer({ logs }: Props) {
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState<ActionType | "ALL">("ALL")

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      (l.ticketTitle ?? "").toLowerCase().includes(search.toLowerCase())
    const matchAction = actionFilter === "ALL" || l.actionType === actionFilter
    return matchSearch && matchAction
  })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-5 w-5 text-orange-400" />
        <h2 className="text-lg font-semibold text-white">Audit Log</h2>
        <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded-md ml-auto">
          {filtered.length} entries
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user or ticket..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as ActionType | "ALL")}
          className="rounded-xl bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
        >
          <option value="ALL">All Actions</option>
          {Object.keys(ACTION_CONFIG).map((a) => (
            <option key={a} value={a}>{ACTION_CONFIG[a as ActionType].label}</option>
          ))}
        </select>
      </div>

      {/* Log entries */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No audit entries found</p>
          </div>
        ) : (
          filtered.map((log) => {
            const cfg = ACTION_CONFIG[log.actionType]
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700/50 hover:border-gray-600 transition-colors"
              >
                {/* Action badge */}
                <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium shrink-0 mt-0.5", cfg.color)}>
                  {cfg.icon}
                  <span className="hidden sm:inline">{cfg.label}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-200">{log.userName}</span>
                    <span className="text-xs text-gray-600 bg-gray-700/50 px-1.5 py-0.5 rounded">
                      {log.userRole.replace("_", " ")}
                    </span>
                    {log.ticketTitle && (
                      <span className="text-xs text-gray-500 truncate">
                        → <span className="text-gray-400">{log.ticketTitle}</span>
                      </span>
                    )}
                  </div>
                  {(log.oldValue || log.newValue) && (
                    <div className="flex items-center gap-2 mt-1">
                      {log.oldValue && (
                        <span className="text-xs text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded line-through">
                          {log.oldValue}
                        </span>
                      )}
                      {log.oldValue && log.newValue && <span className="text-xs text-gray-600">→</span>}
                      {log.newValue && (
                        <span className="text-xs text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                          {log.newValue}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  <p className="text-xs text-gray-700 font-mono">{log.ipAddress}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
