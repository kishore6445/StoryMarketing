"use client"

import { useState } from "react"
import { CheckCircle2, Clock, AlertCircle, FileText, MessageSquare, Download, Eye, ThumbsUp, MessageCircle } from "lucide-react"

interface ClientDeliverable {
  id: string
  name: string
  phase: string
  status: "draft" | "pending_approval" | "approved" | "revisions_needed"
  submittedAt: string
  approvedAt?: string
  description: string
  deliverableType: "document" | "design" | "content" | "video"
  reviewLink?: string
  feedback?: string
  canProvideReview: boolean
}

export function ClientDashboard({ clientId = "client-1", clientName = "ABC Manufacturing" }: { clientId?: string; clientName?: string }) {
  const [deliverables, setDeliverables] = useState<ClientDeliverable[]>([
    {
      id: "del-1",
      name: "Brand Color Palette",
      phase: "Story Design",
      status: "approved",
      submittedAt: "2026-01-28",
      approvedAt: "2026-01-31",
      description: "Primary, secondary, and accent colors with usage guidelines",
      deliverableType: "design",
      reviewLink: "https://drive.google.com/file/d/1-colors/view",
      canProvideReview: false,
    },
    {
      id: "del-2",
      name: "Hero Brand Story",
      phase: "Story Writing",
      status: "pending_approval",
      submittedAt: "2026-02-02",
      description: "Main narrative highlighting ABC Manufacturing's unique value proposition",
      deliverableType: "content",
      reviewLink: "https://docs.google.com/document/d/1-hero-story/edit",
      canProvideReview: true,
    },
    {
      id: "del-3",
      name: "LinkedIn Launch Strategy",
      phase: "Story Distribution",
      status: "draft",
      submittedAt: "2026-02-01",
      description: "Content calendar and engagement tactics for LinkedIn rollout",
      deliverableType: "document",
      reviewLink: "https://docs.google.com/spreadsheets/d/1-strategy/edit",
      canProvideReview: false,
    },
    {
      id: "del-4",
      name: "Website Copy & Messaging",
      phase: "Story Distribution",
      status: "revisions_needed",
      submittedAt: "2026-01-30",
      description: "Homepage and key page copy aligned with brand narrative",
      deliverableType: "content",
      feedback: "Please strengthen the competitive positioning in the opening paragraph. Also add more specific customer examples.",
      reviewLink: "https://docs.google.com/document/d/1-website-copy/edit",
      canProvideReview: true,
    },
  ])

  const [selectedDeliverable, setSelectedDeliverable] = useState<ClientDeliverable | null>(null)
  const [clientFeedback, setClientFeedback] = useState("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const statusConfig = {
    approved: {
      bg: "bg-[#E8F5E9]",
      border: "border-[#4CAF50]",
      icon: <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
      label: "Approved",
      color: "text-[#2E7D32]",
    },
    pending_approval: {
      bg: "bg-[#FFF3E0]",
      border: "border-[#FF9800]",
      icon: <Clock className="w-5 h-5 text-[#E65100]" />,
      label: "Pending Review",
      color: "text-[#E65100]",
    },
    draft: {
      bg: "bg-[#E3F2FD]",
      border: "border-[#2196F3]",
      icon: <FileText className="w-5 h-5 text-[#0051C3]" />,
      label: "In Progress",
      color: "text-[#0051C3]",
    },
    revisions_needed: {
      bg: "bg-[#FFEBEE]",
      border: "border-[#F44336]",
      icon: <AlertCircle className="w-5 h-5 text-[#D32F2F]" />,
      label: "Revisions Needed",
      color: "text-[#D32F2F]",
    },
  }

  const deliverableTypeIcons = {
    document: <FileText className="w-4 h-4" />,
    design: <FileText className="w-4 h-4" />,
    content: <MessageSquare className="w-4 h-4" />,
    video: <FileText className="w-4 h-4" />,
  }

  const stats = {
    total: deliverables.length,
    approved: deliverables.filter((d) => d.status === "approved").length,
    pendingReview: deliverables.filter((d) => d.status === "pending_approval").length,
    revisionsNeeded: deliverables.filter((d) => d.status === "revisions_needed").length,
  }

  const handleSubmitFeedback = async () => {
    if (!selectedDeliverable || !clientFeedback.trim()) return

    setIsSubmittingFeedback(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const updated = deliverables.map((d) =>
      d.id === selectedDeliverable.id ? { ...d, feedback: clientFeedback, status: "pending_approval" as const } : d,
    )
    setDeliverables(updated)
    setClientFeedback("")
    setSelectedDeliverable(null)
    setIsSubmittingFeedback(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Project Deliverables</h1>
        <p className="text-sm text-[#86868B]">Review and approve project milestones for {clientName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
          <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">Total Deliverables</p>
          <p className="text-2xl font-bold text-[#1D1D1F]">{stats.total}</p>
        </div>
        <div className="bg-[#E8F5E9] border border-[#4CAF50] rounded-lg p-4">
          <p className="text-xs font-semibold text-[#2E7D32] uppercase tracking-wide mb-2">Approved</p>
          <p className="text-2xl font-bold text-[#2E7D32]">{stats.approved}</p>
        </div>
        <div className="bg-[#FFF3E0] border border-[#FF9800] rounded-lg p-4">
          <p className="text-xs font-semibold text-[#E65100] uppercase tracking-wide mb-2">Pending Review</p>
          <p className="text-2xl font-bold text-[#E65100]">{stats.pendingReview}</p>
        </div>
        <div className="bg-[#FFEBEE] border border-[#F44336] rounded-lg p-4">
          <p className="text-xs font-semibold text-[#D32F2F] uppercase tracking-wide mb-2">Revisions Needed</p>
          <p className="text-2xl font-bold text-[#D32F2F]">{stats.revisionsNeeded}</p>
        </div>
      </div>

      {/* Deliverables List */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-[#1D1D1F]">Deliverables</h2>
        {deliverables.map((deliverable) => {
          const config = statusConfig[deliverable.status]
          return (
            <div key={deliverable.id} className={`border-2 rounded-lg p-4 ${config.bg} ${config.border}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {config.icon}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#1D1D1F]">{deliverable.name}</h3>
                      <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
                    </div>
                    <p className="text-sm text-[#515154] mb-2">{deliverable.description}</p>
                    <div className="flex items-center gap-2 text-xs text-[#86868B] mb-3">
                      <span className="font-medium">{deliverable.phase}</span>
                      <span>•</span>
                      <span>Submitted {new Date(deliverable.submittedAt).toLocaleDateString()}</span>
                      {deliverable.approvedAt && (
                        <>
                          <span>•</span>
                          <span className="text-[#2E7D32] font-medium">Approved {new Date(deliverable.approvedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>

                    {/* Revision Feedback */}
                    {deliverable.feedback && deliverable.status === "revisions_needed" && (
                      <div className="bg-white/60 border-l-4 border-[#D32F2F] p-3 rounded mb-3">
                        <p className="text-xs font-semibold text-[#D32F2F] mb-1">Feedback for Revision</p>
                        <p className="text-sm text-[#515154]">{deliverable.feedback}</p>
                      </div>
                    )}

                    {/* Approval Feedback */}
                    {deliverable.feedback && deliverable.status !== "revisions_needed" && (
                      <div className="bg-white/60 border-l-4 border-[#2E7D32] p-3 rounded mb-3">
                        <p className="text-xs font-semibold text-[#2E7D32] mb-1">Your Feedback</p>
                        <p className="text-sm text-[#515154]">{deliverable.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-[#F5F5F7] border border-[#E5E5E7] text-sm font-medium text-[#1D1D1F] transition-colors">
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Review</span>
                  </button>
                  {deliverable.canProvideReview && deliverable.status !== "approved" && (
                    <button
                      onClick={() => setSelectedDeliverable(deliverable)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-medium transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Feedback</span>
                    </button>
                  )}
                  {deliverable.status === "approved" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F5E9] text-[#2E7D32] font-medium text-sm">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="hidden sm:inline">Approved</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Feedback Modal */}
      {selectedDeliverable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-[#E5E5E7]">
              <h2 className="text-lg font-semibold text-[#1D1D1F]">Provide Feedback</h2>
              <p className="text-sm text-[#86868B] mt-1">{selectedDeliverable.name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Your Feedback</label>
                <textarea
                  value={clientFeedback}
                  onChange={(e) => setClientFeedback(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or questions about this deliverable..."
                  className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent resize-none"
                  rows={4}
                />
                <p className="text-xs text-[#86868B] mt-2">Be specific with your feedback so the team can implement your suggestions effectively.</p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setSelectedDeliverable(null)
                    setClientFeedback("")
                  }}
                  className="px-4 py-2 rounded-lg border border-[#E5E5E7] text-[#1D1D1F] font-medium hover:bg-[#F5F5F7] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!clientFeedback.trim() || isSubmittingFeedback}
                  className="px-4 py-2 rounded-lg bg-[#2E7D32] text-white font-medium hover:bg-[#1B5E20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingFeedback ? "Sending..." : "Submit Feedback"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
