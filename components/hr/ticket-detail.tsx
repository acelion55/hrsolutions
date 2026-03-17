"use client"

import { useState } from "react"
import {
  Lock, Send, Trash2, UserCheck, AlertTriangle, Clock,
  CheckCircle2, Circle, Loader2, XCircle, Eye, MessageSquare, FileText
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Ticket, TicketStatus, User } from "@/lib/types"
import { useAuth } from "./auth-context"
import {
  canUpdateStatus, canPostInternalNote, canDeleteTicket,
  canAssignTicket, canViewTicket, SENSITIVE_CATEGORIES
} from "@/lib/permissions"
import {
  updateTicketStatus, assignTicket, addComment,
  softDeleteTicket, addAuditLog, MOCK_USERS,
  type TicketComment
} from "@/lib/data"

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
  ticket: Ticket
  onUpdate: () => void
  onDelete: () => void
}

export function TicketDetail({ ticket, onUpdate, onDelete }: Props) {
  const { currentUser } = useAuth()
  const [comment, setComment] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [activeTab, setActiveTab] = useState<"comments" | "details">("comments")

  const isSensitive = SENSITIVE_CATEGORIES.includes(ticket.category)
  const canSeeInternalNotes = canPostInternalNote(currentUser)
  const hrUsers: User[] = MOCK_USERS.filter((u) =>
    ["HR_COORDINATOR", "HR_SPECIALIST", "HR_MANAGER"].includes(u.role)
  )

  // Log view for sensitive tickets
  if (isSensitive) {
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType: "TICKET_VIEWED",
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      oldValue: null,
      newValue: null,
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.100",
    })
  }

  function handleStatusChange(status: TicketStatus) {
    const old = ticket.status
    updateTicketStatus(ticket.id, status)
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType: "STATUS_CHANGED",
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      oldValue: old,
      newValue: status,
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.100",
    })
    onUpdate()
  }

  function handleAssign(userId: string) {
    const user = MOCK_USERS.find((u) => u.id === userId)
    if (!user) return
    assignTicket(ticket.id, user.id, user.name)
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType: "ASSIGNED",
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      oldValue: ticket.assigneeName,
      newValue: user.name,
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.100",
    })
    onUpdate()
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    const commentData: Omit<TicketComment, "id"> = {
      ticketId: ticket.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content: comment.trim(),
      isInternal,
      createdAt: new Date().toISOString(),
    }
    addComment(ticket.id, commentData)
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType: isInternal ? "INTERNAL_NOTE_ADDED" : "COMMENT_ADDED",
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      oldValue: null,
      newValue: comment.trim().slice(0, 80),
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.100",
    })
    setComment("")
    onUpdate()
  }

  function handleDelete() {
    softDeleteTicket(ticket.id)
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType: "TICKET_DELETED",
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      oldValue: "ACTIVE",
      newValue: "SOFT_DELETED",
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.100",
    })
    onDelete()
  }

  const visibleComments = ticket.comments.filter((c) =>
    !c.isInternal || canSeeInternalNotes
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-700/50">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {isSensitive && (
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-0.5">
                <Lock className="h-3 w-3 text-amber-400" />
                <span className="text-xs text-amber-300">Sensitive</span>
              </div>
            )}
            <h2 className="text-base font-semibold text-white leading-tight">{ticket.title}</h2>
          </div>
          {canDeleteTicket(currentUser) && (
            <button
              onClick={handleDelete}
              className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Soft delete (audit logged)"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className={cn("text-xs border flex items-center gap-1", STATUS_CONFIG[ticket.status].color)}>
            {STATUS_CONFIG[ticket.status].icon}
            {STATUS_CONFIG[ticket.status].label}
          </Badge>
          <Badge className={cn("text-xs border", PRIORITY_COLOR[ticket.priority])}>
            {ticket.priority}
          </Badge>
          <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded-md">
            {ticket.category.replace("_", " ")}
          </span>
          <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded-md">
            {ticket.department}
          </span>
        </div>

        {/* Status changer */}
        {canUpdateStatus(currentUser, ticket) && (
          <div className="flex gap-1.5 flex-wrap">
            {(["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"] as TicketStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-lg border transition-colors",
                  ticket.status === s
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300"
                )}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700/50">
        <button
          onClick={() => setActiveTab("comments")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors",
            activeTab === "comments"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-300"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Comments ({visibleComments.length})
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors",
            activeTab === "details"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-300"
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          Details
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "comments" ? (
          <div className="p-4 space-y-3">
            {/* Description */}
            <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {ticket.creatorName.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-300">{ticket.creatorName}</span>
                <span className="text-xs text-gray-600">· {new Date(ticket.createdAt).toLocaleString()}</span>
                <Badge className="text-xs bg-gray-700/50 text-gray-400 border-0 ml-auto">Original</Badge>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{ticket.description}</p>
            </div>

            {/* Comments */}
            {visibleComments.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "rounded-xl p-3 border",
                  c.isInternal
                    ? "bg-amber-500/5 border-amber-500/20"
                    : "bg-gray-800/40 border-gray-700/50"
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                    c.isInternal ? "bg-amber-600" : "bg-gray-600"
                  )}>
                    {c.authorName.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-300">{c.authorName}</span>
                  <span className="text-xs text-gray-600">· {new Date(c.createdAt).toLocaleString()}</span>
                  {c.isInternal && (
                    <div className="flex items-center gap-1 ml-auto bg-amber-500/10 border border-amber-500/30 rounded-md px-1.5 py-0.5">
                      <Lock className="h-2.5 w-2.5 text-amber-400" />
                      <span className="text-xs text-amber-300">Internal</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{c.content}</p>
              </div>
            ))}

            {visibleComments.length === 0 && (
              <p className="text-center text-sm text-gray-600 py-6">No comments yet</p>
            )}
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
                <div key={label} className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
                  <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                  <p className="text-sm text-gray-200 font-medium">{value}</p>
                </div>
              ))}
            </div>

            {/* Assign */}
            {canAssignTicket(currentUser) && (
              <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
                <div className="flex items-center gap-1.5 mb-2">
                  <UserCheck className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-300">Assign To</p>
                </div>
                <div className="space-y-1">
                  {hrUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleAssign(u.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                        ticket.assigneeId === u.id
                          ? "bg-blue-600/20 border border-blue-500/40 text-blue-300"
                          : "hover:bg-gray-700/50 text-gray-400 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white">
                          {u.avatar}
                        </div>
                        <span>{u.name}</span>
                      </div>
                      <span className="text-xs text-gray-600">{u.role.replace("_", " ")}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment input */}
      <div className="p-4 border-t border-gray-700/50">
        {canSeeInternalNotes && (
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setIsInternal(false)}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors",
                !isInternal ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "border-gray-700 text-gray-500 hover:text-gray-300"
              )}
            >
              <MessageSquare className="h-3 w-3" /> Public
            </button>
            <button
              onClick={() => setIsInternal(true)}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors",
                isInternal ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "border-gray-700 text-gray-500 hover:text-gray-300"
              )}
            >
              <Lock className="h-3 w-3" /> Internal Note
            </button>
          </div>
        )}
        <form onSubmit={handleComment} className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={isInternal ? "Add internal note (HR only)..." : "Add a comment..."}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 border",
              isInternal
                ? "bg-amber-500/5 border-amber-500/20 focus:ring-amber-500/40"
                : "bg-gray-800/60 border-gray-700 focus:ring-blue-500/40"
            )}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!comment.trim()}
            className={cn(
              "rounded-xl px-3",
              isInternal ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
