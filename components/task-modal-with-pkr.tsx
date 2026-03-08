"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Clock, User, Flag, AlertCircle, Upload, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: TaskFormData) => Promise<void>
  clientId?: string
  sprintId?: string
  task?: any // For editing existing task
  teamMembers?: Array<{ id: string; full_name: string; email: string }>
}

export interface TaskFormData {
  title: string
  description: string
  assigneeIds: string[] // Changed to array for multiple assignees
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string
  dueTime: string
  promisedDate: string
  promisedTime: string
  phase?: string
  attachments?: Array<{ file: File; name: string }>
}

export function TaskModalWithPKR({
  isOpen,
  onClose,
  onSave,
  clientId,
  sprintId,
  task,
  teamMembers = []
}: TaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    assigneeIds: [],
    priority: 'medium',
    dueDate: '',
    dueTime: '17:00', // Default to 5 PM
    promisedDate: '',
    promisedTime: '09:00', // Default to 9 AM
    phase: '',
    attachments: []
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [bufferWarning, setBufferWarning] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Load task data if editing
  useEffect(() => {
    if (task) {
      const assigneeValue = task.assigneeIds ?? task.assigned_to
      const assigneeIds = Array.isArray(assigneeValue)
        ? assigneeValue
        : assigneeValue
          ? [assigneeValue]
          : []

      setFormData({
        title: task.title || '',
        description: task.description || '',
        assigneeIds,
        priority: task.priority || 'medium',
        dueDate: task.dueDate || task.due_date || '',
        dueTime: task.dueTime || task.due_time || '17:00',
        promisedDate: task.promisedDate || task.promised_date || '',
        promisedTime: task.promisedTime || task.promised_time || '09:00',
        phase: task.phase || '',
        attachments: task.attachments || []
      })
    }
  }, [task])

  // Calculate buffer and show warnings
  useEffect(() => {
    if (formData.dueDate && formData.promisedDate) {
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime || '17:00'}`)
      const promisedDateTime = new Date(`${formData.promisedDate}T${formData.promisedTime || '09:00'}`)
      
      const bufferHours = (promisedDateTime.getTime() - dueDateTime.getTime()) / (1000 * 60 * 60)
      const bufferDays = bufferHours / 24
      
      if (bufferHours < 0) {
        setBufferWarning('⚠️ CRITICAL: Promised date is BEFORE internal deadline! This will create rushed work.')
      } else if (bufferHours < 4) {
        setBufferWarning('⚠️ WARNING: Less than 4 hours buffer. Consider more time for review.')
      } else if (bufferDays < 1) {
        setBufferWarning(`✓ Buffer: ${Math.round(bufferHours)} hours (tight but manageable)`)
      } else {
        setBufferWarning(`✓ Buffer: ${Math.round(bufferDays * 10) / 10} days (healthy buffer)`)
      }
    } else {
      setBufferWarning(null)
    }
  }, [formData.dueDate, formData.dueTime, formData.promisedDate, formData.promisedTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title) return
    
    // Validate PKR dates
    if (!formData.dueDate || !formData.promisedDate) {
      alert('Internal PKR Date and Client Promise Date are required.')
      return
    }

    // Parse dates with times
    const internalDate = new Date(`${formData.dueDate}T${formData.dueTime}`)
    const clientDate = new Date(`${formData.promisedDate}T${formData.promisedTime}`)
    
    // Calculate difference
    const diffMs = clientDate.getTime() - internalDate.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    
    // Client Promise Date must be at least 1 day after Internal PKR Date
    if (diffDays < 1) {
      alert('Client Promise Date must be at least 1 day after the Internal PKR Date.')
      return
    }
    
    setIsSaving(true)
    try {
      await onSave(formData)
      onClose()
      // Reset form
      setFormData({
        title: '',
        description: '',
        assigneeIds: [],
        priority: 'medium',
        dueDate: '',
        dueTime: '17:00',
        promisedDate: '',
        promisedTime: '09:00',
        phase: '',
        attachments: []
      })
    } catch (error) {
      console.error('[v0] Error saving task:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileChange(files)
    }
  }

  const handleFileChange = (files: FileList) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      name: file.name
    }))
    setFormData({
      ...formData,
      attachments: [...(formData.attachments || []), ...newFiles]
    })
  }

  const removeAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachments: (formData.attachments || []).filter((_, i) => i !== index)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white border-b border-[#E5E5E7] px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h2 className="type-h2">{task ? 'Edit Task' : 'Create New Task'}</h2>
            <p className="type-caption text-[#86868B] mt-1">
              {task ? 'Update task details and assignments' : 'Add task details, timelines, and team assignments'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-[#86868B]" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} id="task-form" className="overflow-y-auto flex-1">
          <div className="px-8 py-6 space-y-8">
            {/* Section 1: Task Basics */}
            <div className="space-y-4">
              <div className="type-caption text-[#6B7280] uppercase tracking-wider font-semibold">Task Details</div>
              
              {/* Task Title */}
              <div>
                <label className="type-body font-medium text-[#1C1C1E] block mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Design homepage hero section"
                  className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#E5E5E7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="type-body font-medium text-[#1C1C1E] block mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add task details, requirements, or notes..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#E5E5E7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Attachments */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <label className="type-body font-medium text-[#1C1C1E] block mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#007AFF]" />
                  Attachments
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
                    dragActive
                      ? "border-[#007AFF] bg-white shadow-lg scale-102"
                      : "border-[#007AFF] hover:border-[#0051D5] hover:bg-white"
                  )}
                >
                  <input
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && handleFileChange(e.target.files)}
                    className="hidden"
                    id="file-input"
                    accept=".pdf,.jpg,.jpeg,.docx"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <Upload className="w-8 h-8 text-[#007AFF] mx-auto mb-3" />
                    <p className="type-body font-semibold text-[#1C1C1E]">
                      Click to upload or drag and drop files
                    </p>
                    <p className="type-caption text-[#86868B] mt-2">
                      PDF, DOC, DOCX, JPG, PNG, GIF, MP4, MOV, XLS, XLSX (Max 50MB each)
                    </p>
                  </label>
                </div>

                {/* Attachments List */}
                {(formData.attachments && formData.attachments.length > 0) && (
                  <div className="mt-6 space-y-3">
                    <p className="type-caption font-semibold text-[#6B7280] flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-[#007AFF] text-white rounded-full text-xs font-bold">
                        {formData.attachments.length}
                      </span>
                      {formData.attachments.length === 1 ? 'File attached' : 'Files attached'}
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto bg-white rounded-lg p-3">
                      {formData.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[#007AFF] flex items-center justify-center flex-shrink-0">
                              <Upload className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="type-body text-[#1C1C1E] truncate font-medium">
                                {attachment.name}
                              </p>
                              <p className="type-caption text-[#86868B]">
                                {(attachment.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0 ml-2"
                            title="Remove attachment"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Team & Priority */}
            <div className="space-y-4">
              <div className="type-caption text-[#6B7280] uppercase tracking-wider font-semibold">Assignment & Priority</div>
              
              <div className="grid grid-cols-3 gap-6">
                {/* Assignees (spans 2 columns) */}
                <div className="col-span-2">
                  <label className="type-body font-medium text-[#1C1C1E] mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Assign To Team Members
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto bg-[#F5F5F7] border border-[#E5E5E7] rounded-xl p-4">
                    {teamMembers.length === 0 ? (
                      <p className="type-caption text-[#86868B] italic">No team members available</p>
                    ) : (
                      teamMembers.map((member) => (
                        <label key={member.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.assigneeIds.includes(member.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, assigneeIds: [...formData.assigneeIds, member.id] })
                              } else {
                                setFormData({ ...formData, assigneeIds: formData.assigneeIds.filter((id) => id !== member.id) })
                              }
                            }}
                            className="w-4 h-4 rounded border-[#E5E5E7] text-[#007AFF]"
                          />
                          <div className="min-w-0">
                            <p className="type-body font-medium text-[#1C1C1E] truncate">{member.full_name}</p>
                            <p className="type-caption text-[#86868B] truncate">{member.email}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {formData.assigneeIds.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.assigneeIds.map((id) => {
                        const member = teamMembers.find((m) => m.id === id)
                        return member ? (
                          <span key={id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#007AFF] text-white type-caption rounded-full font-medium">
                            {member.full_name.split(' ')[0]}
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, assigneeIds: formData.assigneeIds.filter((aid) => aid !== id) })}
                              className="hover:opacity-80"
                            >
                              ×
                            </button>
                          </span>
                        ) : null
                      })}
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="type-body font-medium text-[#1C1C1E] mb-2 flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#E5E5E7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Internal PKR Date (Team Commitment) */}
            <div className="bg-gradient-to-br from-[#F8F9FB] to-[#F0F4FF] border-2 border-[#E0E9FF] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#007AFF]"></div>
                <div>
                  <h3 className="type-body font-semibold text-[#1C1C1E]">Internal PKR Date</h3>
                  <p className="type-caption text-[#86868B]">When the team must finish the work. This date is used to measure team PKR.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="type-body font-medium text-[#1C1C1E] mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    PKR Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E5E7] rounded-lg type-body focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="type-body font-medium text-[#1C1C1E] mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    PKR Time
                  </label>
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E5E7] rounded-lg type-body focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <p className="type-caption text-[#86868B] italic">Default: 5:00 PM for internal review buffer</p>
            </div>

            {/* Section 4: Client Promise Date (External Delivery) */}
            <div className="bg-gradient-to-br from-[#F0FFF4] to-[#E8FFF0] border-2 border-[#34C75933] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#34C759]"></div>
                <div>
                  <h3 className="type-body font-semibold text-[#1C1C1E]">Client Promise Date</h3>
                  <p className="type-caption text-[#86868B]">Delivery date promised to the client. Must be at least 1 day after the Internal PKR Date.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="type-body font-medium text-[#1C1C1E] mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Promised Date
                  </label>
                  <input
                    type="date"
                    value={formData.promisedDate}
                    onChange={(e) => setFormData({ ...formData, promisedDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E5E7] rounded-lg type-body focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="type-body font-medium text-[#1C1C1E] mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Promised Time
                  </label>
                  <input
                    type="time"
                    value={formData.promisedTime}
                    onChange={(e) => setFormData({ ...formData, promisedTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E5E7] rounded-lg type-body focus:outline-none focus:ring-2 focus:ring-[#34C759] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <p className="type-caption text-[#86868B] italic">Default: 9:00 AM - client-facing commitment</p>
            </div>

            {/* Section 5: Buffer Warning/Info */}
            {bufferWarning && (
              <div className={cn(
                "flex items-start gap-3 p-4 rounded-xl type-body",
                bufferWarning.includes('CRITICAL') 
                  ? 'bg-red-50 border-2 border-red-200 text-red-800'
                  : bufferWarning.includes('WARNING')
                  ? 'bg-amber-50 border-2 border-amber-200 text-amber-800'
                  : 'bg-emerald-50 border-2 border-emerald-200 text-emerald-800'
              )}>
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{bufferWarning}</p>
                </div>
              </div>
            )}
          </div>
        </form>
        {/* Footer - Sticky Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-[#E5E5E7] px-8 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 type-body font-medium text-[#86868B] hover:bg-[#F5F5F7] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-form"
            disabled={isSaving || !formData.title}
            className="px-6 py-2.5 type-body font-medium text-white bg-[#007AFF] hover:bg-[#0051D5] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isSaving ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
