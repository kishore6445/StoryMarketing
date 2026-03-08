'use client'

import { Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PKRCalculation } from '@/lib/types/pkr'

interface PKRIndicatorBadgeProps {
  pkr: PKRCalculation
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function PKRIndicatorBadge({ 
  pkr, 
  size = 'md', 
  showLabel = false,
  className 
}: PKRIndicatorBadgeProps) {
  const getStatusConfig = () => {
    switch (pkr.status) {
      case 'completed-on-time':
        return {
          icon: CheckCircle2,
          color: 'bg-green-500/10 text-green-700 border-green-500/20',
          label: 'On Time',
          iconColor: 'text-green-600'
        }
      case 'completed-late':
        return {
          icon: XCircle,
          color: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
          label: `Late ${pkr.daysLate ? `(${pkr.daysLate}d)` : ''}`,
          iconColor: 'text-orange-600'
        }
      case 'on-track':
        return {
          icon: Clock,
          color: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
          label: 'On Track',
          iconColor: 'text-blue-600'
        }
      case 'at-risk':
        return {
          icon: AlertTriangle,
          color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
          label: 'At Risk',
          iconColor: 'text-yellow-600'
        }
      case 'delayed':
        return {
          icon: XCircle,
          color: 'bg-red-500/10 text-red-700 border-red-500/20',
          label: 'Delayed',
          iconColor: 'text-red-600'
        }
      default:
        return {
          icon: Clock,
          color: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
          label: 'Unknown',
          iconColor: 'text-gray-600'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  }

  if (!showLabel) {
    return (
      <div 
        className={cn(
          'inline-flex items-center justify-center rounded-full border',
          config.color,
          sizeClasses[size],
          className
        )}
        title={config.label}
      >
        <Icon size={iconSizes[size]} className={config.iconColor} />
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <Icon size={iconSizes[size]} className={config.iconColor} />
      <span>{config.label}</span>
    </div>
  )
}

interface PKRScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PKRScoreBadge({ score, size = 'md', className }: PKRScoreBadgeProps) {
  const getScoreColor = () => {
    if (score >= 90) return 'bg-green-500/10 text-green-700 border-green-500/20'
    if (score >= 75) return 'bg-blue-500/10 text-blue-700 border-blue-500/20'
    if (score >= 60) return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
    if (score >= 50) return 'bg-orange-500/10 text-orange-700 border-orange-500/20'
    return 'bg-red-500/10 text-red-700 border-red-500/20'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  return (
    <div 
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-bold',
        getScoreColor(),
        sizeClasses[size],
        className
      )}
    >
      {score.toFixed(0)}%
    </div>
  )
}
