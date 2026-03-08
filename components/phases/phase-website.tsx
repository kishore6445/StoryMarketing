"use client"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { useClient } from "@/contexts/client-context"
import { usePhaseData } from "@/hooks/use-phase-data"
import { StoryTechCommandCenter } from "@/components/story-tech-command-center"
import { PhaseCompletion } from "@/components/phase-completion"

export function PhaseWebsite() {
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
          title: "Domain registration and SSL setup",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          category: "infrastructure" as const,
          status: "planning" as const
        },
        {
          id: "2",
          title: "Homepage and about page",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          category: "pages" as const,
          status: "setup" as const
        },
        {
          id: "3",
          title: "Services and pricing pages",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
          category: "pages" as const,
          status: "testing" as const
        },
        {
          id: "4",
          title: "CRM integration (HubSpot)",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          category: "integrations" as const,
          status: "launched" as const
        },
        {
          id: "5",
          title: "Page speed optimization",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          category: "optimization" as const,
          status: "setup" as const
        },
        {
          id: "6",
          title: "Analytics and tracking setup",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          category: "integrations" as const,
          status: "launched" as const
        }
      ])
    }
  }, [selectedClientId])

  if (!selectedClientId) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[#86868B]">Please select a client to view Story Tech</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Show Completion Flow */}
      {showCompletion ? (
        <PhaseCompletion
          currentPhase="website"
          currentPhaseName="Story Tech"
          nextPhase="distribution"
          nextPhaseName="Story Distribution"
          onSubmitForReview={() => {}}
          onSkip={() => setShowCompletion(false)}
        />
      ) : (
        <>
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Story Tech</h1>
          </div>

          {/* Story Tech Command Center */}
          <StoryTechCommandCenter
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
