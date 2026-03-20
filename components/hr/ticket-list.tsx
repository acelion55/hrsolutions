"use client"

import { useState } from "react"
import { Search, Filter, Lock, Clock, CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Ticket, TicketStatus } from "@/lib/types"
import { useAuth } from "./auth-context"
import { filterTicketsForUser, SENSITIVE_CATEGORIES } from "@/lib/permissions"

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; icon: React.ReactNode }> = {
  OPEN:        { label: "Open",        color: "bg-blue-50 text-blue-700 border-blue-200",      icon: <Circle className="h-3 w-3" /> },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-50 text-amber-700 border-amber-200",   icon: <Loader2 className="h-3 w-3" /> },
  PENDING:     { label: "Pending",     color: "bg-purple-50 text-purple-700 border-purple-200", icon: <Clock className="h-3 w-3" /> },
  RESOLVED:    { label: "Resolved",    color: "bg-green-50 text-green-700 border-green-200",   icon: <CheckCircle2 className="h-3 w-3" /> },
  CLOSED:      { label: "Closed",      color: "bg-gray-100 text-gray-500 border-gray-200",     icon: <XCircle className="h-3 w-3" /> },
}

const PRIORITY_COLOR: Record<string, string> = {
  LOW:      "bg-gray-100 text-gray-500 border-gray-200",
  MEDIUM:   "bg-blue-50 text-blue-600 border-blue-200",
  HIGH:     "bg-orange-50 text-orange-600 border-orange-200",
  CRITICAL: "bg-red-50 text-red-600 border-red-200",
}

interface Props { tickets: Ticket[]; selectedId: string | null; onSelect: (ticket: Ticket) => void }

export function TicketList({ tickets, selectedId, onSelect }: Props) {
  const { currentUser } = useAuth()
  if (!currentUser) return null

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL")
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("ALL")

  const visible = filterTicketsForUser(currentUser, tickets).filter((t) => {
    if (t.deletedAt) return false
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter
    const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b border-yellow-100 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets..."
            className="pl-9 bg-yellow-50 border-yellow-200 text-gray-800 placeholder:text-gray-400 rounded-xl text-sm focus:ring-yellow-400" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["ALL", "OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium",
                statusFilter === s ? "bg-yellow-400 border-yellow-500 text-white" : "border-yellow-200 text-gray-500 hover:border-yellow-400 hover:text-gray-700 bg-white")}>
              {s === "ALL" ? "All" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((p) => (
            <button key={p} onClick={() => setPriorityFilter(p)}
              className={cn("text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium",
                priorityFilter === p
                  ? "bg-yellow-400 border-yellow-500 text-white"
                  : p === "CRITICAL" ? "border-red-200 text-red-500 hover:bg-red-50 bg-white"
                  : p === "HIGH" ? "border-orange-200 text-orange-500 hover:bg-orange-50 bg-white"
                  : p === "MEDIUM" ? "border-blue-200 text-blue-500 hover:bg-blue-50 bg-white"
                  : p === "LOW" ? "border-gray-200 text-gray-400 hover:bg-gray-50 bg-white"
                  : "border-yellow-200 text-gray-500 hover:border-yellow-400 bg-white")}>
              {p === "ALL" ? "All Priority" : p}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-2 flex items-center justify-between bg-yellow-50 border-b border-yellow-100">
        <span className="text-xs text-gray-400 font-medium">{visible.length} ticket{visible.length !== 1 ? "s" : ""}</span>
        {currentUser.role === "EMPLOYEE" && (
          <span className="text-xs text-gray-400 flex items-center gap-1"><Lock className="h-3 w-3" /> Your tickets only</span>
        )}
      </div>

      <div className="space-y-1 p-2">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Filter className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No tickets found</p>
          </div>
        ) : visible.map((ticket) => {
          const isSensitive = SENSITIVE_CATEGORIES.includes(ticket.category)
          const isSelected = ticket.id === selectedId
          return (
            <button key={ticket.id} onClick={() => onSelect(ticket)}
              className={cn("w-full text-left p-3 rounded-xl border transition-all duration-150",
                isSelected ? "bg-yellow-100 border-yellow-400 shadow-sm" : "bg-white border-yellow-100 hover:bg-yellow-50 hover:border-yellow-300 hover:shadow-sm")}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  {isSensitive && <Lock className="h-3 w-3 text-amber-500 shrink-0" />}
                  <span className="text-sm font-semibold text-gray-800 truncate">{ticket.title}</span>
                </div>
                <Badge className={cn("text-xs border shrink-0 flex items-center gap-1 font-medium", STATUS_CONFIG[ticket.status].color)}>
                  {STATUS_CONFIG[ticket.status].icon}{STATUS_CONFIG[ticket.status].label}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 truncate mb-2">{ticket.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn("text-xs border font-medium", PRIORITY_COLOR[ticket.priority])}>{ticket.priority}</Badge>
                <span className="text-xs text-gray-500 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-200">{ticket.category.replace("_", " ")}</span>
                {ticket.assigneeName && <span className="text-xs text-gray-400 ml-auto">→ {ticket.assigneeName.split(" ")[0]}</span>}
              </div>
              <div className="mt-1.5 text-xs text-gray-400">#{ticket.id} · {new Date(ticket.createdAt).toLocaleDateString()}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
