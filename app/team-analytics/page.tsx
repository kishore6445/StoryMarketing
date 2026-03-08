import { Metadata } from "next"
import { TeamAnalyticsDashboard } from "@/components/team-analytics-dashboard"

export const metadata: Metadata = {
  title: "Team Analytics",
  description: "View comprehensive team performance metrics and analytics",
}

export default function TeamAnalyticsPage() {
  return (
    <main className="h-full bg-white">
      <TeamAnalyticsDashboard />
    </main>
  )
}
