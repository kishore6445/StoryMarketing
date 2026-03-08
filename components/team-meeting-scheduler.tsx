"use client"

import { useState } from "react"
import { Calendar, Users, Clock, Plus, ChevronDown, ChevronRight, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import useSWR from 'swr'

interface TeamMeeting {
  id: string
  title?: string
  client_id?: string
  date: string
  time: string
  attendees: Array<{ id: string; full_name: string; role: string }>
  status: "scheduled" | "completed" | "cancelled"
  notes: string
  repeat_weekly?: boolean
  summary?: string
  key_decisions?: string[]
  action_items?: Array<{ id: string; description: string; owner: string; dueDate: Date; completed: boolean }>
  recording_url?: string
}

interface User {
  id: string
  full_name: string
  email: string
  role: string
}

interface TeamMeetingSchedulerProps {
  clientId?: string
  clientName?: string
  onScheduleMeeting?: (meeting: Partial<TeamMeeting>) => void
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem('sessionToken')
  const response = await fetch(url, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  })
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

export function TeamMeetingScheduler({ clientId, clientName, onScheduleMeeting }: TeamMeetingSchedulerProps) {
  const { data: meetingsData, mutate } = useSWR(
    clientId ? `/api/meetings?clientId=${clientId}` : '/api/meetings',
    fetcher,
    { revalidateOnFocus: false }
  )

  const { data: clientsData } = useSWR('/api/team-members?role=client', fetcher)
  const { data: teamData } = useSWR('/api/team-members', fetcher)

  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null)
  const [detailsFormData, setDetailsFormData] = useState({
    title: '',
    summary: '',
    keyDecisions: [''],
    actionItems: [{ description: '', assignedTo: '', dueDate: '' }]
  })
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '10:00',
    repeatWeekly: true,
    selectedClient: clientId || '',
    selectedAttendees: [] as string[],
    notes: ''
  })

  const meetings = meetingsData?.meetings || []
  const clients = clientsData?.users || []
  const teamMembers = teamData?.users || []

  const completedMeetings = meetings.filter((m: TeamMeeting) => m.status === "completed")
  const upcomingMeetings = meetings.filter((m: TeamMeeting) => m.status === "scheduled")

  const handleScheduleMeeting = async () => {
    if (!formData.date || !formData.time) {
      console.log('[v0] Missing required fields')
      return
    }

    // Sanitize clientId - only use if it's a valid UUID format
    const isValidClientId = formData.selectedClient && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.selectedClient)
    const sanitizedClientId = isValidClientId ? formData.selectedClient : null

    const newMeeting = {
      id: `temp-${Date.now()}`,
      title: formData.title,
      client_id: sanitizedClientId,
      date: formData.date,
      time: formData.time,
      repeat_weekly: formData.repeatWeekly,
      attendees: formData.selectedAttendees.map(id => {
        const member = teamMembers.find((m: User) => m.id === id)
        return member ? { id: member.id, full_name: member.full_name, role: member.role } : null
      }).filter(Boolean),
      status: 'scheduled' as const,
      notes: formData.notes
    }

    // Optimistic update
    mutate({ meetings: [...meetings, newMeeting] }, false)
    setShowScheduleModal(false)

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: formData.title,
          clientId: sanitizedClientId,
          date: formData.date,
          time: formData.time,
          repeatWeekly: formData.repeatWeekly,
          attendees: formData.selectedAttendees,
          notes: formData.notes
        })
      })

      if (response.ok) {
        const { meeting } = await response.json()
        console.log('[v0] Meeting created successfully:', meeting)
        mutate()
        onScheduleMeeting?.(meeting)
        setFormData({
          title: '',
          date: '',
          time: '10:00',
          repeatWeekly: true,
          selectedClient: clientId || '',
          selectedAttendees: [],
          notes: ''
        })
      } else {
        console.error('[v0] Failed to create meeting')
        mutate()
      }
    } catch (error) {
      console.error('[v0] Error creating meeting:', error)
      mutate()
    }
  }

  const handleDeleteMeeting = async (meetingId: string) => {
    // Optimistic update
    mutate({ meetings: meetings.filter((m: TeamMeeting) => m.id !== meetingId) }, false)

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch(`/api/meetings?id=${meetingId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (response.ok) {
        console.log('[v0] Meeting deleted successfully')
        mutate()
      } else {
        console.error('[v0] Failed to delete meeting')
        mutate()
      }
    } catch (error) {
      console.error('[v0] Error deleting meeting:', error)
      mutate()
    }
  }

  const toggleAttendee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAttendees: prev.selectedAttendees.includes(userId)
        ? prev.selectedAttendees.filter(id => id !== userId)
        : [...prev.selectedAttendees, userId]
    }))
  }

  const handleOpenDetailsModal = (meeting: TeamMeeting) => {
    setShowDetailsModal(meeting.id)
    setDetailsFormData({
      title: meeting.title || '',
      summary: meeting.summary || '',
      keyDecisions: meeting.key_decisions?.length > 0 ? meeting.key_decisions : [''],
      actionItems: meeting.action_items?.length > 0 
        ? meeting.action_items.map(item => ({
            description: item.description,
            assignedTo: item.owner,
            dueDate: new Date(item.dueDate).toISOString().split('T')[0]
          }))
        : [{ description: '', assignedTo: '', dueDate: '' }]
    })
  }

  const handleSaveMeetingDetails = async () => {
    if (!showDetailsModal) return

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch(`/api/meetings/${showDetailsModal}/details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: detailsFormData.title,
          summary: detailsFormData.summary,
          keyDecisions: detailsFormData.keyDecisions.filter(d => d.trim() !== ''),
          actionItems: detailsFormData.actionItems
            .filter(item => item.description.trim() !== '')
            .map(item => ({
              description: item.description,
              assignedTo: item.assignedTo || null,
              dueDate: item.dueDate || null
            }))
        })
      })

      if (response.ok) {
        console.log('[v0] Meeting details saved successfully')
        mutate()
        setShowDetailsModal(null)
      } else {
        console.error('[v0] Failed to save meeting details')
      }
    } catch (error) {
      console.error('[v0] Error saving meeting details:', error)
    }
  }

  const addKeyDecision = () => {
    setDetailsFormData(prev => ({
      ...prev,
      keyDecisions: [...prev.keyDecisions, '']
    }))
  }

  const updateKeyDecision = (index: number, value: string) => {
    setDetailsFormData(prev => ({
      ...prev,
      keyDecisions: prev.keyDecisions.map((d, i) => i === index ? value : d)
    }))
  }

  const removeKeyDecision = (index: number) => {
    setDetailsFormData(prev => ({
      ...prev,
      keyDecisions: prev.keyDecisions.filter((_, i) => i !== index)
    }))
  }

  const addActionItem = () => {
    setDetailsFormData(prev => ({
      ...prev,
      actionItems: [...prev.actionItems, { description: '', assignedTo: '', dueDate: '' }]
    }))
  }

  const updateActionItem = (index: number, field: string, value: string) => {
    setDetailsFormData(prev => ({
      ...prev,
      actionItems: prev.actionItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeActionItem = (index: number) => {
    setDetailsFormData(prev => ({
      ...prev,
      actionItems: prev.actionItems.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#1D1D1F]">Team Meetings</h2>
          <p className="text-sm text-[#86868B] mt-1">Weekly sync for {clientName}</p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2E7D32] text-white rounded-lg font-medium hover:bg-[#1B5E20] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </button>
      </div>

      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
          <h3 className="text-base font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#007AFF]" />
            Upcoming Meeting
          </h3>

          {upcomingMeetings.map((meeting: TeamMeeting) => (
            <div key={meeting.id} className="p-4 border border-[#E5E5E7] rounded-lg hover:bg-[#F8F9FB] transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  {meeting.title && (
                    <div className="text-base font-semibold text-[#1D1D1F] mb-1">
                      {meeting.title}
                    </div>
                  )}
                  <div className="text-sm font-semibold text-[#1D1D1F]">
                    {new Date(meeting.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} at {meeting.time}
                  </div>
                  {meeting.repeat_weekly && (
                    <div className="text-xs text-[#86868B] mt-1">Every week</div>
                  )}
                </div>
                <span className="px-3 py-1 bg-[#E3F2FD] text-[#0051C3] text-xs font-medium rounded-full">Scheduled</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-[#515154]">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {meeting.attendees?.length || 0} attendees
                </div>
              </div>

              {meeting.notes && (
                <p className="text-sm text-[#515154] mt-2">{meeting.notes}</p>
              )}

              <div className="mt-3 flex gap-2">
                <button 
                  onClick={() => handleOpenDetailsModal(meeting)}
                  className="text-xs font-medium text-[#007AFF] hover:text-[#0051C3]"
                >
                  Add Details
                </button>
                <button 
                  onClick={() => handleDeleteMeeting(meeting.id)}
                  className="text-xs font-medium text-[#FF3B30] hover:text-[#C41E00]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past Meetings */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
        <h3 className="text-base font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#34C759]" />
          Meeting History
        </h3>

        <div className="space-y-3">
          {completedMeetings.length > 0 ? (
            completedMeetings.map((meeting: TeamMeeting) => (
              <div key={meeting.id}>
                <button
                  onClick={() => setExpandedMeetingId(expandedMeetingId === meeting.id ? null : meeting.id)}
                  className="w-full text-left p-3 rounded-lg border border-[#E5E5E7] hover:bg-[#F8F9FB] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <CheckCircle2Icon />
                    <div>
                      <div className="text-sm font-semibold text-[#1D1D1F]">
                        {meeting.title || new Date(meeting.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <div className="text-xs text-[#86868B]">{meeting.attendees?.length || 0} attendees • {meeting.time}{!meeting.title && ` • ${new Date(meeting.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}</div>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn("w-4 h-4 text-[#86868B] transition-transform", expandedMeetingId === meeting.id && "rotate-180")}
                  />
                </button>

                {/* Expanded Meeting Details */}
                {expandedMeetingId === meeting.id && (
                  <div className="mt-2 ml-3 border-l-2 border-[#E5E5E7] pl-4 py-3 space-y-4">
                    {/* Summary */}
                    {meeting.summary && (
                      <div>
                        <h4 className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-2">Summary</h4>
                        <p className="text-sm text-[#515154] leading-relaxed">{meeting.summary}</p>
                      </div>
                    )}

                    {/* Key Decisions */}
                    {meeting.key_decisions && meeting.key_decisions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-2">Key Decisions</h4>
                        <ul className="space-y-1">
                          {meeting.key_decisions.map((decision, index) => (
                            <li key={index} className="text-sm text-[#515154] leading-relaxed flex gap-2">
                              <span className="text-[#007AFF]">•</span>
                              <span>{decision}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Notes */}
                    {meeting.notes && (
                      <div>
                        <h4 className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-2">Meeting Notes</h4>
                        <p className="text-sm text-[#515154] leading-relaxed">{meeting.notes}</p>
                      </div>
                    )}

                    {/* Attendees */}
                    {meeting.attendees && meeting.attendees.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-2">Attendees</h4>
                        <div className="flex flex-wrap gap-2">
                          {meeting.attendees.map((attendee) => (
                            <div key={attendee.id} className="px-2 py-1 bg-[#F5F5F7] rounded text-xs text-[#515154]">
                              {attendee.full_name}
                              <span className="text-[#86868B]"> • {attendee.role}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Items */}
                    {meeting.action_items && meeting.action_items.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider mb-2">Action Items</h4>
                        <div className="space-y-2">
                          {meeting.action_items.map((item) => (
                            <div key={item.id} className="flex items-start gap-2 p-2 bg-[#F8F9FB] rounded">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                className="mt-1 w-4 h-4 rounded border-[#D1D1D6] text-[#2E7D32]"
                                readOnly
                              />
                              <div className="flex-1">
                                <p className={cn("text-sm", item.completed ? "line-through text-[#86868B]" : "text-[#515154]")}>
                                  {item.description}
                                </p>
                                <p className="text-xs text-[#86868B] mt-1">
                                  {item.owner} • Due {new Date(item.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recording */}
                    {meeting.recording_url && (
                      <div>
                        <a
                          href={meeting.recording_url}
                          className="text-sm text-[#007AFF] hover:text-[#0051C3] font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Recording →
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-[#86868B]">No past meetings yet</p>
          )}
        </div>
      </div>

      {/* Meeting Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-[#1D1D1F]">Edit Meeting Details</h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Meeting Title</label>
              <input
                type="text"
                value={detailsFormData.title}
                onChange={(e) => setDetailsFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-[#D1D1D6] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                placeholder="e.g., Weekly Team Sync"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Summary</label>
              <textarea
                value={detailsFormData.summary}
                onChange={(e) => setDetailsFormData(prev => ({ ...prev, summary: e.target.value }))}
                className="w-full px-3 py-2 border border-[#D1D1D6] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF] resize-none"
                rows={4}
                placeholder="Enter meeting summary..."
              />
            </div>

            {/* Key Decisions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#1D1D1F]">Key Decisions</label>
                <button
                  onClick={addKeyDecision}
                  className="text-xs font-medium text-[#007AFF] hover:text-[#0051C3]"
                >
                  + Add Decision
                </button>
              </div>
              <div className="space-y-2">
                {detailsFormData.keyDecisions.map((decision, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={decision}
                      onChange={(e) => updateKeyDecision(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#D1D1D6] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                      placeholder={`Decision ${index + 1}`}
                    />
                    {detailsFormData.keyDecisions.length > 1 && (
                      <button
                        onClick={() => removeKeyDecision(index)}
                        className="px-3 py-2 text-[#FF3B30] hover:bg-[#FFEBEE] rounded-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#1D1D1F]">Action Items</label>
                <button
                  onClick={addActionItem}
                  className="text-xs font-medium text-[#007AFF] hover:text-[#0051C3]"
                >
                  + Add Action Item
                </button>
              </div>
              <div className="space-y-3">
                {detailsFormData.actionItems.map((item, index) => (
                  <div key={index} className="border border-[#E5E5E7] rounded-lg p-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateActionItem(index, 'description', e.target.value)}
                        className="flex-1 px-3 py-2 border border-[#D1D1D6] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                        placeholder="Action item description"
                      />
                      {detailsFormData.actionItems.length > 1 && (
                        <button
                          onClick={() => removeActionItem(index)}
                          className="px-3 py-2 text-[#FF3B30] hover:bg-[#FFEBEE] rounded-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={item.assignedTo}
                        onChange={(e) => updateActionItem(index, 'assignedTo', e.target.value)}
                        className="flex-1 px-3 py-2 border border-[#D1D1D6] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF] bg-white"
                      >
                        <option value="">Assign to...</option>
                        {teamMembers.map((member: User) => (
                          <option key={member.id} value={member.id}>{member.full_name}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={item.dueDate}
                        onChange={(e) => updateActionItem(index, 'dueDate', e.target.value)}
                        className="px-3 py-2 border border-[#D1D1D6] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setShowDetailsModal(null)}
                className="flex-1 px-4 py-2 border border-[#D1D1D6] rounded-lg text-sm font-medium text-[#1D1D1F] hover:bg-[#F8F9FB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMeetingDetails}
                className="flex-1 px-4 py-2 bg-[#2E7D32] text-white rounded-lg text-sm font-medium hover:bg-[#1B5E20] transition-colors"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-[#1D1D1F]">Schedule Team Meeting</h3>

            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Meeting Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-[#D1D1D6] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                placeholder="e.g., Weekly Team Sync"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Meeting Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-[#D1D1D6] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Time</label>
              <input 
                type="time" 
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-[#D1D1D6] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Repeat Weekly</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.repeatWeekly}
                  onChange={(e) => setFormData(prev => ({ ...prev, repeatWeekly: e.target.checked }))}
                  className="w-4 h-4 rounded border-[#D1D1D6]" 
                />
                <span className="text-sm text-[#515154]">Yes, every week</span>
              </label>
            </div>

            {!clientId && (
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Client (Optional)</label>
                <select
                  value={formData.selectedClient}
                  onChange={(e) => setFormData(prev => ({ ...prev, selectedClient: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#D1D1D6] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                >
                  <option value="">No client</option>
                  {clients.map((client: User) => (
                    <option key={client.id} value={client.id}>{client.full_name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Team Members (Optional)</label>
              <div className="border border-[#D1D1D6] rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member: User) => (
                    <label key={member.id} className="flex items-center gap-2 cursor-pointer hover:bg-[#F8F9FB] p-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.selectedAttendees.includes(member.id)}
                        onChange={() => toggleAttendee(member.id)}
                        className="w-4 h-4 rounded border-[#D1D1D6]"
                      />
                      <div className="flex-1">
                        <div className="text-sm text-[#1D1D1F]">{member.full_name}</div>
                        <div className="text-xs text-[#86868B]">{member.role}</div>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-[#86868B]">No team members available</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-[#D1D1D6] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF] resize-none"
                rows={3}
                placeholder="Add meeting notes or agenda..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2 border border-[#D1D1D6] rounded-lg text-sm font-medium text-[#1D1D1F] hover:bg-[#F8F9FB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleMeeting}
                disabled={!formData.date || !formData.time}
                className="flex-1 px-4 py-2 bg-[#2E7D32] text-white rounded-lg text-sm font-medium hover:bg-[#1B5E20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CheckCircle2Icon() {
  return (
    <svg className="w-5 h-5 text-[#34C759]" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  )
}
