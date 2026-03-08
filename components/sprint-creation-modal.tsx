"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"

interface Sprint {
  id: string
  name: string
  start_date: string
  end_date: string
  status: "planning" | "active" | "completed"
  assignees?: string[]
}

interface SprintCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSprintCreated: (sprint: Sprint) => void
  teamMembers: Array<{ id: string; full_name: string; email: string }>
  clientId: string
}

export function SprintCreationModal({
  isOpen,
  onClose,
  onSprintCreated,
  teamMembers,
  clientId,
}: SprintCreationModalProps) {
  const [sprintName, setSprintName] = useState("")
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const today = new Date()
    today.setDate(today.getDate() + 7)
    return today.toISOString().split("T")[0]
  })
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const toggleAssignee = (memberId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    )
  }

  const handleCreateSprint = async () => {
    if (!sprintName.trim() || !startDate || !endDate) return

    setIsCreating(true)
    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch("/api/sprints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: sprintName,
          clientId,
          start_date: startDate,
          end_date: endDate,
          assignees: selectedAssignees,
          status: "planning",
        }),
      })

      if (response.ok) {
        const newSprint = await response.json()
        onSprintCreated(newSprint)
        setSprintName("")
        setSelectedAssignees([])
        onClose()
      }
    } catch (error) {
      console.error("[v0] Error creating sprint:", error)
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#E5E5E7] flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-[#1D1D1F]">Create New Sprint</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F5F5F7] rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-[#86868B]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sprint Name */}
          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Sprint Name *</label>
            <input
              type="text"
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              placeholder="e.g., Week of Feb 10 - Client ABC"
              className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
            </div>
          </div>

          {/* Team Member Assignment */}
          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-3">Assign Team Members</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {teamMembers.length === 0 ? (
                <p className="text-sm text-[#86868B] italic">No team members available</p>
              ) : (
                teamMembers.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-3 border border-[#E5E5E7] rounded-lg hover:bg-[#F5F5F7] cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssignees.includes(member.id)}
                      onChange={() => toggleAssignee(member.id)}
                      className="w-4 h-4 rounded border-[#E5E5E7]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1D1D1F]">{member.full_name}</p>
                      <p className="text-xs text-[#86868B]">{member.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Selected Assignees Summary */}
          {selectedAssignees.length > 0 && (
            <div className="bg-[#F5F5F7] rounded-lg p-3">
              <p className="text-xs font-medium text-[#86868B] mb-2">
                {selectedAssignees.length} team member{selectedAssignees.length === 1 ? "" : "s"} assigned
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedAssignees.map((memberId) => {
                  const member = teamMembers.find((m) => m.id === memberId)
                  return member ? (
                    <span
                      key={memberId}
                      className="px-3 py-1 bg-white border border-[#E5E5E7] rounded-full text-xs font-medium text-[#1D1D1F]"
                    >
                      {member.full_name}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E5E5E7] flex gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white border border-[#E5E5E7] text-[#1D1D1F] rounded-lg font-medium hover:bg-[#F5F5F7] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateSprint}
            disabled={!sprintName.trim() || !startDate || !endDate || isCreating}
            className="flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? "Creating..." : "Create Sprint"}
          </button>
        </div>
      </div>
    </div>
  )
}
