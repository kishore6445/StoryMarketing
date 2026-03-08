'use client'

import { useState, useEffect, useCallback } from 'react'
import { calculateTaskPKR } from '@/lib/pkr-calculator'
import type { TaskWithPKR, PKRMetrics } from '@/lib/types/pkr'

export function usePKR(tasks: TaskWithPKR[] | undefined) {
  const [tasksWithPKR, setTasksWithPKR] = useState<TaskWithPKR[]>([])
  const [metrics, setMetrics] = useState<PKRMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const calculatePKRForTasks = useCallback(() => {
    if (!tasks || tasks.length === 0) {
      setTasksWithPKR([])
      setMetrics(null)
      setLoading(false)
      return
    }

    // Calculate PKR for each task
    const enrichedTasks = tasks.map(task => {
      const pkr = calculateTaskPKR(task)
      return { ...task, pkr }
    })

    setTasksWithPKR(enrichedTasks)

    // Calculate overall metrics
    const completed = enrichedTasks.filter(t => 
      t.status === 'done' || t.status === 'completed'
    )
    const onTime = completed.filter(t => t.pkr?.completedOnTime === true)
    const late = completed.filter(t => t.pkr?.completedOnTime === false)

    const overallPKR = completed.length > 0 
      ? (onTime.length / completed.length) * 100 
      : 0

    // Calculate this week's PKR
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const thisWeekCompleted = completed.filter(t => 
      t.completed_at && new Date(t.completed_at) > oneWeekAgo
    )
    const lastWeekCompleted = completed.filter(t => 
      t.completed_at && 
      new Date(t.completed_at) > twoWeeksAgo && 
      new Date(t.completed_at) <= oneWeekAgo
    )

    const thisWeekOnTime = thisWeekCompleted.filter(t => 
      t.pkr?.completedOnTime === true
    )
    const lastWeekOnTime = lastWeekCompleted.filter(t => 
      t.pkr?.completedOnTime === true
    )

    const currentWeekPKR = thisWeekCompleted.length > 0
      ? (thisWeekOnTime.length / thisWeekCompleted.length) * 100
      : 0

    const lastWeekPKR = lastWeekCompleted.length > 0
      ? (lastWeekOnTime.length / lastWeekCompleted.length) * 100
      : 0

    const trend = currentWeekPKR > lastWeekPKR + 5 
      ? 'up' 
      : currentWeekPKR < lastWeekPKR - 5 
        ? 'down' 
        : 'stable'

    setMetrics({
      totalTasks: tasks.length,
      completedTasks: completed.length,
      onTimeTasks: onTime.length,
      lateTasks: late.length,
      overallPKR,
      currentWeekPKR,
      lastWeekPKR,
      trend
    })

    setLoading(false)
  }, [tasks])

  useEffect(() => {
    calculatePKRForTasks()
  }, [calculatePKRForTasks])

  const refreshPKR = useCallback(() => {
    setLoading(true)
    calculatePKRForTasks()
  }, [calculatePKRForTasks])

  return {
    tasksWithPKR,
    metrics,
    loading,
    refreshPKR
  }
}

export function useTaskPKR(task: TaskWithPKR | undefined) {
  const [pkr, setPKR] = useState<ReturnType<typeof calculateTaskPKR> | null>(null)

  useEffect(() => {
    if (!task) {
      setPKR(null)
      return
    }

    const calculated = calculateTaskPKR(task)
    setPKR(calculated)
  }, [task])

  return pkr
}
