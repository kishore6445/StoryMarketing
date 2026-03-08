/**
 * PKR (Promises Kept Ratio) Calculator
 * Calculates internal and external PKR metrics for tasks
 */

export interface Task {
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  due_date?: string
  due_time?: string
  promised_date?: string
  promised_time?: string
  completed_at?: string
  internal_status?: string
  external_status?: string
  assigned_to?: string
  client_id?: string
}

export interface PKRMetrics {
  pkr: number // Percentage 0-100
  total: number
  completed?: number
  onTime: number
  late: number
  overdue: number
  overdueToClient?: number
  riskLevel?: 'low' | 'warning' | 'critical'
}

export interface ComprehensivePKR {
  internal: PKRMetrics
  external: PKRMetrics
  commitmentQuality: number
  bufferAnalysis: {
    averageBufferHours: number
    largestBufferDays: number
  }
}

/**
 * Combine date and time into a single Date object
 */
export function combineDateTime(date: string | null | undefined, time: string | null | undefined): Date | null {
  if (!date) return null
  
  const baseDate = new Date(date)
  
  if (time) {
    const [hours, minutes] = time.split(':').map(Number)
    baseDate.setHours(hours, minutes, 0, 0)
  } else {
    // Default to 5 PM for due dates, 9 AM for promised dates
    baseDate.setHours(17, 0, 0, 0)
  }
  
  return baseDate
}

/**
 * Calculate Internal PKR (Team Commitment Performance)
 * Measures how well the team meets internal deadlines
 */
export function calculateInternalPKR(tasks: Task[], userId?: string): PKRMetrics {
  // Filter by user if provided
  let filteredTasks = tasks
  if (userId) {
    filteredTasks = tasks.filter(t => t.assigned_to === userId)
  }
  
  // Only consider tasks with internal deadlines
  const tasksWithDeadlines = filteredTasks.filter(t => t.due_date)
  
  if (tasksWithDeadlines.length === 0) {
    return {
      pkr: 100,
      total: 0,
      onTime: 0,
      late: 0,
      overdue: 0,
      riskLevel: 'low'
    }
  }
  
  const now = new Date()
  let onTimeCount = 0
  let lateCount = 0
  let overdueCount = 0
  
  tasksWithDeadlines.forEach(task => {
    const dueDateTime = combineDateTime(task.due_date, task.due_time)
    
    if (!dueDateTime) return
    
    if (task.status === 'done') {
      // Task is completed - check if it was on time
      const completedAt = task.completed_at ? new Date(task.completed_at) : now
      
      if (completedAt <= dueDateTime) {
        onTimeCount++
      } else {
        lateCount++
      }
    } else {
      // Task is not completed - check if it's overdue
      if (now > dueDateTime) {
        overdueCount++
      }
    }
  })
  
  const totalCompleted = onTimeCount + lateCount
  const pkr = tasksWithDeadlines.length > 0 
    ? (onTimeCount / tasksWithDeadlines.length) * 100 
    : 100
  
  let riskLevel: 'low' | 'warning' | 'critical' = 'low'
  if (pkr < 70 || overdueCount > 2) riskLevel = 'critical'
  else if (pkr < 80 || overdueCount > 0) riskLevel = 'warning'
  
  return {
    pkr: Math.round(pkr * 10) / 10,
    total: tasksWithDeadlines.length,
    completed: totalCompleted,
    onTime: onTimeCount,
    late: lateCount,
    overdue: overdueCount,
    riskLevel
  }
}

/**
 * Calculate External PKR (Client-Facing Performance)
 * Measures how well promises to clients are kept
 */
export function calculateExternalPKR(tasks: Task[], userId?: string): PKRMetrics {
  // Filter by user if provided
  let filteredTasks = tasks
  if (userId) {
    filteredTasks = tasks.filter(t => t.assigned_to === userId)
  }
  
  // Only consider tasks with client promises
  const tasksWithPromises = filteredTasks.filter(t => t.promised_date)
  
  if (tasksWithPromises.length === 0) {
    return {
      pkr: 100,
      total: 0,
      onTime: 0,
      late: 0,
      overdue: 0,
      overdueToClient: 0,
      riskLevel: 'low'
    }
  }
  
  const now = new Date()
  let onTimeCount = 0
  let lateCount = 0
  let overdueToClientCount = 0
  
  tasksWithPromises.forEach(task => {
    const promisedDateTime = combineDateTime(task.promised_date, task.promised_time)
    
    if (!promisedDateTime) return
    
    if (task.status === 'done') {
      // Task is completed - check if delivered on time
      const completedAt = task.completed_at ? new Date(task.completed_at) : now
      
      if (completedAt <= promisedDateTime) {
        onTimeCount++
      } else {
        lateCount++
      }
    } else {
      // Task is not completed - check if promise is broken
      if (now > promisedDateTime) {
        overdueToClientCount++
      }
    }
  })
  
  const pkr = tasksWithPromises.length > 0 
    ? (onTimeCount / tasksWithPromises.length) * 100 
    : 100
  
  let riskLevel: 'low' | 'warning' | 'critical' = 'low'
  if (overdueToClientCount > 0) riskLevel = 'critical'
  else if (pkr < 90 || lateCount > 0) riskLevel = 'warning'
  
  return {
    pkr: Math.round(pkr * 10) / 10,
    total: tasksWithPromises.length,
    onTime: onTimeCount,
    late: lateCount,
    overdue: 0,
    overdueToClient: overdueToClientCount,
    riskLevel
  }
}

/**
 * Calculate Commitment Quality Score
 * Measures how many completed tasks met internal deadlines
 */
export function calculateCommitmentQuality(tasks: Task[], userId?: string): number {
  // Filter by user if provided
  let filteredTasks = tasks
  if (userId) {
    filteredTasks = tasks.filter(t => t.assigned_to === userId)
  }
  
  const completedTasks = filteredTasks.filter(t => t.status === 'done' && t.due_date)
  
  if (completedTasks.length === 0) return 100 // No tasks completed yet
  
  const onTimeCount = completedTasks.filter(task => {
    const dueDateTime = combineDateTime(task.due_date, task.due_time)
    if (!dueDateTime) return false
    
    const completedAt = task.completed_at ? new Date(task.completed_at) : new Date()
    return completedAt <= dueDateTime
  }).length
  
  return Math.round((onTimeCount / completedTasks.length) * 100 * 10) / 10
}

/**
 * Calculate buffer time between internal due date and external promised date
 */
export function calculateBufferAnalysis(tasks: Task[]): {
  averageBufferHours: number
  largestBufferDays: number
} {
  const tasksWithBothDates = tasks.filter(t => t.due_date && t.promised_date)
  
  if (tasksWithBothDates.length === 0) {
    return { averageBufferHours: 0, largestBufferDays: 0 }
  }
  
  let totalBufferHours = 0
  let largestBufferDays = 0
  
  tasksWithBothDates.forEach(task => {
    const dueDateTime = combineDateTime(task.due_date, task.due_time)
    const promisedDateTime = combineDateTime(task.promised_date, task.promised_time)
    
    if (!dueDateTime || !promisedDateTime) return
    
    const bufferMs = promisedDateTime.getTime() - dueDateTime.getTime()
    const bufferHours = bufferMs / (1000 * 60 * 60)
    const bufferDays = bufferHours / 24
    
    totalBufferHours += bufferHours
    largestBufferDays = Math.max(largestBufferDays, bufferDays)
  })
  
  const averageBufferHours = totalBufferHours / tasksWithBothDates.length
  
  return {
    averageBufferHours: Math.round(averageBufferHours * 10) / 10,
    largestBufferDays: Math.round(largestBufferDays * 10) / 10
  }
}

/**
 * Calculate comprehensive PKR metrics
 */
export function calculateComprehensivePKR(tasks: Task[], userId?: string): ComprehensivePKR {
  return {
    internal: calculateInternalPKR(tasks, userId),
    external: calculateExternalPKR(tasks, userId),
    commitmentQuality: calculateCommitmentQuality(tasks, userId),
    bufferAnalysis: calculateBufferAnalysis(tasks)
  }
}

/**
 * Calculate PKR for a single task
 */
export function calculateTaskPKR(task: Task): {
  score: number
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed-on-time' | 'completed-late'
  timeUntilDue: number
  timeUntilPromised: number
  isOverdue: boolean
  isPastPromised: boolean
  completedOnTime: boolean | null
  daysLate?: number
} {
  const now = new Date()
  const dueDateTime = combineDateTime(task.due_date, task.due_time)
  const promisedDateTime = combineDateTime(task.promised_date, task.promised_time)
  
  const timeUntilDue = dueDateTime ? dueDateTime.getTime() - now.getTime() : Infinity
  const timeUntilPromised = promisedDateTime ? promisedDateTime.getTime() - now.getTime() : Infinity
  
  const isOverdue = timeUntilDue < 0
  const isPastPromised = timeUntilPromised < 0
  
  // For completed tasks
  if (task.status === 'done' || task.status === 'completed') {
    const completedAt = task.completed_at ? new Date(task.completed_at) : now
    const deadline = promisedDateTime || dueDateTime
    
    if (!deadline) {
      return {
        score: 100,
        status: 'completed-on-time',
        timeUntilDue,
        timeUntilPromised,
        isOverdue: false,
        isPastPromised: false,
        completedOnTime: true
      }
    }
    
    const completedOnTime = completedAt <= deadline
    const msLate = completedAt.getTime() - deadline.getTime()
    const daysLate = msLate > 0 ? Math.ceil(msLate / (1000 * 60 * 60 * 24)) : 0
    
    return {
      score: completedOnTime ? 100 : 0,
      status: completedOnTime ? 'completed-on-time' : 'completed-late',
      timeUntilDue,
      timeUntilPromised,
      isOverdue: false,
      isPastPromised: false,
      completedOnTime,
      daysLate: daysLate > 0 ? daysLate : undefined
    }
  }
  
  // For in-progress tasks
  const relevantDeadline = promisedDateTime || dueDateTime
  
  if (!relevantDeadline) {
    return {
      score: 100,
      status: 'on-track',
      timeUntilDue,
      timeUntilPromised,
      isOverdue: false,
      isPastPromised: false,
      completedOnTime: null
    }
  }
  
  const timeUntilDeadline = relevantDeadline.getTime() - now.getTime()
  const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60)
  
  // Determine status
  let status: 'on-track' | 'at-risk' | 'delayed'
  if (timeUntilDeadline < 0) {
    status = 'delayed'
  } else if (hoursUntilDeadline < 24) {
    status = 'at-risk'
  } else {
    status = 'on-track'
  }
  
  // Calculate score (100 = on track, decreases as deadline approaches)
  const score = Math.min(100, Math.max(0, hoursUntilDeadline * 4))
  
  return {
    score: Math.round(score * 10) / 10,
    status,
    timeUntilDue,
    timeUntilPromised,
    isOverdue,
    isPastPromised,
    completedOnTime: null
  }
}

/**
 * Get PKR badge/status based on score
 */
export function getPKRBadge(pkr: number): {
  label: string
  color: string
  level: 'elite' | 'good' | 'warning' | 'critical'
} {
  if (pkr >= 90) {
    return { label: 'ELITE', color: 'green', level: 'elite' }
  } else if (pkr >= 80) {
    return { label: 'GOOD', color: 'blue', level: 'good' }
  } else if (pkr >= 70) {
    return { label: 'WARNING', color: 'yellow', level: 'warning' }
  } else {
    return { label: 'AT RISK', color: 'red', level: 'critical' }
  }
}

/**
 * Format hours into human-readable string
 */
export function formatBufferTime(hours: number): string {
  if (hours < 24) {
    return `${Math.round(hours)} hours`
  } else {
    const days = Math.floor(hours / 24)
    const remainingHours = Math.round(hours % 24)
    if (remainingHours === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`
    }
    return `${days}d ${remainingHours}h`
  }
}
