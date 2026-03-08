"use client"

import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"
import { isClientUser, type UserRole } from "@/lib/rbac"

interface RoleBasedLayoutProps {
  children: ReactNode
  userRole: UserRole
  currentPhase?: string
  onPhaseChange?: (phaseId: string) => void
}

export function RoleBasedLayout({ children, userRole, currentPhase, onPhaseChange }: RoleBasedLayoutProps) {
  const isClient = isClientUser(userRole)

  return (
    <div className="flex h-screen bg-[#F8F9FB]">
      {/* Sidebar - Hidden for client users */}
      {!isClient && currentPhase && onPhaseChange && (
        <Sidebar currentPhase={currentPhase} onPhaseChange={onPhaseChange} />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isClient ? "ml-0" : "ml-64"}`}>
        {/* Top Navigation */}
        <TopNav userRole={userRole} clientName={isClient ? "ABC Manufacturing" : undefined} />

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto ${isClient ? "p-8" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
