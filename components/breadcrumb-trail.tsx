"use client"

import { ChevronRight, LayoutDashboard } from "lucide-react"

interface BreadcrumbTrailProps {
  items: Array<{
    label: string
    onClick?: () => void
    active?: boolean
  }>
}

export function BreadcrumbTrail({ items }: BreadcrumbTrailProps) {
  return (
    <div className="flex items-center gap-2 px-6 py-3 bg-white border-b border-[#E5E5E7] text-sm">
      <LayoutDashboard className="w-4 h-4 text-[#86868B]" />
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-[#D1D1D6]" />}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-[#007AFF] hover:text-[#0051C3] transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span
              className={
                item.active ? "text-[#1D1D1F] font-medium" : "text-[#86868B]"
              }
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
