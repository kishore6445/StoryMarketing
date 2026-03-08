"use client"

import { useState } from "react"
import { FileText, Send, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface WeeklyReportData {
  clientName: string
  weekOf: Date
  tasksCompleted: number
  tasksInProgress: number
  tasksPending: number
  keyAccomplishments: string[]
  blockers: string[]
  nextWeekPriorities: string[]
  metrics?: {
    engagement: number
    reach: number
    leads: number
  }
}

interface WeeklyReportGeneratorProps {
  clientId: string
  clientName: string
  onGenerateReport?: (report: WeeklyReportData) => void
}

export function WeeklyReportGenerator({ clientId, clientName, onGenerateReport }: WeeklyReportGeneratorProps) {
  const [reportData, setReportData] = useState<WeeklyReportData>({
    clientName,
    weekOf: new Date(),
    tasksCompleted: 4,
    tasksInProgress: 3,
    tasksPending: 2,
    keyAccomplishments: [
      "Finalized positioning statement and messaging framework",
      "Completed competitive analysis across 5 key competitors",
      "Created content brief template for consistency",
      "Scheduled weekly team meetings for next month",
    ],
    blockers: ["Awaiting client feedback on hero narrative", "Design tool license pending approval"],
    nextWeekPriorities: [
      "Create initial content drafts based on approved positioning",
      "Design brand visual identity system",
      "Record hero testimonial video",
      "Set up social media channels",
    ],
  })

  const [showPreview, setShowPreview] = useState(false)
  const [recipients, setRecipients] = useState(["client@example.com", "stakeholder@example.com"])
  const [customMessage, setCustomMessage] = useState("")

  const handleSendReport = () => {
    onGenerateReport?.(reportData)
    // TODO: Send email with report
    alert("Report would be sent to: " + recipients.join(", "))
  }

  const downloadReport = () => {
    const reportText = generateReportText(reportData)
    const blob = new Blob([reportText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${clientName}-weekly-report-${reportData.weekOf.toISOString().split("T")[0]}.txt`
    a.click()
  }

  const generateReportText = (data: WeeklyReportData): string => {
    const weekEnd = new Date(data.weekOf)
    weekEnd.setDate(weekEnd.getDate() + 6)

    return `
WEEKLY REPORT - ${data.clientName}
Week of: ${data.weekOf.toLocaleDateString()} to ${weekEnd.toLocaleDateString()}
Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

═══════════════════════════════════════════════════════════════════

EXECUTIVE SUMMARY
─────────────────
Tasks Completed:     ${data.tasksCompleted}
Tasks In Progress:   ${data.tasksInProgress}
Tasks Pending:       ${data.tasksPending}
Total Tasks:         ${data.tasksCompleted + data.tasksInProgress + data.tasksPending}
Completion Rate:     ${Math.round((data.tasksCompleted / (data.tasksCompleted + data.tasksInProgress + data.tasksPending)) * 100)}%

KEY ACCOMPLISHMENTS
───────────────────
${data.keyAccomplishments.map((acc, idx) => `${idx + 1}. ${acc}`).join("\n")}

${data.metrics ? `METRICS
───────
• Engagement Rate: ${data.metrics.engagement}%
• Total Reach: ${data.metrics.reach.toLocaleString()} users
• Leads Generated: ${data.metrics.leads}
` : ""}

BLOCKERS / RISKS
────────────────
${data.blockers.length > 0 ? data.blockers.map((blocker, idx) => `${idx + 1}. ${blocker}`).join("\n") : "None reported"}

NEXT WEEK PRIORITIES
────────────────────
${data.nextWeekPriorities.map((priority, idx) => `${idx + 1}. ${priority}`).join("\n")}

═══════════════════════════════════════════════════════════════════

Report compiled by Story Marketing OS
Questions? Contact your account manager
    `
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#1D1D1F]">Weekly Report</h2>
          <p className="text-sm text-[#86868B] mt-1">
            Week of {reportData.weekOf.toLocaleDateString()} - {new Date(reportData.weekOf.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 border border-[#D1D1D6] text-[#1D1D1F] rounded-lg font-medium hover:bg-[#F8F9FB] transition-colors"
          >
            <FileText className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-[#0051C3] transition-colors"
          >
            {showPreview ? "Hide" : "Preview"}
          </button>
        </div>
      </div>

      {/* Report Preview */}
      {showPreview && (
        <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
          <pre className="text-xs text-[#515154] overflow-auto max-h-96 whitespace-pre-wrap font-mono">
            {generateReportText(reportData)}
          </pre>
        </div>
      )}

      {/* Report Content Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Accomplishments & Blockers */}
        <div className="space-y-6">
          {/* Tasks Summary */}
          <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
            <h3 className="text-base font-semibold text-[#1D1D1F] mb-4">Task Summary</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#E8F5E9] rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                <div>
                  <p className="text-sm font-medium text-[#1D1D1F]">Completed</p>
                  <p className="text-xs text-[#86868B]">{reportData.tasksCompleted} tasks finished</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#E3F2FD] rounded-lg">
                <Clock className="w-5 h-5 text-[#007AFF]" />
                <div>
                  <p className="text-sm font-medium text-[#1D1D1F]">In Progress</p>
                  <p className="text-xs text-[#86868B]">{reportData.tasksInProgress} tasks active</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#FFF3E0] rounded-lg">
                <AlertCircle className="w-5 h-5 text-[#9E5610]" />
                <div>
                  <p className="text-sm font-medium text-[#1D1D1F]">Pending</p>
                  <p className="text-xs text-[#86868B]">{reportData.tasksPending} tasks waiting</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Accomplishments */}
          <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
            <h3 className="text-base font-semibold text-[#1D1D1F] mb-4">Key Accomplishments</h3>

            <div className="space-y-3">
              {reportData.keyAccomplishments.map((acc, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-[#F8F9FB] rounded-lg group hover:bg-[#F0F4F8] transition-colors">
                  <div className="text-sm font-semibold text-[#2E7D32] min-w-fit">✓</div>
                  <input
                    type="text"
                    value={acc}
                    onChange={(e) => {
                      const newAccomplishments = [...reportData.keyAccomplishments]
                      newAccomplishments[idx] = e.target.value
                      setReportData({ ...reportData, keyAccomplishments: newAccomplishments })
                    }}
                    className="flex-1 bg-transparent text-sm text-[#515154] border-0 outline-none"
                  />
                </div>
              ))}

              <button
                onClick={() =>
                  setReportData({
                    ...reportData,
                    keyAccomplishments: [...reportData.keyAccomplishments, "New accomplishment"],
                  })
                }
                className="w-full py-2 text-sm text-[#007AFF] font-medium border-2 border-dashed border-[#D1D1D6] rounded-lg hover:border-[#007AFF] transition-colors"
              >
                + Add Accomplishment
              </button>
            </div>
          </div>

          {/* Blockers */}
          <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
            <h3 className="text-base font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#FF3B30]" />
              Blockers & Risks
            </h3>

            <div className="space-y-3">
              {reportData.blockers.map((blocker, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-[#FFEBEE] rounded-lg group hover:bg-[#FFCDD2] transition-colors">
                  <div className="text-sm font-semibold text-[#FF3B30] min-w-fit">⚠</div>
                  <input
                    type="text"
                    value={blocker}
                    onChange={(e) => {
                      const newBlockers = [...reportData.blockers]
                      newBlockers[idx] = e.target.value
                      setReportData({ ...reportData, blockers: newBlockers })
                    }}
                    className="flex-1 bg-transparent text-sm text-[#515154] border-0 outline-none"
                  />
                  <button
                    onClick={() => setReportData({ ...reportData, blockers: reportData.blockers.filter((_, i) => i !== idx) })}
                    className="text-xs text-[#86868B] hover:text-[#FF3B30] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                onClick={() => setReportData({ ...reportData, blockers: [...reportData.blockers, "New blocker"] })}
                className="w-full py-2 text-sm text-[#FF3B30] font-medium border-2 border-dashed border-[#D1D1D6] rounded-lg hover:border-[#FF3B30] transition-colors"
              >
                + Add Blocker
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Next Week & Send */}
        <div className="space-y-6">
          {/* Next Week Priorities */}
          <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
            <h3 className="text-base font-semibold text-[#1D1D1F] mb-4">Next Week Priorities</h3>

            <div className="space-y-3">
              {reportData.nextWeekPriorities.map((priority, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-[#F8F9FB] rounded-lg group hover:bg-[#F0F4F8] transition-colors">
                  <div className="text-sm font-semibold text-[#007AFF] min-w-fit">{idx + 1}.</div>
                  <input
                    type="text"
                    value={priority}
                    onChange={(e) => {
                      const newPriorities = [...reportData.nextWeekPriorities]
                      newPriorities[idx] = e.target.value
                      setReportData({ ...reportData, nextWeekPriorities: newPriorities })
                    }}
                    className="flex-1 bg-transparent text-sm text-[#515154] border-0 outline-none"
                  />
                </div>
              ))}

              <button
                onClick={() =>
                  setReportData({
                    ...reportData,
                    nextWeekPriorities: [...reportData.nextWeekPriorities, "New priority"],
                  })
                }
                className="w-full py-2 text-sm text-[#007AFF] font-medium border-2 border-dashed border-[#D1D1D6] rounded-lg hover:border-[#007AFF] transition-colors"
              >
                + Add Priority
              </button>
            </div>
          </div>

          {/* Send Report */}
          <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
            <h3 className="text-base font-semibold text-[#1D1D1F] mb-4">Send Report</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Recipients</label>
                <textarea
                  value={recipients.join(", ")}
                  onChange={(e) => setRecipients(e.target.value.split(",").map((r) => r.trim()))}
                  className="w-full p-3 border border-[#D1D1D6] rounded-lg text-sm font-mono resize-none"
                  rows={3}
                />
                <p className="text-xs text-[#86868B] mt-2">Separate email addresses with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Personal Message (Optional)</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a custom message to include with the report..."
                  className="w-full p-3 border border-[#D1D1D6] rounded-lg text-sm resize-none"
                  rows={4}
                />
              </div>

              <button
                onClick={handleSendReport}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#2E7D32] text-white rounded-lg font-medium hover:bg-[#1B5E20] transition-colors"
              >
                <Send className="w-4 h-4" />
                Send Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
