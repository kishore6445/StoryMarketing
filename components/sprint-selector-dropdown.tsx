"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Plus, X, MoreVertical, Trash2, Edit2, Users } from "lucide-react"

interface Sprint {
  id: string
  name: string
  start_date: string
  end_date: string
  status: "planning" | "active" | "completed"
}

interface SprintSelectorDropdownProps {
  sprints: Sprint[]
  selectedSprintId?: string
  onSprintChange: (sprintId: string | null) => void
  onSprintCreated?: (sprint: Sprint) => void
  onSprintUpdated?: (sprint: Sprint) => void
  onSprintDeleted?: (sprintId: string) => void
  isLoading?: boolean
  clientId?: string
  teamMembers?: Array<{ id: string; full_name: string; email: string }>
}

export function SprintSelectorDropdown({
  sprints,
  selectedSprintId,
  onSprintChange,
  onSprintCreated,
  onSprintUpdated,
  onSprintDeleted,
  isLoading,
  clientId,
  teamMembers = [],
}: SprintSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState<string | null>(null)
  const [newSprintName, setNewSprintName] = useState("")
  const [newSprintStart, setNewSprintStart] = useState("")
  const [newSprintEnd, setNewSprintEnd] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setOpenMenuId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedSprint = sprints.find((s) => s.id === selectedSprintId)

  const handleCreateSprint = async () => {
    if (!newSprintName.trim() || !newSprintStart || !newSprintEnd || !clientId) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/clients/${clientId}/sprints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newSprintName,
          start_date: newSprintStart,
          end_date: newSprintEnd,
          status: "planning",
        }),
      })

      if (response.ok) {
        const newSprint = await response.json()
        onSprintCreated?.(newSprint)
        onSprintChange(newSprint.id)
        setNewSprintName("")
        setNewSprintStart("")
        setNewSprintEnd("")
        setIsCreating(false)
        setIsOpen(false)
      }
    } catch (error) {
      console.error("[v0] Error creating sprint:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSprint = async (sprintId: string) => {
    if (!newSprintName.trim() || !newSprintStart || !newSprintEnd) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/account-manager/sprints/${sprintId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newSprintName,
          startDate: newSprintStart,
          endDate: newSprintEnd,
        }),
      })

      if (response.ok) {
        const updatedSprint = await response.json()
        onSprintUpdated?.(updatedSprint.sprint)
        setIsEditing(null)
        setNewSprintName("")
        setNewSprintStart("")
        setNewSprintEnd("")
        setOpenMenuId(null)
      }
    } catch (error) {
      console.error("[v0] Error updating sprint:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSprint = async (sprintId: string) => {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/account-manager/sprints/${sprintId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        onSprintDeleted?.(sprintId)
        setDeleteConfirm(null)
        setOpenMenuId(null)
        if (selectedSprintId === sprintId) {
          onSprintChange(null)
        }
      }
    } catch (error) {
      console.error("[v0] Error deleting sprint:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEditSprint = (sprint: Sprint) => {
    setIsEditing(sprint.id)
    setNewSprintName(sprint.name)
    setNewSprintStart(sprint.start_date)
    setNewSprintEnd(sprint.end_date)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1D1D1F] bg-white border border-[#E5E5E7] rounded-lg hover:bg-[#F5F5F7] transition-all"
      >
        <div className="text-left">
          <span className="truncate max-w-[200px] block">
            {selectedSprint ? selectedSprint.name : "No Sprint"}
          </span>
          {selectedSprint && (
            <span className="text-xs text-[#86868B] block">
              {new Date(selectedSprint.start_date).toLocaleDateString()} - {new Date(selectedSprint.end_date).toLocaleDateString()}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-[#86868B] transition-transform ml-auto flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-[#E5E5E7] rounded-lg shadow-lg z-50 min-w-[300px]">
          {/* Sprint List */}
          <div className="max-h-[300px] overflow-y-auto">
            {/* No Sprint Option */}
            <button
              onClick={() => {
                onSprintChange(null)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F5F5F7] transition-colors flex items-center justify-between ${
                !selectedSprintId ? "bg-[#F5F5F7] font-medium" : "text-[#86868B]"
              }`}
            >
              <span>No Sprint</span>
              {!selectedSprintId && <div className="w-2 h-2 bg-[#007AFF] rounded-full" />}
            </button>

            {/* Sprint Options */}
            {sprints.length > 0 && (
              <>
                <div className="px-4 py-1.5 text-xs font-semibold text-[#86868B] uppercase tracking-wider">
                  Available Sprints
                </div>
                {sprints.map((sprint) => (
                  <div
                    key={sprint.id}
                    className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[#F5F5F7] transition-colors group"
                  >
                    <button
                      onClick={() => {
                        onSprintChange(sprint.id)
                        setIsOpen(false)
                      }}
                      className={`flex-1 text-left ${selectedSprintId === sprint.id ? "font-medium" : ""}`}
                    >
                      <div className="font-medium text-[#1D1D1F]">{sprint.name}</div>
                      <div className="text-xs text-[#86868B]">
                        {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                      </div>
                    </button>
                    
                    {/* Sprint Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === sprint.id ? null : sprint.id)}
                        className="p-1 rounded-lg hover:bg-[#E5E5E7] transition-all opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-4 h-4 text-[#86868B]" />
                      </button>

                      {openMenuId === sprint.id && (
                        <div className="absolute right-0 mt-1 bg-white border border-[#E5E5E7] rounded-lg shadow-lg z-50 min-w-[140px]">
                          <button
                            onClick={() => startEditSprint(sprint)}
                            className="w-full text-left px-4 py-2.5 text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors flex items-center gap-2 font-medium"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => setIsAssigning(sprint.id)}
                            className="w-full text-left px-4 py-2.5 text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors flex items-center gap-2 font-medium border-t border-[#E5E5E7]"
                          >
                            <Users className="w-4 h-4" />
                            Assign Team
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(sprint.id)}
                            className="w-full text-left px-4 py-2.5 text-sm text-[#E53935] hover:bg-[#FFEBEE] transition-colors flex items-center gap-2 font-medium border-t border-[#E5E5E7]"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Edit Sprint Form */}
          {isEditing ? (
            <div className="border-t border-[#E5E5E7] p-4 space-y-3">
              <h4 className="text-sm font-medium text-[#1D1D1F]">Edit Sprint</h4>
              <input
                type="text"
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                placeholder="Sprint name"
                className="w-full px-3 py-2 text-sm border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={newSprintStart}
                  onChange={(e) => setNewSprintStart(e.target.value)}
                  className="px-3 py-2 text-sm border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
                <input
                  type="date"
                  value={newSprintEnd}
                  onChange={(e) => setNewSprintEnd(e.target.value)}
                  className="px-3 py-2 text-sm border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditSprint(isEditing)}
                  disabled={!newSprintName.trim() || !newSprintStart || !newSprintEnd || isSubmitting}
                  className="flex-1 px-3 py-1.5 text-sm bg-[#007AFF] text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium transition-all"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(null)
                    setNewSprintName("")
                    setNewSprintStart("")
                    setNewSprintEnd("")
                  }}
                  className="px-3 py-1.5 text-sm bg-[#F5F5F7] text-[#1D1D1F] rounded-lg hover:bg-[#E5E5E7] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : deleteConfirm ? (
            <div className="border-t border-[#E5E5E7] p-4 space-y-3">
              <p className="text-sm text-[#1D1D1F]">Delete this sprint? This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteSprint(deleteConfirm)}
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-1.5 text-sm bg-[#E53935] text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium transition-all"
                >
                  {isSubmitting ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-3 py-1.5 text-sm bg-[#F5F5F7] text-[#1D1D1F] rounded-lg hover:bg-[#E5E5E7] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : isAssigning ? (
            <div className="border-t border-[#E5E5E7] p-4 space-y-3">
              <h4 className="text-sm font-medium text-[#1D1D1F]">Assign Team Members</h4>
              {teamMembers.length === 0 ? (
                <p className="text-sm text-[#86868B] italic">No team members available</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 p-2 hover:bg-[#F5F5F7] rounded cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAssignees.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAssignees([...selectedAssignees, member.id])
                          } else {
                            setSelectedAssignees(selectedAssignees.filter((id) => id !== member.id))
                          }
                        }}
                        className="w-4 h-4 rounded border-[#E5E5E7]"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1D1D1F] truncate">{member.full_name}</p>
                        <p className="text-xs text-[#86868B] truncate">{member.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-1.5 text-sm bg-[#007AFF] text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium transition-all"
                >
                  {isSubmitting ? "Assigning..." : "Assign"}
                </button>
                <button
                  onClick={() => {
                    setIsAssigning(null)
                    setSelectedAssignees([])
                  }}
                  className="px-3 py-1.5 text-sm bg-[#F5F5F7] text-[#1D1D1F] rounded-lg hover:bg-[#E5E5E7] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : isCreating ? (
            <div className="border-t border-[#E5E5E7] p-4 space-y-3">
              <input
                type="text"
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                placeholder="Sprint name"
                className="w-full px-3 py-2 text-sm border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={newSprintStart}
                  onChange={(e) => setNewSprintStart(e.target.value)}
                  className="px-3 py-2 text-sm border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
                <input
                  type="date"
                  value={newSprintEnd}
                  onChange={(e) => setNewSprintEnd(e.target.value)}
                  className="px-3 py-2 text-sm border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateSprint}
                  disabled={!newSprintName.trim() || !newSprintStart || !newSprintEnd || isSubmitting}
                  className="flex-1 px-3 py-1.5 text-sm bg-[#007AFF] text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium transition-all"
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewSprintName("")
                    setNewSprintStart("")
                    setNewSprintEnd("")
                  }}
                  className="px-3 py-1.5 text-sm bg-[#F5F5F7] text-[#1D1D1F] rounded-lg hover:bg-[#E5E5E7] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-[#E5E5E7] p-4">
              <button
                onClick={() => setIsCreating(true)}
                className="w-full px-4 py-2.5 text-sm text-[#007AFF] hover:bg-[#F5F5F7] transition-colors flex items-center gap-2 font-medium rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Create New Sprint
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
