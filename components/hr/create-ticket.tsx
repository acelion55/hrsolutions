"use client"

import { useState, useRef } from "react"
import { X, AlertTriangle, Paperclip, FileText, ImageIcon, Trash2, Tag, AlignLeft, Building2, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TicketCategory, TicketPriority, Department, Ticket } from "@/lib/types"
import { useAuth } from "./auth-context"
import { createTicket, addAuditLog } from "@/lib/data"
import { SENSITIVE_CATEGORIES } from "@/lib/permissions"
import { toast } from "sonner"

const CATEGORIES: TicketCategory[] = ["GENERAL", "IT", "PAYROLL", "BENEFITS", "GRIEVANCE", "MEDICAL", "ONBOARDING", "OFFBOARDING"]
const DEPARTMENTS: Department[] = ["ENGINEERING", "FINANCE", "OPERATIONS", "MARKETING", "HR"]

const PRIORITY_CONFIG: { value: TicketPriority; label: string; color: string; active: string }[] = [
  { value: "LOW",      label: "Low",      color: "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50",         active: "border-gray-400 bg-gray-100 text-gray-700 font-bold" },
  { value: "MEDIUM",   label: "Medium",   color: "border-blue-200 text-blue-500 hover:border-blue-300 hover:bg-blue-50",         active: "border-blue-400 bg-blue-50 text-blue-700 font-bold" },
  { value: "HIGH",     label: "High",     color: "border-orange-200 text-orange-500 hover:border-orange-300 hover:bg-orange-50", active: "border-orange-400 bg-orange-50 text-orange-700 font-bold" },
  { value: "CRITICAL", label: "Critical", color: "border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50",             active: "border-red-400 bg-red-50 text-red-700 font-bold" },
]

interface AttachmentFile { name: string; size: number; type: string; url: string }
interface Props { onClose: () => void; onCreated: (ticket: Ticket) => void }

export function CreateTicketForm({ onClose, onCreated }: Props) {
  const { currentUser } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<TicketCategory>("GENERAL")
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM")
  const [department, setDepartment] = useState<Department>(currentUser?.department ?? "ENGINEERING")
  const [attachments, setAttachments] = useState<AttachmentFile[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  if (!currentUser) return null
  const user = currentUser

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setAttachments((prev) => [...prev, ...files.map((f) => ({ name: f.name, size: f.size, type: f.type, url: URL.createObjectURL(f) }))])
    e.target.value = ""
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    const ticket = createTicket({
      title: title.trim(), description: description.trim(),
      category, priority, status: "OPEN", department,
      location: user.department + " Office", projectName: "General",
      ticketType: "SERVICE_REQUEST", attachments: [],
      creatorId: user.id, creatorName: user.name, assigneeId: null, assigneeName: null,
    })
    addAuditLog({ userId: user.id, userName: user.name, userRole: user.role, actionType: "TICKET_CREATED", ticketId: ticket.id, ticketTitle: ticket.title, oldValue: null, newValue: "OPEN", timestamp: new Date().toISOString(), ipAddress: "192.168.1.100" })
    toast.success("Ticket created!", { description: ticket.title })
    onCreated(ticket)
    onClose()
  }

  const isSensitive = SENSITIVE_CATEGORIES.includes(category)
  const sel = "w-full rounded-xl bg-white border border-gray-200 text-gray-800 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 appearance-none cursor-pointer"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col border border-gray-100">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-t-2xl">
          <h2 className="text-base font-bold text-white">New Support Ticket</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">

          {/* Title */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
              <AlignLeft className="h-3.5 w-3.5 text-yellow-500" /> Title <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              required
              className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:bg-white transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
              <AlignLeft className="h-3.5 w-3.5 text-yellow-500" /> Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information..."
              rows={3}
              required
              className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:bg-white transition-colors resize-none"
            />
          </div>

          {/* Category + Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                <Tag className="h-3.5 w-3.5 text-yellow-500" /> Category
              </label>
              <div className="relative">
                <select value={category} onChange={(e) => setCategory(e.target.value as TicketCategory)} className={sel}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                <Building2 className="h-3.5 w-3.5 text-yellow-500" /> Department
              </label>
              <div className="relative">
                <select value={department} onChange={(e) => setDepartment(e.target.value as Department)} className={sel}>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_CONFIG.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "py-2 rounded-xl border-2 text-xs transition-all",
                    priority === p.value ? p.active : p.color
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
              <Paperclip className="h-3.5 w-3.5 text-yellow-500" /> Attachments
            </label>
            <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFiles} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-400 text-sm font-medium transition-colors"
            >
              <Paperclip className="h-4 w-4" /> Click to attach images or PDFs
            </button>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachments.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
                    {f.type.startsWith("image/") ? <ImageIcon className="h-4 w-4 text-yellow-500 shrink-0" /> : <FileText className="h-4 w-4 text-yellow-500 shrink-0" />}
                    <span className="text-xs text-gray-700 flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-gray-400">{formatSize(f.size)}</span>
                    <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sensitive warning */}
          {isSensitive && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700"><strong>Sensitive Category:</strong> Restricted to HR Managers only.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-bold transition-colors shadow-sm"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
