"use client"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { useClient } from "@/contexts/client-context"
import { usePhaseData } from "@/hooks/use-phase-data"
import { StoryLearningCommandCenter } from "@/components/story-learning-command-center"
import { PhaseCompletion } from "@/components/phase-completion"

export function PhaseLearning() {
  const { selectedClientId } = useClient()
  const { phases, isLoading, mutate } = usePhaseData(selectedClientId)
  const [showCompletion, setShowCompletion] = useState(false)
  const [learnings, setLearnings] = useState<any[]>([])

  // Mock data for demonstration - replace with actual API call
  useEffect(() => {
    if (selectedClientId) {
      // This would be replaced with actual API data
      setLearnings([
        {
          id: "1",
          title: "LinkedIn engagement drives 40% of leads",
          clientName: "The Rustic Spin",
          category: "insight" as const,
          priority: "high" as const,
          status: "documented" as const
        },
        {
          id: "2",
          title: "Email cadence changed to bi-weekly",
          clientName: "The Rustic Spin",
          category: "decision" as const,
          priority: "high" as const,
          status: "implemented" as const
        },
        {
          id: "3",
          title: "Video content gets 3x more engagement",
          clientName: "The Rustic Spin",
          category: "insight" as const,
          priority: "high" as const,
          status: "reinforced" as const
        },
        {
          id: "4",
          title: "Focus messaging on ROI over features",
          clientName: "The Rustic Spin",
          category: "action" as const,
          priority: "medium" as const,
          status: "archived" as const
        },
        {
          id: "5",
          title: "Tuesday posts show 2x reach",
          clientName: "The Rustic Spin",
          category: "insight" as const,
          priority: "medium" as const,
          status: "documented" as const
        },
        {
          id: "6",
          title: "Testimonials boost conversion by 25%",
          clientName: "The Rustic Spin",
          category: "action" as const,
          priority: "high" as const,
          status: "archived" as const
        }
      ])
    }
  }, [selectedClientId])

  if (!selectedClientId) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[#86868B]">Please select a client to view Story Learning</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Show Completion Flow */}
      {showCompletion ? (
        <PhaseCompletion
          currentPhase="learning"
          currentPhaseName="Story Learning"
          nextPhase="research"
          nextPhaseName="Story Research (Next Cycle)"
          onSubmitForReview={() => {}}
          onSkip={() => setShowCompletion(false)}
        />
      ) : (
        <>
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Story Learning</h1>
          </div>

          {/* Story Learning Command Center */}
          <StoryLearningCommandCenter
            items={learnings}
            isLoading={isLoading}
            onAddItem={() => {
              // Handle add learning
            }}
          />

          {/* Phase Complete Button */}
          <button
            onClick={() => setShowCompletion(true)}
            className="w-full py-3 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-[#0051D5] transition-colors flex items-center justify-center gap-2"
          >
            Complete Cycle & Start Next Sprint
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  )
}
