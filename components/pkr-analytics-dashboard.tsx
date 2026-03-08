"use client"

import { useState, useMemo } from "react"
import { ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PKRRowData {
  id: string
  name: string
  pkrPercentage: number
  total: number
  kept: number
  atRisk: number
  missed: number
}

interface PKRAnalyticsDashboardProps {
  usersPKRData?: PKRRowData[]
  clientsPKRData?: PKRRowData[]
  overallPKR?: number
  totalPromises?: number
  keptPromises?: number
  atRiskPromises?: number
  missedPromises?: number
}

export function PKRAnalyticsDashboard({
  usersPKRData = [],
  clientsPKRData = [],
  overallPKR = 85,
  totalPromises = 148,
  keptPromises = 125,
  atRiskPromises = 18,
  missedPromises = 5,
}: PKRAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"users" | "clients">("users")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"pkr-asc" | "pkr-desc" | "missed-desc" | "risk-desc" | "total-desc">("pkr-asc")
  const [timelineType, setTimelineType] = useState<"week" | "month" | "custom">("week")

  // Get current data based on active tab
  const currentData = activeTab === "users" ? usersPKRData : clientsPKRData

  // Filter and sort
  const filteredAndSorted = useMemo(() => {
    let filtered = currentData.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filtered.sort((a, b) => {
      if (sortBy === "pkr-asc") return a.pkrPercentage - b.pkrPercentage
      if (sortBy === "pkr-desc") return b.pkrPercentage - a.pkrPercentage
      if (sortBy === "missed-desc") return b.missed - a.missed
      if (sortBy === "risk-desc") return b.atRisk - a.atRisk
      if (sortBy === "total-desc") return b.total - a.total
      return 0
    })
  }, [currentData, searchTerm, sortBy])

  const getPKRColor = (pkr: number) => {
    if (pkr >= 85) return "text-green-600"
    if (pkr >= 70) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-4">
      {/* ===== COMPACT TOP SUMMARY STRIP ===== */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Overall PKR</span>
            <span className={cn("text-2xl font-bold mt-1", getPKRColor(overallPKR))}>
              {overallPKR}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{totalPromises}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Kept</span>
            <span className="text-2xl font-bold text-green-700 mt-1">{keptPromises}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">At Risk</span>
            <span className="text-2xl font-bold text-amber-700 mt-1">{atRiskPromises}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Missed</span>
            <span className="text-2xl font-bold text-red-700 mt-1">{missedPromises}</span>
          </div>
        </div>
      </div>

      {/* ===== TAB & CONTROL ROW ===== */}
      <div className="flex items-center gap-4 justify-between">
        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("users")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded transition-colors",
              activeTab === "users"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            By User
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded transition-colors",
              activeTab === "clients"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            By Client
          </button>
        </div>

        {/* Timeline Filter */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {["week", "month", "custom"].map((t) => (
            <button
              key={t}
              onClick={() => setTimelineType(t as "week" | "month" | "custom")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded transition-colors",
                timelineType === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {t === "week" ? "This Week" : t === "month" ? "This Month" : "Custom"}
            </button>
          ))}
        </div>
      </div>

      {/* ===== SEARCH & SORT ROW ===== */}
      <div className="flex items-center gap-3">
        {/* Search Box */}
        <div className="flex-1 relative max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === "users" ? "users" : "clients"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="pkr-asc">Sort: Lowest PKR</option>
          <option value="pkr-desc">Sort: Highest PKR</option>
          <option value="missed-desc">Sort: Most Missed</option>
          <option value="risk-desc">Sort: Most At Risk</option>
          <option value="total-desc">Sort: Most Total</option>
        </select>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wide sticky top-0">
          <div>{activeTab === "users" ? "User Name" : "Client Name"}</div>
          <div className="text-right">PKR %</div>
          <div className="text-right">Total</div>
          <div className="text-right">Kept</div>
          <div className="text-right">At Risk</div>
          <div className="text-right">Missed</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {filteredAndSorted.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No {activeTab === "users" ? "users" : "clients"} found</p>
            </div>
          ) : (
            filteredAndSorted.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-6 gap-4 p-4 hover:bg-gray-50 transition-colors items-center"
              >
                <div className="font-medium text-gray-900 truncate">{row.name}</div>
                <div className={cn("text-right font-semibold text-lg", getPKRColor(row.pkrPercentage))}>
                  {row.pkrPercentage}%
                </div>
                <div className="text-right text-gray-900 font-medium">{row.total}</div>
                <div className="text-right text-green-700 font-medium">{row.kept}</div>
                <div className="text-right text-amber-700 font-medium">{row.atRisk}</div>
                <div className="text-right text-red-700 font-medium">{row.missed}</div>
              </div>
            ))
          )}
        </div>

        {/* Results Count */}
        {filteredAndSorted.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 text-right">
            Showing {filteredAndSorted.length} of {currentData.length}
          </div>
        )}
      </div>
    </div>
  )
}
