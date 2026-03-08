"use client"

import { useState } from "react"
import { Plus, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TechMove {
  id: string
  title: string
  clientName: string
  dueDate: string
  category: "infrastructure" | "pages" | "optimization" | "integrations"
  status: "planning" | "setup" | "testing" | "launched"
}

interface StoryTechCommandCenterProps {
  moves: TechMove[]
  isLoading?: boolean
  onAddMove?: () => void
}

const categoryColors = {
  infrastructure: { label: "Infrastructure", border: "border-t-[#007AFF]", bg: "bg-[#007AFF]", light: "bg-[#F3F8FF]" },
  pages: { label: "Pages", border: "border-t-[#5856D6]", bg: "bg-[#5856D6]", light: "bg-[#F5F3FF]" },
  optimization: { label: "Optimization", border: "border-t-[#FF9500]", bg: "bg-[#FF9500]", light: "bg-[#FFF7ED]" },
  integrations: { label: "Integrations", border: "border-t-[#34C759]", bg: "bg-[#34C759]", light: "bg-[#F0FFF4]" },
}

const statusConfig = {
  planning: { label: "Planning", color: "text-[#6B7280]" },
  setup: { label: "Setup", color: "text-[#007AFF]" },
  testing: { label: "Testing", color: "text-[#FF9500]" },
  launched: { label: "Launched", color: "text-[#34C759]" },
}

export function StoryTechCommandCenter({ moves, isLoading = false, onAddMove }: StoryTechCommandCenterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Organize moves by status
  const columns = {
    planning: moves.filter(m => m.status === "planning"),
    setup: moves.filter(m => m.status === "setup"),
    testing: moves.filter(m => m.status === "testing"),
    launched: moves.filter(m => m.status === "launched"),
  }

  const launchedCount = columns.launched.length
  const totalMoves = moves.length
  const completionPercent = totalMoves > 0 ? Math.round((launchedCount / totalMoves) * 100) : 0

  if (isLoading) {
    return <div className="py-12 text-center text-[#86868B]">Loading Story Tech data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Mission Panel */}
      <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Mission</h2>
        <div className="space-y-2">
          <p className="text-sm text-[#515154]">Build a high-performance digital platform that converts visitors into leads and customers.</p>
          <div className="mt-4 pt-4 border-t border-[#E5E5E7]">
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">Success Criteria</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-[#34C759] mt-1">✓</span>
                <span className="text-sm text-[#515154]">Core pages live and optimized for conversions</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#34C759] mt-1">✓</span>
                <span className="text-sm text-[#515154]">Integrations (CRM, email, analytics) connected</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#34C759] mt-1">✓</span>
                <span className="text-sm text-[#515154]">Performance metrics tracked and reporting active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Development Progress */}
      <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">Platform Completion</h3>
          <span className="text-sm font-semibold text-[#1D1D1F]">{completionPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#E5E5E7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#34C759] transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-[#86868B]">{launchedCount} of {totalMoves} tech modules launched</div>
      </div>

      {/* Tech Development Kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 w-full min-w-max">
          {/* Column: Planning */}
          <div className="flex-shrink-0 w-96 bg-white rounded-xl border border-[#E5E5E7] overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 px-4 py-2.5 flex items-center justify-between transition-all border-b border-[#E5E5E7] bg-white">
              <div className="flex items-baseline gap-2">
                <h3 className="font-semibold text-xs uppercase text-[#6B7280] tracking-widest leading-none">Planning</h3>
                <span className="text-xs font-normal text-[#9CA3AF]">{columns.planning.length}</span>
              </div>
              <div className="w-10 h-0.5 bg-[#E5E5E7] rounded-full overflow-hidden">
                <div className="h-full bg-[#6B7280]" style={{ width: "30%" }} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {columns.planning.length > 0 ? (
                columns.planning.map(move => (
                  <TechMoveCard key={move.id} move={move} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Plus className="w-8 h-8 text-[#D1D1D6] mb-2" />
                  <p className="text-xs text-[#86868B] mb-2">No planning tasks</p>
                  <p className="text-xs text-[#BDBDBE]">Define first tech requirements</p>
                </div>
              )}
            </div>
          </div>

          {/* Column: Setup */}
          <div className="flex-shrink-0 w-96 bg-white rounded-xl border border-[#E5E5E7] overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 px-4 py-2.5 flex items-center justify-between transition-all border-b border-[#E5E5E7] bg-white">
              <div className="flex items-baseline gap-2">
                <h3 className="font-semibold text-xs uppercase text-[#6B7280] tracking-widest leading-none">Setup</h3>
                <span className="text-xs font-normal text-[#9CA3AF]">{columns.setup.length}</span>
              </div>
              <div className="w-10 h-0.5 bg-[#E5E5E7] rounded-full overflow-hidden">
                <div className="h-full bg-[#007AFF]" style={{ width: "50%" }} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {columns.setup.length > 0 ? (
                columns.setup.map(move => (
                  <TechMoveCard key={move.id} move={move} />
                ))
              ) : (
                <div className="text-center py-8 text-[#86868B] text-xs">No setup tasks</div>
              )}
            </div>
          </div>

          {/* Column: Testing */}
          <div className="flex-shrink-0 w-96 bg-white rounded-xl border border-[#E5E5E7] overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 px-4 py-2.5 flex items-center justify-between transition-all border-b border-[#E5E5E7] bg-white">
              <div className="flex items-baseline gap-2">
                <h3 className="font-semibold text-xs uppercase text-[#6B7280] tracking-widest leading-none">Testing</h3>
                <span className="text-xs font-normal text-[#9CA3AF]">{columns.testing.length}</span>
              </div>
              <div className="w-10 h-0.5 bg-[#E5E5E7] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF9500]" style={{ width: "70%" }} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {columns.testing.length > 0 ? (
                columns.testing.map(move => (
                  <TechMoveCard key={move.id} move={move} />
                ))
              ) : (
                <div className="text-center py-8 text-[#86868B] text-xs">No testing tasks</div>
              )}
            </div>
          </div>

          {/* Column: Launched */}
          <div className="flex-shrink-0 w-96 bg-white rounded-xl border border-[#E5E5E7] overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 px-4 py-2.5 flex items-center justify-between transition-all border-b border-[#E5E5E7] bg-white">
              <div className="flex items-baseline gap-2">
                <h3 className="font-semibold text-xs uppercase text-[#6B7280] tracking-widest leading-none">Launched</h3>
                <span className="text-xs font-normal text-[#9CA3AF]">{columns.launched.length}</span>
              </div>
              <div className="w-10 h-0.5 bg-[#E5E5E7] rounded-full overflow-hidden">
                <div className="h-full bg-[#34C759]" style={{ width: "100%" }} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {columns.launched.length > 0 ? (
                columns.launched.map(move => (
                  <TechMoveCard key={move.id} move={move} />
                ))
              ) : (
                <div className="text-center py-8 text-[#86868B] text-xs">No launched modules yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Standards */}
      <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Tech Stack Standards</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-2">Performance</h3>
            <ul className="space-y-1 text-sm text-[#515154]">
              <li>• Page load time: under 2 seconds</li>
              <li>• Core Web Vitals: all green</li>
              <li>• Mobile-first responsive design</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-2">Security</h3>
            <ul className="space-y-1 text-sm text-[#515154]">
              <li>• SSL certificate installed</li>
              <li>• GDPR compliance ready</li>
              <li>• Regular security audits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function TechMoveCard({ move }: { move: TechMove }) {
  const category = categoryColors[move.category]
  const daysUntilDue = Math.ceil(
    (new Date(move.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  const isOverdue = daysUntilDue < 0

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all duration-150 bg-white",
        "hover:shadow-sm hover:-translate-y-0.5 hover:border-[#D1D5DB]",
        "border-[#E5E7EB]"
      )}
    >
      <h4 className="text-sm font-medium text-[#111111] leading-snug mb-2">{move.title}</h4>

      <div className="space-y-2">
        <div className="text-xs text-[#9CA3AF]">{move.clientName}</div>

        {/* Category Badge */}
        <div className="flex items-center gap-2">
          <div className={cn("w-1.5 h-1.5 rounded-full", category.bg)} />
          <span className="text-xs font-medium text-[#6B7280]">{category.label}</span>
        </div>

        {/* Due Date & Status */}
        <div className="flex items-center justify-between pt-2">
          <div className={cn("text-xs font-semibold", isOverdue ? "text-red-600" : "text-[#6B7280]")}>
            {isOverdue ? (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </div>
            ) : (
              `${daysUntilDue}d`
            )}
          </div>
          <span className={cn("text-xs font-medium", statusConfig[move.status].color)}>
            {statusConfig[move.status].label}
          </span>
        </div>
      </div>
    </div>
  )
}
