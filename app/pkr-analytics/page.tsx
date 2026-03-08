"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { TopNav } from "@/components/top-nav"
import { Sidebar } from "@/components/sidebar"
import { PKRAnalyticsDashboard } from "@/components/pkr-analytics-dashboard"

export default function PKRAnalyticsPage() {
  const [currentPhase, setCurrentPhase] = useState("account-manager")

  // Mock data for users PKR
  const usersPKRData = [
    { id: "1", name: "Alex Johnson", pkrPercentage: 94, total: 32, kept: 30, atRisk: 1, missed: 1 },
    { id: "2", name: "Sarah Chen", pkrPercentage: 88, total: 25, kept: 22, atRisk: 2, missed: 1 },
    { id: "3", name: "Mike Davis", pkrPercentage: 92, total: 24, kept: 22, atRisk: 1, missed: 1 },
    { id: "4", name: "Emma Wilson", pkrPercentage: 85, total: 20, kept: 17, atRisk: 2, missed: 1 },
    { id: "5", name: "James Brown", pkrPercentage: 90, total: 30, kept: 27, atRisk: 2, missed: 1 },
    { id: "6", name: "Lisa Anderson", pkrPercentage: 96, total: 25, kept: 24, atRisk: 0, missed: 1 },
  ]

  // Mock data for clients PKR
  const clientsPKRData = [
    { id: "c1", name: "TechCorp Inc", pkrPercentage: 92, total: 50, kept: 46, atRisk: 3, missed: 1 },
    { id: "c2", name: "Global Solutions", pkrPercentage: 88, total: 40, kept: 35, atRisk: 4, missed: 1 },
    { id: "c3", name: "Enterprise Ltd", pkrPercentage: 90, total: 35, kept: 31, atRisk: 3, missed: 1 },
    { id: "c4", name: "StartUp Hub", pkrPercentage: 85, total: 23, kept: 19, atRisk: 3, missed: 1 },
  ]

  const mockSprintMetrics = [
    { week: "Week 1", pkr: 88 },
    { week: "Week 2", pkr: 85 },
    { week: "Week 3", pkr: 90 },
    { week: "Week 4", pkr: 87 },
    { week: "Week 5", pkr: 92 },
    { week: "Week 6", pkr: 89 },
  ]

  const mockCurrentSprint = {
    name: "Sprint 24",
    pkrPercentage: 89,
    totalPromises: 145,
    keptPromises: 129,
    atRiskPromises: 12,
    missedPromises: 4,
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FAFBFC]">
        <TopNav />
        <div className="flex">
          <Sidebar currentPhase={currentPhase} onPhaseChange={setCurrentPhase} />
          <main className="flex-1 ml-64 transition-all duration-300 mt-16 p-8 [@media(max-width:768px)]:ml-20">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-4xl font-bold text-[#1D1D1F] mb-3">Company-Wide PKR Analytics</h1>
                <p className="text-lg text-[#86868B]">
                  Numbers-first comparison dashboard for tracking Promises Kept Ratio across users and clients. Filter, sort, and compare PKR metrics with precision.
                </p>
              </div>

              {/* Main Analytics Dashboard - Numbers First */}
              <PKRAnalyticsDashboard
                usersPKRData={usersPKRData}
                clientsPKRData={clientsPKRData}
                overallPKR={mockCurrentSprint.pkrPercentage}
                totalPromises={mockCurrentSprint.totalPromises}
                keptPromises={mockCurrentSprint.keptPromises}
                atRiskPromises={mockCurrentSprint.atRiskPromises}
                missedPromises={mockCurrentSprint.missedPromises}
              />

              {/* Footer Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-sm text-blue-900">
                <p className="font-semibold mb-2">About PKR (Promises Kept Ratio)</p>
                <p className="text-blue-800">
                  PKR measures the percentage of committed promises (tasks promised to be completed in a sprint) that are actually kept by the due date. 
                  A higher PKR indicates better commitment adherence and team reliability. Target: 90%+ for elite performance.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
