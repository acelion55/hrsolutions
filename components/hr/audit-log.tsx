"use client"

import { useState } from "react"
import { Shield, Search, Eye, Edit2, UserCheck, Trash2, Plus, MessageSquare, Lock } from "lucide-react"
import type { AuditLog, ActionType } from "@/lib/types"
import { cn } from "@/lib/utils"

const ACTION_CONFIG: Record<ActionType, { label: string; icon: React.ReactNode; color: string }> = {
  TICKET_CREATED:      { label: "Ticket Created",  icon: <Plus className="h-3 w-3" />,          color: "text-green-700 bg-green-50 border-green-200" },
  STATUS_CHANGED:      { label: "Status Changed",  icon: <Edit2 className="h-3 w-3" />,          color: "text-blue-700 bg-blue-50 border-blue-200" },
  ASSIGNED:            { label: "Assigned",         icon: <UserCheck className="h-3 w-3" />,     color: "text-purple-700 bg-purple-50 border-purple-200" },
  COMMENT_ADDED:       { label: "Comment Added",    icon: <MessageSquare className="h-3 w-3" />, color: "text-gray-600 bg-gray-100 border-gray-200" },
  INTERNAL_NOTE_ADDED: { label: "Internal Note",   icon: <Lock className="h-3 w-3" />,           color: "text-amber-700 bg-amber-50 border-amber-200" },
  TICKET_DELETED:      { label: "Ticket Deleted",  icon: <Trash2 className="h-3 w-3" />,         color: "text-red-700 bg-red-50 border-red-200" },
  TICKET_VIEWED:       { label: "Ticket Viewed",   icon: <Eye className="h-3 w-3" />,            color: "text-cyan-700 bg-cyan-50 border-cyan-200" },
  ROLE_CHANGED:        { label: "Role Changed",    icon: <Shield className="h-3 w-3" />,         color: "text-orange-700 bg-orange-50 border-orange-200" },
}

interface Props { logs: AuditLog[] }

export function AuditLogViewer({ logs }: Props) {
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState<ActionType | "ALL">("ALL")

  // Fix: filter is applied correctly — both search AND action filter work together
  const filtered = logs.filter((l) => {
    const matchSearch = search.trim() === "" ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      (l.ticketTitle ?? "").toLowerCase().includes(search.toLowerCase()) ||
      l.userRole.toLowerCase().includes(search.toLowerCase())
    const matchAction = actionFilter === "ALL" || l.actionType === actionFilter
    return matchSearch && matchAction
  })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-bold text-gray-900">Audit Log</h2>
        <span className="text-xs text-gray-500 bg-yellow-100 border border-yellow-200 px-2 py-0.5 rounded-md ml-auto font-semibold">
          {filtered.length} entries
        </span>
      </div>

      {/* Filters — search bar on top, action filter below */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, ticket, or role..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-yellow-200 text-gray-800 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
          />
        </div>
        {/* Action filter buttons */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActionFilter("ALL")}
            className={cn("text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors",
              actionFilter === "ALL" ? "bg-yellow-400 border-yellow-500 text-white" : "bg-white border-yellow-200 text-gray-500 hover:border-yellow-400 hover:text-gray-700")}>
            All
          </button>
          {(Object.keys(ACTION_CONFIG) as ActionType[]).map((a) => (
            <button key={a} onClick={() => setActionFilter(a)}
              className={cn("text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors",
                actionFilter === a ? "bg-yellow-400 border-yellow-500 text-white" : "bg-white border-yellow-200 text-gray-500 hover:border-yellow-400 hover:text-gray-700")}>
              {ACTION_CONFIG[a].label}
            </button>
          ))}
        </div>
      </div>

      {/* Log entries */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No audit entries found</p>
          </div>
        ) : (
          filtered.map((log) => {
            const cfg = ACTION_CONFIG[log.actionType]
            return (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-yellow-200 hover:border-yellow-300 hover:shadow-sm transition-all shadow-sm">
                <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold shrink-0 mt-0.5", cfg.color)}>
                  {cfg.icon}
                  <span className="hidden sm:inline">{cfg.label}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-800">{log.userName}</span>
                    <span className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded">{log.userRole.replace("_", " ")}</span>
                    {log.ticketTitle && (
                      <span className="text-xs text-gray-400 truncate">→ <span className="text-gray-600">{log.ticketTitle}</span></span>
                    )}
                  </div>
                  {(log.oldValue || log.newValue) && (
                    <div className="flex items-center gap-2 mt-1">
                      {log.oldValue && <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded line-through">{log.oldValue}</span>}
                      {log.oldValue && log.newValue && <span className="text-xs text-gray-400">→</span>}
                      {log.newValue && <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">{log.newValue}</span>}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-600 font-medium">{new Date(log.timestamp).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  <p className="text-xs text-gray-300 font-mono">{log.ipAddress}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
