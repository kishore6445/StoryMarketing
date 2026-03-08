"use client"

import React from "react"

import { useMemo } from "react"

interface Phase {
  name: string
  sections: Array<{
    name: string
    tasks: Array<{ completed: boolean }>
  }>
}

interface ProgressCalculatorProps {
  phases: Phase[]
  children: (progress: any) => React.ReactNode
}

export function ProgressCalculator({ phases, children }: ProgressCalculatorProps) {
  const calculatedProgress = useMemo(() => {
    return phases.map((phase) => {
      const phaseTaskStats = phase.sections.reduce(
        (acc, section) => {
          const totalTasks = section.tasks.length
          const completedTasks = section.tasks.filter((t) => t.completed).length
          return {
            total: acc.total + totalTasks,
            completed: acc.completed + completedTasks,
          }
        },
        { total: 0, completed: 0 }
      )

      const progress =
        phaseTaskStats.total > 0
          ? Math.round((phaseTaskStats.completed / phaseTaskStats.total) * 100)
          : 0

      let status: "not_started" | "in_progress" | "completed"
      if (progress === 100) {
        status = "completed"
      } else if (progress > 0) {
        status = "in_progress"
      } else {
        status = "not_started"
      }

      return {
        name: phase.name,
        completedTasks: phaseTaskStats.completed,
        totalTasks: phaseTaskStats.total,
        progress,
        status,
      }
    })
  }, [phases])

  return <>{children(calculatedProgress)}</>
}
