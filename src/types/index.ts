export type UserRole = "admin" | "agent" | "requester";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "pending"
  | "resolved"
  | "closed";

export type TicketPriority = "low" | "medium" | "high" | "critical";

export type TicketCategory =
  | "hardware"
  | "software"
  | "network"
  | "access"
  | "email"
  | "security"
  | "other";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  number: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  requesterId: string;
  requesterName: string;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  dueAt?: string;
  firstResponseAt?: string;
  slaBreached?: boolean;
  tags?: string[];
  commentsCount?: number;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  isInternal: boolean;
  isSystem?: boolean;
  createdAt: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: TicketCategory;
  views: number;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  openTickets: number;
  inProgress: number;
  pending: number;
  resolvedToday: number;
  slaCompliance: number;
  avgResponseTimeHours: number;
  unassigned: number;
  critical: number;
}

export interface Attachment {
  id: string;
  ticketId: string;
  uploadedBy: string;
  uploaderName?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  createdAt: string;
}
