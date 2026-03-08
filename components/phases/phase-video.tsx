"use client"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { useClient } from "@/contexts/client-context"
import { usePhaseData } from "@/hooks/use-phase-data"
import { StoryVideoCommandCenter } from "@/components/story-video-command-center"
import { PhaseCompletion } from "@/components/phase-completion"

export function PhaseVideo() {
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
          title: "Brand hero video (60 seconds)",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          videoType: "hero" as const,
          status: "concept" as const
        },
        {
          id: "2",
          title: "Client success story testimonial",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          videoType: "testimonial" as const,
          status: "production" as const
        },
        {
          id: "3",
          title: "Service explainer video (2 minutes)",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          videoType: "explainer" as const,
          status: "editing" as const
        },
        {
          id: "4",
          title: "YouTube intro sequence & watermark",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          videoType: "hero" as const,
          status: "final" as const
        }
      ])
    }
  }, [selectedClientId])

  if (!selectedClientId) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[#86868B]">Please select a client to view video phase</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Show Completion Flow */}
      {showCompletion ? (
        <PhaseCompletion
          currentPhase="video"
          currentPhaseName="Story Video"
          nextPhase="distribution"
          nextPhaseName="Distribution"
          onSubmitForReview={() => {}}
          onSkip={() => setShowCompletion(false)}
        />
      ) : (
        <>
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Story Video</h1>
          </div>

          {/* Story Video Command Center */}
          <StoryVideoCommandCenter
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
