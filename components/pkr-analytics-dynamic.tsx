"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { ComprehensivePKRView } from "./comprehensive-pkr-view"
import { Loader2 } from "lucide-react"

const fetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json())
}

export function PKRAnalyticsDynamic() {
  const { data: pkrData, isLoading } = useSWR("/api/pkr/calculate", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60000, // Refresh every minute
  })

  const { data: usersData } = useSWR("/api/users", fetcher, {
    revalidateOnFocus: false,
  })

  const { data: clientsData } = useSWR("/api/clients", fetcher, {
    revalidateOnFocus: false,
  })

  const { data: sprintsData } = useSWR("/api/sprints", fetcher, {
    revalidateOnFocus: false,
  })

  // Helper: get the effective deadline for a task (promised_date takes priority over due_date)
  const getDeadline = (t: any): Date | null => {
    if (t.promised_date) {
      return new Date(`${t.promised_date}${t.promised_time ? 'T' + t.promised_time : 'T23:59:59'}`)
    }
    if (t.due_date) {
      return new Date(`${t.due_date}${t.due_time ? 'T' + t.due_time : 'T23:59:59'}`)
    }
    return null
  }

  const isCompleted = (t: any) => t.status === 'done' || t.status === 'completed'

  // Helper: compute PKR for a date range
  const computePKRForDateRange = (tasks: any[], startDate: Date, endDate: Date) => {
    const tasksInRange = tasks.filter((t: any) => {
      const deadline = getDeadline(t)
      if (!deadline) return false
      return deadline >= startDate && deadline < endDate
    })
    return computePKR(tasksInRange)
  }

  // Helper: calculate 8-week trend of PKR values
  const getWeeklyTrend = (tasks: any[]) => {
    const trend: number[] = []
    const now = new Date()
    for (let i = 7; i >= 0; i--) {
      const weekEnd = new Date(now)
      weekEnd.setDate(weekEnd.getDate() - (i * 7))
      const weekStart = new Date(weekEnd)
      weekStart.setDate(weekStart.getDate() - 7)
      
      const { pkrPercentage } = computePKRForDateRange(tasks, weekStart, weekEnd)
      trend.push(pkrPercentage)
    }
    return trend
  }

  // Helper: compute PKR for a set of tasks
  const computePKR = (tasks: any[]) => {
    const now = new Date()
    // A "promise" = any task that has a deadline (promised_date or due_date)
    const tasksWithDeadline = tasks.filter((t: any) => getDeadline(t) !== null)
    const totalPromises = tasksWithDeadline.length

    // Kept: completed AND completed_at <= deadline
    const keptPromises = tasksWithDeadline.filter((t: any) => {
      if (!isCompleted(t)) return false
      if (!t.completed_at) return false
      const deadline = getDeadline(t)!
      return new Date(t.completed_at) <= deadline
    }).length

    // Missed: either completed late OR not yet complete and past deadline
    const missedPromises = tasksWithDeadline.filter((t: any) => {
      if (isCompleted(t)) {
        if (!t.completed_at) return false
        const deadline = getDeadline(t)!
        return new Date(t.completed_at) > deadline
      }
      // Incomplete and past deadline
      const deadline = getDeadline(t)!
      return now > deadline
    }).length

    // At risk: incomplete and deadline within 24h from now (not yet past)
    const atRiskPromises = tasksWithDeadline.filter((t: any) => {
      if (isCompleted(t)) return false
      const deadline = getDeadline(t)!
      const hoursUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
      return hoursUntil >= 0 && hoursUntil < 24
    }).length

    const pkrPercentage = totalPromises > 0
      ? Math.round((keptPromises / totalPromises) * 100)
      : 0

    return { totalPromises, keptPromises, missedPromises, atRiskPromises, pkrPercentage }
  }

  // Calculate team member PKR metrics from tasks
  const allTasks: any[] = pkrData?.tasks || []

  const teamMembers = (usersData?.users || []).map((user: any) => {
    const userTasks = allTasks.filter((t: any) => t.assigned_to === user.id)
    const { totalPromises, keptPromises, missedPromises, atRiskPromises, pkrPercentage } = computePKR(userTasks)
    const weeklyTrend = getWeeklyTrend(userTasks)
    return {
      id: user.id,
      name: user.full_name || user.email,
      email: user.email,
      pkrPercentage,
      totalPromises,
      keptPromises,
      atRiskPromises,
      missedPromises,
      weeklyTrend,
    }
  })

  // Calculate client PKR metrics
  const clientData = (clientsData?.clients || []).map((client: any) => {
    const clientTasks = allTasks.filter((t: any) => t.client_id === client.id)
    const { totalPromises, keptPromises, pkrPercentage } = computePKR(clientTasks)
    const weeklyTrend = getWeeklyTrend(clientTasks)

    // Get assigned user (first user assigned to any task for this client)
    const assignedUser = usersData?.users?.find((u: any) =>
      clientTasks.some((t: any) => t.assigned_to === u.id)
    )

    // Count sprints for this client
    const clientSprints = sprintsData?.sprints?.filter((s: any) => s.client_id === client.id) || []

    // Trend: compare recent 5 tasks vs overall
    const recentTasks = clientTasks.slice(-5)
    const { pkrPercentage: recentPKR } = computePKR(recentTasks)
    const trend = recentPKR > pkrPercentage ? "up" : recentPKR < pkrPercentage ? "down" : "stable"

    return {
      id: client.id,
      name: client.name,
      pkrPercentage,
      totalPromises,
      keptPromises,
      assignedTo: assignedUser?.full_name || assignedUser?.email || "Unassigned",
      sprintCount: clientSprints.length,
      trend: trend as "up" | "down" | "stable",
      weeklyTrend,
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#86868B]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#1D1D1F] mb-3">PKR Analytics Dashboard</h1>
        <p className="text-lg text-[#86868B]">
          Track Promises Kept Ratio across your team, individual contributors, and clients.
        </p>
      </div>

      {/* Comprehensive PKR View with Tabs */}
      <ComprehensivePKRView
        teamMembers={teamMembers}
        clientData={clientData}
      />

      {/* Footer Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-sm text-blue-900">
        <p className="font-semibold mb-2">Understanding PKR Metrics</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-800">
          <div>
            <p className="font-medium mb-1">Individual Performance</p>
            <p>Track each team member's commitment adherence and identify high performers.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Team Performance</p>
            <p>Monitor aggregate team PKR and ensure collective targets are met.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Client Performance</p>
            <p>Understand delivery performance by client to identify risk areas and improve relationships.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
