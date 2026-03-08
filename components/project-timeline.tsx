"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: "deadline" | "milestone" | "phase-start" | "phase-end"
  color: string
  client?: string
}

interface GanttTask {
  id: string
  name: string
  startDate: Date
  endDate: Date
  progress: number
  color: string
  assignee?: string
  phase?: string
}

interface ProjectTimelineProps {
  clientId?: string
}

export function ProjectTimeline({ clientId }: ProjectTimelineProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1))
  const [viewType, setViewType] = useState<"calendar" | "gantt">("calendar")

  const calendarEvents: CalendarEvent[] = [
    { id: "1", title: "Research Phase Starts", date: new Date(2026, 0, 1), type: "phase-start", color: "#2E7D32", client: "ABC Manufacturing" },
    { id: "2", title: "Victory Target Approved", date: new Date(2026, 0, 28), type: "milestone", color: "#FFB547", client: "ABC Manufacturing" },
    { id: "3", title: "Writing Phase Ends", date: new Date(2026, 1, 26), type: "phase-end", color: "#FF3B30", client: "ABC Manufacturing" },
    { id: "4", title: "Design Review", date: new Date(2026, 2, 10), type: "milestone", color: "#FFB547", client: "TechStartup XYZ" },
    { id: "5", title: "Campaign Launch", date: new Date(2026, 3, 15), type: "deadline", color: "#007AFF", client: "ABC Manufacturing" },
  ]

  const ganttTasks: GanttTask[] = [
    {
      id: "1",
      name: "Story Research",
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026, 0, 15),
      progress: 100,
      color: "#34C759",
      phase: "Research",
      assignee: "Sarah",
    },
    {
      id: "2",
      name: "Story Writing",
      startDate: new Date(2026, 0, 29),
      endDate: new Date(2026, 2, 26),
      progress: 65,
      color: "#007AFF",
      phase: "Writing",
      assignee: "Alex",
    },
    {
      id: "3",
      name: "Story Design & Video",
      startDate: new Date(2026, 2, 26),
      endDate: new Date(2026, 4, 15),
      progress: 0,
      color: "#FFB547",
      phase: "Design",
      assignee: "Jordan",
    },
    {
      id: "4",
      name: "Campaign Distribution",
      startDate: new Date(2026, 4, 15),
      endDate: new Date(2026, 5, 15),
      progress: 0,
      color: "#FF3B30",
      phase: "Distribution",
      assignee: "Ravi",
    },
  ]

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-[#1D1D1F]">Project Timeline</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewType("calendar")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              viewType === "calendar"
                ? "bg-[#007AFF] text-white"
                : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E5E5E7]"
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setViewType("gantt")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              viewType === "gantt"
                ? "bg-[#007AFF] text-white"
                : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E5E5E7]"
            }`}
          >
            Gantt Chart
          </button>
        </div>
      </div>

      {viewType === "calendar" ? (
        <CalendarView currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} events={calendarEvents} />
      ) : (
        <GanttChart tasks={ganttTasks} />
      )}
    </div>
  )
}

interface CalendarViewProps {
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  events: CalendarEvent[]
}

function CalendarView({ currentMonth, setCurrentMonth, events }: CalendarViewProps) {
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const getEventsForDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return events.filter(
      (event) =>
        event.date.getDate() === day &&
        event.date.getMonth() === currentMonth.getMonth() &&
        event.date.getFullYear() === currentMonth.getFullYear()
    )
  }

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-semibold text-[#1D1D1F]">{monthName}</h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-[#86868B] py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((i) => (
          <div key={`empty-${i}`} className="aspect-square bg-[#F8F9FB] rounded" />
        ))}

        {days.map((day) => {
          const dayEvents = getEventsForDay(day)
          return (
            <div
              key={day}
              className="aspect-square border border-[#E5E5E7] rounded p-1 hover:bg-[#F8F9FB] transition-colors cursor-pointer"
            >
              <p className="text-xs font-semibold text-[#1D1D1F] mb-1">{day}</p>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs font-medium text-white px-1 py-0.5 rounded truncate"
                    style={{ backgroundColor: event.color }}
                    title={event.title}
                  >
                    {event.title.split(" ").pop()}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <p className="text-xs text-[#86868B]">+{dayEvents.length - 2} more</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-[#E5E5E7]">
        <p className="text-xs font-medium text-[#86868B] uppercase tracking-wide mb-3">Legend</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#2E7D32]" />
            <span className="text-[#1D1D1F]">Phase Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#FF3B30]" />
            <span className="text-[#1D1D1F]">Phase End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#FFB547]" />
            <span className="text-[#1D1D1F]">Milestone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#007AFF]" />
            <span className="text-[#1D1D1F]">Deadline</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface GanttChartProps {
  tasks: GanttTask[]
}

function GanttChart({ tasks }: GanttChartProps) {
  const startDate = new Date(2026, 0, 1)
  const endDate = new Date(2026, 5, 30)
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  const getTaskPosition = (taskStart: Date) => {
    const days = Math.ceil((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return (days / totalDays) * 100
  }

  const getTaskWidth = (taskStart: Date, taskEnd: Date) => {
    const days = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24))
    return (days / totalDays) * 100
  }

  return (
    <div>
      {/* Timeline Header */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#E5E5E7]">
        <div className="w-40 flex-shrink-0" />
        <div className="flex-1 flex text-xs text-[#86868B] font-medium">
          <div className="flex-1">Jan</div>
          <div className="flex-1">Feb</div>
          <div className="flex-1">Mar</div>
          <div className="flex-1">Apr</div>
          <div className="flex-1">May</div>
          <div className="flex-1">Jun</div>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2">
            {/* Task Name */}
            <div className="w-40 flex-shrink-0">
              <p className="text-sm font-medium text-[#1D1D1F] truncate">{task.name}</p>
              <p className="text-xs text-[#86868B]">{task.assignee}</p>
            </div>

            {/* Timeline Bar */}
            <div className="flex-1 relative h-8 bg-[#F8F9FB] rounded border border-[#E5E5E7]">
              <div
                className="h-full rounded flex items-center justify-center cursor-grab hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: task.color,
                  marginLeft: `${getTaskPosition(task.startDate)}%`,
                  width: `${getTaskWidth(task.startDate, task.endDate)}%`,
                }}
                draggable
              >
                {task.progress > 0 && (
                  <div className="absolute inset-0 rounded flex items-center justify-center text-xs font-semibold text-white">
                    {task.progress}%
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Date Range Info */}
      <div className="mt-6 pt-4 border-t border-[#E5E5E7] text-xs text-[#86868B]">
        <p>
          Timeline: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()} ({totalDays} days)
        </p>
        <p className="mt-1">Drag tasks to reschedule | Colors indicate phase assignment</p>
      </div>
    </div>
  )
}
