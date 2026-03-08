'use client';

import { useCallback } from "react"
import type { User, UserRole, Permission } from "@/lib/rbac"
import { hasPermission, canApprove, isClientUser, canManageUsers, canEditTasks } from "@/lib/rbac"

// Mock current user - in production, fetch from session/auth
export const MOCK_CURRENT_USER: User = {
  id: "user-1",
  name: "John Manager",
  email: "john@company.com",
  role: "manager",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  createdAt: "2025-01-01",
  lastLogin: new Date().toISOString(),
  isActive: true,
}

export function useUserContext() {
  // In production, this would be from authentication context
  const user = MOCK_CURRENT_USER

  const checkPermission = useCallback(
    (permission: Permission): boolean => {
      return hasPermission(user.role, permission)
    },
    [user.role],
  )

  const isClient = useCallback((): boolean => {
    return isClientUser(user.role)
  }, [user.role])

  const canApproveContent = useCallback((): boolean => {
    return canApprove(user.role)
  }, [user.role])

  const canManage = useCallback((): boolean => {
    return canManageUsers(user.role)
  }, [user.role])

  const canEdit = useCallback((): boolean => {
    return canEditTasks(user.role)
  }, [user.role])

  return {
    user,
    role: user.role,
    checkPermission,
    isClient,
    canApproveContent,
    canManage,
    canEdit,
  }
}
