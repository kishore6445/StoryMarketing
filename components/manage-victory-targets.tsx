"use client"

import { useState, useEffect } from "react"
import { Target, Save, X, ChevronDown } from "lucide-react"

interface PhaseStrategy {
  id: string
  victory_target: string
  power_moves: string[]
}

interface ClientPhase {
  id: string
  phase_name: string
  phase_strategy: PhaseStrategy[]
}

interface Client {
  id: string
  name: string
  client_phases: ClientPhase[]
}

interface ManageVictoryTargetsProps {
  clients?: Array<{ id: string; name: string }>
}

const PHASE_NAMES = [
  'Story Research',
  'Story Writing',
  'Story Design',
  'Story Website',
  'Story Distribution',
  'Story Analytics',
  'Story Learning',
]

export function ManageVictoryTargets({ clients = [] }: ManageVictoryTargetsProps) {
  const [clientsData, setClientsData] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [editingPhaseKey, setEditingPhaseKey] = useState<string | null>(null)
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())
  const [editedTargets, setEditedTargets] = useState<Record<string, string>>({})
  const [editedMoves, setEditedMoves] = useState<Record<string, string[]>>({})

  useEffect(() => {
    fetchClientsData()
  }, [])

  const fetchClientsData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/phase-strategy', {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      })
      const data = await response.json()
      if (data.clients) {
        setClientsData(data.clients)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch clients data:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectedClientData = clientsData.find((c) => c.id === selectedClientId)

  const toggleExpanded = (phaseKey: string) => {
    const newSet = new Set(expandedPhases)
    newSet.has(phaseKey) ? newSet.delete(phaseKey) : newSet.add(phaseKey)
    setExpandedPhases(newSet)
  }

  const handleEditPhase = (phaseKey: string, currentTarget: string, currentMoves: string[]) => {
    setEditingPhaseKey(phaseKey)
    setEditedTargets({ [phaseKey]: currentTarget })
    setEditedMoves({ [phaseKey]: [...currentMoves] })
  }

  const handleSavePhase = async (phaseKey: string, phaseName: string) => {
    if (!selectedClientId) return

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/phase-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          clientId: selectedClientId,
          phaseName,
          victoryTarget: editedTargets[phaseKey] || '',
          powerMoves: editedMoves[phaseKey] || [],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to save victory target")
        return
      }

      await fetchClientsData()
      setEditingPhaseKey(null)
      setEditedTargets({})
      setEditedMoves({})
      alert("Victory target saved successfully!")
    } catch (error) {
      console.error("[v0] Failed to save victory target:", error)
      alert("Failed to save victory target")
    }
  }

  const handleCancelEdit = () => {
    setEditingPhaseKey(null)
    setEditedTargets({})
    setEditedMoves({})
  }

  const handleAddPowerMove = (phaseKey: string) => {
    const current = editedMoves[phaseKey] || []
    setEditedMoves({ [phaseKey]: [...current, ""] })
  }

  const handleUpdatePowerMove = (phaseKey: string, index: number, value: string) => {
    const current = editedMoves[phaseKey] || []
    const updated = [...current]
    updated[index] = value
    setEditedMoves({ [phaseKey]: updated })
  }

  const handleRemovePowerMove = (phaseKey: string, index: number) => {
    const current = editedMoves[phaseKey] || []
    const updated = current.filter((_, i) => i !== index)
    setEditedMoves({ [phaseKey]: updated })
  }

  // Get all 7 phases with their strategies for selected client
  const getClientPhases = () => {
    if (!selectedClientData) return []
    
    return PHASE_NAMES.map((phaseName) => {
      const existingPhase = selectedClientData.client_phases?.find(
        (p) => p.phase_name === phaseName
      )
      const strategy = existingPhase?.phase_strategy?.[0]
      
      return {
        name: phaseName,
        victoryTarget: strategy?.victory_target || '',
        powerMoves: strategy?.power_moves || [],
        key: `${selectedClientId}-${phaseName}`,
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight flex items-center gap-2">
          <Target className="w-8 h-8 text-[#2E7D32]" />
          Manage Victory Targets
        </h1>
        <p className="text-sm text-[#86868B]">Update victory targets and power moves for each department per client</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-[#E5E5E7] p-4">
            <h2 className="text-sm font-semibold text-[#1D1D1F] uppercase tracking-wider mb-3">Select Client</h2>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-sm text-[#86868B]">Loading clients...</p>
              </div>
            ) : clientsData.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-[#86868B]">No clients found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {clientsData.map((client) => {
                  const phaseCount = client.client_phases?.filter(
                    (p) => p.phase_strategy && p.phase_strategy.length > 0
                  ).length || 0
                  
                  return (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className={`w-full p-3 rounded-lg border transition-colors text-left ${
                        selectedClientId === client.id
                          ? "bg-[#D1FADF] border-[#2E7D32]"
                          : "bg-[#F8F9FB] border-[#E5E5E7] hover:border-[#86868B]"
                      }`}
                    >
                      <div className="font-medium text-[#1D1D1F]">{client.name}</div>
                      <div className="text-xs text-[#86868B] mt-1">
                        {phaseCount} of {PHASE_NAMES.length} phases configured
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Phase Victory Targets */}
        <div className="lg:col-span-2">
          {selectedClientData ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[#1D1D1F] uppercase tracking-wider">
                {selectedClientData.name} - Victory Targets
              </h2>

              {getClientPhases().map((phase) => {
                const phaseKey = phase.key
                const isEmpty = !phase.victoryTarget && phase.powerMoves.length === 0
                
                return (
                  <div key={phaseKey} className="bg-white rounded-lg border border-[#E5E5E7] overflow-hidden">
                    {/* Header */}
                    <button
                      onClick={() => toggleExpanded(phaseKey)}
                      className="w-full p-4 hover:bg-[#F8F9FB] transition-colors flex items-center justify-between"
                    >
                      <div className="text-left flex-1">
                        <h3 className="font-semibold text-[#1D1D1F]">{phase.name}</h3>
                        <p className="text-xs text-[#86868B] mt-1 line-clamp-1">
                          {phase.victoryTarget || 'No victory target set'}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-[#86868B] transition-transform ${
                          expandedPhases.has(phaseKey) ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Expanded Content */}
                    {expandedPhases.has(phaseKey) && (
                    <div className="border-t border-[#E5E5E7] p-4 bg-[#F8F9FB] space-y-4">
                      {editingPhaseKey === phaseKey ? (
                        <>
                          {/* Edit Mode */}
                          <div className="space-y-4">
                            <div>
                              <label className="text-xs font-medium text-[#1D1D1F] block mb-2">Victory Target</label>
                              <textarea
                                value={editedTargets[phaseKey] || ""}
                                onChange={(e) => setEditedTargets({ [phaseKey]: e.target.value })}
                                placeholder="Enter the victory target for this phase..."
                                className="w-full text-sm text-[#1D1D1F] placeholder:text-[#86868B] bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent resize-none"
                                rows={3}
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-[#1D1D1F]">Power Moves</label>
                                <button
                                  onClick={() => handleAddPowerMove(phaseKey)}
                                  className="text-xs text-[#007AFF] hover:underline"
                                >
                                  + Add Move
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(editedMoves[phaseKey] || []).map((move, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={move}
                                      onChange={(e) => handleUpdatePowerMove(phaseKey, index, e.target.value)}
                                      placeholder="Enter power move..."
                                      className="flex-1 text-sm text-[#1D1D1F] placeholder:text-[#86868B] bg-white border border-[#E5E5E7] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                                    />
                                    <button
                                      onClick={() => handleRemovePowerMove(phaseKey, index)}
                                      className="text-[#FF3B30] hover:bg-[#FFE5E5] p-1 rounded"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => handleSavePhase(phaseKey, phase.name)}
                                className="flex-1 px-4 py-2 bg-[#2E7D32] text-white text-sm rounded-lg hover:bg-[#1B5E20] transition-colors font-medium flex items-center justify-center gap-2"
                              >
                                <Save className="w-4 h-4" />
                                Save Changes
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex-1 px-4 py-2 bg-[#E5E5E7] text-[#1D1D1F] text-sm rounded-lg hover:bg-[#D1D1D6] transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* View Mode */}
                          {isEmpty ? (
                            <div className="text-center py-4">
                              <p className="text-sm text-[#86868B] mb-4">No victory target configured for this phase</p>
                              <button
                                onClick={() => handleEditPhase(phaseKey, '', [])}
                                className="w-full px-4 py-2 bg-[#007AFF] text-white text-sm rounded-lg hover:bg-[#0051D5] transition-colors font-medium"
                              >
                                Set Victory Target
                              </button>
                            </div>
                          ) : (
                            <>
                              <div>
                                <div className="text-xs font-medium text-[#86868B] mb-1">Victory Target</div>
                                <p className="text-sm text-[#1D1D1F]">{phase.victoryTarget}</p>
                              </div>

                              {phase.powerMoves.length > 0 && (
                                <div>
                                  <div className="text-xs font-medium text-[#86868B] mb-2">
                                    Power Moves ({phase.powerMoves.length})
                                  </div>
                                  <ul className="space-y-1">
                                    {phase.powerMoves.map((move, idx) => (
                                      <li key={idx} className="text-sm text-[#1D1D1F] flex items-start gap-2">
                                        <span className="text-[#2E7D32] mt-1">→</span>
                                        <span>{move}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <button
                                onClick={() => handleEditPhase(phaseKey, phase.victoryTarget, phase.powerMoves)}
                                className="w-full px-4 py-2 bg-[#007AFF] text-white text-sm rounded-lg hover:bg-[#0051D5] transition-colors font-medium"
                              >
                                Edit Victory Target
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          ) : (
            <div className="bg-[#F8F9FB] rounded-lg border border-[#E5E5E7] p-8 text-center">
              <p className="text-sm text-[#86868B]">Select a client to view and manage their victory targets</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
