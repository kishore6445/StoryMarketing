"use client"

import { useState, useMemo } from "react"
import { Copy, Check, Users, ChevronDown } from "lucide-react"
import useSWR from "swr"
import { cn } from "@/lib/utils"

interface TeamMember {
  id: string
  full_name: string
  email: string
  task_count: number
  task_ids: string[]
}

const fetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json())
}

export function TeamTasksSidebar() {
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedMember, setExpandedMember] = useState<string | null>(null)

  // Fetch tasks data
  const { data: tasksData } = useSWR("/api/my-tasks", fetcher, { revalidateOnFocus: false })
  const { data: usersData } = useSWR("/api/users", fetcher, { revalidateOnFocus: false })

  // Calculate team member task counts and IDs
  const teamMembers = useMemo(() => {
    if (!tasksData?.tasks || !usersData?.users) return []

    const memberMap = new Map<string, TeamMember>()

    // Initialize all users
    usersData.users.forEach((user: any) => {
      memberMap.set(user.id, {
        id: user.id,
        full_name: user.full_name || "Unknown",
        email: user.email || "",
        task_count: 0,
        task_ids: [],
      })
    })

    // Count tasks per member
    tasksData.tasks.forEach((task: any) => {
      const assignedTo = task.assigned_to || task.owner
      if (assignedTo && memberMap.has(assignedTo)) {
        const member = memberMap.get(assignedTo)!
        member.task_count += 1
        if (task.task_id) {
          member.task_ids.push(task.task_id)
        }
      }
    })

    // Return sorted by task count (descending)
    return Array.from(memberMap.values()).sort((a, b) => b.task_count - a.task_count)
  }, [tasksData?.tasks, usersData?.users])

  const selectedMembersList = Array.from(selectedMembers)
    .map(id => teamMembers.find(m => m.id === id))
    .filter(Boolean) as TeamMember[]

  const allSelectedTaskIds = selectedMembersList.flatMap(m => m.task_ids)

  const handleSelectMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers)
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId)
    } else {
      newSelected.add(memberId)
    }
    setSelectedMembers(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedMembers.size === teamMembers.length) {
      setSelectedMembers(new Set())
    } else {
      setSelectedMembers(new Set(teamMembers.map(m => m.id)))
    }
  }

  const handleCopyTaskIds = (taskIds: string[], format: 'comma' | 'newline' | 'list') => {
    if (taskIds.length === 0) return

    let clipboardText = ""
    if (format === 'comma') {
      clipboardText = taskIds.join(", ")
    } else if (format === 'newline') {
      clipboardText = taskIds.join("\n")
    } else {
      clipboardText = taskIds.map((id, i) => `${i + 1}. ${id}`).join("\n")
    }

    navigator.clipboard.writeText(clipboardText)
    setCopiedId(`${format}`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="w-64 bg-white border-r border-[#E5E5E7] flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E5E7] sticky top-0 bg-white">
        <h2 className="font-black text-[#1D1D1F] text-sm uppercase tracking-widest flex items-center gap-2 mb-4">
          <Users className="w-4 h-4" />
          Team Task Manager
        </h2>

        {/* Select All */}
        <button
          onClick={handleSelectAll}
          className="w-full px-3 py-2 text-xs font-semibold text-[#007AFF] bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
        >
          {selectedMembers.size === teamMembers.length ? "Deselect All" : "Select All"}
        </button>
      </div>

      {/* Team Members List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-3">
          {teamMembers.length === 0 ? (
            <p className="text-xs text-[#86868B] text-center py-4">No team members</p>
          ) : (
            teamMembers.map((member) => {
              const isSelected = selectedMembers.has(member.id)
              const isExpanded = expandedMember === member.id

              return (
                <div key={member.id} className="space-y-1">
                  {/* Member Row */}
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all cursor-pointer",
                      isSelected
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-[#E5E5E7] hover:bg-[#F5F5F7]"
                    )}
                    onClick={() => handleSelectMember(member.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-[#D1D1D6] accent-[#007AFF] cursor-pointer"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1D1D1F] truncate">
                        {member.full_name}
                      </p>
                      <p className="text-[11px] text-[#86868B] truncate">
                        {member.task_count} {member.task_count === 1 ? "task" : "tasks"}
                      </p>
                    </div>

                    {member.task_count > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedMember(isExpanded ? null : member.id)
                        }}
                        className="p-1 hover:bg-white rounded transition-all"
                      >
                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 text-[#86868B] transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {/* Task IDs for Member */}
                  {isExpanded && member.task_ids.length > 0 && (
                    <div className="ml-6 p-2 bg-[#FAFAFA] rounded-lg border border-[#E5E5E7] space-y-1.5">
                      <div className="space-y-1">
                        {member.task_ids.map((taskId) => (
                          <div
                            key={taskId}
                            className="flex items-center justify-between gap-2 px-2 py-1 bg-white rounded border border-[#E5E5E7] hover:border-[#D1D1D6]"
                          >
                            <code className="text-[10px] font-mono font-bold text-[#007AFF]">
                              {taskId}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(taskId)
                                setCopiedId(taskId)
                                setTimeout(() => setCopiedId(null), 1500)
                              }}
                              className="p-0.5 hover:bg-blue-50 rounded transition-all"
                              title="Copy task ID"
                            >
                              {copiedId === taskId ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-[#86868B] hover:text-[#007AFF]" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Bulk Copy Options */}
                      <div className="pt-1 border-t border-[#E5E5E7] flex gap-1">
                        <button
                          onClick={() => handleCopyTaskIds(member.task_ids, "comma")}
                          className="flex-1 px-2 py-1 text-[10px] font-semibold text-[#007AFF] bg-blue-50 hover:bg-blue-100 rounded transition-all"
                          title="Copy as comma-separated"
                        >
                          {copiedId === "comma" ? "✓" : "Copy"}
                        </button>
                        <button
                          onClick={() => handleCopyTaskIds(member.task_ids, "newline")}
                          className="flex-1 px-2 py-1 text-[10px] font-semibold text-[#007AFF] bg-blue-50 hover:bg-blue-100 rounded transition-all"
                          title="Copy one per line"
                        >
                          {copiedId === "newline" ? "✓" : "List"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Bulk Copy Footer - Selected Members */}
      {selectedMembers.size > 0 && (
        <div className="p-4 border-t border-[#E5E5E7] bg-blue-50 space-y-3 sticky bottom-0">
          <div className="text-xs">
            <p className="font-semibold text-[#1D1D1F] mb-1">
              {selectedMembers.size} member{selectedMembers.size !== 1 ? "s" : ""} selected
            </p>
            <p className="text-[#86868B]">
              {allSelectedTaskIds.length} total task{allSelectedTaskIds.length !== 1 ? "s" : ""}
            </p>
          </div>

          {allSelectedTaskIds.length > 0 && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleCopyTaskIds(allSelectedTaskIds, "comma")}
                className={cn(
                  "w-full px-3 py-2 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                  copiedId === "comma"
                    ? "bg-green-100 text-green-700"
                    : "bg-[#007AFF] text-white hover:opacity-90"
                )}
              >
                {copiedId === "comma" ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied (Comma)
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy (Comma)
                  </>
                )}
              </button>

              <button
                onClick={() => handleCopyTaskIds(allSelectedTaskIds, "list")}
                className={cn(
                  "w-full px-3 py-2 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                  copiedId === "list"
                    ? "bg-green-100 text-green-700"
                    : "bg-[#007AFF] text-white hover:opacity-90"
                )}
              >
                {copiedId === "list" ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied (List)
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy (List)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
