"use client"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { useClient } from "@/contexts/client-context"
import { usePhaseData } from "@/hooks/use-phase-data"
import { StoryWritingCommandCenter } from "@/components/story-writing-command-center"
import { PhaseCompletion } from "@/components/phase-completion"

export function PhaseWriting() {
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
          title: "Blog: The Power of Clear Positioning",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          priority: "high" as const,
          status: "outline" as const
        },
        {
          id: "2",
          title: "LinkedIn Article: Building Your Authority",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          priority: "high" as const,
          status: "writing" as const
        },
        {
          id: "3",
          title: "Email Sequence: Welcome Series",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          priority: "medium" as const,
          status: "editing" as const
        },
        {
          id: "4",
          title: "Case Study: Client Success Story",
          clientName: "The Rustic Spin",
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          priority: "high" as const,
          status: "published" as const
        }
      ])
    }
  }, [selectedClientId])

  if (!selectedClientId) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[#86868B]">Please select a client to view writing phase</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Show Completion Flow */}
      {showCompletion ? (
        <PhaseCompletion
          currentPhase="writing"
          currentPhaseName="Story Writing"
          nextPhase="distribution"
          nextPhaseName="Distribution"
          onSubmitForReview={() => {}}
          onSkip={() => setShowCompletion(false)}
        />
      ) : (
        <>
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Story Writing</h1>
          </div>

          {/* Story Writing Command Center */}
          <StoryWritingCommandCenter
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
