import type { User, Ticket, TicketComment, AuditLog, ActionType, TicketType } from "./types"

// ─── Mock Users ───────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  { id: "u1",  name: "Alice Johnson",   email: "alice@company.com",   role: "EMPLOYEE",       department: "ENGINEERING", avatar: "AJ" },
  { id: "u2",  name: "Bob Martinez",    email: "bob@company.com",     role: "EMPLOYEE",       department: "FINANCE",     avatar: "BM" },
  { id: "u3",  name: "Carol White",     email: "carol@company.com",   role: "HR_COORDINATOR", department: "HR",          avatar: "CW" },
  { id: "u4",  name: "David Lee",       email: "david@company.com",   role: "HR_SPECIALIST",  department: "HR",          avatar: "DL" },
  { id: "u5",  name: "Eva Chen",        email: "eva@company.com",     role: "HR_MANAGER",     department: "HR",          avatar: "EC" },
  { id: "u6",  name: "Frank Admin",     email: "frank@company.com",   role: "SYSTEM_ADMIN",   department: "OPERATIONS",  avatar: "FA" },
  // IT Team
  { id: "u7",  name: "Grace Kim",       email: "grace@company.com",   role: "EMPLOYEE",       department: "ENGINEERING", avatar: "GK" },
  { id: "u8",  name: "Henry Scott",     email: "henry@company.com",   role: "EMPLOYEE",       department: "ENGINEERING", avatar: "HS" },
  { id: "u9",  name: "Irene Patel",     email: "irene@company.com",   role: "EMPLOYEE",       department: "ENGINEERING", avatar: "IP" },
  // Operations Team
  { id: "u10", name: "James Wilson",    email: "james@company.com",   role: "EMPLOYEE",       department: "OPERATIONS",  avatar: "JW" },
  { id: "u11", name: "Karen Brown",     email: "karen@company.com",   role: "EMPLOYEE",       department: "OPERATIONS",  avatar: "KB" },
  // Finance Team
  { id: "u12", name: "Leo Turner",      email: "leo@company.com",     role: "EMPLOYEE",       department: "FINANCE",     avatar: "LT" },
  { id: "u13", name: "Mia Nguyen",      email: "mia@company.com",     role: "EMPLOYEE",       department: "FINANCE",     avatar: "MN" },
  // Marketing Team
  { id: "u14", name: "Nathan Reed",     email: "nathan@company.com",  role: "EMPLOYEE",       department: "MARKETING",   avatar: "NR" },
  { id: "u15", name: "Olivia Brooks",   email: "olivia@company.com",  role: "EMPLOYEE",       department: "MARKETING",   avatar: "OB" },
]

// ─── Mock Tickets ─────────────────────────────────────────────────────────────
export const MOCK_TICKETS: Ticket[] = [
  {
    id: "t1",
    title: "Laptop not connecting to VPN",
    description: "My work laptop has been unable to connect to the company VPN since Monday. I've tried restarting and reinstalling the client.",
    category: "IT",
    priority: "HIGH",
    status: "IN_PROGRESS",
    department: "ENGINEERING",
    location: "Mumbai Office",
    projectName: "Internal IT",
    ticketType: "BUG" as TicketType,
    attachments: [],
    creatorId: "u1",
    creatorName: "Alice Johnson",
    assigneeId: "u4",
    assigneeName: "David Lee",
    comments: [
      { id: "c1", ticketId: "t1", authorId: "u3", authorName: "Carol White", authorRole: "HR_COORDINATOR", content: "Assigned to David for investigation.", isInternal: false, createdAt: "2025-01-10T09:30:00Z" },
      { id: "c2", ticketId: "t1", authorId: "u4", authorName: "David Lee", authorRole: "HR_SPECIALIST", content: "Checking with IT team. Possible certificate expiry issue.", isInternal: true, createdAt: "2025-01-10T11:00:00Z" },
      { id: "c3", ticketId: "t1", authorId: "u1", authorName: "Alice Johnson", authorRole: "EMPLOYEE", content: "Any update on this? I have a client call tomorrow.", isInternal: false, createdAt: "2025-01-11T08:00:00Z" },
    ],
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-01-11T08:00:00Z",
    deletedAt: null,
  },
  {
    id: "t2",
    title: "Payroll discrepancy for December",
    description: "My December payslip shows incorrect overtime hours. I worked 12 extra hours but only 8 were credited.",
    category: "PAYROLL",
    priority: "HIGH",
    status: "OPEN",
    department: "FINANCE",
    location: "Delhi Office",
    projectName: "Payroll System",
    ticketType: "SERVICE_REQUEST" as TicketType,
    attachments: [],
    creatorId: "u2",
    creatorName: "Bob Martinez",
    assigneeId: null,
    assigneeName: null,
    comments: [],
    createdAt: "2025-01-12T10:00:00Z",
    updatedAt: "2025-01-12T10:00:00Z",
    deletedAt: null,
  },
  {
    id: "t3",
    title: "Workplace harassment complaint",
    description: "I would like to formally report an incident of workplace harassment that occurred on January 8th.",
    category: "GRIEVANCE",
    priority: "CRITICAL",
    status: "OPEN",
    department: "ENGINEERING",
    location: "Mumbai Office",
    projectName: "HR",
    ticketType: "SERVICE_REQUEST" as TicketType,
    attachments: [],
    creatorId: "u1",
    creatorName: "Alice Johnson",
    assigneeId: "u5",
    assigneeName: "Eva Chen",
    comments: [
      { id: "c4", ticketId: "t3", authorId: "u5", authorName: "Eva Chen", authorRole: "HR_MANAGER", content: "This has been escalated to HR Manager level. We will contact you within 24 hours.", isInternal: false, createdAt: "2025-01-12T14:00:00Z" },
      { id: "c5", ticketId: "t3", authorId: "u5", authorName: "Eva Chen", authorRole: "HR_MANAGER", content: "Reviewed CCTV footage. Incident confirmed. Initiating formal process.", isInternal: true, createdAt: "2025-01-12T15:00:00Z" },
    ],
    createdAt: "2025-01-12T13:00:00Z",
    updatedAt: "2025-01-12T15:00:00Z",
    deletedAt: null,
  },
  {
    id: "t4",
    title: "Health insurance enrollment question",
    description: "I need help understanding the dental coverage options for the new plan year.",
    category: "BENEFITS",
    priority: "MEDIUM",
    status: "RESOLVED",
    department: "FINANCE",
    location: "Delhi Office",
    projectName: "HR Benefits",
    ticketType: "SERVICE_REQUEST" as TicketType,
    attachments: [],
    creatorId: "u2",
    creatorName: "Bob Martinez",
    assigneeId: "u3",
    assigneeName: "Carol White",
    comments: [
      { id: "c6", ticketId: "t4", authorId: "u3", authorName: "Carol White", authorRole: "HR_COORDINATOR", content: "The dental plan covers 80% of preventive care and 50% of basic procedures. I've attached the full benefits guide.", isInternal: false, createdAt: "2025-01-09T11:00:00Z" },
    ],
    createdAt: "2025-01-08T09:00:00Z",
    updatedAt: "2025-01-09T11:00:00Z",
    deletedAt: null,
  },
  {
    id: "t5",
    title: "Medical leave documentation",
    description: "I need to submit documentation for my upcoming medical procedure and request 2 weeks of medical leave.",
    category: "MEDICAL",
    priority: "HIGH",
    status: "PENDING",
    department: "MARKETING",
    location: "Bangalore Office",
    projectName: "HR Medical",
    ticketType: "SERVICE_REQUEST" as TicketType,
    attachments: [],
    creatorId: "u2",
    creatorName: "Bob Martinez",
    assigneeId: "u5",
    assigneeName: "Eva Chen",
    comments: [
      { id: "c7", ticketId: "t5", authorId: "u5", authorName: "Eva Chen", authorRole: "HR_MANAGER", content: "Please upload your doctor's note via the secure portal. Your leave has been pre-approved.", isInternal: false, createdAt: "2025-01-13T10:00:00Z" },
    ],
    createdAt: "2025-01-13T09:00:00Z",
    updatedAt: "2025-01-13T10:00:00Z",
    deletedAt: null,
  },
  {
    id: "t6",
    title: "New employee onboarding checklist",
    description: "I started on Monday and haven't received access to several systems including Slack, Jira, and the HR portal.",
    category: "ONBOARDING",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    department: "ENGINEERING",
    location: "Mumbai Office",
    projectName: "Onboarding",
    ticketType: "SERVICE_REQUEST" as TicketType,
    attachments: [],
    creatorId: "u1",
    creatorName: "Alice Johnson",
    assigneeId: "u3",
    assigneeName: "Carol White",
    comments: [],
    createdAt: "2025-01-06T08:00:00Z",
    updatedAt: "2025-01-06T08:00:00Z",
    deletedAt: null,
  },
  {
    id: "t7",
    title: "Remote work policy clarification",
    description: "Can someone clarify the updated remote work policy? Specifically around the 3-day in-office requirement.",
    category: "GENERAL",
    priority: "LOW",
    status: "CLOSED",
    department: "OPERATIONS",
    location: "Delhi Office",
    projectName: "General",
    ticketType: "SERVICE_REQUEST" as TicketType,
    attachments: [],
    creatorId: "u2",
    creatorName: "Bob Martinez",
    assigneeId: "u3",
    assigneeName: "Carol White",
    comments: [
      { id: "c8", ticketId: "t7", authorId: "u3", authorName: "Carol White", authorRole: "HR_COORDINATOR", content: "The policy requires 3 days in-office per week, with flexibility on which days. Full policy document sent to your email.", isInternal: false, createdAt: "2025-01-07T14:00:00Z" },
    ],
    createdAt: "2025-01-07T10:00:00Z",
    updatedAt: "2025-01-07T14:00:00Z",
    deletedAt: null,
  },
  {
    id: "t8",
    title: "Performance review process question",
    description: "When does the Q1 performance review cycle begin and what forms do I need to complete?",
    category: "GENERAL",
    priority: "LOW",
    status: "OPEN",
    department: "FINANCE",
    location: "Delhi Office",
    projectName: "General",
    ticketType: "SERVICE_REQUEST" as TicketType,
    attachments: [],
    creatorId: "u2",
    creatorName: "Bob Martinez",
    assigneeId: null,
    assigneeName: null,
    comments: [],
    createdAt: "2025-01-14T09:00:00Z",
    updatedAt: "2025-01-14T09:00:00Z",
    deletedAt: null,
  },
]

// ─── Mock Audit Logs ──────────────────────────────────────────────────────────
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: "a1", userId: "u1", userName: "Alice Johnson", userRole: "EMPLOYEE", actionType: "TICKET_CREATED", ticketId: "t1", ticketTitle: "Laptop not connecting to VPN", oldValue: null, newValue: "OPEN", timestamp: "2025-01-10T08:00:00Z", ipAddress: "192.168.1.101" },
  { id: "a2", userId: "u3", userName: "Carol White", userRole: "HR_COORDINATOR", actionType: "ASSIGNED", ticketId: "t1", ticketTitle: "Laptop not connecting to VPN", oldValue: null, newValue: "David Lee", timestamp: "2025-01-10T09:30:00Z", ipAddress: "192.168.1.103" },
  { id: "a3", userId: "u4", userName: "David Lee", userRole: "HR_SPECIALIST", actionType: "STATUS_CHANGED", ticketId: "t1", ticketTitle: "Laptop not connecting to VPN", oldValue: "OPEN", newValue: "IN_PROGRESS", timestamp: "2025-01-10T11:00:00Z", ipAddress: "192.168.1.104" },
  { id: "a4", userId: "u1", userName: "Alice Johnson", userRole: "EMPLOYEE", actionType: "TICKET_CREATED", ticketId: "t3", ticketTitle: "Workplace harassment complaint", oldValue: null, newValue: "OPEN", timestamp: "2025-01-12T13:00:00Z", ipAddress: "192.168.1.101" },
  { id: "a5", userId: "u5", userName: "Eva Chen", userRole: "HR_MANAGER", actionType: "TICKET_VIEWED", ticketId: "t3", ticketTitle: "Workplace harassment complaint", oldValue: null, newValue: null, timestamp: "2025-01-12T13:30:00Z", ipAddress: "192.168.1.105" },
  { id: "a6", userId: "u5", userName: "Eva Chen", userRole: "HR_MANAGER", actionType: "ASSIGNED", ticketId: "t3", ticketTitle: "Workplace harassment complaint", oldValue: null, newValue: "Eva Chen", timestamp: "2025-01-12T14:00:00Z", ipAddress: "192.168.1.105" },
  { id: "a7", userId: "u2", userName: "Bob Martinez", userRole: "EMPLOYEE", actionType: "TICKET_CREATED", ticketId: "t2", ticketTitle: "Payroll discrepancy for December", oldValue: null, newValue: "OPEN", timestamp: "2025-01-12T10:00:00Z", ipAddress: "192.168.1.102" },
  { id: "a8", userId: "u3", userName: "Carol White", userRole: "HR_COORDINATOR", actionType: "STATUS_CHANGED", ticketId: "t4", ticketTitle: "Health insurance enrollment question", oldValue: "IN_PROGRESS", newValue: "RESOLVED", timestamp: "2025-01-09T11:00:00Z", ipAddress: "192.168.1.103" },
]

// ─── In-memory mutable store ──────────────────────────────────────────────────
let tickets = [...MOCK_TICKETS]
let auditLogs = [...MOCK_AUDIT_LOGS]
let nextTicketId = 9
let nextCommentId = 9
let nextAuditId = 9

export function getTickets() { return tickets }
export function getAuditLogs() { return auditLogs }

export function addAuditLog(log: Omit<AuditLog, "id">) {
  const entry: AuditLog = { ...log, id: `a${nextAuditId++}` }
  auditLogs = [entry, ...auditLogs]
  return entry
}

export function createTicket(data: Omit<Ticket, "id" | "comments" | "createdAt" | "updatedAt" | "deletedAt">) {
  const ticket: Ticket = {
    ...data,
    id: `t${nextTicketId++}`,
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  }
  tickets = [ticket, ...tickets]
  return ticket
}

export function updateTicketStatus(ticketId: string, status: Ticket["status"]) {
  tickets = tickets.map((t) => t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t)
  return tickets.find((t) => t.id === ticketId)!
}

export function assignTicket(ticketId: string, assigneeId: string, assigneeName: string) {
  tickets = tickets.map((t) => t.id === ticketId ? { ...t, assigneeId, assigneeName, updatedAt: new Date().toISOString() } : t)
  return tickets.find((t) => t.id === ticketId)!
}

export function softDeleteTicket(ticketId: string) {
  tickets = tickets.map((t) => t.id === ticketId ? { ...t, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : t)
}

export function addComment(ticketId: string, comment: Omit<TicketComment, "id">) {
  const newComment: TicketComment = { ...comment, id: `c${nextCommentId++}` }
  tickets = tickets.map((t) =>
    t.id === ticketId ? { ...t, comments: [...t.comments, newComment], updatedAt: new Date().toISOString() } : t
  )
  return newComment
}

export function updateUserRole(userId: string, role: User["role"]) {
  // In a real app this would hit the DB; here we just return the updated user
  return MOCK_USERS.map((u) => u.id === userId ? { ...u, role } : u)
}

// Re-export TicketComment type for convenience
export type { TicketComment } from "./types"
