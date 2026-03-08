"use client"

import { useState } from "react"
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface IndividualPKR {
  id: string
  name: string
  email: string
  pkrPercentage: number
  totalPromises: number
  keptPromises: number
  atRiskPromises: number
  missedPromises: number
  weeklyTrend?: number[] // PKR % for each of last 8 weeks
}

interface ClientPKR {
  id: string
  name: string
  pkrPercentage: number
  totalPromises: number
  keptPromises: number
  assignedTo: string
  sprintCount: number
  trend: "up" | "down" | "stable"
  weeklyTrend?: number[] // PKR % for each of last 8 weeks
}

interface PKRViewProps {
  teamMembers?: IndividualPKR[]
  clientData?: ClientPKR[]
}

type SortField = "pkr" | "total" | "kept" | "missed" | "atRisk"
type SortDirection = "asc" | "desc"
type TimelineFilter = "week" | "month" | "custom"

// Sparkline component - renders PKR trend as Unicode blocks
function Sparkline({ trend }: { trend?: number[] }) {
  if (!trend || trend.length === 0) return <span className="text-gray-400 text-xs">—</span>
  
  // Map PKR percentages to Unicode block characters (▁ to █)
  const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"]
  const normalized = trend.map(value => {
    const normalized = Math.round((value / 100) * 7) // Map 0-100 to 0-7
    return Math.max(0, Math.min(7, normalized))
  })
  
  const sparklineText = normalized.map(i => blocks[i]).join("")
  
  return (
    <span className="font-mono text-xs text-gray-600 tracking-tight">
      {sparklineText}
    </span>
  )
}

export function ComprehensivePKRView({ teamMembers = [], clientData = [] }: PKRViewProps) {
  const [activeTab, setActiveTab] = useState<"individual" | "client">("individual")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("pkr")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [showZeroTasks, setShowZeroTasks] = useState(false)
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>("week")

  // Filter out zero-task members if toggle is off
  const activeMembers = teamMembers.filter(m => showZeroTasks || m.totalPromises > 0)
  const activeClients = clientData.filter(c => showZeroTasks || c.totalPromises > 0)

  // Overall stats - calculated from active items only
  const totalPromises = activeMembers.reduce((sum, m) => sum + m.totalPromises, 0)
  const totalKept = activeMembers.reduce((sum, m) => sum + m.keptPromises, 0)
  const totalAtRisk = activeMembers.reduce((sum, m) => sum + m.atRiskPromises, 0)
  const totalMissed = activeMembers.reduce((sum, m) => sum + m.missedPromises, 0)
  const overallPKR = totalPromises > 0 ? Math.round((totalKept / totalPromises) * 100) : 0
  const activeContributors = teamMembers.filter(m => m.totalPromises > 0).length

  // Filter and sort team members
  const filteredTeam = activeMembers
    .filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let compareValue = 0
      switch (sortField) {
        case "pkr":
          compareValue = a.pkrPercentage - b.pkrPercentage
          break
        case "total":
          compareValue = a.totalPromises - b.totalPromises
          break
        case "kept":
          compareValue = a.keptPromises - b.keptPromises
          break
        case "missed":
          compareValue = a.missedPromises - b.missedPromises
          break
        case "atRisk":
          compareValue = a.atRiskPromises - b.atRiskPromises
          break
      }
      return sortDirection === "asc" ? compareValue : -compareValue
    })

  // Filter and sort clients
  const filteredClients = activeClients
    .filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let compareValue = 0
      switch (sortField) {
        case "pkr":
          compareValue = a.pkrPercentage - b.pkrPercentage
          break
        case "total":
          compareValue = a.totalPromises - b.totalPromises
          break
        case "kept":
          compareValue = a.keptPromises - b.keptPromises
          break
      }
      return sortDirection === "asc" ? compareValue : -compareValue
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    return sortDirection === "asc" ? 
      <ArrowUp className="w-4 h-4 text-blue-600" /> : 
      <ArrowDown className="w-4 h-4 text-blue-600" />
  }

  const getPKRColor = (pkr: number) => {
    if (pkr > 70) return "text-green-700 font-semibold"
    if (pkr >= 40) return "text-amber-700 font-semibold"
    return "text-red-700 font-semibold"
  }

  return (
    <div className="space-y-6">
      {/* Top Summary Strip */}
      <div className="grid grid-cols-6 gap-3 bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-600 mb-1">PKR</p>
          <p className={cn("text-3xl font-bold", getPKRColor(overallPKR))}>{overallPKR}%</p>
        </div>
        <div className="text-center border-l border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-900">{totalPromises}</p>
        </div>
        <div className="text-center border-l border-gray-200">
          <p className="text-xs font-semibold text-green-700 mb-1">Kept</p>
          <p className="text-3xl font-bold text-green-700">{totalKept}</p>
        </div>
        <div className="text-center border-l border-gray-200">
          <p className="text-xs font-semibold text-amber-700 mb-1">At Risk</p>
          <p className="text-3xl font-bold text-amber-700">{totalAtRisk}</p>
        </div>
        <div className="text-center border-l border-gray-200">
          <p className="text-xs font-semibold text-red-700 mb-1">Missed</p>
          <p className="text-3xl font-bold text-red-700">{totalMissed}</p>
        </div>
        <div className="text-center border-l border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-1">Active</p>
          <p className="text-3xl font-bold text-gray-900">{activeContributors}</p>
        </div>
      </div>

      {/* Timeline Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Timeline:</span>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { value: "week" as TimelineFilter, label: "This Week" },
            { value: "month" as TimelineFilter, label: "This Month" },
            { value: "custom" as TimelineFilter, label: "Custom" }
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setTimelineFilter(filter.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded transition-colors",
                timelineFilter === filter.value
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("individual")}
            className={cn(
              "px-4 py-3 font-medium text-sm border-b-2 transition-colors",
              activeTab === "individual"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            )}
          >
            By User
          </button>
          <button
            onClick={() => setActiveTab("client")}
            className={cn(
              "px-4 py-3 font-medium text-sm border-b-2 transition-colors",
              activeTab === "client"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            )}
          >
            By Client
          </button>
        </div>
        {activeTab === "individual" && (
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={showZeroTasks}
              onChange={(e) => setShowZeroTasks(e.target.checked)}
              className="rounded cursor-pointer"
            />
            Show users with no tasks
          </label>
        )}
      </div>

      {/* Search Controls */}
      <div className="flex gap-3">
        <div className="flex-1 relative max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Individual View - Table */}
      {activeTab === "individual" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Name</th>
                  <th 
                    className="px-6 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("pkr")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      PKR {renderSortIcon("pkr")}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("total")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Total {renderSortIcon("total")}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("kept")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Kept {renderSortIcon("kept")}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("pkr")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      PKR & Trend {renderSortIcon("pkr")}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("missed")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Missed {renderSortIcon("missed")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeam.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{member.name}</p>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className={cn("min-w-10", getPKRColor(member.pkrPercentage))}>
                          {member.pkrPercentage}%
                        </span>
                        <Sparkline trend={member.weeklyTrend} />
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-900">{member.totalPromises}</td>
                    <td className="px-6 py-3 text-right text-gray-900">{member.keptPromises}</td>
                    <td className="px-6 py-3 text-right text-gray-900">{member.atRiskPromises}</td>
                    <td className="px-6 py-3 text-right text-gray-900">{member.missedPromises}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTeam.length === 0 && (
            <div className="text-center py-12 text-gray-500">No members found</div>
          )}
        </div>
      )}

      {/* Client View - Table */}
      {activeTab === "client" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Client</th>
                  <th 
                    className="px-6 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("pkr")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      PKR & Trend {renderSortIcon("pkr")}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("total")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Total {renderSortIcon("total")}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("kept")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Kept {renderSortIcon("kept")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{client.name}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className={cn("min-w-10", getPKRColor(client.pkrPercentage))}>
                          {client.pkrPercentage}%
                        </span>
                        <Sparkline trend={client.weeklyTrend} />
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-900">{client.totalPromises}</td>
                    <td className="px-6 py-3 text-right text-gray-900">{client.keptPromises}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={cn(
                        "font-semibold",
                        client.trend === "up" ? "text-green-700" : 
                        client.trend === "down" ? "text-red-700" : 
                        "text-gray-600"
                      )}>
                        {client.trend === "up" ? "↑" : client.trend === "down" ? "↓" : "→"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredClients.length === 0 && (
            <div className="text-center py-12 text-gray-500">No clients found</div>
          )}
        </div>
      )}
    </div>
  )
}
