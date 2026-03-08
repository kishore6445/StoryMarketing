"use client"

import { useState } from "react"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import { FileText, Sheet, Presentation, LinkIcon, Trash2, Check } from "lucide-react"

interface SectionWorkspaceProps {
  sectionId: string | null | undefined
  clientId: string
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem('sessionToken')
  const res = await fetch(url, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

const getDocumentIcon = (type: string) => {
  switch (type) {
    case "google_doc":
    case "doc":
      return <FileText className="w-4 h-4 text-[#4285F4]" />
    case "google_sheet":
    case "sheet":
      return <Sheet className="w-4 h-4 text-[#0F9D58]" />
    case "slide":
      return <Presentation className="w-4 h-4 text-[#F4B400]" />
    default:
      return <LinkIcon className="w-4 h-4 text-[#86868B]" />
  }
}

export function SectionWorkspace({ sectionId, clientId }: SectionWorkspaceProps) {
  const { data: tasksData, mutate: mutateTasks } = useSWR(
    sectionId ? `/api/tasks?sectionId=${sectionId}` : null, 
    fetcher,
    { revalidateOnFocus: false }
  )
  const { data: docsData, mutate: mutateDocs } = useSWR(
    sectionId ? `/api/documents?sectionId=${sectionId}` : null, 
    fetcher,
    { revalidateOnFocus: false }
  )

  const [isAddingDoc, setIsAddingDoc] = useState(false)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newDocName, setNewDocName] = useState("")
  const [newDocLink, setNewDocLink] = useState("")
  const [newDocType, setNewDocType] = useState("link")
  const [newTaskTitle, setNewTaskTitle] = useState("")

  const tasks = tasksData?.tasks || []
  const documents = docsData?.documents || []

  if (!sectionId) {
    return (
      <div className="mt-6 pt-6 border-t border-[#F5F5F7]">
        <p className="text-sm text-[#86868B]">Section not found. Please select a valid section.</p>
      </div>
    )
  }

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    
    // Optimistic update
    const optimisticData = { tasks: tasks.map((t: any) => t.id === taskId ? { ...t, status: newStatus } : t) }
    mutateTasks(optimisticData, false)
    
    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ taskId, status: newStatus }),
      })
      
      if (!response.ok) {
        // Rollback on error
        mutateTasks()
        console.error('[v0] Failed to toggle task')
      } else {
        // Revalidate to sync with server
        mutateTasks()
      }
    } catch (error) {
      // Rollback on error
      mutateTasks()
      console.error('[v0] Error toggling task:', error)
    }
  }

  const addDocument = async () => {
    if (!newDocName.trim() || !newDocLink.trim() || !sectionId) return

    // Create temp ID for optimistic update
    const tempId = `temp-${Date.now()}`
    const newDoc = {
      id: tempId,
      title: newDocName,
      url: newDocLink,
      doc_type: newDocType,
      section_id: sectionId,
    }

    // Optimistic update
    const optimisticData = { documents: [...documents, newDoc] }
    mutateDocs(optimisticData, false)

    setNewDocName("")
    setNewDocLink("")
    setNewDocType("link")
    setIsAddingDoc(false)

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sectionId,
          title: newDocName,
          url: newDocLink,
          docType: newDocType,
          clientId,
        }),
      })

      if (!response.ok) {
        console.error('[v0] Failed to add document')
      }
      
      // Revalidate to get server data with real ID
      mutateDocs()
    } catch (error) {
      console.error('[v0] Error adding document:', error)
      mutateDocs()
    }
  }

  const deleteDocument = async (docId: string) => {
    // Optimistic update
    const optimisticData = { documents: documents.filter((d: any) => d.id !== docId) }
    mutateDocs(optimisticData, false)

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/documents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ documentId: docId }),
      })

      if (!response.ok) {
        console.error('[v0] Failed to delete document')
        mutateDocs()
      } else {
        mutateDocs()
      }
    } catch (error) {
      console.error('[v0] Error deleting document:', error)
      mutateDocs()
    }
  }

  const addTask = async () => {
    if (!newTaskTitle.trim() || !sectionId) return

    // Create temp ID for optimistic update
    const tempId = `temp-${Date.now()}`
    const newTask = {
      id: tempId,
      title: newTaskTitle,
      status: 'todo',
      section_id: sectionId,
    }

    // Optimistic update
    const optimisticData = { tasks: [...tasks, newTask] }
    mutateTasks(optimisticData, false)

    setNewTaskTitle("")
    setIsAddingTask(false)

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sectionId,
          title: newTaskTitle,
          status: 'todo',
          clientId,
        }),
      })

      if (!response.ok) {
        console.error('[v0] Failed to add task')
      }
      
      // Revalidate to get server data with real ID
      mutateTasks()
    } catch (error) {
      console.error('[v0] Error adding task:', error)
      mutateTasks()
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-[#F5F5F7] space-y-8">
      {/* Documents Section */}
      <div>
        <h3 className="text-xs font-medium text-[#86868B] uppercase tracking-wider mb-4">Documents</h3>

        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#F5F5F7] transition-colors group">
                <a
                  href={doc.url || doc.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 flex-1"
                >
                  {getDocumentIcon(doc.doc_type || doc.type)}
                  <span className="text-sm text-[#1D1D1F] flex-1 group-hover:text-[#007AFF] transition-colors truncate">
                    {doc.title || doc.name}
                  </span>
                </a>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="p-1 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !isAddingDoc && <p className="text-sm text-[#86868B]">No documents yet</p>
        )}

        {isAddingDoc && (
          <div className="bg-[#F8F9FB] rounded-lg p-4 space-y-3 mt-3">
            <input
              type="text"
              placeholder="Document name"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
              autoFocus
            />
            <input
              type="url"
              placeholder="Document link (URL)"
              value={newDocLink}
              onChange={(e) => setNewDocLink(e.target.value)}
              className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
            />
            <select
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value)}
              className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
            >
              <option value="link">Link</option>
              <option value="doc">Google Doc</option>
              <option value="sheet">Google Sheet</option>
              <option value="slide">Google Slides</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={addDocument}
                className="px-4 py-2 bg-[#007AFF] text-white text-sm rounded-lg hover:bg-[#0056CC] transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingDoc(false)
                  setNewDocName("")
                  setNewDocLink("")
                  setNewDocType("link")
                }}
                className="px-4 py-2 text-[#86868B] text-sm hover:text-[#1D1D1F] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!isAddingDoc && (
          <button
            onClick={() => setIsAddingDoc(true)}
            className="text-sm text-[#86868B] hover:text-[#007AFF] transition-colors mt-2"
          >
            + Add document
          </button>
        )}
      </div>

      {/* Tasks Section */}
      <div>
        <h3 className="text-xs font-medium text-[#86868B] uppercase tracking-wider mb-4">Tasks for this section</h3>

        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task: any) => (
              <label key={task.id} className="flex items-start gap-3 cursor-pointer group">
                <button
                  onClick={() => toggleTask(task.id, task.status)}
                  className={cn(
                    "mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                    task.status === 'done' ? "bg-[#007AFF] border-[#007AFF]" : "border-[#D1D1D6] hover:border-[#007AFF]",
                  )}
                >
                  {task.status === 'done' && <Check className="w-2.5 h-2.5 text-white" />}
                </button>
                <span
                  className={cn("text-sm flex-1", task.status === 'done' ? "text-[#86868B] line-through" : "text-[#1D1D1F]")}
                >
                  {task.title}
                </span>
              </label>
            ))}
          </div>
        ) : (
          !isAddingTask && <p className="text-sm text-[#86868B]">No tasks yet</p>
        )}

        {isAddingTask && (
          <div className="bg-[#F8F9FB] rounded-lg p-4 space-y-3 mt-3">
            <input
              type="text"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") addTask()
                if (e.key === "Escape") {
                  setIsAddingTask(false)
                  setNewTaskTitle("")
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={addTask}
                className="px-4 py-2 bg-[#007AFF] text-white text-sm rounded-lg hover:bg-[#0056CC] transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingTask(false)
                  setNewTaskTitle("")
                }}
                className="px-4 py-2 text-[#86868B] text-sm hover:text-[#1D1D1F] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!isAddingTask && (
          <button
            onClick={() => setIsAddingTask(true)}
            className="text-sm text-[#86868B] hover:text-[#007AFF] transition-colors mt-2"
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  )
}
