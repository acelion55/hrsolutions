"use client"

import { useState, useRef } from "react"
import {
  ArrowLeft, Ticket, MapPin, Building2, FolderOpen,
  AlignLeft, Tag, UserCheck, Paperclip, FileText,
  ImageIcon, Trash2, CheckCircle2, AlertTriangle, Bug, Wrench, ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TicketCategory, TicketPriority, Department, TicketType } from "@/lib/types"
import { useAuth } from "./auth-context"
import { createTicket, addAuditLog, MOCK_USERS } from "@/lib/data"
import { SENSITIVE_CATEGORIES } from "@/lib/permissions"
import { toast } from "sonner"

const CATEGORIES: TicketCategory[] = ["GENERAL", "IT", "PAYROLL", "BENEFITS", "GRIEVANCE", "MEDICAL", "ONBOARDING", "OFFBOARDING"]
const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
const DEPARTMENTS: Department[] = ["ENGINEERING", "FINANCE", "OPERATIONS", "MARKETING", "HR"]
const LOCATIONS = ["Mumbai Office", "Delhi Office", "Bangalore Office", "Hyderabad Office", "Chennai Office", "Remote"]
const PROJECTS = ["Internal IT", "Payroll System", "HR Benefits", "HR Medical", "Onboarding", "General", "Marketing Campaign", "Finance Q1", "Engineering Sprint"]

interface AttachmentFile { name: string; size: number; type: string; url: string }
interface Props { onBack: () => void; onCreated: () => void }

const PRIORITY_COLORS: Record<TicketPriority, { active: string; idle: string }> = {
  LOW:      { active: "border-gray-400 bg-gray-100 text-gray-700",       idle: "border-gray-200 text-gray-400 hover:border-gray-300" },
  MEDIUM:   { active: "border-blue-400 bg-blue-50 text-blue-700",        idle: "border-gray-200 text-gray-400 hover:border-blue-300" },
  HIGH:     { active: "border-orange-400 bg-orange-50 text-orange-700",  idle: "border-gray-200 text-gray-400 hover:border-orange-300" },
  CRITICAL: { active: "border-red-400 bg-red-50 text-red-700",           idle: "border-gray-200 text-gray-400 hover:border-red-300" },
}

const sel = "w-full rounded-xl bg-white border border-gray-200 text-gray-800 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 appearance-none"

export function CreateTaskForm({ onBack, onCreated }: Props) {
  const { currentUser } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<TicketCategory>("GENERAL")
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM")
  const [department, setDepartment] = useState<Department>(currentUser?.department ?? "ENGINEERING")
  const [location, setLocation] = useState(LOCATIONS[0])
  const [projectName, setProjectName] = useState(PROJECTS[0])
  const [ticketType, setTicketType] = useState<TicketType>("SERVICE_REQUEST")
  const [assigneeId, setAssigneeId] = useState("")
  const [attachments, setAttachments] = useState<AttachmentFile[]>([])
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!currentUser) return null
  const user = currentUser
  const assignableUsers = MOCK_USERS.filter((u) => u.role !== "SYSTEM_ADMIN" && u.id !== user.id)

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
    const assignee = MOCK_USERS.find((u) => u.id === assigneeId)
    const ticket = createTicket({
      title: title.trim(), description: description.trim(),
      category, priority, status: "OPEN", department,
      location, projectName, ticketType,
      attachments: attachments.map((a) => ({ name: a.name, type: a.type, url: a.url })),
      creatorId: user.id, creatorName: user.name,
      assigneeId: assignee?.id ?? null, assigneeName: assignee?.name ?? null,
    })
    addAuditLog({ userId: user.id, userName: user.name, userRole: user.role, actionType: "TICKET_CREATED", ticketId: ticket.id, ticketTitle: ticket.title, oldValue: null, newValue: "OPEN", timestamp: new Date().toISOString(), ipAddress: "192.168.1.100" })
    setSubmitted(true)
    setTimeout(() => { toast.success("Ticket submitted!", { description: ticket.title }); onCreated() }, 1500)
  }

  const isSensitive = SENSITIVE_CATEGORIES.includes(category)

  if (submitted) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-20 w-20 rounded-full bg-green-100 border-4 border-green-300 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ticket Submitted!</h2>
          <p className="text-gray-500 text-sm">Your ticket has been created successfully.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-yellow-200 shadow-sm px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
            <Ticket className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-sm font-bold text-gray-900">Create New Task</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">

          {/* ── Desktop: 2 columns | Mobile: 1 column ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* ── LEFT COLUMN ── */}
            <div className="space-y-5">

              {/* Ticket Type */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-yellow-500" /> Ticket Type
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {([["BUG", "Bug Report", <Bug key="b" className="h-4 w-4" />], ["SERVICE_REQUEST", "Service Request", <Wrench key="s" className="h-4 w-4" />]] as [TicketType, string, React.ReactNode][]).map(([val, label, icon]) => (
                    <button key={val} type="button" onClick={() => setTicketType(val)}
                      className={cn("flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all",
                        ticketType === val ? "border-yellow-400 bg-yellow-50 text-yellow-800" : "border-gray-200 bg-white text-gray-500 hover:border-yellow-300")}>
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title + Description */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <AlignLeft className="h-3.5 w-3.5 text-yellow-500" /> Task Details
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title <span className="text-red-400">*</span></label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} required
                    placeholder="Brief description of the issue or request"
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description <span className="text-red-400">*</span></label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5}
                    placeholder="Provide detailed information about the issue or request..."
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-colors resize-none" />
                </div>
              </div>

              {/* Category + Priority */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category & Priority</p>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                  <div className="relative">
                    <select value={category} onChange={(e) => setCategory(e.target.value as TicketCategory)} className={sel}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Priority</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRIORITIES.map((p) => (
                      <button key={p} type="button" onClick={() => setPriority(p)}
                        className={cn("py-2 rounded-xl border-2 text-xs font-bold transition-all",
                          priority === p ? PRIORITY_COLORS[p].active : PRIORITY_COLORS[p].idle)}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                {isSensitive && (
                  <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700"><strong>Sensitive Category:</strong> Restricted to HR Managers only.</p>
                  </div>
                )}
              </div>

            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-5">

              {/* Location + Department + Project */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-yellow-500" /> Location & Project
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-yellow-500" /> Location
                    </label>
                    <div className="relative">
                      <select value={location} onChange={(e) => setLocation(e.target.value)} className={sel}>
                        {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-yellow-500" /> Department
                    </label>
                    <div className="relative">
                      <select value={department} onChange={(e) => setDepartment(e.target.value as Department)} className={sel}>
                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <FolderOpen className="h-3 w-3 text-yellow-500" /> Project Name
                  </label>
                  <div className="relative">
                    <select value={projectName} onChange={(e) => setProjectName(e.target.value)} className={sel}>
                      {PROJECTS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Assign Employee */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-yellow-500" /> Assign To <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  <button type="button" onClick={() => setAssigneeId("")}
                    className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all text-left",
                      assigneeId === "" ? "border-yellow-400 bg-yellow-50 text-yellow-800 font-semibold" : "border-gray-200 text-gray-500 hover:border-yellow-300")}>
                    <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">?</div>
                    <span className="text-sm">Unassigned</span>
                  </button>
                  {assignableUsers.map((u) => (
                    <button key={u.id} type="button" onClick={() => setAssigneeId(u.id)}
                      className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all text-left",
                        assigneeId === u.id ? "border-yellow-400 bg-yellow-50 text-yellow-800 font-semibold" : "border-gray-200 text-gray-500 hover:border-yellow-300")}>
                      <div className="h-7 w-7 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-white shrink-0">{u.avatar}</div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.role.replace(/_/g, " ")}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 text-yellow-500" /> Attachments
                </p>
                <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFiles} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-1.5 px-4 py-5 rounded-xl border-2 border-dashed border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-400 transition-colors">
                  <Paperclip className="h-5 w-5" />
                  <span className="text-sm font-semibold">Click to attach files</span>
                  <span className="text-xs text-gray-400">Images, PDF, Word, Excel</span>
                </button>
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
                        {f.type.startsWith("image/") ? <ImageIcon className="h-4 w-4 text-yellow-500 shrink-0" /> : <FileText className="h-4 w-4 text-yellow-500 shrink-0" />}
                        <span className="text-xs text-gray-700 flex-1 truncate font-medium">{f.name}</span>
                        <span className="text-xs text-gray-400">{formatSize(f.size)}</span>
                        <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Submit row — full width */}
          <div className="flex gap-3 mt-5 pb-6">
            <button type="button" onClick={onBack}
              className="flex-1 lg:flex-none lg:w-40 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2">
              <Ticket className="h-4 w-4" /> Submit Ticket
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}
