"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Search,
  FileText,
  Palette,
  Globe,
  Send,
  BarChart3,
  GraduationCap,
  ClipboardCheck,
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
  ChevronDown,
  Building2,
  Share2,
  AlertCircle,
} from "lucide-react"

interface SidebarImprovedProps {
  currentPhase: string
  onPhaseChange: (phase: string) => void
  selectedClient?: { name: string; status: "active" | "archived" }
}

interface MenuSection {
  id: string
  title: string
  color: "blue" | "purple" | "green" | "red" | "gray"
  items: MenuItem[]
  defaultOpen?: boolean
  badge?: number | "alert"
}

interface MenuItem {
  id: string
  name: string
  icon: any
  status?: "completed" | "in-progress" | "not-started"
  department?: "research" | "writing" | "design" | "distribution" | "analytics"
}

const GitBranch = () => <Zap className="w-5 h-5" />

export function SidebarImproved({
  currentPhase,
  onPhaseChange,
  selectedClient,
}: SidebarImprovedProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["production", "client-context"])
  )

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const accentColors = {
    blue: "text-[#007AFF] bg-[#F0F7FF]",
    purple: "text-[#9333EA] bg-[#FAF5FF]",
    green: "text-[#2E7D32] bg-[#F1F8F4]",
    red: "text-[#FF3B30] bg-[#FFE8E8]",
    gray: "text-[#86868B] bg-[#F8F9FB]",
  }

  const departmentColors = {
    research: { bg: "bg-[#0066FF]", label: "Research" },
    writing: { bg: "bg-[#7C3AED]", label: "Writing" },
    design: { bg: "bg-[#F59E0B]", label: "Design" },
    distribution: { bg: "bg-[#10B981]", label: "Distribution" },
    analytics: { bg: "bg-[#FF6B35]", label: "Analytics" },
  }

  const sections: MenuSection[] = [
    {
      id: "quick-access",
      title: "Quick Access",
      color: "blue",
      defaultOpen: true,
      items: [
        { id: "overview", name: "Dashboard", icon: LayoutDashboard },
        { id: "my-tasks", name: "My Tasks Today", icon: CheckSquare },
        { id: "command-center", name: "Weekly Summary", icon: TrendingUp },
      ],
    },
    {
      id: "client-context",
      title: `${selectedClient?.name || "Client"} Context`,
      color: "blue",
      defaultOpen: true,
      badge: 4,
      items: [
        { id: "client-detail", name: "Overview", icon: LayoutDashboard },
        { id: "client-meetings", name: "Meetings", icon: Users },
        { id: "client-tasks", name: "Tasks & Reports", icon: CheckSquare },
        { id: "client-reports", name: "Weekly Report", icon: FileText },
      ],
    },
    {
      id: "production",
      title: "Production Workflow",
      color: "blue",
      defaultOpen: true,
      items: [
        { id: "research", name: "Story Research", icon: Search, status: "completed", department: "research" },
        { id: "writing", name: "Story Writing", icon: FileText, status: "in-progress", department: "writing" },
        {
          id: "design",
          name: "Story Design & Video",
          icon: Palette,
          status: "not-started",
          department: "design",
        },
        { id: "website", name: "Story Website", icon: Globe, status: "not-started", department: "design" },
        {
          id: "distribution",
          name: "Story Distribution",
          icon: Send,
          status: "not-started",
          department: "distribution",
        },
        { id: "data", name: "Story Analytics", icon: BarChart3, status: "not-started", department: "analytics" },
        { id: "learning", name: "Story Learning", icon: GraduationCap, status: "not-started", department: "analytics" },
        { id: "report-card", name: "Report Card", icon: ClipboardCheck, status: "in-progress", department: "analytics" },
      ],
    },
    {
      id: "campaigns",
      title: "Campaign Hub",
      color: "purple",
      badge: 3,
      items: [
        { id: "manage-campaigns", name: "Manage Campaigns", icon: Target },
        { id: "record-campaign-metrics", name: "Campaign Metrics", icon: TrendingUp },
        { id: "manage-victory-targets", name: "Victory Targets", icon: Target },
        { id: "content-calendar", name: "Content Calendar", icon: Calendar },
      ],
    },
    {
      id: "team",
      title: "Team & Workflows",
      color: "green",
      badge: "alert",
      items: [
        { id: "collaboration", name: "Team Collaboration", icon: MessageSquare },
        { id: "team-meetings", name: "Team Meetings", icon: Users },
        { id: "workflow", name: "Workflow Engine", icon: Zap },
        { id: "workflow-manager", name: "Workflow Manager", icon: GitBranch },
      ],
    },
    {
      id: "compliance",
      title: "Compliance & Assets",
      color: "red",
      items: [
        { id: "compliance", name: "Compliance & Safety", icon: Shield },
        { id: "templates", name: "Templates & SOPs", icon: BookOpen },
      ],
    },
    {
      id: "settings",
      title: "Admin Settings",
      color: "gray",
      items: [
        { id: "clients", name: "Manage Clients", icon: Building2 },
        { id: "connect-social", name: "Social Connections", icon: Share2 },
      ],
    },
  ]

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-[#E5E5E7] overflow-y-auto">
      <nav className="p-3 space-y-1">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.id)
          const isDefaultOpen = section.defaultOpen ?? false
          const shouldShow = isExpanded || isDefaultOpen

          return (
            <div key={section.id} className="space-y-1">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all",
                  isExpanded
                    ? `${accentColors[section.color]} font-semibold`
                    : "text-[#515154] hover:text-[#111111]"
                )}
              >
                <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                  {section.title}
                  {section.badge && (
                    <span className={cn(
                      "text-xs font-bold rounded-full px-2 py-0.5",
                      section.badge === "alert"
                        ? "bg-[#FF3B30] text-white"
                        : "bg-[#007AFF] text-white"
                    )}>
                      {section.badge === "alert" ? "!" : section.badge}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isExpanded ? "rotate-180" : ""
                  )}
                />
              </button>

              {/* Section Items */}
              {isExpanded && (
                <div className="space-y-1 pl-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = item.id === currentPhase

                    return (
                      <button
                        key={item.id}
                        onClick={() => onPhaseChange(item.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 transition-all relative rounded-r-lg border-l-4 hover:shadow-sm"
                        style={{
                          borderLeftColor: item.department
                            ? {
                                research: "#0066FF",
                                writing: "#7C3AED",
                                design: "#F59E0B",
                                distribution: "#10B981",
                                analytics: "#FF6B35",
                              }[item.department]
                            : "#E5E5E7",
                          backgroundColor: item.department
                            ? {
                                research: "#E8F1FF",
                                writing: "#F8F4FF",
                                design: "#FFF8E8",
                                distribution: "#E8F9F3",
                                analytics: "#FFF0E6",
                              }[item.department]
                            : isActive
                            ? "#F0F7FF"
                            : "transparent",
                        }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{
                            color: item.department
                              ? {
                                  research: "#0066FF",
                                  writing: "#7C3AED",
                                  design: "#F59E0B",
                                  distribution: "#10B981",
                                  analytics: "#FF6B35",
                                }[item.department]
                              : isActive
                              ? "#007AFF"
                              : "#86868B",
                          }}
                        />
                        <span
                          className="text-sm flex-1 text-left font-medium"
                          style={{
                            color: item.department
                              ? {
                                  research: "#0052CC",
                                  writing: "#6D28D9",
                                  design: "#B45309",
                                  distribution: "#065F46",
                                  analytics: "#C2410C",
                                }[item.department]
                              : isActive
                              ? "#1D1D1F"
                              : "#515154",
                          }}
                        >
                          {item.name}
                        </span>
                        
                        {/* Department Badge Label */}
                        {item.department && (
                          <span
                            className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 text-white text-center min-w-[32px]"
                            style={{
                              backgroundColor: {
                                research: "#0066FF",
                                writing: "#7C3AED",
                                design: "#F59E0B",
                                distribution: "#10B981",
                                analytics: "#FF6B35",
                              }[item.department],
                            }}
                          >
                            {departmentColors[item.department].label.slice(0, 3).toUpperCase()}
                          </span>
                        )}
                        
                        {item.status && !item.department && (
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              item.status === "completed"
                                ? "bg-[#34C759]"
                                : item.status === "in-progress"
                                  ? "bg-[#FF9500]"
                                  : "bg-[#D1D1D6]"
                            )}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Divider between sections */}
              {section.id !== sections[sections.length - 1].id && (
                <div className="my-2 border-t border-[#E5E5E7]" />
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
