"use client"

import { useState } from "react"
import { X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TicketCategory, TicketPriority, Department, Ticket } from "@/lib/types"
import { useAuth } from "./auth-context"
import { createTicket, addAuditLog } from "@/lib/data"
import { SENSITIVE_CATEGORIES } from "@/lib/permissions"
import { toast } from "sonner"

const CATEGORIES: TicketCategory[] = ["GENERAL", "IT", "PAYROLL", "BENEFITS", "GRIEVANCE", "MEDICAL", "ONBOARDING", "OFFBOARDING"]
const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
const DEPARTMENTS: Department[] = ["ENGINEERING", "FINANCE", "OPERATIONS", "MARKETING", "HR"]

interface Props {
  onClose: () => void
  onCreated: (ticket: Ticket) => void
}

export function CreateTicketForm({ onClose, onCreated }: Props) {
  const { currentUser } = useAuth()
  const user = currentUser!
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<TicketCategory>("GENERAL")
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM")
  const [department, setDepartment] = useState<Department>(user.department)

  if (!currentUser) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    const ticket = createTicket({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: "OPEN",
      department,
      location: user.department + " Office",
      projectName: "General",
      ticketType: "SERVICE_REQUEST",
      attachments: [],
      creatorId: user.id,
      creatorName: user.name,
      assigneeId: null,
      assigneeName: null,
    })

    addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      actionType: "TICKET_CREATED",
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      oldValue: null,
      newValue: "OPEN",
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.100",
    })

    onCreated(ticket)
    onClose()
    toast.success("Ticket created successfully!", { description: ticket.title })
  }

  const isSensitive = SENSITIVE_CATEGORIES.includes(category)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">New Support Ticket</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of your issue"
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about your issue..."
              rows={4}
              className="w-full rounded-xl bg-gray-800 border border-gray-600 text-white placeholder:text-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full rounded-xl bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full rounded-xl bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department)}
              className="w-full rounded-xl bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {isSensitive && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300">
                <strong>Sensitive Category:</strong> This ticket will be restricted to HR Managers only and will be audit-logged on every view.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl border-gray-600 text-gray-300 hover:bg-gray-800">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
              Submit Ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
