"use client"

import { ChevronDown, FileText, User, Calendar, CheckCircle2 } from "lucide-react"
import { useState } from "react"

interface ActionItem {
  id: string
  description: string
  owner: string
  dueDate: string
  status: "pending" | "in_progress" | "completed"
  priority: "high" | "medium" | "low"
}

interface MeetingNote {
  id: string
  date: string
  title: string
  attendees: string[]
  summary: string
  decisions: string[]
  actionItems: ActionItem[]
  meetingLink?: string
}

export function WeeklyMeetingNotes({ meetings = [] }: { meetings?: MeetingNote[] }) {
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null)

  const mockMeetings: MeetingNote[] =
    meetings.length > 0
      ? meetings
      : [
          {
            id: "meeting-1",
            date: "2026-02-02",
            title: "Weekly Project Sync",
            attendees: ["Sarah Chen", "John Smith", "ABC Manufacturing Contact"],
            summary:
              "Reviewed progress on brand story development and discussed website copy revisions feedback. Aligned on next week deliverables.",
            decisions: [
              "Website copy will be revised with stronger competitive positioning",
              "Color palette approved for all marketing materials",
              "LinkedIn strategy to launch on Feb 10",
            ],
            actionItems: [
              {
                id: "action-1",
                description: "Revise website copy with competitive positioning",
                owner: "John Smith",
                dueDate: "2026-02-05",
                status: "in_progress",
                priority: "high",
              },
              {
                id: "action-2",
                description: "Schedule LinkedIn launch kickoff meeting",
                owner: "Sarah Chen",
                dueDate: "2026-02-09",
                status: "pending",
                priority: "medium",
              },
            ],
          },
          {
            id: "meeting-2",
            date: "2026-01-26",
            title: "Brand Strategy Workshop",
            attendees: ["Sarah Chen", "Michael Johnson", "ABC Manufacturing Contact"],
            summary:
              "Deep dive into brand positioning and storytelling framework. Discussed customer pain points and value propositions.",
            decisions: [
              "Primary brand messaging focuses on operational efficiency",
              "Three hero stories approved for development",
              "Budget approved for video production",
            ],
            actionItems: [
              {
                id: "action-3",
                description: "Create video production brief",
                owner: "John Smith",
                dueDate: "2026-02-01",
                status: "completed",
                priority: "high",
              },
            ],
          },
        ]

  const statusConfig = {
    pending: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]", label: "Pending" },
    in_progress: { bg: "bg-[#E3F2FD]", text: "text-[#0051C3]", label: "In Progress" },
    completed: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", label: "Completed" },
  }

  const priorityConfig = {
    high: { bg: "bg-[#FFEBEE]", text: "text-[#D32F2F]", label: "High" },
    medium: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]", label: "Medium" },
    low: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", label: "Low" },
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#1D1D1F] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#007AFF]" />
          Weekly Meeting Notes
        </h2>
        <p className="text-sm text-[#86868B]">{mockMeetings.length} meetings this month</p>
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {mockMeetings.map((meeting) => (
          <div key={meeting.id} className="bg-white border border-[#E5E5E7] rounded-lg overflow-hidden">
            {/* Meeting Header - Click to Expand */}
            <button
              onClick={() => setExpandedMeeting(expandedMeeting === meeting.id ? null : meeting.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-[#F5F5F7] transition-colors"
            >
              <div className="flex items-start gap-3 flex-1 text-left">
                <FileText className="w-5 h-5 text-[#007AFF] mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-[#1D1D1F]">{meeting.title}</p>
                  <p className="text-sm text-[#86868B]">
                    {new Date(meeting.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-[#86868B] transition-transform ${
                  expandedMeeting === meeting.id ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Meeting Details - Expanded */}
            {expandedMeeting === meeting.id && (
              <div className="border-t border-[#E5E5E7] p-4 bg-[#F8F9FB] space-y-4">
                {/* Attendees */}
                <div>
                  <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">Attendees</p>
                  <div className="flex flex-wrap gap-2">
                    {meeting.attendees.map((attendee) => (
                      <span key={attendee} className="px-2 py-1 bg-white border border-[#E5E5E7] rounded text-xs text-[#1D1D1F]">
                        {attendee}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">Summary</p>
                  <p className="text-sm text-[#515154] leading-relaxed">{meeting.summary}</p>
                </div>

                {/* Decisions */}
                <div>
                  <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">Key Decisions</p>
                  <ul className="space-y-2">
                    {meeting.decisions.map((decision, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-[#1D1D1F]">
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32] flex-shrink-0 mt-0.5" />
                        {decision}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Items */}
                {meeting.actionItems.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">Action Items</p>
                    <div className="space-y-2">
                      {meeting.actionItems.map((action) => (
                        <div key={action.id} className="bg-white border border-[#E5E5E7] rounded p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-medium text-[#1D1D1F]">{action.description}</p>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${priorityConfig[action.priority].bg} ${priorityConfig[action.priority].text}`}>
                              {priorityConfig[action.priority].label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 text-xs text-[#86868B]">
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3" />
                              {action.owner}
                            </div>
                            <div className="flex items-center gap-2">
                              {new Date(action.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${statusConfig[action.status].bg} ${statusConfig[action.status].text}`}>
                              {statusConfig[action.status].label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
