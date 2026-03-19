import type { Role, Permission, TicketCategory, Ticket, User } from "./types"

// ─── Permission Matrix ────────────────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  EMPLOYEE: [
    "CREATE_TICKET",
    "READ_OWN_TICKETS",
    "POST_PUBLIC_COMMENT",
  ],
  HR_COORDINATOR: [
    "CREATE_TICKET",
    "READ_OWN_TICKETS",
    "UPDATE_STATUS",
    "POST_PUBLIC_COMMENT",
    "POST_INTERNAL_NOTE",
    "ASSIGN_TICKET",
  ],
  HR_SPECIALIST: [
    "CREATE_TICKET",
    "READ_OWN_TICKETS",
    "UPDATE_STATUS",
    "POST_PUBLIC_COMMENT",
    "POST_INTERNAL_NOTE",
    "ASSIGN_TICKET",
  ],
  HR_MANAGER: [
    "CREATE_TICKET",
    "READ_OWN_TICKETS",
    "READ_ALL_TICKETS",
    "UPDATE_STATUS",
    "POST_PUBLIC_COMMENT",
    "POST_INTERNAL_NOTE",
    "DELETE_TICKET",
    "VIEW_ANALYTICS",
    "ASSIGN_TICKET",
  ],
  SYSTEM_ADMIN: [
    "MANAGE_ROLES",
    "VIEW_AUDIT_LOGS",
    "VIEW_ANALYTICS",
  ],
}

// ─── Role Hierarchy (higher index = more authority) ───────────────────────────
export const ROLE_HIERARCHY: Role[] = [
  "EMPLOYEE",
  "HR_COORDINATOR",
  "HR_SPECIALIST",
  "HR_MANAGER",
  "SYSTEM_ADMIN",
]

export function getRoleLevel(role: Role): number {
  return ROLE_HIERARCHY.indexOf(role)
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

// ─── Sensitive Categories (Privacy Wall) ─────────────────────────────────────
export const SENSITIVE_CATEGORIES: TicketCategory[] = ["GRIEVANCE", "MEDICAL"]

export function canAccessSensitiveCategory(role: Role, category: TicketCategory): boolean {
  if (!SENSITIVE_CATEGORIES.includes(category)) return true
  return role === "HR_MANAGER" || role === "SYSTEM_ADMIN"
}

// ─── Row-Level Security ───────────────────────────────────────────────────────
// Mirrors: GET /api/tickets/:id — Owner | Assignee | VIEW_ALL
export function canViewTicket(user: User, ticket: Ticket): boolean {
  if (ticket.deletedAt) {
    // Soft-deleted tickets only visible to HR_MANAGER+
    return user.role === "HR_MANAGER" || user.role === "SYSTEM_ADMIN"
  }

  // Privacy wall for sensitive categories
  if (!canAccessSensitiveCategory(user.role, ticket.category)) return false

  // Owner
  if (ticket.creatorId === user.id) return true

  // Assignee
  if (ticket.assigneeId === user.id) return true

  // VIEW_ALL permission
  if (hasPermission(user.role, "READ_ALL_TICKETS")) return true

  // HR Coordinator can see non-sensitive tickets in their scope
  if (user.role === "HR_COORDINATOR") return true

  return false
}

export function canUpdateStatus(user: User, ticket: Ticket): boolean {
  // Assignee can always resolve/close their assigned ticket
  if (ticket.assigneeId === user.id) return true
  if (!hasPermission(user.role, "UPDATE_STATUS")) return false
  return canViewTicket(user, ticket)
}

export function isAssignee(user: User, ticket: Ticket): boolean {
  return ticket.assigneeId === user.id
}

export function canPostInternalNote(user: User): boolean {
  return hasPermission(user.role, "POST_INTERNAL_NOTE")
}

export function canDeleteTicket(user: User): boolean {
  return hasPermission(user.role, "DELETE_TICKET")
}

export function canAssignTicket(user: User): boolean {
  return hasPermission(user.role, "ASSIGN_TICKET")
}

// ─── Filter tickets list with RLS applied ────────────────────────────────────
export function filterTicketsForUser(user: User, tickets: Ticket[]): Ticket[] {
  return tickets.filter((t) => canViewTicket(user, t))
}
