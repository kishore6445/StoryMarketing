// Real-time progress synchronization utilities
// When database is added, replace these with actual database subscriptions

interface ProgressUpdate {
  phaseId: string
  completedTasks: number
  totalTasks: number
  timestamp: string
}

// Mock websocket-like functionality for real-time updates
// TODO: Replace with actual WebSocket or database subscription (Supabase realtime, etc)
export function subscribeToProgressUpdates(
  clientId: string,
  onUpdate: (updates: ProgressUpdate[]) => void
) {
  // Simulate real-time updates
  const interval = setInterval(() => {
    // In production: Listen to database changes via WebSocket
    console.log("[v0] Simulated progress update check")
  }, 5000)

  return () => clearInterval(interval)
}

// Calculate phase progress based on completed tasks
export function calculatePhaseProgress(completedTasks: number, totalTasks: number): number {
  if (totalTasks === 0) return 0
  return Math.round((completedTasks / totalTasks) * 100)
}

// Get phase status based on progress
export function getPhaseStatus(progress: number): "not_started" | "in_progress" | "completed" {
  if (progress === 100) return "completed"
  if (progress > 0) return "in_progress"
  return "not_started"
}

// Calculate overall journey progress
export function calculateJourneyProgress(phases: Array<{ totalTasks: number; completedTasks: number }>) {
  const totalCompleted = phases.reduce((sum, p) => sum + p.completedTasks, 0)
  const totalTasks = phases.reduce((sum, p) => sum + p.totalTasks, 0)
  return totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0
}

// Format progress for display
export function formatPhaseProgress(phase: {
  name: string
  completedTasks: number
  totalTasks: number
}): string {
  return `${phase.name}: ${phase.completedTasks}/${phase.totalTasks} completed`
}

// Detect if phase is blocked (previous phase not completed)
export function isPhaseBlocked(phaseIndex: number, phases: Array<{ progress: number }>): boolean {
  if (phaseIndex === 0) return false
  return phases[phaseIndex - 1].progress < 100
}

// Get estimated completion date
export function estimateCompletionDate(
  currentProgress: number,
  dailyProgressRate: number = 5 // 5% per day default
): Date {
  if (currentProgress >= 100) return new Date()

  const remainingProgress = 100 - currentProgress
  const daysRemaining = Math.ceil(remainingProgress / dailyProgressRate)
  const completionDate = new Date()
  completionDate.setDate(completionDate.getDate() + daysRemaining)

  return completionDate
}

// Get phase milestones
export function getPhaseMillestones(phase: {
  name: string
  totalTasks: number
}): Array<{ percentage: number; label: string }> {
  const taskInterval = Math.ceil(phase.totalTasks / 4)
  return [
    { percentage: 25, label: "25% - Initial work" },
    { percentage: 50, label: "50% - Halfway there" },
    { percentage: 75, label: "75% - Almost done" },
    { percentage: 100, label: "100% - Complete" },
  ]
}
