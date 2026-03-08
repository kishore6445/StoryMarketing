"use client"

import { useState } from "react"
import { X, ChevronDown, Check } from "lucide-react"

export interface FilterState {
  status: string[]
  priority: string[]
  assignee: string[]
  dueDate: string[]
  category: string[]
}

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: FilterState) => void
  initialFilters?: FilterState
}

export function FilterPanel({ isOpen, onClose, onApplyFilters, initialFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      status: [],
      priority: [],
      assignee: [],
      dueDate: [],
      category: [],
    }
  )

  const filterOptions = {
    status: [
      { id: "completed", label: "Completed", count: 24 },
      { id: "in-progress", label: "In Progress", count: 12 },
      { id: "not-started", label: "Not Started", count: 8 },
      { id: "blocked", label: "Blocked", count: 3 },
    ],
    priority: [
      { id: "high", label: "High", count: 15 },
      { id: "medium", label: "Medium", count: 18 },
      { id: "low", label: "Low", count: 14 },
    ],
    assignee: [
      { id: "sarah", label: "Sarah Chen", count: 12 },
      { id: "ravi", label: "Ravi Patel", count: 10 },
      { id: "alex", label: "Alex Rodriguez", count: 8 },
      { id: "jordan", label: "Jordan Smith", count: 7 },
      { id: "unassigned", label: "Unassigned", count: 10 },
    ],
    dueDate: [
      { id: "today", label: "Due Today", count: 3 },
      { id: "this-week", label: "Due This Week", count: 8 },
      { id: "this-month", label: "Due This Month", count: 15 },
      { id: "overdue", label: "Overdue", count: 2 },
    ],
    category: [
      { id: "task", label: "Task", count: 20 },
      { id: "campaign", label: "Campaign", count: 5 },
      { id: "document", label: "Document", count: 12 },
      { id: "phase", label: "Phase", count: 7 },
    ],
  }

  const handleFilterToggle = (category: keyof FilterState, id: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(id) ? prev[category].filter((item) => item !== id) : [...prev[category], id],
    }))
  }

  const handleClearAll = () => {
    setFilters({
      status: [],
      priority: [],
      assignee: [],
      dueDate: [],
      category: [],
    })
  }

  const handleApply = () => {
    onApplyFilters(filters)
    onClose()
  }

  const activeFilterCount = Object.values(filters).reduce((total, arr) => total + arr.length, 0)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      {/* Filter Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white border-l border-[#E5E5E7] z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E7]">
          <h2 className="text-lg font-semibold text-[#1D1D1F]">Filters</h2>
          <button onClick={onClose} className="text-[#86868B] hover:text-[#1D1D1F] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Groups */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Status Filter */}
            <FilterGroup
              title="Status"
              options={filterOptions.status}
              selectedIds={filters.status}
              onToggle={(id) => handleFilterToggle("status", id)}
            />

            {/* Priority Filter */}
            <FilterGroup
              title="Priority"
              options={filterOptions.priority}
              selectedIds={filters.priority}
              onToggle={(id) => handleFilterToggle("priority", id)}
            />

            {/* Assignee Filter */}
            <FilterGroup
              title="Assigned To"
              options={filterOptions.assignee}
              selectedIds={filters.assignee}
              onToggle={(id) => handleFilterToggle("assignee", id)}
            />

            {/* Due Date Filter */}
            <FilterGroup
              title="Due Date"
              options={filterOptions.dueDate}
              selectedIds={filters.dueDate}
              onToggle={(id) => handleFilterToggle("dueDate", id)}
            />

            {/* Category Filter */}
            <FilterGroup
              title="Category"
              options={filterOptions.category}
              selectedIds={filters.category}
              onToggle={(id) => handleFilterToggle("category", id)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E5E5E7] p-6 flex gap-3">
          <button
            onClick={handleClearAll}
            className="flex-1 px-4 py-2 text-sm font-medium text-[#1D1D1F] bg-[#F5F5F7] rounded-lg hover:bg-[#E5E5E7] transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#2E7D32] rounded-lg hover:bg-[#1B5E20] transition-colors"
          >
            {activeFilterCount > 0 ? `Apply (${activeFilterCount})` : "Apply"}
          </button>
        </div>
      </div>
    </>
  )
}

interface FilterGroupProps {
  title: string
  options: Array<{ id: string; label: string; count: number }>
  selectedIds: string[]
  onToggle: (id: string) => void
}

function FilterGroup({ title, options, selectedIds, onToggle }: FilterGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3 text-sm font-semibold text-[#1D1D1F] hover:text-[#007AFF] transition-colors"
      >
        {title}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-2 ml-2">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 cursor-pointer py-2 px-2 rounded hover:bg-[#F8F9FB] transition-colors"
            >
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(option.id)}
                  onChange={() => onToggle(option.id)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    selectedIds.includes(option.id)
                      ? "bg-[#007AFF] border-[#007AFF]"
                      : "border-[#D1D1D6] hover:border-[#007AFF]"
                  }`}
                >
                  {selectedIds.includes(option.id) && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>

              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm text-[#1D1D1F]">{option.label}</span>
                <span className="text-xs text-[#86868B] bg-[#F3F3F6] px-2 py-0.5 rounded">
                  {option.count}
                </span>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
