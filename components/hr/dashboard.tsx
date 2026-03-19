"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  Ticket, BarChart2, Shield, Users, Plus,
  ChevronDown, Lock, Bell, Menu, X,
  AlertTriangle, Clock, UserX, CheckCircle2, LogOut, UserCircle, ArrowLeft
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAuth } from "./auth-context"
import { getTickets, getAuditLogs } from "@/lib/data"
import { hasPermission, ROLE_PERMISSIONS } from "@/lib/permissions"
import { TicketList } from "./ticket-list"
import { TicketDetail } from "./ticket-detail"
import { Analytics } from "./analytics"
import { AuditLogViewer } from "./audit-log"
import { RoleManagement } from "./role-management"
import { ProfilePage } from "./profile"
import type { Ticket as TicketType, Role } from "@/lib/types"

type View = "tickets" | "analytics" | "audit" | "roles" | "profile"

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

export function HRDashboard({ onBack, onCreateTicket }: { onBack?: () => void; onCreateTicket?: () => void } = {}) {
  const { currentUser, logout, login, allUsers } = useAuth()
  if (!currentUser) return null
  const [view, setView] = useState<View>("tickets")
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [showUserSwitcher, setShowUserSwitcher] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((n) => n + 1), [])

  const tickets = getTickets()
  const auditLogs = getAuditLogs()

  const liveSelectedTicket = selectedTicket
    ? tickets.find((t) => t.id === selectedTicket.id) ?? null
    : null

  const canCreateTicket = hasPermission(currentUser.role, "CREATE_TICKET")
  const canViewAnalytics = hasPermission(currentUser.role, "VIEW_ANALYTICS")
  const canViewAuditLogs = hasPermission(currentUser.role, "VIEW_AUDIT_LOGS")
  const canManageRoles = hasPermission(currentUser.role, "MANAGE_ROLES")

  const navItems = [
    { id: "tickets" as View,   label: "Tickets",         icon: <Ticket className="h-4 w-4" />,      show: true },
    { id: "analytics" as View, label: "Analytics",       icon: <BarChart2 className="h-4 w-4" />,   show: canViewAnalytics },
    { id: "audit" as View,     label: "Audit Log",       icon: <Shield className="h-4 w-4" />,      show: canViewAuditLogs },
    { id: "roles" as View,     label: "Role Management", icon: <Users className="h-4 w-4" />,       show: canManageRoles },
    { id: "profile" as View,   label: "My Profile",      icon: <UserCircle className="h-4 w-4" />, show: true },
  ].filter((n) => n.show)

  const openTickets = tickets.filter((t) => !t.deletedAt && t.status === "OPEN").length

  // ── Notifications ──────────────────────────────────────────────────────────
  const [showNotifications, setShowNotifications] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const notifRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        notifRef.current && !notifRef.current.contains(e.target as Node) &&
        bellRef.current && !bellRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function toggleNotifications() {
    setShowNotifications((v) => !v)
  }

  // Build role-aware notifications
  const notifications = (() => {
    const items: { id: string; icon: React.ReactNode; color: string; title: string; body: string; ticketId?: string }[] = []
    const visibleTickets = tickets.filter((t) => !t.deletedAt)

    if (currentUser.role === "EMPLOYEE") {
      // My tickets that got a new comment or status change
      visibleTickets
        .filter((t) => t.creatorId === currentUser.id)
        .forEach((t) => {
          if (t.status === "RESOLVED")
            items.push({ id: `resolved-${t.id}`, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-400", title: "Ticket Resolved", body: t.title, ticketId: t.id })
          else if (t.status === "IN_PROGRESS")
            items.push({ id: `inprog-${t.id}`, icon: <Clock className="h-4 w-4" />, color: "text-amber-400", title: "Ticket In Progress", body: t.title, ticketId: t.id })
        })
    }

    if (["HR_COORDINATOR", "HR_SPECIALIST"].includes(currentUser.role)) {
      // Unassigned tickets
      visibleTickets.filter((t) => !t.assigneeId && t.status === "OPEN").forEach((t) => {
        items.push({ id: `unassigned-${t.id}`, icon: <UserX className="h-4 w-4" />, color: "text-blue-400", title: "Unassigned Ticket", body: t.title, ticketId: t.id })
      })
      // Tickets assigned to me
      visibleTickets.filter((t) => t.assigneeId === currentUser.id && t.status === "OPEN").forEach((t) => {
        items.push({ id: `mine-${t.id}`, icon: <Ticket className="h-4 w-4" />, color: "text-purple-400", title: "Assigned to You", body: t.title, ticketId: t.id })
      })
    }

    if (currentUser.role === "HR_MANAGER" || currentUser.role === "SYSTEM_ADMIN") {
      // Critical open tickets
      visibleTickets.filter((t) => t.priority === "CRITICAL" && t.status === "OPEN").forEach((t) => {
        items.push({ id: `critical-${t.id}`, icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-400", title: "Critical Ticket Open", body: t.title, ticketId: t.id })
      })
      // Unassigned tickets
      visibleTickets.filter((t) => !t.assigneeId && t.status === "OPEN").forEach((t) => {
        items.push({ id: `unassigned-${t.id}`, icon: <UserX className="h-4 w-4" />, color: "text-amber-400", title: "Unassigned Ticket", body: t.title, ticketId: t.id })
      })
    }

    return items
  })()

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length

  function markAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)))
  }

  function handleNotifClick(n: typeof notifications[0]) {
    setReadIds((prev) => new Set([...prev, n.id]))
    if (n.ticketId) {
      const t = tickets.find((tk) => tk.id === n.ticketId)
      if (t) { setSelectedTicket(t); setView("tickets") }
    }
    setShowNotifications(false)
  }

  function handleSelectTicket(ticket: TicketType) {
    setSelectedTicket(ticket)
    setShowMobileSidebar(false)
  }

  function handleTicketDeleted() {
    setSelectedTicket(null)
    refresh()
  }

  function switchUser(user: NonNullable<typeof currentUser>) {
    login(user.email, "password")
    setSelectedTicket(null)
    setView("tickets")
    setShowUserSwitcher(false)
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setShowMobileSidebar(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-gray-900 border-r border-gray-800 transition-transform duration-300 md:relative md:translate-x-0",
        showMobileSidebar ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <Ticket className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">HR Tickets</p>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
          <button className="md:hidden text-gray-500 hover:text-white" onClick={() => setShowMobileSidebar(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User switcher */}
        <div className="p-3 border-b border-gray-800">
          <button
            onClick={() => setShowUserSwitcher(!showUserSwitcher)}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0", ROLE_BADGE_SOLID[currentUser.role])}>
              {currentUser.avatar}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <span className={cn("text-xs px-1.5 py-0.5 rounded-md border inline-block mt-0.5", ROLE_COLORS[currentUser.role])}>
                {currentUser.role.replace(/_/g, " ")}
              </span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform shrink-0", showUserSwitcher && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showUserSwitcher && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-1 pt-1 border-t border-gray-800 space-y-0.5">
                  <p className="text-xs text-gray-600 px-2 py-1">Switch role (demo)</p>
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
                        u.id === currentUser.id
                          ? "bg-blue-600/20 text-blue-300"
                          : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                      )}
                    >
                      <div className={cn("h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0", ROLE_BADGE_SOLID[u.role])}>
                        {u.avatar.charAt(0)}
                      </div>
                      <span className="flex-1 truncate text-left">{u.name}</span>
                      <span className="text-xs text-gray-600 shrink-0">{u.role.split("_")[0]}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setShowMobileSidebar(false) }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border",
                view === item.id
                  ? "bg-blue-600/20 text-blue-300 border-blue-500/30"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200 border-transparent"
              )}
            >
              {item.icon}
              {item.label}
              {item.id === "tickets" && openTickets > 0 && (
                <span className="ml-auto text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                  {openTickets}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* New ticket button */}
        {canCreateTicket && (
          <div className="p-3 border-t border-gray-800">
            <button
              onClick={() => onCreateTicket?.()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Ticket
            </button>
          </div>
        )}

        {/* Permissions legend */}
        <div className="p-3 border-t border-gray-800">
          <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
            <Lock className="h-3 w-3" /> Your permissions
          </p>
          <div className="flex flex-wrap gap-1">
            {ROLE_PERMISSIONS[currentUser.role].map((p) => (
              <span key={p} className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                {p.replace(/_/g, " ").toLowerCase()}
              </span>
            ))}
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 text-sm transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur shrink-0 overflow-visible">
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setShowMobileSidebar(true)}>
            <Menu className="h-5 w-5" />
          </button>
          {onBack && (
            <button onClick={onBack} className="hidden md:flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </button>
          )}
          <h1 className="text-sm font-semibold text-white">
            {view === "tickets" ? "Support Tickets" : view === "analytics" ? "Analytics" : view === "audit" ? "Audit Log" : view === "profile" ? "My Profile" : "Role Management"}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            {/* Bell with dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                ref={bellRef}
                onClick={toggleNotifications}
                className="relative p-1.5 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <Bell className={cn("h-5 w-5", unreadCount > 0 ? "text-white" : "text-gray-500")} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-11 w-80 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden" style={{ zIndex: 99999 }}>
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-semibold text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Items */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-800">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                        <Bell className="h-7 w-7 mb-2 opacity-30" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const isUnread = !readIds.has(n.id)
                        return (
                          <button
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className={cn(
                              "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-800/60 transition-colors",
                              isUnread && "bg-gray-800/30"
                            )}
                          >
                            <div className={cn("mt-0.5 shrink-0", n.color)}>{n.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-gray-300">{n.title}</p>
                                {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />}
                              </div>
                              <p className="text-xs text-gray-500 truncate mt-0.5">{n.body}</p>
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-gray-800">
                      <p className="text-xs text-gray-600 text-center">
                        {notifications.length} notification{notifications.length !== 1 ? "s" : ""} · role-filtered
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <span className={cn("text-xs px-2 py-1 rounded-lg border hidden sm:inline-block", ROLE_COLORS[currentUser.role])}>
              {currentUser.role.replace(/_/g, " ")}
            </span>
          </div>
        </header>

        {/* View content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {/* ── Tickets view ── */}
              {view === "tickets" && (
                <div className="flex h-full">
                  {/* List panel */}
                  <div className={cn(
                    "flex flex-col border-r border-gray-800 bg-gray-900/50 shrink-0 transition-all",
                    liveSelectedTicket
                      ? "hidden md:flex md:w-80 lg:w-96"
                      : "flex w-full md:w-80 lg:w-96"
                  )}>
                    <TicketList
                      key={tick}
                      tickets={tickets}
                      selectedId={liveSelectedTicket?.id ?? null}
                      onSelect={handleSelectTicket}
                    />
                  </div>

                  {/* Detail panel */}
                  <div className={cn(
                    "flex-1 overflow-hidden",
                    liveSelectedTicket ? "flex flex-col" : "hidden md:flex md:flex-col"
                  )}>
                    {liveSelectedTicket ? (
                      <>
                        <div className="md:hidden flex items-center px-4 py-2 border-b border-gray-800">
                          <button
                            onClick={() => setSelectedTicket(null)}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            ← Back to list
                          </button>
                        </div>
                        <TicketDetail
                          key={liveSelectedTicket.id + tick}
                          ticket={liveSelectedTicket}
                          onUpdate={refresh}
                          onDelete={handleTicketDeleted}
                        />
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-600">
                        <Ticket className="h-12 w-12 mb-3 opacity-20" />
                        <p className="text-sm">Select a ticket to view details</p>
                        {canCreateTicket && (
                          <button
                            onClick={() => onCreateTicket?.()}
                            className="mt-4 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300"
                          >
                            <Plus className="h-4 w-4" /> Create a new ticket
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {view === "analytics" && (
                <div className="h-full overflow-y-auto">
                  <Analytics key={tick} tickets={tickets} />
                </div>
              )}

              {view === "audit" && (
                <div className="h-full overflow-y-auto">
                  <AuditLogViewer key={tick} logs={auditLogs} />
                </div>
              )}

              {view === "roles" && (
                <div className="h-full overflow-y-auto">
                  <RoleManagement />
                </div>
              )}

              {view === "profile" && (
                <ProfilePage
                  key={tick}
                  tickets={tickets}
                  onSelectTicket={(t) => { setSelectedTicket(t); setView("tickets") }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  )
}
