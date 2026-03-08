// Simplified Role-Based Access Control System
// 4 Core Roles: admin, manager, user, client

export type UserRole = "admin" | "manager" | "user" | "client"

export type Permission =
  | "view_dashboard"
  | "view_tasks"
  | "create_tasks"
  | "edit_tasks"
  | "delete_tasks"
  | "approve_tasks"
  | "submit_for_review"
  | "view_approvals"
  | "manage_workflows"
  | "manage_users"
  | "view_client_deliverables"
  | "provide_feedback"
  | "view_sops"

export interface RolePermission {
  role: UserRole
  permissions: Permission[]
  description: string
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermission> = {
  admin: {
    role: "admin",
    permissions: [
      "view_dashboard",
      "view_tasks",
      "create_tasks",
      "edit_tasks",
      "delete_tasks",
      "approve_tasks",
      "submit_for_review",
      "view_approvals",
      "manage_workflows",
      "manage_users",
      "view_sops",
    ],
    description: "Full system access and management",
  },
  manager: {
    role: "manager",
    permissions: [
      "view_dashboard",
      "view_tasks",
      "create_tasks",
      "edit_tasks",
      "approve_tasks",
      "submit_for_review",
      "view_approvals",
      "view_sops",
    ],
    description: "Can manage tasks and approve workflows",
  },
  user: {
    role: "user",
    permissions: [
      "view_dashboard",
      "view_tasks",
      "create_tasks",
      "edit_tasks",
      "submit_for_review",
      "view_approvals",
      "view_sops",
    ],
    description: "Can create and submit tasks for approval",
  },
  client: {
    role: "client",
    permissions: [
      "view_client_deliverables",
      "provide_feedback",
      "view_sops",
    ],
    description: "Can view deliverables and provide feedback",
  },
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  clientId?: string
  avatar?: string
  createdAt: string
  lastLogin?: string
  isActive: boolean
}

// Permission checking utilities
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].permissions.includes(permission)
}

export function canApprove(role: UserRole): boolean {
  return hasPermission(role, "approve_tasks")
}

export function canEditTasks(role: UserRole): boolean {
  return hasPermission(role, "edit_tasks")
}

export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, "manage_users")
}

export function isClientUser(role: UserRole): boolean {
  return role === "client"
}

export function isInternalUser(role: UserRole): boolean {
  return ["admin", "manager", "user"].includes(role)
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "Administrator",
    manager: "Manager",
    user: "Team Member",
    client: "Client",
  }
  return labels[role]
}
