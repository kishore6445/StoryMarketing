"use client"

import { Bell } from "lucide-react"
import { useState } from "react"
import { NotificationCenter, type Notification } from "./notification-center"

interface NotificationBellProps {
  unreadCount?: number
  onBellClick?: () => void
}

export function NotificationBell({ unreadCount = 0, onBellClick }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = () => {
    setIsOpen(!isOpen)
    onBellClick?.()
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="relative p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-[#1D1D1F]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-[#E5E5E7] rounded-lg shadow-lg z-50">
          <div className="max-h-96 overflow-y-auto p-4">
            <NotificationCenter />
          </div>
        </div>
      )}
    </div>
  )
}
