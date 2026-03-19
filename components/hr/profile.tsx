"use client"

import { useState } from "react"
import { UserCircle, Inbox, ClipboardList, Circle, Loader2, Clock, CheckCircle2, XCircle, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "./auth-context"
import { Badge } from "@/components/ui/badge"
import type { Ticket, TicketStatus, Role } from "@/lib/types"
import { SENSITIVE_CATEGORIES } from "@/lib/permissions"

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; icon: React.ReactNode }> = {
  OPEN:        { label: "Open",        color: "bg-blue-500/20 text-blue-300 border-blue-500/30",   icon: <Circle className="h-3 w-3" /> },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: <Loader2 className="h-3 w-3" /> },
  PENDING:     { label: "Pending",     color: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: <Clock className="h-3 w-3" /> },
  RESOLVED:    { label: "Resolved",    color: "bg-green-500/20 text-green-300 border-green-500/30",  icon: <CheckCircle2 className="h-3 w-3" /> },
  CLOSED:      { label: "Closed",      color: "bg-gray-500/20 text-gray-400 border-gray-500/30",    icon: <XCircle className="h-3 w-3" /> },
}

const PRIORITY_COLOR: Record<string, string> = {
  LOW:      "bg-gray-500/20 text-gray-400 border-gray-500/30",
  MEDIUM:   "bg-blue-500/20 text-blue-300 border-blue-500/30",
  HIGH:     "bg-orange-500/20 text-orange-300 border-orange-500/30",
  CRITICAL: "bg-red-500/20 text-red-300 border-red-500/30",
}

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
  tickets: Ticket[]
  onSelectTicket: (ticket: Ticket) => void
}

function TicketRow({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  const isSensitive = SENSITIVE_CATEGORIES.includes(ticket.category)
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-800/60 transition-colors border-b border-gray-700/30 last:border-0"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          {isSensitive && <Lock className="h-3 w-3 text-amber-400 shrink-0" />}
          <span className="text-sm font-medium text-gray-200 truncate">{ticket.title}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className={cn("text-xs border flex items-center gap-1", STATUS_CONFIG[ticket.status].color)}>
            {STATUS_CONFIG[ticket.status].icon}
            {STATUS_CONFIG[ticket.status].label}
          </Badge>
          <Badge className={cn("text-xs border", PRIORITY_COLOR[ticket.priority])}>
            {ticket.priority}
          </Badge>
          <span className="text-xs text-gray-600">#{ticket.id} · {new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <span className="text-xs text-gray-600 shrink-0 mt-1">{ticket.department}</span>
    </button>
  )
}

export function ProfilePage({ tickets, onSelectTicket }: Props) {
  const { currentUser } = useAuth()
  if (!currentUser) return null
  const [tab, setTab] = useState<"assigned" | "mytasks">("assigned")

  const activeTickets = tickets.filter((t) => !t.deletedAt)

  // Tickets assigned TO me (someone else assigned me)
  const assignedToMe = activeTickets.filter(
    (t) => t.assigneeId === currentUser.id && t.creatorId !== currentUser.id
  )

  // Tickets I created and assigned to someone else
  const myAssignedTasks = activeTickets.filter(
    (t) => t.creatorId === currentUser.id && t.assigneeId && t.assigneeId !== currentUser.id
  )

  const myCreated = activeTickets.filter((t) => t.creatorId === currentUser.id).length
  const myResolved = activeTickets.filter(
    (t) => t.assigneeId === currentUser.id && (t.status === "RESOLVED" || t.status === "CLOSED")
  ).length

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Profile Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0", ROLE_BADGE_SOLID[currentUser.role])}>
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={cn("text-xs px-2 py-0.5 rounded-md border", ROLE_COLORS[currentUser.role])}>
                  {currentUser.role.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-md">
                  {currentUser.department}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Tickets Created", value: myCreated, color: "text-blue-400" },
              { label: "Assigned to Me", value: assignedToMe.length, color: "text-purple-400" },
              { label: "Resolved by Me", value: myResolved, color: "text-green-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-800/60 rounded-xl p-3 text-center border border-gray-700/50">
                <p className={cn("text-2xl font-bold", color)}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setTab("assigned")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors",
                tab === "assigned"
                  ? "border-purple-500 text-purple-400 bg-purple-500/5"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              )}
            >
              <Inbox className="h-4 w-4" />
              Assigned to Me
              {assignedToMe.length > 0 && (
                <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full">{assignedToMe.length}</span>
              )}
            </button>
            <button
              onClick={() => setTab("mytasks")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors",
                tab === "mytasks"
                  ? "border-blue-500 text-blue-400 bg-blue-500/5"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              )}
            >
              <ClipboardList className="h-4 w-4" />
              My Tasks
              {myAssignedTasks.length > 0 && (
                <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">{myAssignedTasks.length}</span>
              )}
            </button>
          </div>

          {/* Tab content */}
          <div>
            {tab === "assigned" ? (
              assignedToMe.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                  <Inbox className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">No tickets assigned to you</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-600 px-4 py-2 border-b border-gray-800">
                    Tickets assigned to you by others — {assignedToMe.length} total
                  </p>
                  {assignedToMe.map((t) => (
                    <TicketRow key={t.id} ticket={t} onClick={() => onSelectTicket(t)} />
                  ))}
                </div>
              )
            ) : (
              myAssignedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                  <ClipboardList className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">You haven't assigned any tickets yet</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-600 px-4 py-2 border-b border-gray-800">
                    Tickets you created and assigned to others — {myAssignedTasks.length} total
                  </p>
                  {myAssignedTasks.map((t) => (
                    <TicketRow
                      key={t.id}
                      ticket={t}
                      onClick={() => onSelectTicket(t)}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
