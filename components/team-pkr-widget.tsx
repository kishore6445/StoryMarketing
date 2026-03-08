"use client"

import { Award, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamMemberPKR {
  memberId: string
  memberName: string
  pkrPercentage: number
  promisesKept: number
  totalPromises: number
  trend?: "up" | "down" | "stable"
}

interface TeamPKRWidgetProps {
  teamMembers: TeamMemberPKR[]
  teamAveragePKR: number
  isLoading?: boolean
}

export function TeamPKRWidget({ teamMembers, teamAveragePKR, isLoading }: TeamPKRWidgetProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse h-12" />
        ))}
      </div>
    )
  }

  const sortedMembers = [...teamMembers].sort((a, b) => b.pkrPercentage - a.pkrPercentage)

  return (
    <div className="rounded-lg border border-border bg-card space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Company Performance - Team Members</h3>
        </div>
      </div>

      {/* Company PKR - This is our collective performance */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wide">Company PKR - Aggregate Performance</p>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-blue-900 dark:text-blue-100">{Math.round(teamAveragePKR)}%</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">
              {teamAveragePKR >= 90 ? "Elite Level" : teamAveragePKR >= 80 ? "Acceptable" : "Below Target"}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              Sum of all team member performance
            </span>
          </div>
        </div>
      </div>

      {/* Individual Contributors - Make Up Company Performance */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground px-1">Individual contributors (ranked by performance):</p>
        {sortedMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No team members data available</p>
        ) : (
          sortedMembers.map((member, index) => {
            const getColor = () => {
              if (member.pkrPercentage >= 90) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              if (member.pkrPercentage >= 80) return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
              return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }

            const getTextColor = () => {
              if (member.pkrPercentage >= 90) return "text-green-700 dark:text-green-300"
              if (member.pkrPercentage >= 80) return "text-amber-700 dark:text-amber-300"
              return "text-red-700 dark:text-red-300"
            }

            const vsCompany = member.pkrPercentage - Math.round(teamAveragePKR)

            return (
              <div key={member.memberId} className={cn("rounded-lg p-3 border", getColor())}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-foreground">{member.memberName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-bold", getTextColor())}>{member.pkrPercentage}%</span>
                    <span className={cn("text-xs font-semibold", vsCompany > 0 ? "text-green-600" : vsCompany < 0 ? "text-red-600" : "text-gray-500")}>
                      {vsCompany > 0 ? "+" : ""}{vsCompany}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        member.pkrPercentage >= 90 && "bg-green-500",
                        member.pkrPercentage >= 80 && member.pkrPercentage < 90 && "bg-amber-500",
                        member.pkrPercentage < 80 && "bg-red-500"
                      )}
                      style={{ width: `${member.pkrPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {member.promisesKept}/{member.totalPromises}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          <span>Target: 90%+</span>
        </div>
        <span>{sortedMembers.length} team members</span>
      </div>
    </div>
  )
}
