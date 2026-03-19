export type TicketType = "BUG" | "SERVICE_REQUEST"

export type Role = "EMPLOYEE" | "HR_COORDINATOR" | "HR_SPECIALIST" | "HR_MANAGER" | "SYSTEM_ADMIN"

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "PENDING" | "RESOLVED" | "CLOSED"

export type TicketCategory =
  | "GENERAL"
  | "IT"
  | "PAYROLL"
  | "BENEFITS"
  | "GRIEVANCE"
  | "MEDICAL"
  | "ONBOARDING"
  | "OFFBOARDING"

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export type Department = "ENGINEERING" | "FINANCE" | "OPERATIONS" | "MARKETING" | "HR"

export type ActionType =
  | "TICKET_CREATED"
  | "STATUS_CHANGED"
  | "ASSIGNED"
  | "COMMENT_ADDED"
  | "INTERNAL_NOTE_ADDED"
  | "TICKET_DELETED"
  | "TICKET_VIEWED"
  | "ROLE_CHANGED"

export type Permission =
  | "CREATE_TICKET"
  | "READ_OWN_TICKETS"
  | "READ_ALL_TICKETS"
  | "UPDATE_STATUS"
  | "POST_PUBLIC_COMMENT"
  | "POST_INTERNAL_NOTE"
  | "DELETE_TICKET"
  | "VIEW_ANALYTICS"
  | "MANAGE_ROLES"
  | "VIEW_AUDIT_LOGS"
  | "ASSIGN_TICKET"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  department: Department
  avatar: string
}

export interface TicketComment {
  id: string
  ticketId: string
  authorId: string
  authorName: string
  authorRole: Role
  content: string
  isInternal: boolean
  createdAt: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  department: Department
  location: string
  projectName: string
  ticketType: TicketType
  attachments: { name: string; type: string; url: string }[]
  creatorId: string
  creatorName: string
  assigneeId: string | null
  assigneeName: string | null
  comments: TicketComment[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  userRole: Role
  actionType: ActionType
  ticketId: string | null
  ticketTitle: string | null
  oldValue: string | null
  newValue: string | null
  timestamp: string
  ipAddress: string
}
