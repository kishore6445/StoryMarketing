import { ReactNode } from "react"
import type { UserRole, Permission } from "@/lib/rbac"
import { hasPermission, isClientUser } from "@/lib/rbac"

interface PermissionGuardProps {
  children: ReactNode
  permission?: Permission
  role?: UserRole
  requiredRole?: UserRole
  fallback?: ReactNode
  hideIfNoAccess?: boolean
}

export function PermissionGuard({
  children,
  permission,
  role = "user",
  requiredRole,
  fallback,
  hideIfNoAccess = true,
}: PermissionGuardProps) {
  let hasAccess = true

  if (permission) {
    hasAccess = hasPermission(role, permission)
  }

  if (requiredRole) {
    hasAccess = role === requiredRole
  }

  if (!hasAccess) {
    if (hideIfNoAccess) {
      return null
    }
    return fallback || <div className="text-sm text-[#86868B] p-4">Access denied</div>
  }

  return children
}

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
  role?: UserRole
}

export function ClientOnly({ children, fallback, role = "user" }: ClientOnlyProps) {
  const isClient = isClientUser(role)

  if (!isClient) {
    return fallback || null
  }

  return children
}

interface InternalOnlyProps {
  children: ReactNode
  fallback?: ReactNode
  role?: UserRole
}

export function InternalOnly({ children, fallback, role = "user" }: InternalOnlyProps) {
  const isClient = isClientUser(role)

  if (isClient) {
    return fallback || null
  }

  return children
}
