"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MoreVertical, Copy, Edit, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskWorkspaceOverview } from "@/components/task-workspace-overview"
import { TaskWorkspaceDiscussion } from "@/components/task-workspace-discussion"
import { TaskWorkspaceActivity } from "@/components/task-workspace-activity"
import { TaskWorkspaceFiles } from "@/components/task-workspace-files"
import { TaskWorkspaceSidebar } from "@/components/task-workspace-sidebar"
import { TaskModalWithPKR, TaskFormData } from "@/components/task-modal-with-pkr"

type TabType = "overview" | "discussion" | "activity" | "files"

interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "in_review" | "done"
  priority: "low" | "medium" | "high" | "urgent"
  assignee?: { id: string; name: string; email: string }
  client?: { id: string; name: string }
  sprint?: { id: string; name: string }
  phase?: string
  dueDate?: string
  promisedDate?: string
  createdBy?: { id: string; name: string }
  createdAt?: string
  updatedAt?: string
}

export default function TaskWorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.taskId as string
  const encodedTaskId = encodeURIComponent(taskId)
  
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [statusBlocked, setStatusBlocked] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const workspaceTaskId = task?.id || taskId

  // Fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("sessionToken")
        console.log("[v0] Fetching task with ID:", taskId, "Token:", token ? "present" : "missing")
        
        if (!token) {
          console.error("[v0] No session token found in localStorage")
          setTask(null)
          return
        }
        
        const response = await fetch(`/api/tasks/${encodedTaskId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
        console.log("[v0] Task API response status:", response.status)
         // debugger;

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Task data received:", data)
          setTask(data)
        } else if (response.status === 401 || response.status === 403) {
          console.error("[v0] Authentication failed - session may have expired")
          localStorage.removeItem("sessionToken")
          setTask(null)
        } else {
          const errorData = await response.json()
          console.error("[v0] Task fetch failed with status:", response.status, "Error:", errorData)
          setTask(null)
        }
      } catch (error) {
        console.error("[v0] Error fetching task:", error)
        setTask(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (taskId) {
      fetchTask()
    }
  }, [taskId, encodedTaskId])

  const handleStatusChange = async (newStatus: "todo" | "in_progress" | "in_review" | "done") => {
    if (!task) return
    
    // Block moving to "in_review" if subtasks are incomplete
    if (newStatus === "in_review" && statusBlocked) {
      alert("Cannot move to Review. Please complete all subtasks first.")
      return
    }
    
    try {
      setIsChangingStatus(true)
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/tasks/${encodedTaskId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        setTask({ ...task, status: newStatus })
        setShowStatusMenu(false)
      }
    } catch (error) {
      console.error("[v0] Error updating task status:", error)
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleAssigneeChange = async (assigneeId: string | null) => {
    if (!task) return

    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/tasks/${encodedTaskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ assigned_to: assigneeId })
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTask(updatedTask)
        console.log("[v0] Task assignee updated:", updatedTask)
      }
    } catch (error) {
      console.error("[v0] Error updating assignee:", error)
    }
  }

  const handleEditTask = async (formData: TaskFormData) => {
    if (!task) return

    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/tasks/${encodedTaskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          phase: formData.phase,
          due_date: formData.dueDate,
          due_time: formData.dueTime,
          promised_date: formData.promisedDate,
          promised_time: formData.promisedTime
        })
      })

      if (response.ok) {
        const updatedTask = await response.json()

        const attachmentsToUpload = (formData.attachments || []).filter(
          (attachment) => attachment?.file instanceof File
        )

        for (const attachment of attachmentsToUpload) {
          const uploadFormData = new FormData()
          uploadFormData.append("file", attachment.file)

          const uploadResponse = await fetch(`/api/tasks/${encodedTaskId}/files`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
            body: uploadFormData,
          })

          if (!uploadResponse.ok) {
            console.error("[v0] Failed to upload attachment while updating task:", await uploadResponse.text())
          }
        }

        setTask(updatedTask)
        setShowEditModal(false)
        console.log("[v0] Task updated successfully:", updatedTask)
      }
    } catch (error) {
      console.error("[v0] Error updating task:", error)
      alert("Failed to update task. Please try again.")
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/tasks/${taskId}`
    navigator.clipboard.writeText(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
            <p className="text-gray-600 mb-2">The task you're looking for could not be loaded_test.</p>
            <p className="text-sm text-gray-500">This might be due to:</p>
            <ul className="text-sm text-gray-500 text-left mt-3 space-y-1 ml-4">
              <li>• The task was deleted or archived</li>
              <li>• You don't have access to this task</li>
              <li>• Your session has expired - try logging in again</li>
            </ul>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const statusOptions = [
    { value: "todo" as const, label: "To Do", icon: Circle },
    { value: "in_progress" as const, label: "In Progress", icon: Circle },
    { value: "in_review" as const, label: "In Review", icon: Circle },
    { value: "done" as const, label: "Done", icon: CheckCircle2 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy link"
              >
                <Copy className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Client Label & Task Title */}
          <div className="mb-2">
            {task.client_id && (
              <span className="inline-block px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium mb-2">
                {task.client_id}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h1>

          {/* Status, Priority, Phase Dropdowns */}
          <div className="flex items-center gap-3 mb-6">
            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                disabled={isChangingStatus}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Circle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {task.status === "in_progress" ? "In Progress" : task.status === "in_review" ? "In Review" : task.status === "todo" ? "To Do" : "Done"}
                </span>
              </button>
              {showStatusMenu && (
                <div className="absolute top-full mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                <span>Priority: {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || "Not set"}</span>
              </button>
            </div>

            {/* Phase Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                <span>Phase: {task.phase || "Not set"}</span>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (task.status !== "in_review") {
                  handleStatusChange("in_review")
                }
              }}
              disabled={isChangingStatus || task.status === "in_review"}
              className="px-4 py-2 bg-orange-100 text-orange-700 font-medium text-sm rounded-lg hover:bg-orange-200 disabled:opacity-50 transition-colors"
            >
              Move to Review
            </button>
            <button
              onClick={() => {
                if (task.status !== "done") {
                  handleStatusChange("done")
                }
              }}
              disabled={isChangingStatus || task.status === "done"}
              className="px-4 py-2 bg-green-100 text-green-700 font-medium text-sm rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
            >
              Mark Done
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-blue-100 text-blue-700 font-medium text-sm rounded-lg hover:bg-blue-200 transition-colors"
            >
              Edit Task
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left: Main Content */}
          <div className="col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "discussion", label: "Discussion" },
                  { id: "activity", label: "Activity" },
                  { id: "files", label: "Files" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={cn(
                      "px-6 py-4 font-medium text-sm transition-colors border-b-2 -mb-px",
                      activeTab === tab.id
                        ? "text-blue-600 border-b-blue-600"
                        : "text-gray-600 border-b-transparent hover:text-gray-900"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "overview" && <TaskWorkspaceOverview task={task} onStatusBlocked={setStatusBlocked} />}
                {activeTab === "discussion" && <TaskWorkspaceDiscussion taskId={workspaceTaskId} />}
                {activeTab === "activity" && <TaskWorkspaceActivity taskId={workspaceTaskId} />}
                {activeTab === "files" && <TaskWorkspaceFiles taskId={workspaceTaskId} />}
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="col-span-1">
            <TaskWorkspaceSidebar 
              task={task} 
              onAssigneeChange={handleAssigneeChange}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      {task && (
        <TaskModalWithPKR
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditTask}
          task={{
            title: task.title,
            description: task.description,
            assigneeIds: task.assigned_to ? [task.assigned_to] : [],
            priority: task.priority,
            dueDate: task.due_date,
            dueTime: task.due_time,
            promisedDate: task.promised_date,
            promisedTime: task.promised_time,
            phase: task.phase
          }}
        />
      )}
    </div>
  )
}
