"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useClient } from "@/contexts/client-context"
import {
  ChevronLeft,
  ClipboardCheck,
  Eye,
  Lock,
  LayoutDashboard,
  Search,
  FileText,
  Palette,
  Globe,
  Send,
  BarChart3,
  GraduationCap,
  CheckSquare,
  Settings,
  Users,
  MessageSquare,
  TrendingUp,
  Target,
  Calendar,
  Shield,
  BookOpen,
  Zap,
  UserPlus,
  List,
  ChevronDown,
} from "lucide-react"

const primaryNav = [
  {
    id: "my-tasks",
    name: "My Tasks_test",
    icon: CheckSquare,
  },
  {
    id: "client-analytics",
    name: "Client Analytics",
    icon: BarChart3,
  },
  {
    id: "team-analytics",
    name: "Team Analytics",
    icon: Users,
  },
  {
    id: "pkr-analytics",
    name: "PKR Analytics",
    icon: TrendingUp,
  },
]

const storyJourney = [
  {
    id: "research",
    name: "Story Research",
    icon: Search,
    status: "completed",
  },
  {
    id: "writing",
    name: "Story Writing",
    icon: FileText,
    status: "in-progress",
  },
  {
    id: "design",
    name: "Story Design & Video",
    icon: Palette,
    status: "not-started",
  },
  {
    id: "website",
    name: "Story Website",
    icon: Globe,
    status: "not-started",
  },
  {
    id: "distribution",
    name: "Story Distribution",
    icon: Send,
    status: "not-started",
  },
  {
    id: "data",
    name: "Story Analytics",
    icon: BarChart3,
    status: "not-started",
  },
  {
    id: "learning",
    name: "Story Learning",
    icon: GraduationCap,
    status: "not-started",
  },
]

const collaboration = [
  {
    id: "backlog",
    name: "Backlog",
    icon: List,
    href: "/backlog",
  },
  {
    id: "client-portal",
    name: "Client Portal",
    icon: Eye,
    isExternal: true,
    href: "/client-portal",
  },
  {
    id: "account-manager",
    name: "Client Overview",
    icon: Users,
    href: "/account-manager",
  },
]

const advancedFeatures = [
  {
    id: "report-card",
    name: "Client Report Card",
    icon: ClipboardCheck,
  },
  {
    id: "team-meetings",
    name: "Team Meetings",
    icon: Users,
  },
  {
    id: "collaboration",
    name: "Team Collaboration",
    icon: MessageSquare,
  },
  {
    id: "workflow-manager",
    name: "Workflow Manager",
    icon: Zap,
  },
  {
    id: "manage-campaigns",
    name: "Manage Campaigns",
    icon: Target,
  },
  {
    id: "record-campaign-metrics",
    name: "Record Metrics",
    icon: TrendingUp,
  },
  {
    id: "manage-victory-targets",
    name: "Victory Targets",
    icon: Target,
  },
  {
    id: "content-calendar",
    name: "Content Calendar",
    icon: Calendar,
  },
  {
    id: "compliance",
    name: "Compliance & Safety",
    icon: Shield,
  },
  {
    id: "templates",
    name: "Templates & SOPs",
    icon: BookOpen,
  },
  {
    id: "manage-clients",
    name: "Manage Clients",
    icon: Users,
  },
  {
    id: "admin-users",
    name: "Admin User Management",
    icon: UserPlus,
  },
]

const statusLabels = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  completed: "Completed",
}

// Monochrome styling with blue accent for active state
const sidebarItemStyles = {
  activeButton: "bg-[#007AFF] text-white border-l-2 border-l-[#007AFF]",
  inactiveButton: "text-[#1D1D1F] border-l-2 border-l-transparent hover:bg-[#F5F5F7]",
  label: "text-[#86868B]",
}

interface SidebarProps {
  currentPhase: string
  onPhaseChange: (phase: string) => void
}

export function Sidebar({ currentPhase, onPhaseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [showStoryJourney, setShowStoryJourney] = useState(true)
  const [showClientSprints, setShowClientSprints] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  const { setSelectedClientId } = useClient()
  
  const userRole = user?.role || "user"
  const isClient = userRole === "client"
  const isAdmin = userRole === "admin"

  // For clients: show only Client Portal
  // For others: show Dashboard and My Tasks
  const visibleNav = isClient ? [] : primaryNav
  const visibleStory = isClient ? [] : storyJourney
  const visibleCollaboration = isClient ? collaboration.filter(c => c.id === "client-portal") : collaboration

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 bg-card border-r border-border overflow-y-auto transition-all duration-300 z-40",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <nav className="p-4 space-y-1">
          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2.5 rounded-lg hover:bg-muted transition-all mb-4 group"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn(
                "w-5 h-5 text-muted-foreground group-hover:text-foreground transition-all",
                isCollapsed && "rotate-180",
              )}
            />
          </button>

          {/* Primary Navigation (Dashboard & My Tasks) */}
          {visibleNav.map((item) => {
            const Icon = item.icon
            const isActive = item.id === currentPhase

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "my-tasks") {
                    setSelectedClientId(null)
                  }
                  onPhaseChange(item.id)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-semibold transition-all",
                  isActive 
                    ? sidebarItemStyles.activeButton
                    : sidebarItemStyles.inactiveButton,
                  isCollapsed && "justify-center px-2.5",
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="flex-1 text-left">{item.name}</span>}
              </button>
            )
          })}

          {/* Divider */}
          {!isClient && <div className="my-4 border-t border-border" />}

          {/* Story Journey Section - Collapsible */}
          {!isClient && (
            <>
              <button
                onClick={() => setShowStoryJourney(!showStoryJourney)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-semibold transition-all relative",
                  showStoryJourney ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  isCollapsed && "justify-center px-2.5",
                )}
                title={isCollapsed ? "Story Journey" : undefined}
              >
                {!isCollapsed && (
                  <>
                    <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider flex-1 text-left">
                      Story Journey
                    </span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform flex-shrink-0", !showStoryJourney && "-rotate-90")} />
                  </>
                )}
              </button>

              {/* Story Journey Items (Hidden by default if collapsed) */}
              {showStoryJourney && (
                <div className={isCollapsed ? "" : "ml-0 space-y-1"}>
                  {visibleStory.map((phase) => {
                    const Icon = phase.icon
                    const isActive = phase.id === currentPhase

                    return (
                      <button
                        key={phase.id}
                        onClick={() => onPhaseChange(phase.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-all",
                          isActive 
                            ? sidebarItemStyles.activeButton
                            : sidebarItemStyles.inactiveButton,
                          isCollapsed && "justify-center px-2.5",
                        )}
                        title={isCollapsed ? phase.name : undefined}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && <span className="flex-1 text-left">{phase.name}</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* Divider */}
          {!isClient && <div className="my-4 border-t border-border" />}

          {/* Client Sprints Section - Collapsible */}
          {!isClient && (
            <>
              <button
                onClick={() => setShowClientSprints(!showClientSprints)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-semibold transition-all relative",
                  showClientSprints ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  isCollapsed && "justify-center px-2.5",
                )}
                title={isCollapsed ? "Client Sprints" : undefined}
              >
                {!isCollapsed && (
                  <>
                    <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider flex-1 text-left">
                      Client Sprints
                    </span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform flex-shrink-0", !showClientSprints && "-rotate-90")} />
                  </>
                )}
              </button>

              {/* Client Sprints Items (Backlog, Client Portal, Client Overview) */}
              {showClientSprints && (
                <div className={isCollapsed ? "" : "ml-0 space-y-1"}>
                  {visibleCollaboration.map((item) => {
                    const Icon = item.icon

                    if (item.isExternal) {
                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-all text-[#007AFF] hover:bg-[#F0F7FF]",
                            isCollapsed && "justify-center px-2.5",
                          )}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          {!isCollapsed && <span className="flex-1 text-left">{item.name}</span>}
                        </a>
                      )
                    } else {
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.href) router.push(item.href)
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-all text-[#1D1D1F] hover:bg-[#F5F5F7]",
                            isCollapsed && "justify-center px-2.5",
                          )}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          {!isCollapsed && <span className="flex-1 text-left">{item.name}</span>}
                        </button>
                      )
                    }
                  })}
                </div>
              )}
            </>
          )}

          {/* Divider */}
          {!isClient && <div className="my-4 border-t border-border" />}

          {/* More Menu - Advanced Features */}
          {!isClient && (
            <>
              {!isCollapsed && (
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">More</p>
                </div>
              )}
              <button
                onClick={() => setShowMore(!showMore)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative",
                  showMore ? "bg-muted text-foreground" : "text-foreground hover:bg-muted",
                  isCollapsed && "justify-center px-2.5",
                )}
                title={isCollapsed ? "More options" : undefined}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">Advanced</span>
                    <ChevronLeft className={cn("w-4 h-4 transition-transform", showMore && "rotate-180")} />
                  </>
                )}
              </button>

              {/* Advanced Features (Hidden by default) */}
              {showMore && !isCollapsed && (
                <div className="ml-2 border-l border-[#E5E5E7] pl-2 space-y-1">
                  {advancedFeatures.map((feature) => {
                    const Icon = feature.icon
                    const isActive = feature.id === currentPhase

                    return (
                      <button
                        key={feature.id}
                        onClick={() => onPhaseChange(feature.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all",
                          isActive 
                            ? "bg-[#007AFF] text-white border-l border-l-[#007AFF]"
                            : "text-[#1D1D1F] border-l border-l-transparent hover:bg-[#F5F5F7]",
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 text-left">{feature.name}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </nav>
      </aside>
    </>
  )
}
