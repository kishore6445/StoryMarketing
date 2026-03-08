"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Send, MessageCircle, User, Calendar } from "lucide-react"
import { ApprovalChainPreview } from "./approval-chain-preview"
import { RejectionDetailsCard } from "./rejection-details-card"
import { SOPAccordion } from "./sop-accordion"
import { useWorkflowNotifications } from "@/hooks/use-workflow-notifications"
import type { ApprovalStep } from "@/lib/workflow-config"
import { GENERIC_SOPS, BRAND_SPECIFIC_SOPS } from "@/lib/sop-config"

interface PhaseCompletionProps {
  currentPhase: string
  currentPhaseName: string
  nextPhase: string
  nextPhaseName: string
  onSubmitForReview: () => void
  onSkip: () => void
}

export function PhaseCompletion({ currentPhase, currentPhaseName, nextPhase, nextPhaseName, onSubmitForReview, onSkip }: PhaseCompletionProps) {
  const [showApprovalFlow, setShowApprovalFlow] = useState(false)
  const [approvalComments, setApprovalComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showApprovalChainPreview, setShowApprovalChainPreview] = useState(false)
  const { notifyTaskSubmitted, notifySOPsRequired } = useWorkflowNotifications()

  // Mock approval steps
  const approvalSteps: ApprovalStep[] = [
    {
      id: "step_1",
      stepNumber: 1,
      role: "manager",
      title: "Manager Review",
      description: "Manager reviews the deliverables",
      timeoutDays: 1,
      canReject: true,
      canDelegate: true,
      requiredComments: false,
      notifyOnApproval: true,
      notifyOnRejection: true,
      sopIds: ["gen-2"],
      requiredSOPAcknowledgement: true,
    },
    {
      id: "step_2",
      stepNumber: 2,
      role: "director",
      title: "Director Approval",
      description: "Director reviews and approves the phase completion",
      timeoutDays: 2,
      canReject: true,
      canDelegate: false,
      requiredComments: true,
      notifyOnApproval: true,
      notifyOnRejection: true,
      sopIds: ["gen-3"],
      requiredSOPAcknowledgement: true,
    },
  ]

  const completionChecklist = [
    { id: 1, title: "All tasks marked complete or deferred", completed: true },
    { id: 2, title: "Victory target metrics achieved", completed: true },
    { id: 3, title: "Key deliverables documented", completed: true },
    { id: 4, title: "Stakeholder feedback collected", completed: false },
    { id: 5, title: "Assets organized and archived", completed: true },
  ]

  const completedItems = completionChecklist.filter((item) => item.completed).length
  const completionPercentage = Math.round((completedItems / completionChecklist.length) * 100)
  const allComplete = completedItems === completionChecklist.length

  const handleSubmitForReview = async () => {
    setIsSubmitting(true)
    notifyTaskSubmitted(`${currentPhaseName} Phase`)
    notifySOPsRequired(approvalSteps.reduce((sum, step) => sum + (step.sopIds?.length || 0), 0))
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setShowApprovalFlow(true)
    onSubmitForReview()
    setIsSubmitting(false)
  }

  if (showApprovalFlow) {
    return <ApprovalWorkflow currentPhaseName={currentPhaseName} nextPhaseName={nextPhaseName} onApprove={() => {}} onReject={() => setShowApprovalFlow(false)} />
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Complete {currentPhaseName}</h1>
        <p className="text-sm text-[#86868B]">Review the checklist before moving to the next phase</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-[#1D1D1F]">Phase Completion Checklist</p>
            <p className="text-xs text-[#86868B] mt-1">{completedItems} of {completionChecklist.length} items complete</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#2E7D32]">{completionPercentage}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-[#F3F3F6] rounded-full overflow-hidden mb-6">
          <div className="h-full bg-[#2E7D32] rounded-full transition-all" style={{ width: `${completionPercentage}%` }} />
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          {completionChecklist.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F8F9FB] transition-colors">
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-[#2E7D32] flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-[#D1D1D6] flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-sm ${item.completed ? "text-[#1D1D1F]" : "text-[#86868B]"}`}>{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Phase Preview */}
      <div className="bg-[#D1FADF] border border-[#2E7D32]/20 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">→</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#2E7D32] mb-1">Next Phase: {nextPhaseName}</h3>
            <p className="text-sm text-[#1B5E20] mb-3">Moving to the next phase will update all team member notifications and adjust project timeline.</p>
            <div className="bg-white/50 rounded p-2 text-xs text-[#1B5E20]">
              Estimated start date: <span className="font-medium">Feb 26, 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Victory Target Summary */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Victory Target Achievement</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#D1FADF] rounded-lg">
            <span className="text-sm font-medium text-[#1D1D1F]">Define narrative roles and story pillars</span>
            <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <p className="text-xs text-[#86868B] px-1">All victory target metrics have been achieved. Documents archived in project vault.</p>
        </div>
      </div>

      {/* Show Approval Chain Preview if clicked */}
      {showApprovalChainPreview && (
        <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
          <ApprovalChainPreview
            approvalSteps={approvalSteps}
            estimatedDays={3}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitForReview}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!showApprovalChainPreview ? (
          <>
            <button
              onClick={() => setShowApprovalChainPreview(true)}
              disabled={!allComplete}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                allComplete
                  ? "bg-[#2E7D32] text-white hover:bg-[#1B5E20]"
                  : "bg-[#F3F3F6] text-[#86868B] cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </button>
            <button
              onClick={onSkip}
              className="px-6 py-3 bg-[#F5F5F7] text-[#1D1D1F] rounded-lg font-medium hover:bg-[#E5E5E7] transition-colors"
            >
              Save Progress
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowApprovalChainPreview(false)}
            className="px-6 py-3 bg-[#F5F5F7] text-[#1D1D1F] rounded-lg font-medium hover:bg-[#E5E5E7] transition-colors"
          >
            Back
          </button>
        )}
      </div>
      {!allComplete && (
        <div className="bg-[#FEE4E2] border border-[#FF3B30]/20 rounded-lg p-4">
          <p className="text-sm text-[#C41C1C]">Complete all checklist items before submitting for review.</p>
        </div>
      )}
    </div>
  )
}

interface ApprovalWorkflowProps {
  currentPhaseName: string
  nextPhaseName: string
  onApprove: () => void
  onReject: () => void
}

export function ApprovalWorkflow({ currentPhaseName, nextPhaseName, onApprove, onReject }: ApprovalWorkflowProps) {
  const [approvalComments, setApprovalComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [approvalStep, setApprovalStep] = useState<"pending" | "approved" | "rejected">("pending")
  const [showRejectionDetails, setShowRejectionDetails] = useState(false)
  const [acknowledgedSOPs, setAcknowledgedSOPs] = useState<string[]>([])
  const { notifyTaskApproved, notifyPhaseTransition } = useWorkflowNotifications()

  // Mock SOP IDs for this approval step
  const requiredSOPIds = ["gen-2", "gen-3"]
  const allSOPs = [...GENERIC_SOPS, ...BRAND_SPECIFIC_SOPS]

  const approvers = [
    { id: 1, name: "Sarah Chen", role: "Creative Lead", status: "pending" },
    { id: 2, name: "Ravi Patel", role: "Strategy Lead", status: "pending" },
  ]

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      // Simulate phase transition with smooth loading
      await new Promise((resolve) => setTimeout(resolve, 800))
      notifyTaskApproved(`${currentPhaseName} Completion`)
      
      // Notify phase transition with detailed info
      notifyPhaseTransition(currentPhaseName, nextPhaseName)
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setApprovalStep("approved")
      onApprove()
    } catch (error) {
      console.error("[v0] Phase transition error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (approvalStep === "approved") {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Phase Approved!</h1>
          <p className="text-sm text-[#86868B]">Ready to move forward</p>
        </div>

        <div className="bg-[#D1FADF] border border-[#2E7D32]/20 rounded-lg p-8 text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <svg className="absolute inset-0 w-16 h-16 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="stroke-[#2E7D32]/20" />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="stroke-[#2E7D32]" strokeDasharray="60" strokeDashoffset="0" style={{ animation: 'dash 1.5s linear infinite' }} />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-[#1D1D1F]">Transitioning to {nextPhaseName}...</h2>
          <p className="text-sm text-[#1B5E20]">Updating project timeline and notifying team members</p>

          <div className="space-y-2 text-sm text-[#1B5E20]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Phase marked complete</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Stakeholders notified</span>
            </div>
            <div className="flex items-center gap-2 animate-pulse">
              <div className="w-4 h-4 rounded-full bg-[#2E7D32]"></div>
              <span>Initializing {nextPhaseName}...</span>
            </div>
          </div>

          <button
            disabled={true}
            className="px-6 py-3 bg-[#2E7D32] text-white rounded-lg font-medium opacity-50 cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Processing..." : `Proceed to ${nextPhaseName}`}
          </button>
        </div>

        <style jsx>{`
          @keyframes dash {
            to {
              stroke-dashoffset: -60;
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Awaiting Approval</h1>
        <p className="text-sm text-[#86868B]">
          {currentPhaseName} completion is pending stakeholder approval to proceed to {nextPhaseName}
        </p>
      </div>

      {/* Approval Status */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-6">Approvals Required</h2>

        <div className="space-y-4">
          {approvers.map((approver) => (
            <div key={approver.id} className="flex items-start justify-between p-4 bg-[#F8F9FB] rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#007AFF] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {approver.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-[#1D1D1F]">{approver.name}</p>
                  <p className="text-xs text-[#86868B]">{approver.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {approver.status === "pending" && (
                  <>
                    <Circle className="w-3 h-3 text-[#FFB547] animate-pulse" />
                    <span className="text-xs font-medium text-[#FFB547]">Pending</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Form */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Internal Notes</h2>
        <textarea
          value={approvalComments}
          onChange={(e) => setApprovalComments(e.target.value)}
          placeholder="Add notes for stakeholders (optional)..."
          className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent resize-none"
          rows={4}
        />
        <p className="text-xs text-[#86868B] mt-2">These notes will be visible to all approvers.</p>
      </div>

      {/* Required Guidelines/SOPs */}
      {requiredSOPIds.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
          <SOPAccordion
            sopIds={requiredSOPIds}
            allSOPs={allSOPs}
            requiredAcknowledgement={true}
            acknowledgedSOPs={acknowledgedSOPs}
            onAcknowledge={(sopId) => {
              setAcknowledgedSOPs([...acknowledgedSOPs, sopId])
            }}
          />
        </div>
      )}

      {/* Phase Summary */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Phase Summary</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between p-2">
            <span className="text-[#86868B]">Phase Completed</span>
            <span className="font-medium text-[#1D1D1F]">{currentPhaseName}</span>
          </div>
          <div className="flex items-center justify-between p-2">
            <span className="text-[#86868B]">Tasks Completed</span>
            <span className="font-medium text-[#1D1D1F]">20 / 20</span>
          </div>
          <div className="flex items-center justify-between p-2">
            <span className="text-[#86868B]">Duration</span>
            <span className="font-medium text-[#1D1D1F]">28 days</span>
          </div>
          <div className="flex items-center justify-between p-2 border-t border-[#E5E5E7] pt-3">
            <span className="text-[#86868B]">Next Phase</span>
            <span className="font-medium text-[#1D1D1F]">{nextPhaseName}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-[#2E7D32] text-white rounded-lg font-medium hover:bg-[#1B5E20] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Sending..." : "Notify Approvers"}
        </button>
        <button
          onClick={onReject}
          className="px-6 py-3 bg-[#F5F5F7] text-[#1D1D1F] rounded-lg font-medium hover:bg-[#E5E5E7] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
