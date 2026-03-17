"use client"

import { useState } from "react"
import { Search, Filter, Lock, AlertTriangle, Clock, CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Ticket, TicketStatus, TicketCategory } from "@/lib/types"
import { useAuth } from "./auth-context"
import { filterTicketsForUser, SENSITIVE_CATEGORIES } from "@/lib/permissions"

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; icon: React.ReactNode }> = {
  OPEN: { label: "Open", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: <Circle className="h-3 w-3" /> },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: <Loader2 className="h-3 w-3" /> },
  PENDING: { label: "Pending", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: <Clock className="h-3 w-3" /> },
  RESOLVED: { label: "Resolved", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: <CheckCircle2 className="h-3 w-3" /> },
  CLOSED: { label: "Closed", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: <XCircle className="h-3 w-3" /> },
}

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  MEDIUM: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  HIGH: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  CRITICAL: "bg-red-500/20 text-red-300 border-red-500/30",
}

interface Props {
  tickets: Ticket[]
  selectedId: string | null
  onSelect: (ticket: Ticket) => void
}

export function TicketList({ tickets, selectedId, onSelect }: Props) {
  const { currentUser } = useAuth()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL")
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "ALL">("ALL")

  const visible = filterTicketsForUser(currentUser, tickets).filter((t) => {
    if (t.deletedAt) return false
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter
    const matchCategory = categoryFilter === "ALL" || t.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-700/50 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="pl-9 bg-gray-800/60 border-gray-700 text-white placeholder:text-gray-500 rounded-xl text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-lg border transition-colors",
                statusFilter === s
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300"
              )}
            >
              {s === "ALL" ? "All" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">{visible.length} ticket{visible.length !== 1 ? "s" : ""}</span>
        {currentUser.role === "EMPLOYEE" && (
          <span className="text-xs text-gray-600 flex items-center gap-1">
            <Lock className="h-3 w-3" /> Showing your tickets only
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1 px-2 pb-4">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600">
            <Filter className="h-8 w-8 mb-2" />
            <p className="text-sm">No tickets found</p>
          </div>
        ) : (
          visible.map((ticket) => {
            const isSensitive = SENSITIVE_CATEGORIES.includes(ticket.category)
            const isSelected = ticket.id === selectedId
            return (
              <button
                key={ticket.id}
                onClick={() => onSelect(ticket)}
                className={cn(
                  "w-full text-left p-3 rounded-xl border transition-all duration-150",
                  isSelected
                    ? "bg-blue-600/20 border-blue-500/50"
                    : "bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/80 hover:border-gray-600"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isSensitive && <Lock className="h-3 w-3 text-amber-400 shrink-0" />}
                    <span className="text-sm font-medium text-white truncate">{ticket.title}</span>
                  </div>
                  <Badge className={cn("text-xs border shrink-0 flex items-center gap-1", STATUS_CONFIG[ticket.status].color)}>
                    {STATUS_CONFIG[ticket.status].icon}
                    {STATUS_CONFIG[ticket.status].label}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 truncate mb-2">{ticket.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn("text-xs border", PRIORITY_COLOR[ticket.priority])}>
                    {ticket.priority}
                  </Badge>
                  <span className="text-xs text-gray-600 bg-gray-700/50 px-2 py-0.5 rounded-md">
                    {ticket.category.replace("_", " ")}
                  </span>
                  {ticket.assigneeName && (
                    <span className="text-xs text-gray-500 ml-auto">→ {ticket.assigneeName.split(" ")[0]}</span>
                  )}
                </div>
                <div className="mt-1.5 text-xs text-gray-600">
                  #{ticket.id} · {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
