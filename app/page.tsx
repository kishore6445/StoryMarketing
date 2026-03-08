"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { AuthGuard } from "@/components/auth-guard"
import { TopNav } from "@/components/top-nav"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { useClient } from "@/contexts/client-context"
import { useRouter } from "next/navigation"
import { JourneyTimeline } from "@/components/journey-timeline"
import { CurrentPhaseCard } from "@/components/current-phase-card"
import { TodaysFocus } from "@/components/todays-focus"
import { VisibilitySnapshot } from "@/components/visibility-snapshot"
import { ProgressTracker } from "@/components/progress-tracker"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { ActivityFeed } from "@/components/activity-feed"
import { TaskComments } from "@/components/task-comments"
import { TeamMentions } from "@/components/team-mentions"
import { PhaseResearch } from "@/components/phases/phase-research"
import { PhaseWriting } from "@/components/phases/phase-writing"
import { PhaseDesign } from "@/components/phases/phase-design"
import { PhaseWebsite } from "@/components/phases/phase-website"
import { PhaseDistribution } from "@/components/phases/phase-distribution"
import { PhaseData } from "@/components/phases/phase-data"
import { PhaseLearning } from "@/components/phases/phase-learning"
import { ClientReportCard } from "@/components/client-report-card"
import { MyTasksToday } from "@/components/my-tasks-today"
import { AddClientModal } from "@/components/add-client-modal"
import { ClientsListView } from "@/components/clients-list-view"
import { ConnectSocial } from "@/components/connect-social"
import { RecordMetrics } from "@/components/record-metrics"
import { ManageVictoryTargets } from "@/components/manage-victory-targets"
import { ManageCampaigns } from "@/components/manage-campaigns"
import { RecordCampaignMetrics } from "@/components/record-campaign-metrics"
import { DashboardHome } from "@/components/dashboard-home"
import { ClientDetailView } from "@/components/client-detail-view"
import { ContentCalendarEnhanced } from "@/components/content-calendar-enhanced"
import { ComplianceBrandSafety } from "@/components/compliance-brand-safety"
import { TemplateLibrary } from "@/components/template-library"
import { TeamMeetingScheduler } from "@/components/team-meeting-scheduler"
import { WorkflowDashboard } from "@/components/workflow-dashboard"
import { WorkflowManager } from "@/components/workflow-manager"
import { ManageClientsSection } from "@/components/manage-clients-section"
import { PostComposer } from "@/components/post-composer"
import { AdminUserManagement } from "@/components/admin-user-management"
import { ComprehensivePKRView } from "@/components/comprehensive-pkr-view"
import { PKRAnalyticsDynamic } from "@/components/pkr-analytics-dynamic"
import { TeamAnalyticsDashboard } from "@/components/team-analytics-dashboard"
import { ClientAnalytics } from "@/components/client-analytics"
import { TrendingUp, Target } from "lucide-react"

const clientsFetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json())
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { selectedClientId, setSelectedClientId } = useClient()
  const [currentPhase, setCurrentPhase] = useState("my-tasks")
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [showClientDetail, setShowClientDetail] = useState(false)
  const [showPostComposer, setShowPostComposer] = useState(false)
  const [clients, setClients] = useState([] as any[])
  
  // Redirect clients to their portal
  useEffect(() => {
    if (user?.role === 'client') {
      router.push('/client-portal')
    }
  }, [user, router])

  const { data: clientsData, mutate: mutateClients } = useSWR("/api/clients", clientsFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })

  useEffect(() => {
    if (clientsData?.clients) {
      setClients(clientsData.clients.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || "",
        brandColor: c.brand_color || "#0071E3",
        is_active: c.is_active,
      })))
    }
  }, [clientsData])

  const handleAddClient = async (clientData: { name: string; description: string; brandColor?: string }) => {
    // Optimistic update
    const tempClient = {
      id: `temp-${Date.now()}`,
      ...clientData,
      is_active: true,
    }
    setClients((prev) => [...prev, tempClient])
    setShowAddClientModal(false)

    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: clientData.name,
          description: clientData.description,
          brandColor: clientData.brandColor,
        }),
      })
      const data = await response.json()
      if (data.success && data.client) {
        // Revalidate to get real data
        mutateClients()
      }
    } catch (error) {
      // Revert on error
      mutateClients()
    }
  }

  const handleEditClient = (clientId: string) => {
    console.log("Edit client:", clientId)
  }

  const handleArchiveClient = async (clientId: string) => {
    // Optimistic update
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, is_active: false } : c)))

    try {
      const token = localStorage.getItem("sessionToken")
      await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: false }),
      })
      mutateClients()
    } catch (error) {
      mutateClients()
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FAFBFC]">
        <TopNav
          hideClientSelector={currentPhase === "my-tasks"}
        />
        <div className="flex">
          <Sidebar currentPhase={currentPhase} onPhaseChange={setCurrentPhase} />
          <main className="flex-1 ml-64 transition-all duration-300 mt-16 p-8 [@media(max-width:768px)]:ml-20">
            <div className="max-w-7xl mx-auto space-y-8">
              {currentPhase === "overview" && (
                <DashboardHome
                  clients={clients}
                  selectedClientId={selectedClientId}
                  onClientSelect={(clientId) => {
                    setSelectedClientId(clientId)
                    setShowClientDetail(true)
                  }}
                />
              )}

              {currentPhase === "my-tasks" && <MyTasksToday />}
              {showClientDetail && (
                <ClientDetailView
                  clientId={selectedClientId}
                  clientName={clients.find((c) => c.id === selectedClientId)?.name || ""}
                  clientDescription={clients.find((c) => c.id === selectedClientId)?.description || ""}
                  clientBrandColor={clients.find((c) => c.id === selectedClientId)?.brandColor || "#000000"}
                  onBack={() => setShowClientDetail(false)}
                />
              )}
              {currentPhase === "clients" && (
                <ClientsListView
                  clients={clients}
                  selectedClientId={selectedClientId}
                  onSelectClient={setSelectedClientId}
                  onEditClient={handleEditClient}
                  onArchiveClient={handleArchiveClient}
                />
              )}
              {currentPhase === "connect-social" && (
                <div className="bg-white border border-[#E5E5E7] rounded-lg p-8">
                  <ConnectSocial clientId={selectedClientId} />
                </div>
              )}
              {currentPhase === "record-metrics" && <RecordMetrics />}
              {currentPhase === "manage-campaigns" && <ManageCampaigns />}
              {currentPhase === "record-campaign-metrics" && <RecordCampaignMetrics />}
              {currentPhase === "manage-victory-targets" && <ManageVictoryTargets />}
              {currentPhase === "research" && <PhaseResearch />}
              {currentPhase === "writing" && <PhaseWriting />}
              {currentPhase === "design" && <PhaseDesign />}
              {currentPhase === "website" && <PhaseWebsite />}
              {currentPhase === "distribution" && <PhaseDistribution />}
              {(currentPhase === "data" || currentPhase === "analytics") && <PhaseData />}
              {currentPhase === "learning" && <PhaseLearning />}
              {currentPhase === "report-card" && <ClientReportCard clientId={selectedClientId} />}
              {currentPhase === "collaboration" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h1 className="type-h1">Team Collaboration</h1>
                    <p className="type-body text-[#86868B]">
                      Stay connected with your team through activity feeds, task comments, and team mentions
                    </p>
                  </div>
                  <ActivityFeed limit={15} />
                </div>
              )}
              {currentPhase === "team-meetings" && (
                <TeamMeetingScheduler clientId={selectedClientId} clientName={clients.find((c) => c.id === selectedClientId)?.name || ""} />
              )}
              {currentPhase === "workflow" && <WorkflowDashboard clientId={selectedClientId} />}
              {currentPhase === "workflow-manager" && <WorkflowManager />}
              {currentPhase === "content-calendar" && (
                <ContentCalendarEnhanced 
                  clientId={selectedClientId} 
                  onCreatePost={() => setShowPostComposer(true)}
                />
              )}
              {currentPhase === "compliance" && <ComplianceBrandSafety clientId={selectedClientId} />}
              {currentPhase === "templates" && <TemplateLibrary />}
              {currentPhase === "manage-clients" && <ManageClientsSection />}
              {currentPhase === "admin-users" && <AdminUserManagement />}
              {currentPhase === "pkr-analytics" && <PKRAnalyticsDynamic />}
              {currentPhase === "team-analytics" && <TeamAnalyticsDashboard />}
              {currentPhase === "client-analytics" && <ClientAnalytics />}
            </div>
          </main>
        </div>

        <AddClientModal isOpen={showAddClientModal} onClose={() => setShowAddClientModal(false)} onSubmit={handleAddClient} />
        
        {showPostComposer && (
          <PostComposer 
            onClose={() => setShowPostComposer(false)}
            onSchedule={async (post) => {
              console.log('[v0] Scheduling post:', post)
              
              // Close modal immediately for better UX
              setShowPostComposer(false)
              
              // Make API call to schedule post
              try {
                const token = localStorage.getItem('sessionToken')
                const response = await fetch('/api/posts/schedule', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    clientId: post.clientId,
                    platforms: post.channels,
                    content: post.content,
                    scheduledDate: post.scheduledDate,
                    scheduledTime: post.scheduledTime,
                    media: [], // TODO: Handle media upload
                    status: post.status,
                  }),
                })
                
                const data = await response.json()
                
                if (data.success) {
                  console.log('[v0] Post scheduled successfully:', data.postId)
                  // SWR will auto-refresh the calendar via cache revalidation
                } else {
                  console.error('[v0] Failed to schedule post:', data.error)
                  alert('Failed to schedule post: ' + data.error)
                }
              } catch (error) {
                console.error('[v0] Error scheduling post:', error)
                alert('Error scheduling post. Please try again.')
              }
            }}
          />
        )}
      </div>
    </AuthGuard>
  )
}
