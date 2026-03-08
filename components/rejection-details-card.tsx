"use client"

import { AlertCircle, Clock, User, FileText, ArrowRight } from "lucide-react"

interface RejectionDetailsCardProps {
  rejectedBy: string
  rejectedAt: string
  reason: string
  requiredChanges: string[]
  comments?: string
  approverMessage?: string
  onResubmit: () => void
  onViewComparison: () => void
}

export function RejectionDetailsCard({
  rejectedBy,
  rejectedAt,
  reason,
  requiredChanges,
  comments,
  approverMessage,
  onResubmit,
  onViewComparison,
}: RejectionDetailsCardProps) {
  return (
    <div className="space-y-4 max-w-2xl">
      {/* Alert Header */}
      <div className="bg-[#FFEBEE] border-2 border-[#D32F2F] rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-[#D32F2F] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#9B2C2C]">Submission Rejected</h2>
            <p className="text-sm text-[#9B2C2C]/80 mt-1">Your submission has been rejected. Please review the feedback below and resubmit.</p>
          </div>
        </div>
      </div>

      {/* Rejection Metadata */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#86868B]" />
            <div className="text-sm">
              <p className="text-xs font-semibold text-[#86868B] uppercase">Rejected By</p>
              <p className="font-medium text-[#1D1D1F]">{rejectedBy}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#86868B]" />
            <div className="text-sm">
              <p className="text-xs font-semibold text-[#86868B] uppercase">Date</p>
              <p className="font-medium text-[#1D1D1F]">{new Date(rejectedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Reason */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
        <p className="text-xs font-semibold text-[#86868B] uppercase mb-2">Reason for Rejection</p>
        <p className="text-sm text-[#1D1D1F] leading-relaxed">{reason}</p>
      </div>

      {/* Required Changes */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
        <p className="text-xs font-semibold text-[#86868B] uppercase mb-3">Required Changes</p>
        <div className="space-y-2">
          {requiredChanges.map((change, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-[#FFE8E8] border border-[#D32F2F] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#D32F2F]">{idx + 1}</span>
              </div>
              <p className="text-sm text-[#515154] leading-relaxed pt-0.5">{change}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Approver Comments */}
      {approverMessage && (
        <div className="bg-[#F0F4FF] border border-[#0051C3]/20 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-2">
            <FileText className="w-4 h-4 text-[#0051C3] flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-[#00308E] uppercase">Approver's Additional Comments</p>
          </div>
          <p className="text-sm text-[#00308E] leading-relaxed italic">{approverMessage}</p>
        </div>
      )}

      {/* Internal Comments */}
      {comments && (
        <div className="bg-[#FFF8E1] border border-[#E65100]/20 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-2">
            <FileText className="w-4 h-4 text-[#E65100] flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-[#E65100] uppercase">Your Notes</p>
          </div>
          <p className="text-sm text-[#9B5610] leading-relaxed">{comments}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onViewComparison}
          className="flex-1 px-4 py-2.5 bg-white border border-[#E5E5E7] hover:bg-[#F5F5F7] text-[#1D1D1F] font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          View Comparison
        </button>
        <button
          onClick={onResubmit}
          className="flex-1 px-4 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          Resubmit
        </button>
      </div>

      {/* Helpful Tips */}
      <div className="bg-[#E8F5E9] border border-[#2E7D32]/20 rounded-lg p-4 text-sm text-[#1B5E20]">
        <p className="font-medium mb-2">Tips for resubmission:</p>
        <ul className="text-xs space-y-1 list-disc list-inside">
          <li>Address all required changes listed above</li>
          <li>Include a note explaining your revisions</li>
          <li>Review related SOPs before resubmitting</li>
          <li>Contact the approver if you need clarification</li>
        </ul>
      </div>
    </div>
  )
}
