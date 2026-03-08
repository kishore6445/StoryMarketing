"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

interface InlineSprintCreatorProps {
  clientId?: string
  sprints: Array<{ id: string; name: string; start_date: string; end_date: string; status: string }>
  selectedSprintId?: string
  onSprintChange: (sprintId: string | null) => void
  onSprintCreated?: () => void
}

export function InlineSprintCreator({
  clientId,
  sprints,
  selectedSprintId,
  onSprintChange,
  onSprintCreated,
}: InlineSprintCreatorProps) {
  const [showForm, setShowForm] = useState(false)
  const [sprintName, setSprintName] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateSprint = async () => {
    if (!sprintName.trim() || !clientId) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch("/api/sprints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId,
          name: sprintName,
          start_date: startDate,
          end_date: endDate,
          status: "planning",
        }),
      })

      if (response.ok) {
        const newSprint = await response.json()
        setSprintName("")
        setStartDate(new Date().toISOString().split("T")[0])
        setEndDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
        setShowForm(false)
        onSprintCreated?.()
      }
    } catch (error) {
      console.error("[v0] Error creating sprint:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedSprint = sprints.find((s) => s.id === selectedSprintId)

  return (
    <div className="space-y-3">
      {/* Current Sprint Display */}
      {selectedSprint ? (
        <div className="flex items-center justify-between p-3 bg-[#F5F5F7] rounded-lg">
          <div>
            <p className="text-xs text-[#86868B] uppercase tracking-wide">Active Sprint</p>
            <p className="text-sm font-medium text-[#1D1D1F]">{selectedSprint.name}</p>
            <p className="text-xs text-[#86868B] mt-1">
              {selectedSprint.start_date} - {selectedSprint.end_date}
            </p>
          </div>
          <button
            onClick={() => onSprintChange(null)}
            className="p-1 hover:bg-white rounded transition-all"
          >
            <X className="w-4 h-4 text-[#86868B]" />
          </button>
        </div>
      ) : sprints.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-[#86868B] uppercase tracking-wide">Select Sprint</p>
          <div className="space-y-1">
            {sprints.map((sprint) => (
              <button
                key={sprint.id}
                onClick={() => onSprintChange(sprint.id)}
                className="w-full text-left p-2 hover:bg-[#F5F5F7] rounded transition-all text-sm text-[#1D1D1F]"
              >
                <span className="font-medium">{sprint.name}</span>
                <span className="text-xs text-[#86868B] ml-2">
                  {sprint.start_date} - {sprint.end_date}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Create Sprint Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[#E5E5E7] rounded-lg hover:bg-[#F5F5F7] transition-all text-sm font-medium text-[#1D1D1F]"
        >
          <Plus className="w-4 h-4" />
          Create Sprint
        </button>
      ) : (
        <div className="p-4 border border-[#E5E5E7] rounded-lg bg-white space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] mb-1">Sprint Name</label>
            <input
              type="text"
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              placeholder="e.g., Q1 Planning"
              className="w-full px-3 py-2 text-sm border border-[#E5E5E7] rounded focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#E5E5E7] rounded focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#E5E5E7] rounded focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-3 py-2 text-sm border border-[#E5E5E7] rounded hover:bg-[#F5F5F7] transition-all text-[#1D1D1F] font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSprint}
              disabled={!sprintName.trim() || isSubmitting}
              className="flex-1 px-3 py-2 text-sm bg-[#007AFF] text-white rounded hover:opacity-90 disabled:opacity-50 transition-all font-medium"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
