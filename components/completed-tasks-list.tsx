"use client"

import { CheckCircle2, Copy } from "lucide-react"
import { useState } from "react"

interface Task {
  id: string
  task_id?: string
  title: string
  client_name: string
  due_date: string
  completed_date: string
}

interface CompletedTasksListProps {
  tasks: Task[]
}

export function CompletedTasksList({ tasks }: CompletedTasksListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyTaskToClipboard = (task: Task) => {
    const text = `${task.task_id || task.id} - ${task.title}\nClient: ${task.client_name}\nCompleted: ${new Date(task.completed_date).toLocaleDateString()}`
    navigator.clipboard.writeText(text)
    setCopiedIndex(tasks.indexOf(task))
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const copyAllToClipboard = () => {
    const text = tasks
      .map((task) => `${task.task_id || task.id} - ${task.title}\nClient: ${task.client_name}\nCompleted: ${new Date(task.completed_date).toLocaleDateString()}`)
      .join("\n\n")
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Completed Tasks</h2>
          <p className="text-sm text-gray-600 mt-1">{tasks.length} tasks completed in this period</p>
        </div>
        {tasks.length > 0 && (
          <button
            onClick={copyAllToClipboard}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Copy className="w-4 h-4" />
            Copy All
          </button>
        )}
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-600">No completed tasks in this period</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-start justify-between gap-4 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-xs font-mono text-gray-500">{task.task_id || task.id}</p>
                </div>
                <p className="font-medium text-gray-900 mb-1 break-words">{task.title}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{task.client_name}</span>
                  <span>Completed: {new Date(task.completed_date).toLocaleDateString()}</span>
                  {task.due_date && (
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => copyTaskToClipboard(task)}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-2 rounded-lg hover:bg-gray-200 text-gray-600"
                title="Copy task details"
              >
                <Copy className="w-4 h-4" />
                {copiedIndex === index && (
                  <span className="absolute right-12 top-4 text-xs text-green-600 font-medium whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
