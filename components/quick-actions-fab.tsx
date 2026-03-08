"use client"

import { useState } from "react"
import { Plus, X, CheckCircle2, MessageSquare, FileText, TrendingUp } from "lucide-react"

interface QuickActionsFABProps {
  clientId?: string
  onAddTask?: () => void
  onScheduleMeeting?: () => void
  onGenerateReport?: () => void
  onViewAnalytics?: () => void
}

export function QuickActionsFAB({
  clientId,
  onAddTask = () => {},
  onScheduleMeeting = () => {},
  onGenerateReport = () => {},
  onViewAnalytics = () => {},
}: QuickActionsFABProps) {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    {
      icon: CheckCircle2,
      label: "Add Task",
      color: "bg-blue-500",
      onClick: onAddTask,
    },
    {
      icon: MessageSquare,
      label: "Meeting",
      color: "bg-purple-500",
      onClick: onScheduleMeeting,
    },
    {
      icon: FileText,
      label: "Report",
      color: "bg-green-500",
      onClick: onGenerateReport,
    },
    {
      icon: TrendingUp,
      label: "Analytics",
      color: "bg-orange-500",
      onClick: onViewAnalytics,
    },
  ]

  return (
    <>
      {/* Floating Action Menu */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 space-y-3 z-40">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={() => {
                  action.onClick()
                  setIsOpen(false)
                }}
                className="flex items-center gap-3 bg-white border border-[#E5E5E7] rounded-lg p-3 shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
              >
                <div className={`${action.color} p-2 rounded-lg text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-[#1D1D1F] whitespace-nowrap">{action.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center justify-center font-semibold text-lg text-white ${
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-[#2E7D32] hover:bg-[#1B5E20]"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
