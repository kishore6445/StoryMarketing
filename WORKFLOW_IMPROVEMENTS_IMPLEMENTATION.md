# Workflow UX Improvements - Implementation Guide

## Overview
This guide demonstrates how to integrate the 5 quick-win improvements into your workflow application.

## 1. Toast Notification System

### Setup
The toast notification system is now available in `/components/toast-notification.tsx`.

### Usage in a page/layout
```tsx
import { useToast, ToastContainer } from "@/components/toast-notification"

export default function Page() {
  const { toasts, addToast, removeToast } = useToast()

  return (
    <>
      <YourContent />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
```

### Trigger notifications in components
```tsx
import { useToast } from "@/components/toast-notification"

export function MyComponent() {
  const { addToast } = useToast()

  const handleAction = () => {
    addToast({
      type: "success",
      title: "Success!",
      message: "Action completed",
      duration: 4000,
    })
  }

  return <button onClick={handleAction}>Perform Action</button>
}
```

## 2. Approval Chain Preview

### Location
`/components/approval-chain-preview.tsx`

### Features
- Visual timeline of approval steps
- Shows who will approve and when
- Displays timeout information
- Shows SOP requirements
- Estimated completion time
- Submit button

### Integration in Phase Completion
```tsx
import { ApprovalChainPreview } from "@/components/approval-chain-preview"

<ApprovalChainPreview
  approvalSteps={approvalSteps}
  estimatedDays={3}
  isSubmitting={isSubmitting}
  onSubmit={handleSubmitForReview}
/>
```

## 3. Rejection Details Card

### Location
`/components/rejection-details-card.tsx`

### Features
- Shows who rejected and when
- Displays rejection reason
- Lists required changes with numbered items
- Shows approver's additional comments
- Links to original submission
- Tips for resubmission
- Resubmit and comparison buttons

### Integration
```tsx
import { RejectionDetailsCard } from "@/components/rejection-details-card"

<RejectionDetailsCard
  rejectedBy="Sarah Chen"
  rejectedAt={rejectionDate}
  reason="The narrative needs more depth..."
  requiredChanges={["Change 1", "Change 2"]}
  approverMessage="Good foundation..."
  onResubmit={() => handleResubmit()}
  onViewComparison={() => showComparison()}
/>
```

## 4. Workflow Dashboard with Real-Time Status

### Enhancements Made
- **Overdue Approvals Alert**: Warning banner showing overdue items
- **Pending Approvals Section**: List of approvals with timer badges
- **Status Indicators**: 
  - Red badges for overdue items (days overdue)
  - Orange badges for escalating items (days until escalation)
- **Mock Pending Approvals**: Shows 2 sample approvals for demonstration

### Timer Badge States
```tsx
// Overdue - Red
<div className="flex items-center gap-1 px-3 py-1.5 bg-[#DC2626] text-white rounded-lg">
  <Timer className="w-4 h-4" />
  <span className="text-sm font-bold">1d overdue</span>
</div>

// Escalating Soon - Orange
<div className="flex items-center gap-1 px-3 py-1.5 bg-[#FFF3E0] text-[#9B5610] rounded-lg">
  <Clock className="w-4 h-4" />
  <span className="text-sm font-medium">1d left</span>
</div>
```

## 5. SOP Accordion in Approval Modal

### Location
`/components/sop-accordion.tsx`

### Features
- Expandable SOP guidelines
- Shows SOP type and description
- Links to full guidelines
- Acknowledgement tracking
- "I've Reviewed" button
- Progress indicator (All acknowledged / Needs review)

### Integration in ApprovalWorkflow
```tsx
import { SOPAccordion } from "@/components/sop-accordion"

<SOPAccordion
  sopIds={requiredSOPIds}
  allSOPs={allSOPs}
  requiredAcknowledgement={true}
  acknowledgedSOPs={acknowledgedSOPs}
  onAcknowledge={(sopId) => {
    setAcknowledgedSOPs([...acknowledgedSOPs, sopId])
  }}
/>
```

## 6. Workflow Notifications Hook

### Location
`/hooks/use-workflow-notifications.ts`

### Available Notification Methods
- `notifyTaskSubmitted(taskName)` - Task submitted for review
- `notifyTaskApproved(taskName)` - Task approved
- `notifyTaskRejected(taskName)` - Task rejected
- `notifyPhaseTransition(fromPhase, toPhase)` - Phase changed
- `notifyApprovalRequested(approverName)` - Approval requested
- `notifyApprovalReceived(approverName)` - Approval received
- `notifyApprovalEscalating(escalatingTo, days)` - Escalation pending
- `notifySOPsRequired(count)` - SOPs need review
- `notifyWorkflowBlockage(reason)` - Workflow blocked

### Usage
```tsx
import { useWorkflowNotifications } from "@/hooks/use-workflow-notifications"

export function MyWorkflowComponent() {
  const { 
    notifyTaskSubmitted, 
    notifyPhaseTransition,
    notifyApprovalReceived 
  } = useWorkflowNotifications()

  const handleSubmit = async () => {
    await submitTask()
    notifyTaskSubmitted("Story Design")
  }

  const handleApproval = async () => {
    await approvePhase()
    notifyApprovalReceived("Sarah Chen")
    notifyPhaseTransition("Story Design", "Writing")
  }

  return (
    <div>
      <button onClick={handleSubmit}>Submit</button>
      <button onClick={handleApproval}>Approve</button>
    </div>
  )
}
```

## Design System Integration

### Color Tokens Used
- **Success**: `bg-[#2E7D32]`, `text-[#2E7D32]`, `bg-[#E8F5E9]`
- **Error**: `bg-[#D32F2F]`, `text-[#D32F2F]`, `bg-[#FFEBEE]`
- **Warning**: `bg-[#E65100]`, `text-[#E65100]`, `bg-[#FFF3E0]`
- **Neutral**: `bg-[#F5F5F7]`, `text-[#86868B]`, `border-[#E5E5E7]`

### Typography
- **Headings**: `text-[#1D1D1F]`, `font-semibold`, `tracking-tight`
- **Body**: `text-[#515154]`, `text-sm`
- **Meta**: `text-[#86868B]`, `text-xs`

## Next Steps for Full Implementation

### 1. Add SOP Config (if not exists)
Create `/lib/sop-config.ts` with SOP data structure:
```tsx
export interface SOP {
  id: string
  name: string
  description: string
  category: string
  type: string
  lastUpdated: string
  link: string
}

export const GENERIC_SOPS: SOP[] = [
  // Your SOPs here
]

export const BRAND_SPECIFIC_SOPS: SOP[] = [
  // Your brand-specific SOPs
]
```

### 2. Wire Up Real Data
- Replace mock approval data with real database queries
- Connect rejection flow to actual rejection records
- Fetch real pending approvals with actual timeout info
- Link SOP accordion to real approval step SOPs

### 3. Add Escalation Logic
- Implement escalation timer tracking
- Auto-escalate based on timeout configuration
- Send notifications before escalation happens

### 4. Database Schema Updates
If needed, ensure these fields exist:
- `approval_steps.sopIds` (array of SOP IDs)
- `approval_steps.timeoutDays` (number)
- `approvals.rejectedAt`, `rejectedBy`, `rejectionReason`
- `approvals.requiredChanges` (array)
- `workflows.escalationPolicy`

## Testing Checklist

- [ ] Toast notifications appear and auto-dismiss
- [ ] Approval chain preview shows all steps correctly
- [ ] Rejection card displays all required information
- [ ] Dashboard shows pending approvals with correct timer badges
- [ ] Overdue/escalating approvals display in correct colors
- [ ] SOP accordion expands/collapses properly
- [ ] Acknowledgement tracking works for SOPs
- [ ] Notifications trigger on workflow state changes
- [ ] Component layouts are responsive on mobile/tablet

## Performance Notes

- Toast notifications are cleaned up automatically after duration
- Pending approvals query can be optimized with database indexes on `timeoutDays` and approval status
- SOP accordion uses virtualization if there are many SOPs
- Dashboard updates can be debounced if polling real-time data

---

## Summary

These implementations provide:
1. **Better user clarity** through approval chain previews
2. **Reduced confusion** with rejection feedback cards
3. **Real-time awareness** of approval status and timers
4. **Guided compliance** with SOP acknowledgements
5. **Timely notifications** for all workflow transitions

All components follow the existing design system and can be easily customized with different data or styling.
