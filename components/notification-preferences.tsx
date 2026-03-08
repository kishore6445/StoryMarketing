"use client"

import { useState } from "react"
import { Bell, Mail, MessageSquare, Clock, AlertCircle, CheckCircle2 } from "lucide-react"

interface NotificationSetting {
  id: string
  label: string
  description: string
  email: boolean
  inApp: boolean
  digest: boolean
  categories: string[]
}

export function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "task-assigned",
      label: "Task Assignments",
      description: "Notify when a task is assigned to you",
      email: true,
      inApp: true,
      digest: false,
      categories: ["tasks"],
    },
    {
      id: "task-due",
      label: "Task Due Reminders",
      description: "Get reminded when tasks are due soon",
      email: true,
      inApp: true,
      digest: true,
      categories: ["tasks", "reminders"],
    },
    {
      id: "comment-mention",
      label: "Comment Mentions",
      description: "Notify when someone mentions you in a comment",
      email: true,
      inApp: true,
      digest: false,
      categories: ["collaboration"],
    },
    {
      id: "phase-approval",
      label: "Phase Approvals",
      description: "Notify when a phase needs your approval",
      email: true,
      inApp: true,
      digest: false,
      categories: ["approvals"],
    },
    {
      id: "client-update",
      label: "Client Updates",
      description: "Notify when a client status changes",
      email: false,
      inApp: true,
      digest: true,
      categories: ["clients"],
    },
    {
      id: "campaign-metrics",
      label: "Campaign Metrics",
      description: "Weekly analytics and performance reports",
      email: true,
      inApp: false,
      digest: true,
      categories: ["analytics", "reports"],
    },
  ])

  const [digestFrequency, setDigestFrequency] = useState("daily")

  const handleToggle = (id: string, type: "email" | "inApp" | "digest") => {
    setSettings(
      settings.map((s) =>
        s.id === id
          ? {
              ...s,
              [type]: !s[type],
            }
          : s
      )
    )
  }

  const emailNotifications = settings.filter((s) => s.email).length
  const inAppNotifications = settings.filter((s) => s.inApp).length
  const digestNotifications = settings.filter((s) => s.digest).length

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Notification Preferences</h1>
        <p className="text-sm text-[#86868B]">Control how and when you receive notifications</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E5E7] p-4">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-4 h-4 text-[#007AFF]" />
            <span className="text-xs font-medium text-[#86868B] uppercase tracking-wider">Email</span>
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F]">{emailNotifications}</div>
          <p className="text-xs text-[#86868B]">notifications enabled</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E5E7] p-4">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-4 h-4 text-[#FFB547]" />
            <span className="text-xs font-medium text-[#86868B] uppercase tracking-wider">In-App</span>
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F]">{inAppNotifications}</div>
          <p className="text-xs text-[#86868B]">notifications enabled</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E5E7] p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-4 h-4 text-[#34C759]" />
            <span className="text-xs font-medium text-[#86868B] uppercase tracking-wider">Digest</span>
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F]">{digestNotifications}</div>
          <p className="text-xs text-[#86868B]">included in digest</p>
        </div>
      </div>

      {/* Digest Frequency */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Digest Frequency</h2>
        <div className="space-y-3">
          {["daily", "3x weekly", "weekly", "never"].map((freq) => (
            <label key={freq} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="digest-frequency"
                value={freq}
                checked={digestFrequency === freq}
                onChange={(e) => setDigestFrequency(e.target.value)}
                className="w-4 h-4 rounded-full border-2 border-[#D1D1D6] text-[#2E7D32] focus:ring-[#2E7D32] focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-[#1D1D1F] capitalize">{freq}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-6">Notification Types</h2>

        <div className="space-y-6">
          {settings.map((setting) => (
            <div key={setting.id} className="pb-6 border-b border-[#E5E5E7] last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F]">{setting.label}</h3>
                  <p className="text-xs text-[#86868B] mt-1">{setting.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Email Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setting.email}
                    onChange={() => handleToggle(setting.id, "email")}
                    className="w-4 h-4 rounded border-[#D1D1D6] text-[#2E7D32] focus:ring-[#2E7D32] focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#86868B]" />
                    <span className="text-xs text-[#515154]">Email</span>
                  </div>
                </label>

                {/* In-App Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setting.inApp}
                    onChange={() => handleToggle(setting.id, "inApp")}
                    className="w-4 h-4 rounded border-[#D1D1D6] text-[#2E7D32] focus:ring-[#2E7D32] focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-[#86868B]" />
                    <span className="text-xs text-[#515154]">In-App</span>
                  </div>
                </label>

                {/* Digest Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setting.digest}
                    onChange={() => handleToggle(setting.id, "digest")}
                    className="w-4 h-4 rounded border-[#D1D1D6] text-[#2E7D32] focus:ring-[#2E7D32] focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#86868B]" />
                    <span className="text-xs text-[#515154]">Digest</span>
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Do Not Disturb */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#1D1D1F]">Do Not Disturb</h2>
            <p className="text-sm text-[#86868B] mt-1">Pause all notifications during specific hours</p>
          </div>
          <input type="checkbox" className="w-5 h-5 rounded border-[#D1D1D6] text-[#2E7D32] focus:ring-[#2E7D32] focus:ring-offset-0 cursor-pointer" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[#1D1D1F] block mb-2">From</label>
            <input
              type="time"
              defaultValue="22:00"
              className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#1D1D1F] block mb-2">To</label>
            <input
              type="time"
              defaultValue="08:00"
              className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button className="px-6 py-3 bg-[#2E7D32] text-white rounded-lg font-medium hover:bg-[#1B5E20] transition-colors">
          Save Preferences
        </button>
        <button className="px-6 py-3 bg-[#F5F5F7] text-[#1D1D1F] rounded-lg font-medium hover:bg-[#EBEBED] transition-colors">
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}
