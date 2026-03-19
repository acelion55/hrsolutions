"use client"

import { useMemo, useRef, useState } from "react"
import {
  BarChart2, Ticket, Clock, CheckCircle2, AlertTriangle,
  Search, FileSpreadsheet, FileText, Printer, Filter, X,
  Circle, Loader2, XCircle, Bug, Wrench, MapPin, FolderOpen, User
} from "lucide-react"
import type { Ticket as TicketType, TicketStatus, TicketPriority, Department } from "@/lib/types"
import { filterTicketsForUser } from "@/lib/permissions"
import { useAuth } from "./auth-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; dot: string }> = {
  OPEN:        { label: "Open",        color: "bg-blue-500/20 text-blue-300 border-blue-500/30",   dot: "bg-blue-400" },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", dot: "bg-amber-400" },
  PENDING:     { label: "Pending",     color: "bg-purple-500/20 text-purple-300 border-purple-500/30", dot: "bg-purple-400" },
  RESOLVED:    { label: "Resolved",    color: "bg-green-500/20 text-green-300 border-green-500/30",  dot: "bg-green-400" },
  CLOSED:      { label: "Closed",      color: "bg-gray-500/20 text-gray-400 border-gray-500/30",    dot: "bg-gray-500" },
}

const PRIORITY_CONFIG: Record<string, { color: string }> = {
  LOW:      { color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  MEDIUM:   { color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  HIGH:     { color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  CRITICAL: { color: "bg-red-500/20 text-red-300 border-red-500/30" },
}

interface Props { tickets: TicketType[] }

export function Analytics({ tickets }: Props) {
  const { currentUser } = useAuth()
  if (!currentUser) return null

  const visible = filterTicketsForUser(currentUser, tickets).filter((t) => !t.deletedAt)

  // ── Filters ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("")
  const [statusF, setStatusF] = useState<TicketStatus | "ALL">("ALL")
  const [priorityF, setPriorityF] = useState<TicketPriority | "ALL">("ALL")
  const [deptF, setDeptF] = useState<Department | "ALL">("ALL")
  const [typeF, setTypeF] = useState<"ALL" | "BUG" | "SERVICE_REQUEST">("ALL")

  const tableRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => visible.filter((t) => {
    const q = search.toLowerCase()
    const matchSearch = !q || t.title.toLowerCase().includes(q) ||
      t.projectName?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q) ||
      t.creatorName.toLowerCase().includes(q)
    return matchSearch &&
      (statusF === "ALL" || t.status === statusF) &&
      (priorityF === "ALL" || t.priority === priorityF) &&
      (deptF === "ALL" || t.department === deptF) &&
      (typeF === "ALL" || t.ticketType === typeF)
  }), [visible, search, statusF, priorityF, deptF, typeF])

  // ── KPI Stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = visible.length
    const open = visible.filter((t) => t.status === "OPEN").length
    const inProgress = visible.filter((t) => t.status === "IN_PROGRESS").length
    const resolved = visible.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length
    const critical = visible.filter((t) => t.priority === "CRITICAL").length
    const bugs = visible.filter((t) => t.ticketType === "BUG").length
    const unassigned = visible.filter((t) => !t.assigneeId).length
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0
    return { total, open, inProgress, resolved, critical, bugs, unassigned, resolutionRate }
  }, [visible])

  const departments = Array.from(new Set(visible.map((t) => t.department))) as Department[]
  const activeFilters = [statusF !== "ALL", priorityF !== "ALL", deptF !== "ALL", typeF !== "ALL", !!search].filter(Boolean).length

  function clearFilters() {
    setSearch(""); setStatusF("ALL"); setPriorityF("ALL"); setDeptF("ALL"); setTypeF("ALL")
  }

  // ── Export ────────────────────────────────────────────────────────────────
  function exportExcel() {
    import("xlsx").then((XLSX) => {
      const rows = filtered.map((t) => ({
        "Ticket ID": t.id,
        Title: t.title,
        Type: t.ticketType ?? "—",
        Status: t.status,
        Priority: t.priority,
        Department: t.department,
        Location: t.location ?? "—",
        "Project Name": t.projectName ?? "—",
        "Created By": t.creatorName,
        "Assigned To": t.assigneeName ?? "Unassigned",
        "Created At": new Date(t.createdAt).toLocaleDateString(),
        "Updated At": new Date(t.updatedAt).toLocaleDateString(),
      }))
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Task Report")
      XLSX.writeFile(wb, "task-report.xlsx")
      toast.success("Excel exported!")
    })
  }

  function handlePrint() {
    if (!tableRef.current) return
    const html = `<html><head><title>Task Report</title><style>
      body{font-family:sans-serif;padding:20px;font-size:12px}
      h2{margin-bottom:4px}p{color:#555;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      th{background:#1e293b;color:#fff;padding:6px 10px;text-align:left}
      td{padding:6px 10px;border-bottom:1px solid #e2e8f0}
      tr:nth-child(even) td{background:#f8fafc}
    </style></head><body>
      <h2>Task Report</h2>
      <p>Generated: ${new Date().toLocaleString()} | Total: ${filtered.length} tasks</p>
      ${tableRef.current.innerHTML}
    </body></html>`
    const w = window.open("", "_blank")
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.print()
  }

  return (
    <div className="p-5 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Task Report</h2>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{filtered.length} tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportExcel} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700/50 transition-colors">
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Tasks",      value: stats.total,          color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",   icon: <Ticket className="h-4 w-4" /> },
          { label: "Open",             value: stats.open,           color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20", icon: <Circle className="h-4 w-4" /> },
          { label: "In Progress",      value: stats.inProgress,     color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: <Loader2 className="h-4 w-4" /> },
          { label: "Resolved/Closed",  value: stats.resolved,       color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20", icon: <CheckCircle2 className="h-4 w-4" /> },
          { label: "Critical",         value: stats.critical,       color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",     icon: <AlertTriangle className="h-4 w-4" /> },
          { label: "Bugs",             value: stats.bugs,           color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", icon: <Bug className="h-4 w-4" /> },
          { label: "Unassigned",       value: stats.unassigned,     color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: <Clock className="h-4 w-4" /> },
          { label: "Resolution Rate",  value: `${stats.resolutionRate}%`, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20", icon: <BarChart2 className="h-4 w-4" /> },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} className={cn("rounded-xl border p-3", bg)}>
            <div className={cn("flex items-center gap-1.5 mb-1", color)}>
              {icon}
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Filters</span>
            {activeFilters > 0 && <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">{activeFilters}</span>}
          </div>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors">
              <X className="h-3 w-3" /> Clear all
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, project, location, creator..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Status */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select value={statusF} onChange={(e) => setStatusF(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40">
              <option value="ALL">All Status</option>
              {(["OPEN","IN_PROGRESS","PENDING","RESOLVED","CLOSED"] as TicketStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          {/* Priority */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Priority</label>
            <select value={priorityF} onChange={(e) => setPriorityF(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40">
              <option value="ALL">All Priority</option>
              {["CRITICAL","HIGH","MEDIUM","LOW"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {/* Department */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Department</label>
            <select value={deptF} onChange={(e) => setDeptF(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40">
              <option value="ALL">All Departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {/* Type */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ticket Type</label>
            <select value={typeF} onChange={(e) => setTypeF(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40">
              <option value="ALL">All Types</option>
              <option value="BUG">Bug</option>
              <option value="SERVICE_REQUEST">Service Request</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/60">
                {["#", "Title", "Type", "Status", "Priority", "Department", "Location", "Project", "Assigned To", "Created By", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-gray-600">
                    <Filter className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No tasks match your filters</p>
                  </td>
                </tr>
              ) : filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-600 font-mono">#{t.id}</td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <p className="text-sm font-medium text-gray-200 truncate">{t.title}</p>
                    {t.attachments?.length > 0 && (
                      <span className="text-xs text-gray-600">{t.attachments.length} file{t.attachments.length > 1 ? "s" : ""}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border",
                      t.ticketType === "BUG" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>
                      {t.ticketType === "BUG" ? <Bug className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
                      {t.ticketType === "BUG" ? "Bug" : "Service"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md border", STATUS_CONFIG[t.status].color)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_CONFIG[t.status].dot)} />
                      {STATUS_CONFIG[t.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-md border", PRIORITY_CONFIG[t.priority].color)}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{t.department}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[100px]">{t.location ?? "—"}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <FolderOpen className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[100px]">{t.projectName ?? "—"}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs">
                      <User className="h-3 w-3 text-gray-600 shrink-0" />
                      <span className={t.assigneeName ? "text-gray-300" : "text-gray-600"}>
                        {t.assigneeName ?? "Unassigned"}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{t.creatorName}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-600">Showing {filtered.length} of {visible.length} tasks</span>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              {(["OPEN","IN_PROGRESS","PENDING","RESOLVED","CLOSED"] as TicketStatus[]).map((s) => {
                const count = filtered.filter((t) => t.status === s).length
                return count > 0 ? (
                  <span key={s} className="flex items-center gap-1">
                    <span className={cn("h-2 w-2 rounded-full", STATUS_CONFIG[s].dot)} />
                    {STATUS_CONFIG[s].label}: {count}
                  </span>
                ) : null
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
