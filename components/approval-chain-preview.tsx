"use client"

import { CheckCircle2, Clock, AlertCircle, ChevronRight } from "lucide-react"
import type { ApprovalStep } from "@/lib/workflow-config"

interface ApprovalChainPreviewProps {
  approvalSteps: ApprovalStep[]
  estimatedDays?: number
  onSubmit: () => void
  isSubmitting?: boolean
}

export function ApprovalChainPreview({
  approvalSteps,
  estimatedDays = 5,
  onSubmit,
  isSubmitting = false,
}: ApprovalChainPreviewProps) {
  const totalTimeoutDays = approvalSteps.reduce((sum, step) => sum + (step.timeoutDays || 1), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-[#1D1D1F]">Approval Chain</h3>
        <p className="text-sm text-[#86868B]">Your submission will go through the following approval process</p>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {approvalSteps.map((step, index) => {
          const isLast = index === approvalSteps.length - 1
          const daysFromStart = approvalSteps.slice(0, index).reduce((sum, s) => sum + (s.timeoutDays || 1), 0)

          return (
            <div key={step.id} className="relative">
              {/* Vertical Line */}
              {!isLast && (
                <div className="absolute left-[23px] top-12 bottom-0 w-0.5 bg-[#E5E5E7]" />
              )}

              {/* Step Card */}
              <div className="relative flex gap-4">
                {/* Circle Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-[#E5E5E7] flex items-center justify-center mt-2 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-[#0071E3] flex items-center justify-center text-white text-sm font-bold">
                    {step.stepNumber}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-3 pb-6">
                  <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-[#1D1D1F]">{step.title}</h4>
                        {step.description && (
                          <p className="text-xs text-[#86868B] mt-1">{step.description}</p>
                        )}
                      </div>
                      <span className="px-2 py-1 bg-[#F5F5F7] text-[#86868B] rounded text-xs font-medium">
                        {step.role}
                      </span>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-[#E5E5E7]">
                      {/* Timeline */}
                      <div className="flex items-center gap-1.5 text-xs text-[#515154]">
                        <Clock className="w-4 h-4 text-[#86868B]" />
                        <span>
                          Day {daysFromStart + 1}-{daysFromStart + (step.timeoutDays || 1)}
                        </span>
                      </div>

                      {/* Timeout */}
                      {step.timeoutDays && (
                        <div className="flex items-center gap-1.5 text-xs text-[#515154]">
                          <AlertCircle className="w-4 h-4 text-[#E65100]" />
                          <span>Timeout in {step.timeoutDays} day{step.timeoutDays > 1 ? "s" : ""}</span>
                        </div>
                      )}

                      {/* Permissions */}
                      {step.canReject && (
                        <div className="flex items-center gap-1.5 text-xs text-[#D32F2F]">
                          <AlertCircle className="w-4 h-4" />
                          <span>Can reject</span>
                        </div>
                      )}

                      {/* SOP Indicator */}
                      {step.sopIds && step.sopIds.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-[#2E7D32]">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{step.sopIds.length} SOP{step.sopIds.length > 1 ? "s" : ""} required</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Footer */}
      <div className="bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg p-4 mt-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold text-[#86868B] uppercase">Total Steps</p>
            <p className="text-lg font-bold text-[#1D1D1F] mt-1">{approvalSteps.length}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#86868B] uppercase">Est. Time</p>
            <p className="text-lg font-bold text-[#1D1D1F] mt-1">{totalTimeoutDays} days</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#86868B] uppercase">Status</p>
            <p className="text-lg font-bold text-[#2E7D32] mt-1">Ready</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full px-4 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <ChevronRight className="w-4 h-4" />
            Submit for Review
          </>
        )}
      </button>
    </div>
  )
}
