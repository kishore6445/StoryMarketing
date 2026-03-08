"use client"

import { useCallback } from "react"
import { useToast } from "@/components/toast-notification"

/**
 * Hook for managing workflow notifications
 * Provides methods to show toast notifications for various workflow events
 */
export function useWorkflowNotifications() {
  const { addToast } = useToast()

  // Task state change notifications
  const notifyTaskSubmitted = useCallback(
    (taskName: string) => {
      addToast({
        type: "info",
        title: "Task Submitted",
        message: `${taskName} has been submitted for review`,
        duration: 4000,
      })
    },
    [addToast]
  )

  const notifyTaskApproved = useCallback(
    (taskName: string) => {
      addToast({
        type: "success",
        title: "Approved",
        message: `${taskName} has been approved and moved to the next phase`,
        duration: 4000,
      })
    },
    [addToast]
  )

  const notifyTaskRejected = useCallback(
    (taskName: string) => {
      addToast({
        type: "error",
        title: "Requires Revisions",
        message: `${taskName} needs revisions. Review feedback for details.`,
        duration: 5000,
        action: {
          label: "View Feedback",
          onClick: () => {
            // Navigate to rejection details
          },
        },
      })
    },
    [addToast]
  )

  const notifyPhaseTransition = useCallback(
    (fromPhase: string, toPhase: string) => {
      addToast({
        type: "success",
        title: "Phase Transitioned",
        message: `Moved from ${fromPhase} to ${toPhase}`,
        duration: 4000,
      })
    },
    [addToast]
  )

  const notifyApprovalRequested = useCallback(
    (approverName: string) => {
      addToast({
        type: "info",
        title: "Awaiting Approval",
        message: `Approval requested from ${approverName}`,
        duration: 4000,
      })
    },
    [addToast]
  )

  const notifyApprovalReceived = useCallback(
    (approverName: string) => {
      addToast({
        type: "success",
        title: "Approved",
        message: `${approverName} has approved your submission`,
        duration: 4000,
      })
    },
    [addToast]
  )

  const notifyApprovalEscalating = useCallback(
    (escalatingTo: string, daysUntilEscalation: number) => {
      addToast({
        type: "warning",
        title: "Escalation Pending",
        message: `Approval will escalate to ${escalatingTo} in ${daysUntilEscalation} day${daysUntilEscalation > 1 ? "s" : ""}`,
        duration: 5000,
      })
    },
    [addToast]
  )

  const notifySOPsRequired = useCallback(
    (sopCount: number) => {
      addToast({
        type: "info",
        title: "Review Required",
        message: `Please review ${sopCount} standard operating procedure${sopCount > 1 ? "s" : ""} before proceeding`,
        duration: 5000,
      })
    },
    [addToast]
  )

  const notifyWorkflowBlockage = useCallback(
    (blockageReason: string) => {
      addToast({
        type: "error",
        title: "Workflow Blocked",
        message: blockageReason,
        duration: 6000,
      })
    },
    [addToast]
  )

  return {
    notifyTaskSubmitted,
    notifyTaskApproved,
    notifyTaskRejected,
    notifyPhaseTransition,
    notifyApprovalRequested,
    notifyApprovalReceived,
    notifyApprovalEscalating,
    notifySOPsRequired,
    notifyWorkflowBlockage,
  }
}

/**
 * Example Usage in a component:
 *
 * const { notifyTaskSubmitted, notifyPhaseTransition } = useWorkflowNotifications()
 *
 * const handlePhaseCompletion = async () => {
 *   try {
 *     await submitPhaseForApproval()
 *     notifyTaskSubmitted("Story Design Phase")
 *
 *     // After approval
 *     notifyPhaseTransition("Story Design", "Story Writing")
 *   } catch (error) {
 *     notifyWorkflowBlockage("Failed to submit phase completion")
 *   }
 * }
 */
