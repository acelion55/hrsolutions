"use client"

import { useState } from "react"
import {
  Lock, Send, Trash2, UserCheck, Clock,
  CheckCircle2, Circle, Loader2, XCircle,
  MessageSquare, FileText, Download, Printer, Share2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Ticket, TicketStatus, User } from "@/lib/types"
import { useAuth } from "./auth-context"
import { canUpdateStatus, canPostInternalNote, canDeleteTicket, canAssignTicket, SENSITIVE_CATEGORIES } from "@/lib/permissions"
import { updateTicketStatus, assignTicket, addComment, softDeleteTicket, addAuditLog, MOCK_USERS, type TicketComment } from "@/lib/data"
import { toast } from "sonner"

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

interface Props { ticket: Ticket; onUpdate: () => void; onDelete: () => void }

export function TicketDetail({ ticket, onUpdate, onDelete }: Props) {
  const { currentUser } = useAuth()
  const [comment, setComment] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [activeTab, setActiveTab] = useState<"comments" | "details">("comments")

  if (!currentUser) return null
  const user = currentUser

  const isSensitive = SENSITIVE_CATEGORIES.includes(ticket.category)
  const canSeeInternalNotes = canPostInternalNote(user)
  const hrUsers: User[] = MOCK_USERS.filter((u) => ["HR_COORDINATOR", "HR_SPECIALIST", "HR_MANAGER"].includes(u.role))

  if (isSensitive) {
    addAuditLog({ userId: user.id, userName: user.name, userRole: user.role, actionType: "TICKET_VIEWED", ticketId: ticket.id, ticketTitle: ticket.title, oldValue: null, newValue: null, timestamp: new Date().toISOString(), ipAddress: "192.168.1.100" })
  }

  function handleStatusChange(status: TicketStatus) {
    updateTicketStatus(ticket.id, status)
    addAuditLog({ userId: user.id, userName: user.name, userRole: user.role, actionType: "STATUS_CHANGED", ticketId: ticket.id, ticketTitle: ticket.title, oldValue: ticket.status, newValue: status, timestamp: new Date().toISOString(), ipAddress: "192.168.1.100" })
    toast.success(`Status updated to ${STATUS_CONFIG[status].label}`)
    onUpdate()
  }

  function handleAssign(userId: string) {
    const assignee = MOCK_USERS.find((u) => u.id === userId)
    if (!assignee) return
    assignTicket(ticket.id, assignee.id, assignee.name)
    addAuditLog({ userId: user.id, userName: user.name, userRole: user.role, actionType: "ASSIGNED", ticketId: ticket.id, ticketTitle: ticket.title, oldValue: ticket.assigneeName, newValue: assignee.name, timestamp: new Date().toISOString(), ipAddress: "192.168.1.100" })
    toast.success("Ticket assigned!", { description: `Successfully assigned to ${assignee.name}` })
    onUpdate()
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    const commentData: Omit<TicketComment, "id"> = { ticketId: ticket.id, authorId: user.id, authorName: user.name, authorRole: user.role, content: comment.trim(), isInternal, createdAt: new Date().toISOString() }
    addComment(ticket.id, commentData)
    addAuditLog({ userId: user.id, userName: user.name, userRole: user.role, actionType: isInternal ? "INTERNAL_NOTE_ADDED" : "COMMENT_ADDED", ticketId: ticket.id, ticketTitle: ticket.title, oldValue: null, newValue: comment.trim().slice(0, 80), timestamp: new Date().toISOString(), ipAddress: "192.168.1.100" })
    setComment("")
    onUpdate()
  }

  function handleDelete() {
    softDeleteTicket(ticket.id)
    addAuditLog({ userId: user.id, userName: user.name, userRole: user.role, actionType: "TICKET_DELETED", ticketId: ticket.id, ticketTitle: ticket.title, oldValue: "ACTIVE", newValue: "SOFT_DELETED", timestamp: new Date().toISOString(), ipAddress: "192.168.1.100" })
    toast.success("Ticket deleted (soft delete)")
    onDelete()
  }

  // ── Export helpers ──────────────────────────────────────────────────────────
  function handlePrint() {
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`<html><head><title>Ticket #${ticket.id}</title><style>body{font-family:sans-serif;padding:24px;color:#111}h1{font-size:18px}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border:1px solid #ddd;padding:8px;font-size:13px}th{background:#f5f5f5}</style></head><body>
      <h1>${ticket.title}</h1>
      <table><tr><th>Field</th><th>Value</th></tr>
      <tr><td>ID</td><td>#${ticket.id}</td></tr>
      <tr><td>Status</td><td>${ticket.status}</td></tr>
      <tr><td>Priority</td><td>${ticket.priority}</td></tr>
      <tr><td>Category</td><td>${ticket.category}</td></tr>
      <tr><td>Department</td><td>${ticket.department}</td></tr>
      <tr><td>Created by</td><td>${ticket.creatorName}</td></tr>
      <tr><td>Assignee</td><td>${ticket.assigneeName ?? "Unassigned"}</td></tr>
      <tr><td>Created</td><td>${new Date(ticket.createdAt).toLocaleString()}</td></tr>
      <tr><td>Description</td><td>${ticket.description}</td></tr>
      </table></body></html>`)
    win.document.close()
    win.print()
  }

  function handleExcel() {
    const rows = [
      ["ID", "Title", "Status", "Priority", "Category", "Department", "Creator", "Assignee", "Created"],
      [ticket.id, ticket.title, ticket.status, ticket.priority, ticket.category, ticket.department, ticket.creatorName, ticket.assigneeName ?? "Unassigned", new Date(ticket.createdAt).toLocaleString()],
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `ticket-${ticket.id}.csv`; a.click()
    URL.revokeObjectURL(url)
    toast.success("Exported as CSV")
  }

  function handleShare() {
    const text = `Ticket #${ticket.id}: ${ticket.title}\nStatus: ${ticket.status} | Priority: ${ticket.priority}\nCategory: ${ticket.category} | Dept: ${ticket.department}`
    if (navigator.share) {
      navigator.share({ title: `Ticket #${ticket.id}`, text })
    } else {
      navigator.clipboard.writeText(text)
      toast.success("Ticket details copied to clipboard!")
    }
  }

  const visibleComments = ticket.comments.filter((c) => !c.isInternal || canSeeInternalNotes)

  return (
    <div className="flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-yellow-100">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {isSensitive && (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5">
                <Lock className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-amber-600 font-medium">Sensitive</span>
              </div>
            )}
            <h2 className="text-base font-bold text-gray-900 leading-tight">{ticket.title}</h2>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {/* Excel */}
            <button onClick={handleExcel} title="Export CSV" className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
              <Download className="h-4 w-4" />
            </button>
            {/* Print */}
            <button onClick={handlePrint} title="Print" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <Printer className="h-4 w-4" />
            </button>
            {/* Share */}
            <button onClick={handleShare} title="Share" className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            {canDeleteTicket(user) && (
              <button onClick={handleDelete} title="Delete (soft)" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2">
          <Badge className={cn("text-xs border flex items-center gap-1 font-medium", STATUS_CONFIG[ticket.status].color)}>
            {STATUS_CONFIG[ticket.status].icon}{STATUS_CONFIG[ticket.status].label}
          </Badge>
          <Badge className={cn("text-xs border font-medium", PRIORITY_COLOR[ticket.priority])}>{ticket.priority}</Badge>
          <span className="text-xs text-gray-500 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-200">{ticket.category.replace("_", " ")}</span>
          <span className="text-xs text-gray-500 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-200">{ticket.department}</span>
        </div>

        {canUpdateStatus(user, ticket) && (
          <div className="flex gap-1.5 flex-wrap">
            {(["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"] as TicketStatus[]).map((s) => (
              <button key={s} onClick={() => handleStatusChange(s)}
                className={cn("text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium",
                  ticket.status === s ? "bg-yellow-400 border-yellow-500 text-white" : "border-yellow-200 text-gray-500 hover:border-yellow-400 hover:text-gray-700 bg-white")}>
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-yellow-100 bg-yellow-50">
        {(["comments", "details"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors font-medium capitalize",
              activeTab === tab ? "border-yellow-500 text-yellow-700 bg-white" : "border-transparent text-gray-400 hover:text-gray-600")}>
            {tab === "comments" ? <MessageSquare className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
            {tab === "comments" ? `Comments (${visibleComments.length})` : "Details"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-yellow-50">
        {activeTab === "comments" ? (
          <div className="p-4 space-y-3">
            <div className="bg-white rounded-xl p-3 border border-yellow-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-6 w-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-white">{ticket.creatorName.charAt(0)}</div>
                <span className="text-sm font-semibold text-gray-700">{ticket.creatorName}</span>
                <span className="text-xs text-gray-400">· {new Date(ticket.createdAt).toLocaleString()}</span>
                <Badge className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 ml-auto">Original</Badge>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{ticket.description}</p>
            </div>

            {visibleComments.map((c) => (
              <div key={c.id} className={cn("rounded-xl p-3 border shadow-sm", c.isInternal ? "bg-amber-50 border-amber-200" : "bg-white border-yellow-200")}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white", c.isInternal ? "bg-amber-500" : "bg-gray-400")}>
                    {c.authorName.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{c.authorName}</span>
                  <span className="text-xs text-gray-400">· {new Date(c.createdAt).toLocaleString()}</span>
                  {c.isInternal && (
                    <div className="flex items-center gap-1 ml-auto bg-amber-100 border border-amber-200 rounded-md px-1.5 py-0.5">
                      <Lock className="h-2.5 w-2.5 text-amber-600" />
                      <span className="text-xs text-amber-700 font-medium">Internal</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{c.content}</p>
              </div>
            ))}
            {visibleComments.length === 0 && <p className="text-center text-sm text-gray-400 py-6">No comments yet</p>}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Ticket ID", value: `#${ticket.id}` },
                { label: "Created by", value: ticket.creatorName },
                { label: "Department", value: ticket.department },
                { label: "Created", value: new Date(ticket.createdAt).toLocaleDateString() },
                { label: "Last Updated", value: new Date(ticket.updatedAt).toLocaleDateString() },
                { label: "Assignee", value: ticket.assigneeName ?? "Unassigned" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl p-3 border border-yellow-200 shadow-sm">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm text-gray-800 font-semibold">{value}</p>
                </div>
              ))}
            </div>

            {canAssignTicket(user) && (
              <div className="bg-white rounded-xl p-3 border border-yellow-200 shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <UserCheck className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm font-semibold text-gray-700">Assign To</p>
                </div>
                <div className="space-y-1">
                  {hrUsers.map((u) => (
                    <button key={u.id} onClick={() => handleAssign(u.id)}
                      className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors border",
                        ticket.assigneeId === u.id ? "bg-yellow-50 border-yellow-300 text-yellow-800" : "hover:bg-yellow-50 text-gray-600 border-transparent hover:border-yellow-200")}>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">{u.avatar}</div>
                        <span>{u.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{u.role.replace("_", " ")}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment input */}
      <div className="p-4 border-t border-yellow-100 bg-white">
        {canSeeInternalNotes && (
          <div className="flex gap-2 mb-2">
            {[false, true].map((internal) => (
              <button key={String(internal)} onClick={() => setIsInternal(internal)}
                className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
                  isInternal === internal
                    ? internal ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-yellow-50 border-yellow-300 text-yellow-700"
                    : "border-gray-200 text-gray-400 hover:text-gray-600")}>
                {internal ? <><Lock className="h-3 w-3" /> Internal Note</> : <><MessageSquare className="h-3 w-3" /> Public</>}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleComment} className="flex gap-2">
          <input value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder={isInternal ? "Add internal note (HR only)..." : "Add a comment..."}
            className={cn("flex-1 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 border",
              isInternal ? "bg-amber-50 border-amber-200 focus:ring-amber-300" : "bg-yellow-50 border-yellow-200 focus:ring-yellow-300")} />
          <Button type="submit" size="sm" disabled={!comment.trim()}
            className={cn("rounded-xl px-3 text-white", isInternal ? "bg-amber-500 hover:bg-amber-600" : "bg-yellow-400 hover:bg-yellow-500")}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
