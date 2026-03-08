'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, AlertCircle } from 'lucide-react'

interface SprintIntegrityPanelProps {
  individualPKR: number
  clientPKR: number
  targetPKR: number
  tasksAtRisk: number
}

export function SprintIntegrityPanel({
  individualPKR,
  clientPKR,
  targetPKR,
  tasksAtRisk,
}: SprintIntegrityPanelProps) {
  const getStatus = (pkr: number, target: number) => {
    if (pkr >= target) return { label: 'Elite', color: 'text-emerald-600', bg: 'bg-emerald-50' }
    if (pkr >= target - 10) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' }
    return { label: 'At Risk', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const individualStatus = getStatus(individualPKR, targetPKR)
  const clientStatus = getStatus(clientPKR, targetPKR)

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Individual PKR */}
      <div className={cn('border border-[#E5E5E7] rounded-xl p-5', individualStatus.bg)}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#86868B]">Your PKR</span>
          <TrendingUp className={cn('w-4 h-4', individualStatus.color)} />
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className={cn('text-3xl font-bold', individualStatus.color)}>
            {individualPKR}%
          </span>
          <span className={cn('text-xs font-medium mb-1', individualStatus.color)}>
            {individualStatus.label}
          </span>
        </div>
        <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
          <div
            className={cn('h-full', individualStatus.color === 'text-emerald-600' ? 'bg-emerald-500' : individualStatus.color === 'text-blue-600' ? 'bg-blue-500' : 'bg-red-500')}
            style={{ width: `${Math.min(individualPKR, 100)}%` }}
          />
        </div>
      </div>

      {/* Client PKR */}
      <div className={cn('border border-[#E5E5E7] rounded-xl p-5', clientStatus.bg)}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#86868B]">Client PKR</span>
          <TrendingUp className={cn('w-4 h-4', clientStatus.color)} />
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className={cn('text-3xl font-bold', clientStatus.color)}>
            {clientPKR}%
          </span>
          <span className={cn('text-xs font-medium mb-1', clientStatus.color)}>
            {clientStatus.label}
          </span>
        </div>
        <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
          <div
            className={cn('h-full', clientStatus.color === 'text-emerald-600' ? 'bg-emerald-500' : clientStatus.color === 'text-blue-600' ? 'bg-blue-500' : 'bg-red-500')}
            style={{ width: `${Math.min(clientPKR, 100)}%` }}
          />
        </div>
      </div>

      {/* Tasks at Risk */}
      <div className={cn(
        'border border-[#E5E5E7] rounded-xl p-5',
        tasksAtRisk > 0 ? 'bg-red-50' : 'bg-emerald-50'
      )}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#86868B]">At Risk</span>
          {tasksAtRisk > 0 && <AlertCircle className="w-4 h-4 text-red-600" />}
        </div>
        <div className="flex items-end gap-2">
          <span className={cn(
            'text-3xl font-bold',
            tasksAtRisk > 0 ? 'text-red-600' : 'text-emerald-600'
          )}>
            {tasksAtRisk}
          </span>
          <span className="text-xs font-medium text-[#86868B] mb-1">
            {tasksAtRisk === 0 ? 'No concerns' : `task${tasksAtRisk !== 1 ? 's' : ''} need attention`}
          </span>
        </div>
      </div>
    </div>
  )
}
