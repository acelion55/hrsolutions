"use client"

import { useState, useRef } from "react"
import { ArrowLeft, Upload, X, FileText, ImageIcon, Bug, Wrench, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "./auth-context"
import { createTicket, addAuditLog, MOCK_USERS } from "@/lib/data"
import { SENSITIVE_CATEGORIES } from "@/lib/permissions"
import type { TicketCategory, TicketPriority, Department, TicketType } from "@/lib/types"
import { toast } from "sonner"

const CATEGORIES: TicketCategory[] = ["GENERAL", "IT", "PAYROLL", "BENEFITS", "GRIEVANCE", "MEDICAL", "ONBOARDING", "OFFBOARDING"]
const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
const DEPARTMENTS: Department[] = ["ENGINEERING", "FINANCE", "OPERATIONS", "MARKETING", "HR"]
const LOCATIONS = ["Mumbai Office", "Delhi Office", "Bangalore Office", "Hyderabad Office", "Chennai Office", "Remote"]

interface Attachment { name: string; type: string; url: string }

interface Props {
  onBack: () => void
  onCreated: () => void
}

export function CreateTaskForm({ onBack, onCreated }: Props) {
  const { currentUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState(LOCATIONS[0])
  const [department, setDepartment] = useState<Department>(currentUser!.department)
  const [projectName, setProjectName] = useState("")
  const [category, setCategory] = useState<TicketCategory>("GENERAL")
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM")
  const [ticketType, setTicketType] = useState<TicketType>("SERVICE_REQUEST")
  const [assigneeId, setAssigneeId] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [submitting, setSubmitting] = useState(false)

  const assignableUsers = MOCK_USERS.filter((u) => u.role !== "SYSTEM_ADMIN" && u.id !== currentUser!.id)
  const departments = Array.from(new Set(assignableUsers.map((u) => u.department)))
  const isSensitive = SENSITIVE_CATEGORIES.includes(category)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"]
    Array.from(files).forEach((file) => {
      if (!allowed.includes(file.type)) { toast.error(`${file.name} — only PDF & images allowed`); return }
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} — max 5MB allowed`); return }
      const url = URL.createObjectURL(file)
      setAttachments((prev) => [...prev, { name: file.name, type: file.type, url }])
    })
  }

  function removeAttachment(idx: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !projectName.trim()) return
    setSubmitting(true)

    const assignee = MOCK_USERS.find((u) => u.id === assigneeId)
    const ticket = createTicket({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: "OPEN",
      department,
      location,
      projectName: projectName.trim(),
      ticketType,
      attachments,
      creatorId: currentUser!.id,
      creatorName: currentUser!.name,
      assigneeId: assignee?.id ?? null,
      assigneeName: assignee?.name ?? null,
    })

    addAuditLog({
      userId: currentUser!.id,
      userName: currentUser!.name,
      userRole: currentUser!.role,
      actionType: "TICKET_CREATED",
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      oldValue: null,
      newValue: "OPEN",
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.100",
    })

    toast.success("Ticket created successfully!", { description: ticket.title })
    setSubmitting(false)
    onCreated()
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="h-4 w-px bg-gray-700" />
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
          </div>
          <p className="text-sm font-semibold text-white">Create Task</p>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Ticket Type toggle */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Ticket Type</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: "BUG", icon: <Bug className="h-5 w-5" />, label: "Bug", desc: "Report a defect or issue", color: "border-red-500/50 bg-red-500/10 text-red-300" },
                  { value: "SERVICE_REQUEST", icon: <Wrench className="h-5 w-5" />, label: "Service Request", desc: "Request a service or change", color: "border-blue-500/50 bg-blue-500/10 text-blue-300" },
                ] as const).map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTicketType(t.value)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                      ticketType === t.value ? t.color : "border-gray-700 bg-gray-800/40 text-gray-500 hover:border-gray-600"
                    )}
                  >
                    {t.icon}
                    <div>
                      <p className="text-sm font-semibold">{t.label}</p>
                      <p className="text-xs opacity-70">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Task Title <span className="text-red-400">*</span></label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the issue"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {/* Location + Department */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Location <span className="text-red-400">*</span></label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Department <span className="text-red-400">*</span></label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Project Name <span className="text-red-400">*</span></label>
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Payroll System, Internal IT, Onboarding"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {/* Category + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {isSensitive && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3">
                <p className="text-xs text-amber-300">⚠️ <strong>Sensitive Category:</strong> This ticket will be restricted to HR Managers only.</p>
              </div>
            )}

            {/* Task Description */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Task Description <span className="text-red-400">*</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed information about the issue or request..."
                rows={4}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
              />
            </div>

            {/* Assign Employee */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Assign Employee (optional)</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="">— Unassigned —</option>
                {departments.map((dept) => (
                  <optgroup key={dept} label={dept}>
                    {assignableUsers.filter((u) => u.department === dept).map((u) => (
                      <option key={u.id} value={u.id}>{u.name} · {u.role.replace(/_/g, " ")}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Upload Documents */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Upload Documents (PDF, Images — max 5MB each)</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
                className="border-2 border-dashed border-gray-700 hover:border-blue-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors group"
              >
                <Upload className="h-8 w-8 text-gray-600 group-hover:text-blue-400 mx-auto mb-2 transition-colors" />
                <p className="text-sm text-gray-500 group-hover:text-gray-400">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-600 mt-1">PDF, PNG, JPG, WEBP</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>

              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-2">
                      {a.type === "application/pdf"
                        ? <FileText className="h-4 w-4 text-red-400 shrink-0" />
                        : <ImageIcon className="h-4 w-4 text-blue-400 shrink-0" />
                      }
                      <span className="text-xs text-gray-300 flex-1 truncate">{a.name}</span>
                      <button type="button" onClick={() => removeAttachment(i)} className="text-gray-600 hover:text-red-400 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium transition-colors"
              >
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
