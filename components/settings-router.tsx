"use client"

import React from "react"

import { useState } from "react"
import { User, Bell, Users, BarChart3, LogOut } from "lucide-react"
import { SettingsProfile } from "@/components/settings-profile"
import { NotificationPreferences } from "@/components/notification-preferences"
import { TeamManagement } from "@/components/team-management"
import { MetricsCustomization } from "@/components/metrics-customization"

type SettingsTab = "profile" | "notifications" | "team" | "metrics"

interface SettingsRouterProps {
  onLogout?: () => void
}

export function SettingsRouter({ onLogout }: SettingsRouterProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { id: "team", label: "Team", icon: <Users className="w-4 h-4" /> },
    { id: "metrics", label: "Metrics", icon: <BarChart3 className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-[#E5E5E7] p-6">
          <h2 className="text-lg font-semibold text-[#1D1D1F] mb-8">Settings</h2>

          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-[#2E7D32] text-white"
                    : "text-[#515154] hover:bg-[#F5F5F7]"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium text-[#FF3B30] hover:bg-[#FFE5E5] mt-8 border border-[#FFE5E5]"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          {activeTab === "profile" && <SettingsProfile />}
          {activeTab === "notifications" && <NotificationPreferences />}
          {activeTab === "team" && <TeamManagement />}
          {activeTab === "metrics" && <MetricsCustomization />}
        </div>
      </div>
    </div>
  )
}
