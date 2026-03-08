"use client"

import { useState } from "react"
import { Plus, ChevronDown, Calendar, Archive, Trash2, Edit2, Eye } from "lucide-react"
import useSWR from "swr"

interface Campaign {
  id: string
  client_id: string | null
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  status: "planning" | "active" | "completed" | "archived"
  created_by: string | null
  created_at: string
  updated_at: string
  clients?: {
    id: string
    name: string
  } | null
  campaign_type: string
  platform: string
  content?: string
}

interface Client {
  id: string
  name: string
}

const fetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json())
}

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case "email":
      return "bg-[#D1E3FF] text-[#007AFF]"
    case "linkedin":
      return "bg-[#D1FADF] text-[#2E7D32]"
    case "youtube":
      return "bg-[#F3F3F6] text-[#86868B]"
    case "instagram":
      return "bg-[#FFE5CC] text-[#FF9500]"
    case "facebook":
      return "bg-[#D1E3FF] text-[#007AFF]"
    case "blog":
      return "bg-[#D1FADF] text-[#2E7D32]"
    default:
      return "bg-[#F3F3F6] text-[#86868B]"
  }
}

export function ManageCampaigns() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showContentModal, setShowContentModal] = useState(false)
  const [showViewContentModal, setShowViewContentModal] = useState(false)
  const [selectedCampaignForContent, setSelectedCampaignForContent] = useState<string | null>(null)
  const [contentToAdd, setContentToAdd] = useState("")
  const [newCampaign, setNewCampaign] = useState({
    client_id: "",
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    campaign_type: "",
    platform: "",
  })
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // Fetch campaigns with SWR
  const { data: campaignsData, error: campaignsError, mutate: mutateCampaigns } = useSWR(
    "/api/campaigns",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  )

  // Fetch clients for dropdown
  const { data: clientsData, error: clientsError } = useSWR(
    "/api/clients",
    fetcher,
    {
      revalidateOnFocus: true,
    }
  )

  const clients: Client[] = clientsData?.clients || []
  const activeCampaigns = campaignsData?.campaigns.filter((c: Campaign) => c.status === "active" || c.status === "planning") || []
  const completedCampaigns = campaignsData?.campaigns.filter((c: Campaign) => c.status === "completed") || []
  const archivedCampaigns = campaignsData?.campaigns.filter((c: Campaign) => c.status === "archived") || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#D1E3FF] text-[#007AFF]"
      case "completed":
        return "bg-[#D1FADF] text-[#2E7D32]"
      case "archived":
        return "bg-[#F3F3F6] text-[#86868B]"
      case "planning":
        return "bg-[#FFE5CC] text-[#FF9500]"
      default:
        return "bg-[#F3F3F6] text-[#86868B]"
    }
  }

  const handleCreateCampaign = async () => {
    if (!newCampaign.name) return

    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          client_id: newCampaign.client_id || null,
          name: newCampaign.name,
          description: newCampaign.description || null,
          start_date: newCampaign.start_date || null,
          end_date: newCampaign.end_date || null,
          status: "planning",
          campaign_type: newCampaign.campaign_type,
          platform: newCampaign.platform,
        }),
      })

      if (response.ok) {
        mutateCampaigns()
        setNewCampaign({
          client_id: "",
          name: "",
          description: "",
          start_date: "",
          end_date: "",
          campaign_type: "",
          platform: "",
        })
        setIsCreating(false)
      }
    } catch (error) {
      console.error("[v0] Error creating campaign:", error)
    }
  }

  const handleDeleteCampaign = async (id: string) => {
    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        mutateCampaigns()
      }
    } catch (error) {
      console.error("[v0] Error deleting campaign:", error)
    }
  }

  const handleArchiveCampaign = async (id: string) => {
    const campaign = campaignsData?.campaigns.find((c: Campaign) => c.id === id)
    if (!campaign) return

    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: campaign.status === "archived" ? "active" : "archived",
        }),
      })

      if (response.ok) {
        mutateCampaigns()
      }
    } catch (error) {
      console.error("[v0] Error archiving campaign:", error)
    }
  }

  const handleAddContent = async () => {
    if (!selectedCampaignForContent || !contentToAdd.trim()) return

    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/campaigns/${selectedCampaignForContent}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: contentToAdd,
        }),
      })

      if (response.ok) {
        mutateCampaigns()
        setShowContentModal(false)
        setContentToAdd("")
        setSelectedCampaignForContent(null)
      }
    } catch (error) {
      console.error("[v0] Error adding content:", error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (response.ok) {
        mutateCampaigns()
      }
    } catch (error) {
      console.error("[v0] Error updating status:", error)
    }
  }

  const isLoading = !campaignsData && !campaignsError

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Manage Campaigns</h1>
        <p className="text-sm text-[#86868B]">Create and manage content campaigns to track metrics by campaign type</p>
      </div>

      {/* Create Campaign Button */}
      {!isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      )}

      {/* Create Campaign Form */}
      {isCreating && (
        <div className="bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#1D1D1F]">Create New Campaign</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Client</label>
              <select
                value={newCampaign.client_id}
                onChange={(e) => setNewCampaign({ ...newCampaign, client_id: e.target.value })}
                className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              >
                <option value="">Select client (optional)...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Campaign Name</label>
              <input
                type="text"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="e.g., Q1 Marketing Campaign"
                className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Start Date</label>
              <input
                type="date"
                value={newCampaign.start_date}
                onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#1D1D1F] block mb-1">End Date</label>
              <input
                type="date"
                value={newCampaign.end_date}
                onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Campaign Type</label>
            <select
              value={newCampaign.campaign_type}
              onChange={(e) => setNewCampaign({ ...newCampaign, campaign_type: e.target.value })}
              className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            >
              <option value="">Select type...</option>
              <option value="email_campaign">Email Campaign</option>
              <option value="video_series">Video Series</option>
              <option value="design_batch">Design Batch</option>
              <option value="blog_sprint">Blog Sprint</option>
              <option value="social_series">Social Series</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Platform</label>
            <select
              value={newCampaign.platform}
              onChange={(e) => setNewCampaign({ ...newCampaign, platform: e.target.value })}
              className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            >
              <option value="">Select platform...</option>
              <option value="email">Email</option>
              <option value="linkedin">LinkedIn</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="blog">Blog</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Description (optional)</label>
            <textarea
              value={newCampaign.description}
              onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
              placeholder="Add notes about this campaign..."
              className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-[#E5E5E7]">
            <button
              onClick={handleCreateCampaign}
              className="flex-1 px-4 py-2 bg-[#2E7D32] text-white text-sm rounded-lg hover:bg-[#1B5E20] transition-colors font-medium"
            >
              Create Campaign
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="flex-1 px-4 py-2 bg-[#F5F5F7] text-[#1D1D1F] text-sm rounded-lg hover:bg-[#E5E5E7] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#1D1D1F] uppercase tracking-wider">Active & Draft Campaigns</h2>
          <div className="space-y-2">
            {activeCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white border border-[#E5E5E7] rounded-lg overflow-hidden hover:border-[#86868B] transition-colors"
              >
                <button
                  onClick={() => setExpandedId(expandedId === campaign.id ? null : campaign.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-[#F8F9FB]"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#1D1D1F]">{campaign.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                        {campaign.clients && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#E3F2FD] text-[#0051C3]">
                            {campaign.clients.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#86868B]">
                        {campaign.start_date && campaign.end_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(campaign.start_date).toLocaleDateString()} — {new Date(campaign.end_date).toLocaleDateString()}
                          </span>
                        )}
                        {campaign.description && <span>{campaign.description}</span>}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[#86868B] transition-transform ${expandedId === campaign.id ? "rotate-180" : ""}`}
                  />
                </button>

                {expandedId === campaign.id && (
                  <div className="border-t border-[#E5E5E7] p-4 bg-[#F8F9FB] space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-[#1D1D1F]">Campaign Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {campaign.clients && (
                          <div>
                            <span className="text-[#86868B]">Client:</span>
                            <span className="font-medium text-[#1D1D1F] ml-2">{campaign.clients.name}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-[#86868B]">Status:</span>
                          <select
                            value={campaign.status}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleStatusChange(campaign.id, e.target.value)
                            }}
                            className="ml-2 text-sm bg-white border border-[#E5E5E7] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                          >
                            <option value="planning">Planning</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                        {campaign.start_date && (
                          <div>
                            <span className="text-[#86868B]">Start Date:</span>
                            <span className="font-medium text-[#1D1D1F] ml-2">{new Date(campaign.start_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {campaign.end_date && (
                          <div>
                            <span className="text-[#86868B]">End Date:</span>
                            <span className="font-medium text-[#1D1D1F] ml-2">{new Date(campaign.end_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {campaign.description && (
                          <div className="col-span-2">
                            <span className="text-[#86868B]">Description:</span>
                            <p className="text-[#1D1D1F] mt-1">{campaign.description}</p>
                          </div>
                        )}
                      </div>
                      {campaign.content && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCampaignForContent(campaign.id)
                            setShowViewContentModal(true)
                          }}
                          className="flex items-center gap-1 text-xs text-[#007AFF] hover:text-[#0051C3] transition-colors mt-2"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Campaign Content
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[#E5E5E7]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCampaignForContent(campaign.id)
                          setShowContentModal(true)
                        }}
                        className="flex items-center gap-1 px-3 py-2 bg-white border border-[#E5E5E7] text-[#1D1D1F] text-sm rounded-lg hover:bg-[#F5F5F7] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Content
                      </button>
                      <button className="flex items-center gap-1 px-3 py-2 bg-white border border-[#E5E5E7] text-[#1D1D1F] text-sm rounded-lg hover:bg-[#F5F5F7] transition-colors">
                        <Edit2 className="w-4 h-4" />
                        Record Metrics
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleArchiveCampaign(campaign.id)
                        }}
                        className="flex items-center gap-1 px-3 py-2 bg-white border border-[#E5E5E7] text-[#86868B] text-sm rounded-lg hover:bg-[#F5F5F7] transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCampaign(campaign.id)
                        }}
                        className="ml-auto px-3 py-2 bg-white border border-[#FFD6D6] text-[#C41C1C] text-sm rounded-lg hover:bg-[#FFF0F0] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Campaigns */}
      {completedCampaigns.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#1D1D1F] uppercase tracking-wider">Completed Campaigns</h2>
          <div className="space-y-2">
            {completedCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <span className="font-medium text-[#1D1D1F]">{campaign.name}</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium bg-[#D1FADF] text-[#2E7D32]">
                    Completed
                  </span>
                </div>
                <button
                  onClick={() => handleArchiveCampaign(campaign.id)}
                  className="flex items-center gap-1 px-3 py-2 text-[#86868B] text-sm hover:text-[#1D1D1F] transition-colors"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Archived Campaigns */}
      {archivedCampaigns.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#1D1D1F] uppercase tracking-wider">Archived Campaigns</h2>
          <div className="space-y-2">
            {archivedCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg p-4 flex items-center justify-between opacity-50"
              >
                <span className="text-sm text-[#86868B]">{campaign.name}</span>
                <button
                  onClick={() => handleDeleteCampaign(campaign.id)}
                  className="text-[#C41C1C] hover:text-[#9A0E0E] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      {showContentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowContentModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[#E5E5E7]">
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Add Content to Campaign</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Content</label>
                <textarea
                  value={contentToAdd}
                  onChange={(e) => setContentToAdd(e.target.value)}
                  placeholder="Enter campaign content details, notes, or links..."
                  className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  rows={6}
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#E5E5E7] flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowContentModal(false)
                  setContentToAdd("")
                  setSelectedCampaignForContent(null)
                }}
                className="px-4 py-2 bg-[#F5F5F7] text-[#1D1D1F] text-sm rounded-lg hover:bg-[#E5E5E7] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContent}
                className="px-4 py-2 bg-[#2E7D32] text-white text-sm rounded-lg hover:bg-[#1B5E20] transition-colors font-medium"
              >
                Add Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Content Modal */}
      {showViewContentModal && selectedCampaignForContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowViewContentModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[#E5E5E7] flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#1D1D1F]">Campaign Content</h2>
              <button
                onClick={() => {
                  const campaign = (campaignsData?.campaigns || []).find((c: Campaign) => c.id === selectedCampaignForContent)
                  if (campaign?.content) {
                    navigator.clipboard.writeText(campaign.content)
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#F5F5F7] text-[#1D1D1F] text-sm rounded-lg hover:bg-[#E5E5E7] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
            <div className="p-6">
              <div className="bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg p-4 text-sm text-[#1D1D1F] whitespace-pre-wrap">
                {(campaignsData?.campaigns || []).find((c: Campaign) => c.id === selectedCampaignForContent)?.content || "No content available"}
              </div>
            </div>
            <div className="p-6">
              <div className="bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg p-4 text-sm text-[#1D1D1F] whitespace-pre-wrap">
                {/* {campaigns.find((c) => c.id === selectedCampaignForContent)?.content || "No content available"} */}
                {(campaignsData?.campaigns || []).find((c) => c.id === selectedCampaignForContent)?.content || "No content available"}
              </div>
            </div>
            <div className="p-6 border-t border-[#E5E5E7] flex justify-end">
              <button
                onClick={() => {
                  setShowViewContentModal(false)
                  setSelectedCampaignForContent(null)
                }}
                className="px-4 py-2 bg-[#F5F5F7] text-[#1D1D1F] text-sm rounded-lg hover:bg-[#E5E5E7] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
