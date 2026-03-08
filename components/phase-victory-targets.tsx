"use client"

import { useState } from "react"
import useSWR from "swr"
import { TrendingUp } from "lucide-react"
import { PowerMovesKanban } from "./power-moves-kanban"

interface PowerMove {
  id?: string
  title: string
  assignedTo?: string
  dueDate?: string
  notes?: string
  attachmentUrl?: string
  attachmentName?: string
  status?: "todo" | "inProgress" | "inReview" | "done"
}



interface TeamMember {
  id: string
  full_name: string
  email: string
  role: string
}

interface VictoryTargetsProps {
  phaseName: string
  clientId?: string
  phaseId?: string
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem('sessionToken')
  const res = await fetch(url, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function PhaseVictoryTargets({ phaseName, clientId, phaseId: providedPhaseId }: VictoryTargetsProps) {
  // Fetch phase strategy
  const shouldFetch = clientId && clientId !== 'undefined'
  const { data, mutate } = useSWR(
    shouldFetch ? `/api/phase-strategy?phaseName=${phaseName}&clientId=${clientId}` : null, 
    fetcher,
    { revalidateOnFocus: false }
  )
  
  // Fetch team members
  const { data: teamData } = useSWR(
    '/api/team-members',
    fetcher,
    { revalidateOnFocus: false }
  )
  
  const phaseId = providedPhaseId || data?.phaseId
  const [isAddingMove, setIsAddingMove] = useState(false)
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)
  const [newMove, setNewMove] = useState<PowerMove>({
    title: '',
    assignedTo: '',
    dueDate: '',
    notes: '',
  })

  const strategy = data?.strategy
  const realPowerMoves = strategy?.power_moves || []
  const teamMembers = teamData?.users || []

  // Normalize power moves to handle both string and object formats
  const normalizedMoves = realPowerMoves.map((move: any) => 
    typeof move === 'string' ? { title: move } : move
  )

  const handleAddMove = async () => {
    if (!newMove.title.trim() || !phaseId) return

    const updatedMoves = [...realPowerMoves, newMove]
    
    // Optimistic update
    const optimisticData = {
      ...data,
      strategy: {
        ...strategy,
        power_moves: updatedMoves
      }
    }
    mutate(optimisticData, false)
    
    setNewMove({ title: '', assignedTo: '', dueDate: '', notes: '' })
    setIsAddingMove(false)

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/phase-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          clientId,
          phaseName,
          victoryTarget: strategy?.victory_target || "",
          powerMoves: updatedMoves,
        }),
      })

      if (!response.ok) {
        mutate()
      } else {
        mutate()
      }
    } catch (error) {
      mutate()
    }
  }

  const handleRemoveMove = async (index: number) => {
    if (!phaseId) return
    
    const updatedMoves = realPowerMoves.filter((_: any, i: number) => i !== index)
    
    // Optimistic update
    const optimisticData = {
      ...data,
      strategy: {
        ...strategy,
        power_moves: updatedMoves
      }
    }
    mutate(optimisticData, false)

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/phase-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          clientId,
          phaseName,
          victoryTarget: strategy?.victory_target || "",
          powerMoves: updatedMoves,
        }),
      })

      if (!response.ok) {
        mutate()
      } else {
        mutate()
      }
    } catch (error) {
      mutate()
    }
  }

  const handleStatusChange = async (updatedMove: PowerMove) => {
    if (!phaseId) return

    // Find the index and update the move
    const moveIndex = realPowerMoves.findIndex((m: any) => 
      typeof m === 'string' ? m === updatedMove.title : m.title === updatedMove.title
    )
    if (moveIndex === -1) return

    const updatedMoves = realPowerMoves.map((m: any, i: number) => {
      if (i === moveIndex) {
        return updatedMove
      }
      return m
    })

    // Optimistic update
    const optimisticData = {
      ...data,
      strategy: {
        ...strategy,
        power_moves: updatedMoves
      }
    }
    mutate(optimisticData, false)

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/phase-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          clientId,
          phaseName,
          victoryTarget: strategy?.victory_target || "",
          powerMoves: updatedMoves,
        }),
      })

      if (!response.ok) {
        mutate()
      } else {
        mutate()
      }
    } catch (error) {
      mutate()
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#F8F9FB] to-white rounded-xl border border-[#E5E5E7] p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6">
        {/* Power Moves in Kanban */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
              <h2 className="text-sm font-semibold text-[#1D1D1F] uppercase tracking-wide">Power Moves</h2>
            </div>
          </div>

          <PowerMovesKanban
            moves={realPowerMoves}
            onMoveRemove={handleRemoveMove}
            onMoveAdd={() => setIsAddingMove(true)}
            isAddingMove={isAddingMove}
            newMove={newMove}
            onNewMoveChange={(updatedMove) => {
              setNewMove(updatedMove)
            }}
            onAddMove={handleAddMove}
            onCancelAdd={() => {
              setIsAddingMove(false)
              setNewMove({ title: '', assignedTo: '', dueDate: '', notes: '' })
              setShowAssigneeDropdown(false)
            }}
            onStatusChange={handleStatusChange}
            teamMembers={teamMembers}
            showAssigneeDropdown={showAssigneeDropdown}
            onShowAssigneeDropdown={setShowAssigneeDropdown}
          />
        </div>
      </div>
    </div>
  )
}
