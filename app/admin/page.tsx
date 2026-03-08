"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { AdminUserManagement } from "@/components/admin-user-management"
import { ManageClientsSection } from "@/components/manage-clients-section"
import { UserProfileSettings } from "@/components/user-profile-settings"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'clients'>('profile')

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FAFBFC] p-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-[#E5E5E7]">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === 'profile'
                  ? 'text-[#007AFF]'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              My Profile
              {activeTab === 'profile' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007AFF]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === 'users'
                  ? 'text-[#007AFF]'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              Team Users
              {activeTab === 'users' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007AFF]" />
              )}
            </button>
            {/* <button
              onClick={() => setActiveTab('clients')}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === 'clients'
                  ? 'text-[#007AFF]'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              Clients
              {activeTab === 'clients' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007AFF]" />
              )}
            </button> */}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && <UserProfileSettings />}
        {activeTab === 'users' && <AdminUserManagement />}
        {activeTab === 'clients' && <ManageClientsSection />}
      </div>
    </AuthGuard>
  )
}
