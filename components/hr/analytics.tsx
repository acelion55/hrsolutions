"use client"

import { useMemo, useState } from "react"
import { TrendingUp, Ticket, Clock, CheckCircle2, AlertTriangle, Users, Table2, BarChart2, Download, Printer, Share2, FileText } from "lucide-react"
import type { Ticket as TicketType, Department } from "@/lib/types"
import { filterTicketsForUser } from "@/lib/permissions"
import { useAuth } from "./auth-context"
import { MOCK_USERS } from "@/lib/data"
import { cn } from "@/lib/utils"

const DEPARTMENTS: Department[] = ["ENGINEERING", "FINANCE", "OPERATIONS", "MARKETING", "HR"]

interface Props { tickets: TicketType[] }

export function Analytics({ tickets }: Props) {
  const { currentUser } = useAuth()
  if (!currentUser) return null

  const [subView, setSubView] = useState<"charts" | "table">("charts")
  const [deptFilter, setDeptFilter] = useState<Department | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "IN_PROGRESS" | "PENDING" | "RESOLVED" | "CLOSED">("ALL")

  const allVisible = filterTicketsForUser(currentUser, tickets).filter((t) => !t.deletedAt)
  const visible = allVisible.filter((t) => {
    const matchDept = deptFilter === "ALL" || t.department === deptFilter
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter
    return matchDept && matchStatus
  })

  const stats = useMemo(() => {
    const byStatus   = visible.reduce((a, t) => ({ ...a, [t.status]:   (a[t.status]   ?? 0) + 1 }), {} as Record<string, number>)
    const byCategory = visible.reduce((a, t) => ({ ...a, [t.category]: (a[t.category] ?? 0) + 1 }), {} as Record<string, number>)
    const byPriority = visible.reduce((a, t) => ({ ...a, [t.priority]: (a[t.priority] ?? 0) + 1 }), {} as Record<string, number>)
    const unassigned = visible.filter((t) => !t.assigneeId).length
    const critical   = visible.filter((t) => t.priority === "CRITICAL").length
    const resolved   = visible.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length
    const resolutionRate = visible.length > 0 ? Math.round((resolved / visible.length) * 100) : 0
    return { byStatus, byCategory, byPriority, unassigned, critical, resolutionRate, total: visible.length }
  }, [visible])

  // Department-wise table data
  const deptRows = DEPARTMENTS.map((dept) => {
    const deptTickets = visible.filter((t) => t.department === dept)
    return {
      dept,
      total: deptTickets.length,
      open: deptTickets.filter((t) => t.status === "OPEN").length,
      inProgress: deptTickets.filter((t) => t.status === "IN_PROGRESS").length,
      resolved: deptTickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length,
      critical: deptTickets.filter((t) => t.priority === "CRITICAL").length,
      unassigned: deptTickets.filter((t) => !t.assigneeId).length,
    }
  })

  const topCategories = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxCat = topCategories[0]?.[1] ?? 1

  function handleTableCSV() {
    const headers = ["Department", "Total", "Open", "In Progress", "Resolved", "Critical", "Unassigned"]
    const rows = deptRows.map((r) => [r.dept, r.total, r.open, r.inProgress, r.resolved, r.critical, r.unassigned])
    const totals = ["TOTAL", deptRows.reduce((s,r)=>s+r.total,0), deptRows.reduce((s,r)=>s+r.open,0), deptRows.reduce((s,r)=>s+r.inProgress,0), deptRows.reduce((s,r)=>s+r.resolved,0), deptRows.reduce((s,r)=>s+r.critical,0), deptRows.reduce((s,r)=>s+r.unassigned,0)]
    const csv = [headers, ...rows, totals].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "department-report.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  async function handleTablePDF() {
    const { default: jsPDF } = await import("jspdf")
    const { default: autoTable } = await import("jspdf-autotable")
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text("Lionxcode Ticket Summary", 14, 16)
    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 23)
    autoTable(doc, {
      startY: 28,
      head: [["Department", "Total", "Open", "In Progress", "Resolved", "Critical", "Unassigned"]],
      body: [
        ...deptRows.map((r) => [r.dept, r.total, r.open, r.inProgress, r.resolved, r.critical, r.unassigned]),
        ["TOTAL", deptRows.reduce((s,r)=>s+r.total,0), deptRows.reduce((s,r)=>s+r.open,0), deptRows.reduce((s,r)=>s+r.inProgress,0), deptRows.reduce((s,r)=>s+r.resolved,0), deptRows.reduce((s,r)=>s+r.critical,0), deptRows.reduce((s,r)=>s+r.unassigned,0)],
      ],
      headStyles: { fillColor: [253, 224, 71], textColor: [30, 30, 30], fontStyle: "bold" },
      footStyles: { fillColor: [254, 249, 195], textColor: [30, 30, 30], fontStyle: "bold" },
      didParseCell: (data) => {
        if (data.row.index === deptRows.length) {
          data.cell.styles.fillColor = [254, 249, 195]
          data.cell.styles.fontStyle = "bold"
        }
      },
      styles: { fontSize: 10, cellPadding: 4 },
      alternateRowStyles: { fillColor: [255, 253, 235] },
    })
    doc.save("department-report.pdf")
  }

  function handleTablePrint() {
    const win = window.open("", "_blank")
    if (!win) return
    const rows = deptRows.map((r) => `<tr><td>${r.dept}</td><td>${r.total}</td><td>${r.open}</td><td>${r.inProgress}</td><td>${r.resolved}</td><td>${r.critical}</td><td>${r.unassigned}</td></tr>`).join("")
    const totals = `<tr style="font-weight:bold;background:#fef9c3"><td>TOTAL</td><td>${deptRows.reduce((s,r)=>s+r.total,0)}</td><td>${deptRows.reduce((s,r)=>s+r.open,0)}</td><td>${deptRows.reduce((s,r)=>s+r.inProgress,0)}</td><td>${deptRows.reduce((s,r)=>s+r.resolved,0)}</td><td>${deptRows.reduce((s,r)=>s+r.critical,0)}</td><td>${deptRows.reduce((s,r)=>s+r.unassigned,0)}</td></tr>`
    win.document.write(`<html><head><title>Department Report</title><style>body{font-family:sans-serif;padding:24px}h2{font-size:16px;margin-bottom:12px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;font-size:13px;text-align:left}th{background:#fef9c3;font-weight:bold}</style></head><body><h2>Department-wise Ticket Summary</h2><table><thead><tr><th>Department</th><th>Total</th><th>Open</th><th>In Progress</th><th>Resolved</th><th>Critical</th><th>Unassigned</th></tr></thead><tbody>${rows}${totals}</tbody></table></body></html>`)
    win.document.close()
    setTimeout(() => win.print(), 300)
  }

  function handleTableShare() {
    const lines = deptRows.map((r) => `${r.dept}: Total ${r.total} | Open ${r.open} | Resolved ${r.resolved} | Critical ${r.critical}`).join("\n")
    const text = `Department-wise Ticket Summary\n${lines}`
    if (navigator.share) { navigator.share({ title: "Department Report", text }) }
    else { navigator.clipboard.writeText(text) }
  }

  const STATUS_COLORS: Record<string, string> = { OPEN: "bg-blue-500", IN_PROGRESS: "bg-amber-500", PENDING: "bg-purple-500", RESOLVED: "bg-green-500", CLOSED: "bg-gray-400" }
  const PRIORITY_COLORS: Record<string, string> = { LOW: "bg-gray-400", MEDIUM: "bg-blue-500", HIGH: "bg-orange-500", CRITICAL: "bg-red-500" }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-yellow-600" />
          <h2 className="text-lg font-bold text-gray-900">Analytics Overview</h2>
        </div>
        <div className="flex gap-1 bg-yellow-100 rounded-xl p-1">
          <button onClick={() => setSubView("charts")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              subView === "charts" ? "bg-white text-yellow-700 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
            <BarChart2 className="h-3.5 w-3.5" /> Charts
          </button>
          <button onClick={() => setSubView("table")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              subView === "table" ? "bg-white text-yellow-700 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
            <Table2 className="h-3.5 w-3.5" /> Department Table
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-gray-500">Department:</span>
        {(["ALL", ...DEPARTMENTS] as (Department | "ALL")[]).map((d) => (
          <button key={d} onClick={() => setDeptFilter(d)}
            className={cn("text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium",
              deptFilter === d ? "bg-yellow-400 border-yellow-500 text-white" : "border-yellow-200 text-gray-500 hover:border-yellow-400 bg-white")}>
            {d === "ALL" ? "All" : d}
          </button>
        ))}
        <span className="text-xs font-semibold text-gray-500 ml-2">Status:</span>
        {(["ALL", "OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn("text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium",
              statusFilter === s ? "bg-yellow-400 border-yellow-500 text-white" : "border-yellow-200 text-gray-500 hover:border-yellow-400 bg-white")}>
            {s === "ALL" ? "All" : s.replace("_", " ")}
          </button>
        ))}
        {(deptFilter !== "ALL" || statusFilter !== "ALL") && (
          <button onClick={() => { setDeptFilter("ALL"); setStatusFilter("ALL") }}
            className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 font-medium">
            Clear
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Tickets",   value: stats.total,              icon: <Ticket className="h-4 w-4" />,        color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
          { label: "Unassigned",      value: stats.unassigned,         icon: <Clock className="h-4 w-4" />,         color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
          { label: "Critical",        value: stats.critical,           icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-700",    bg: "bg-red-50 border-red-200" },
          { label: "Resolution Rate", value: `${stats.resolutionRate}%`, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-700",  bg: "bg-green-50 border-green-200" },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-4 bg-white shadow-sm ${bg}`}>
            <div className={`flex items-center gap-1.5 mb-2 ${color}`}>{icon}<span className="text-xs font-semibold">{label}</span></div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {subView === "charts" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* By Status */}
          <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Tickets by Status</h3>
            <div className="space-y-2">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 shrink-0">{status.replace("_", " ")}</span>
                  <div className="flex-1 bg-yellow-50 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${STATUS_COLORS[status] ?? "bg-gray-400"}`} style={{ width: `${(count / stats.total) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Priority */}
          <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Tickets by Priority</h3>
            <div className="space-y-2">
              {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => {
                const count = stats.byPriority[p] ?? 0
                return (
                  <div key={p} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 shrink-0">{p}</span>
                    <div className="flex-1 bg-yellow-50 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full ${PRIORITY_COLORS[p]}`} style={{ width: stats.total > 0 ? `${(count / stats.total) * 100}%` : "0%" }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* By Category */}
          <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Top Categories</h3>
            <div className="space-y-2">
              {topCategories.map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 shrink-0">{cat.replace("_", " ")}</span>
                  <div className="flex-1 bg-yellow-50 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-yellow-400" style={{ width: `${(count / maxCat) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* HR Workload */}
          <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Users className="h-4 w-4 text-yellow-500" />
              <h3 className="text-sm font-bold text-gray-700">HR Team Workload</h3>
            </div>
            <div className="space-y-2">
              {MOCK_USERS.filter((u) => ["HR_COORDINATOR", "HR_SPECIALIST", "HR_MANAGER"].includes(u.role)).map((u) => {
                const assigned = visible.filter((t) => t.assigneeId === u.id).length
                return (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-white shrink-0">{u.avatar}</div>
                    <span className="text-xs text-gray-600 flex-1 truncate">{u.name}</span>
                    <span className="text-xs font-semibold text-gray-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-md">{assigned} ticket{assigned !== 1 ? "s" : ""}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Department-wise tabular view */
        <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-yellow-100 bg-yellow-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700">Department-wise Ticket Summary</h3>
            <div className="flex items-center gap-1.5">
              <button onClick={handleTableCSV} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 text-xs font-semibold transition-colors">
                <Download className="h-3.5 w-3.5" /> Excel
              </button>
              <button onClick={handleTablePDF} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors">
                <FileText className="h-3.5 w-3.5" /> PDF
              </button>
              <button onClick={handleTablePrint} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors">
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
              <button onClick={handleTableShare} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-yellow-300 text-yellow-700 hover:bg-yellow-100 text-xs font-semibold transition-colors">
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-yellow-50 border-b border-yellow-200">
                  {["Department", "Total", "Open", "In Progress", "Resolved", "Critical", "Unassigned"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-100">
                {deptRows.map((row) => (
                  <tr key={row.dept} className="hover:bg-yellow-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{row.dept}</td>
                    <td className="px-4 py-3"><span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold">{row.total}</span></td>
                    <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-semibold">{row.open}</span></td>
                    <td className="px-4 py-3"><span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">{row.inProgress}</span></td>
                    <td className="px-4 py-3"><span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-md font-semibold">{row.resolved}</span></td>
                    <td className="px-4 py-3">
                      {row.critical > 0
                        ? <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md font-semibold">{row.critical}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {row.unassigned > 0
                        ? <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-md font-semibold">{row.unassigned}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="bg-yellow-50 font-bold border-t-2 border-yellow-300">
                  <td className="px-4 py-3 text-gray-800">TOTAL</td>
                  <td className="px-4 py-3 text-gray-800">{deptRows.reduce((s, r) => s + r.total, 0)}</td>
                  <td className="px-4 py-3 text-blue-700">{deptRows.reduce((s, r) => s + r.open, 0)}</td>
                  <td className="px-4 py-3 text-amber-700">{deptRows.reduce((s, r) => s + r.inProgress, 0)}</td>
                  <td className="px-4 py-3 text-green-700">{deptRows.reduce((s, r) => s + r.resolved, 0)}</td>
                  <td className="px-4 py-3 text-red-700">{deptRows.reduce((s, r) => s + r.critical, 0)}</td>
                  <td className="px-4 py-3 text-orange-700">{deptRows.reduce((s, r) => s + r.unassigned, 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
