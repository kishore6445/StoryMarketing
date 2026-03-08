"use client"

import { useState } from "react"
import { Plus, ChevronDown, Calendar, Save, X } from "lucide-react"
import useSWR from "swr"

interface Campaign {
  id: string
  client_id: string | null
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  status: string
  campaign_type: string
  platform: string
}

interface CampaignMetric {
  id: string
  campaign_id: string
  date: string
  impressions: number
  reach: number
  engagement: number
  conversions: number
  spend: number
  created_at: string
}

interface MetricRecording {
  id: string
  campaign_id: string
  content_piece_id: string | null
  recording_date: string
  metric_values: { [key: string]: number | string }
  notes: string | null
}

interface ContentPiece {
  id: string
  content_name: string
  published_date: string
}

const fetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json())
}

const emailMetrics = ["Opens", "Clicks", "Unsubs", "Bounces"]
const videoMetrics = ["Views", "Likes", "Comments", "Shares"]

const mockCampaigns: Campaign[] = [
  { id: "1", client_id: "client1", name: "Email Campaign", description: "An email marketing campaign", start_date: "2023-01-01", end_date: "2023-01-31", status: "active", campaign_type: "email_marketing", platform: "email" },
  { id: "2", client_id: "client2", name: "Video Campaign", description: "A video marketing campaign", start_date: "2023-02-01", end_date: "2023-02-28", status: "active", campaign_type: "video_marketing", platform: "video" },
]

const mockContentPieces: { [key: string]: ContentPiece[] } = {
  "1": [
    { id: "1-1", content_name: "Newsletter 1", published_date: "2023-01-15" },
    { id: "1-2", content_name: "Newsletter 2", published_date: "2023-01-20" },
  ],
  "2": [
    { id: "2-1", content_name: "Video Ad 1", published_date: "2023-02-10" },
    { id: "2-2", content_name: "Video Ad 2", published_date: "2023-02-15" },
  ],
}

export function RecordCampaignMetrics() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [selectedContent, setSelectedContent] = useState<ContentPiece | null>(null)
  const [recordingDate, setRecordingDate] = useState(new Date().toISOString().split("T")[0])
  const [metricValues, setMetricValues] = useState({
    impressions: "",
    reach: "",
    engagement: "",
    conversions: "",
    spend: "",
  })
  const [expandedRecordingId, setExpandedRecordingId] = useState<string | null>(null)
  const [expandedMetricId, setExpandedMetricId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [notes, setNotes] = useState("")
  const [recordings, setRecordings] = useState<MetricRecording[]>([])

  // Fetch campaigns
  const { data: campaignsData, error: campaignsError, mutate: mutateCampaigns } = useSWR(
    "/api/campaigns",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  )

  // Fetch metrics for selected campaign
  const { data: metricsData, error: metricsError, mutate: mutateMetrics } = useSWR(
    selectedCampaignId ? `/api/campaign-metrics?campaign_id=${selectedCampaignId}` : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  )

  const campaigns: Campaign[] = campaignsData?.campaigns || []
  const metrics: CampaignMetric[] = metricsData?.metrics || []
  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId)
  const contentPieces = selectedCampaign ? mockContentPieces[selectedCampaignId] || [] : []
  const currentMetrics = selectedCampaign?.platform === "email" ? emailMetrics : videoMetrics

  const handleSaveMetrics = async () => {
    if (!selectedCampaignId || !recordingDate) return

    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch("/api/campaign-metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaign_id: selectedCampaignId,
          date: recordingDate,
          impressions: parseInt(metricValues.impressions) || 0,
          reach: parseInt(metricValues.reach) || 0,
          engagement: parseInt(metricValues.engagement) || 0,
          conversions: parseInt(metricValues.conversions) || 0,
          spend: parseFloat(metricValues.spend) || 0,
        }),
      })

      if (response.ok) {
        mutateMetrics()
        setMetricValues({
          impressions: "",
          reach: "",
          engagement: "",
          conversions: "",
          spend: "",
        })
        setIsRecording(false)
      }
    } catch (error) {
      console.error("[v0] Error saving metrics:", error)
    }
  }

  const handleSaveRecording = async () => {
    if (!selectedCampaignId || !recordingDate) return

    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch("/api/campaign-metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaign_id: selectedCampaignId,
          content_piece_id: selectedContent?.id || null,
          date: recordingDate,
          metric_values: metricValues,
          notes: notes,
        }),
      })

      if (response.ok) {
        const newRecording = await response.json()
        setRecordings([...recordings, newRecording])
        setMetricValues({
          impressions: "",
          reach: "",
          engagement: "",
          conversions: "",
          spend: "",
        })
        setNotes("")
        setIsRecording(false)
      }
    } catch (error) {
      console.error("[v0] Error saving recording:", error)
    }
  }

  const handleDeleteRecording = async (recordingId: string) => {
    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/campaign-metrics/${recordingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setRecordings(recordings.filter((r) => r.id !== recordingId))
      }
    } catch (error) {
      console.error("[v0] Error deleting recording:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Record Campaign Metrics</h1>
        <p className="text-sm text-[#86868B]">Track metrics for each campaign content piece with custom metrics per campaign type</p>
      </div>

      {/* Campaign Selection */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#1D1D1F]">Select Campaign</h2>

        {campaigns.length === 0 ? (
          <p className="text-sm text-[#86868B]">No campaigns available. Create a campaign first.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => {
                  setSelectedCampaignId(campaign.id)
                  setMetricValues({
                    impressions: "",
                    reach: "",
                    engagement: "",
                    conversions: "",
                    spend: "",
                  })
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedCampaignId === campaign.id
                    ? "border-[#2E7D32] bg-[#D1FADF]"
                    : "border-[#E5E5E7] bg-white hover:border-[#86868B]"
                }`}
              >
                <div className="font-medium text-[#1D1D1F]">{campaign.name}</div>
                <div className="text-xs text-[#86868B] mt-1">{campaign.campaign_type?.replace(/_/g, " ") || "Campaign"}</div>
                {campaign.start_date && campaign.end_date && (
                  <div className="text-xs text-[#86868B] mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(campaign.start_date).toLocaleDateString()} — {new Date(campaign.end_date).toLocaleDateString()}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Metrics Recording */}
      {selectedCampaign && (
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#1D1D1F]">Record Metrics for {selectedCampaign.name}</h2>

          {!isRecording ? (
            <button
              onClick={() => setIsRecording(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Metrics Recording
            </button>
          ) : (
            <div className="bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-[#1D1D1F]">Record Campaign Metrics</h3>

              <div>
                <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Date</label>
                <input
                  type="date"
                  value={recordingDate}
                  onChange={(e) => setRecordingDate(e.target.value)}
                  className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-[#1D1D1F]">Metrics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Impressions</label>
                    <input
                      type="number"
                      value={metricValues.impressions}
                      onChange={(e) => setMetricValues({ ...metricValues, impressions: e.target.value })}
                      placeholder="0"
                      className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Reach</label>
                    <input
                      type="number"
                      value={metricValues.reach}
                      onChange={(e) => setMetricValues({ ...metricValues, reach: e.target.value })}
                      placeholder="0"
                      className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Engagement</label>
                    <input
                      type="number"
                      value={metricValues.engagement}
                      onChange={(e) => setMetricValues({ ...metricValues, engagement: e.target.value })}
                      placeholder="0"
                      className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Conversions</label>
                    <input
                      type="number"
                      value={metricValues.conversions}
                      onChange={(e) => setMetricValues({ ...metricValues, conversions: e.target.value })}
                      placeholder="0"
                      className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Spend ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={metricValues.spend}
                      onChange={(e) => setMetricValues({ ...metricValues, spend: e.target.value })}
                      placeholder="0.00"
                      className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#E5E5E7]">
                <button
                  onClick={handleSaveMetrics}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#2E7D32] text-white text-sm rounded-lg hover:bg-[#1B5E20] transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Metrics
                </button>
                <button
                  onClick={() => {
                    setIsRecording(false)
                    setMetricValues({
                      impressions: "",
                      reach: "",
                      engagement: "",
                      conversions: "",
                      spend: "",
                    })
                  }}
                  className="flex-1 px-4 py-2 bg-[#F5F5F7] text-[#1D1D1F] text-sm rounded-lg hover:bg-[#E5E5E7] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metrics History */}
      {metrics.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1D1D1F]">Metrics History</h2>
          <div className="space-y-2">
            {metrics.map((metric) => (
              <div key={metric.id} className="bg-white border border-[#E5E5E7] rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedMetricId(expandedMetricId === metric.id ? null : metric.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-[#F8F9FB]"
                >
                  <div className="text-left">
                    <div className="font-medium text-[#1D1D1F]">
                      {campaigns.find((c) => c.id === metric.campaign_id)?.name || "Campaign"}
                    </div>
                    <div className="text-xs text-[#86868B] mt-1">{new Date(metric.date).toLocaleDateString()}</div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[#86868B] transition-transform ${expandedMetricId === metric.id ? "rotate-180" : ""}`}
                  />
                </button>

                {expandedMetricId === metric.id && (
                  <div className="border-t border-[#E5E5E7] p-4 bg-[#F8F9FB] space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[#86868B]">Impressions:</span>
                        <span className="font-medium text-[#1D1D1F] ml-2">{metric.impressions.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#86868B]">Reach:</span>
                        <span className="font-medium text-[#1D1D1F] ml-2">{metric.reach.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#86868B]">Engagement:</span>
                        <span className="font-medium text-[#1D1D1F] ml-2">{metric.engagement.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#86868B]">Conversions:</span>
                        <span className="font-medium text-[#1D1D1F] ml-2">{metric.conversions.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#86868B]">Spend:</span>
                        <span className="font-medium text-[#1D1D1F] ml-2">${metric.spend.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
