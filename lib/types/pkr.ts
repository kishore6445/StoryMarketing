export interface PKRCalculation {
  score: number
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed-on-time' | 'completed-late'
  timeUntilDue: number // milliseconds
  timeUntilPromised: number // milliseconds
  isOverdue: boolean
  isPastPromised: boolean
  completedOnTime: boolean | null
  daysLate?: number
}

export interface TaskWithPKR {
  id: string
  task_id?: string
  title: string
  description?: string
  status: string
  internal_status?: string
  external_status?: string
  due_date?: string
  due_time?: string
  promised_date?: string
  promised_time?: string
  completed_at?: string
  created_at: string
  updated_at: string
  client_id: string
  sprint_id?: string
  assigned_to?: string
  priority?: string
  phase?: string
  pkr?: PKRCalculation
}

export interface PKRMetrics {
  totalTasks: number
  completedTasks: number
  onTimeTasks: number
  lateTasks: number
  overallPKR: number
  currentWeekPKR: number
  lastWeekPKR: number
  trend: 'up' | 'down' | 'stable'
}

export interface UserPKRStats {
  userId: string
  userName: string
  totalTasks: number
  completedOnTime: number
  completedLate: number
  currentInProgress: number
  pkrScore: number
  averageDelayDays: number
}

export interface SprintPKRStats {
  sprintId: string
  sprintName: string
  totalTasks: number
  completedTasks: number
  onTimeTasks: number
  lateTasks: number
  pkrScore: number
  teamMembers: UserPKRStats[]
}
