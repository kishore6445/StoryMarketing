"use client"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { useClient } from "@/contexts/client-context"
import { usePhaseData } from "@/hooks/use-phase-data"
import { StoryAnalyticsCommandCenter } from "@/components/story-analytics-command-center"
import { PhaseCompletion } from "@/components/phase-completion"

export function PhaseAnalytics() {
  const { selectedClientId } = useClient()
  const { phases, isLoading, mutate } = usePhaseData(selectedClientId)
  const [showCompletion, setShowCompletion] = useState(false)
  const [metrics, setMetrics] = useState<any[]>([])

  // Mock data for demonstration - replace with actual API call
  useEffect(() => {
    if (selectedClientId) {
      // This would be replaced with actual API data
      setMetrics([
        {
          id: "1",
          title: "LinkedIn Engagement Growth",
          clientName: "The Rustic Spin",
          value: 2340,
          change: 23,
          platform: "linkedin" as const,
          metric: "engagement" as const,
          status: "collected" as const
        },
        {
          id: "2",
          title: "Instagram Reach Campaign",
          clientName: "The Rustic Spin",
          value: 12500,
          change: 18,
          platform: "instagram" as const,
          metric: "reach" as const,
          status: "analyzed" as const
        },
        {
          id: "3",
          title: "Twitter Click Performance",
          clientName: "The Rustic Spin",
          value: 850,
          change: -5,
          platform: "twitter" as const,
          metric: "clicks" as const,
          status: "optimized" as const
        },
        {
          id: "4",
          title: "Email Conversion Rate",
          clientName: "The Rustic Spin",
          value: 42,
          change: 14,
          platform: "email" as const,
          metric: "conversions" as const,
          status: "reporting" as const
        },
        {
          id: "5",
          title: "Blog Post Impressions",
          clientName: "The Rustic Spin",
          value: 8900,
          change: 31,
          platform: "blog" as const,
          metric: "impressions" as const,
          status: "collected" as const
        },
        {
          id: "6",
          title: "Facebook Engagement Trends",
          clientName: "The Rustic Spin",
          value: 1560,
          change: 12,
          platform: "facebook" as const,
          metric: "engagement" as const,
          status: "analyzed" as const
        }
      ])
    }
  }, [selectedClientId])

  if (!selectedClientId) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[#86868B]">Please select a client to view Story Analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Show Completion Flow */}
      {showCompletion ? (
        <PhaseCompletion
          currentPhase="analytics"
          currentPhaseName="Story Analytics"
          nextPhase="learning"
          nextPhaseName="Story Learning"
          onSubmitForReview={() => {}}
          onSkip={() => setShowCompletion(false)}
        />
      ) : (
        <>
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Story Analytics</h1>
          </div>

          {/* Story Analytics Command Center */}
          <StoryAnalyticsCommandCenter
            metrics={metrics}
            isLoading={isLoading}
            onAddMetric={() => {
              // Handle add metric
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
