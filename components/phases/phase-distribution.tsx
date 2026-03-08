"use client"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { useClient } from "@/contexts/client-context"
import { usePhaseData } from "@/hooks/use-phase-data"
import { StoryDistributionCommandCenter } from "@/components/story-distribution-command-center"
import { PhaseCompletion } from "@/components/phase-completion"

export function PhaseDistribution() {
  const { selectedClientId } = useClient()
  const { phases, isLoading, mutate } = usePhaseData(selectedClientId)
  const [showCompletion, setShowCompletion] = useState(false)
  const [moves, setMoves] = useState<any[]>([])

  // Mock data for demonstration - replace with actual API call
  useEffect(() => {
    if (selectedClientId) {
      // This would be replaced with actual API data
      setMoves([
        {
          id: "1",
          title: "Blog post: 5 Ways to Scale Your Business",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          platform: "blog" as const,
          status: "draft" as const
        },
        {
          id: "2",
          title: "LinkedIn: Thought leadership insights",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          platform: "linkedin" as const,
          status: "scheduled" as const
        },
        {
          id: "3",
          title: "Instagram carousel: Behind the scenes",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          platform: "instagram" as const,
          status: "scheduled" as const
        },
        {
          id: "4",
          title: "Email: Weekly newsletter",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          platform: "email" as const,
          status: "published" as const
        },
        {
          id: "5",
          title: "Twitter thread: Industry trends",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          platform: "twitter" as const,
          status: "published" as const
        },
        {
          id: "6",
          title: "LinkedIn: Case study spotlight",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          platform: "linkedin" as const,
          status: "promoted" as const
        }
      ])
    }
  }, [selectedClientId])

  if (!selectedClientId) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[#86868B]">Please select a client to view Story Distribution</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Show Completion Flow */}
      {showCompletion ? (
        <PhaseCompletion
          currentPhase="distribution"
          currentPhaseName="Story Distribution"
          nextPhase="analytics"
          nextPhaseName="Story Analytics"
          onSubmitForReview={() => {}}
          onSkip={() => setShowCompletion(false)}
        />
      ) : (
        <>
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Story Distribution</h1>
          </div>

          {/* Story Distribution Command Center */}
          <StoryDistributionCommandCenter
            moves={moves}
            isLoading={isLoading}
            onAddMove={() => {
              // Handle add move
            }}
          />

          {/* Phase Complete Button */}
          <button
            onClick={() => setShowCompletion(true)}
            className="w-full py-3 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-[#0051D5] transition-colors flex items-center justify-center gap-2"
          >
            Complete Phase & Move Forward
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  )
}
