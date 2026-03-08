"use client"

import { useState } from "react"
import { GripVertical, X, Plus, ChevronDown, User, FileText, Paperclip } from "lucide-react"

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

interface PowerMovesKanbanProps {
  moves: PowerMove[]
  onMoveRemove: (index: number) => Promise<void>
  onMoveAdd: () => void
  isAddingMove: boolean
  newMove: PowerMove
  onNewMoveChange: (move: PowerMove) => void
  onAddMove: () => Promise<void>
  onCancelAdd: () => void
  teamMembers: any[]
  showAssigneeDropdown?: boolean
  onShowAssigneeDropdown?: (show: boolean) => void
  onStatusChange?: (move: PowerMove) => Promise<void>
}

const STATUSES = [
  { id: "todo", label: "To Do", color: "#F5F5F7", borderColor: "#E5E5E7", textColor: "#86868B" },
  { id: "inProgress", label: "In Progress", color: "#E3F2FD", borderColor: "#2E7D32", textColor: "#1976D2" },
  { id: "inReview", label: "In Review", color: "#FFF3E0", borderColor: "#F57C00", textColor: "#F57C00" },
  { id: "done", label: "Done", color: "#E8F5E9", borderColor: "#388E3C", textColor: "#388E3C" },
]

export function PowerMovesKanban({
  moves,
  onMoveRemove,
  onMoveAdd,
  isAddingMove,
  newMove,
  onNewMoveChange,
  onAddMove,
  onCancelAdd,
  teamMembers,
  showAssigneeDropdown,
  onShowAssigneeDropdown,
  onStatusChange,
}: PowerMovesKanbanProps) {
  const [expandedMove, setExpandedMove] = useState<string | null>(null)
  const [draggedMove, setDraggedMove] = useState<{ index: number; status: string } | null>(null)

  // Normalize power moves to handle both string and object formats
  const normalizedMoves = moves.map((move: any) => 
    typeof move === 'string' ? { title: move, status: "todo" } : { ...move, status: move.status || "todo" }
  )

  // Group moves by status
  const movesByStatus = STATUSES.reduce((acc, status) => {
    acc[status.id] = normalizedMoves.filter(m => m.status === status.id)
    return acc
  }, {} as Record<string, PowerMove[]>)

  const handleDragStart = (index: number, status: string) => {
    setDraggedMove({ index, status })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetStatus: string) => {
    if (!draggedMove) return
    
    const move = movesByStatus[draggedMove.status][draggedMove.index]
    if (move && move.status !== targetStatus) {
      const updatedMove = { ...move, status: targetStatus as PowerMove["status"] }
      onStatusChange?.(updatedMove)
    }
    setDraggedMove(null)
  }

  return (
    <div className="space-y-4">
      {/* Kanban Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {STATUSES.map((status) => (
          <div
            key={status.id}
            className="rounded-lg border-2 p-4 min-h-96"
            style={{
              backgroundColor: status.color,
              borderColor: status.borderColor,
            }}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(status.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: status.textColor }}
              >
                {status.label}
              </h3>
              <span
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  backgroundColor: status.textColor,
                  color: "white",
                }}
              >
                {movesByStatus[status.id].length}
              </span>
            </div>

            {/* Add New Move Button - shows in To Do column */}
            {status.id === "todo" && !isAddingMove && (
              <button
                onClick={onMoveAdd}
                className="w-full mb-3 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border-2 border-dashed"
                style={{
                  borderColor: status.borderColor,
                  color: status.textColor,
                }}
              >
                <Plus className="w-4 h-4" />
                Add Move
              </button>
            )}

            {/* Column Moves */}
            <div className="space-y-3">
              {movesByStatus[status.id].map((move, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index, status.id)}
                  className="bg-white rounded-lg border border-[#E5E5E7] p-3 shadow-sm hover:shadow-md transition-shadow cursor-move group"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-[#86868B] flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1D1D1F]">{move.title}</p>
                      
                      {(move.dueDate || move.assignedTo || move.notes) && (
                        <button
                          onClick={() => setExpandedMove(expandedMove === `${status.id}-${index}` ? null : `${status.id}-${index}`)}
                          className="mt-2 text-xs text-[#2E7D32] hover:underline"
                        >
                          Details
                        </button>
                      )}

                      {expandedMove === `${status.id}-${index}` && (
                        <div className="mt-2 pt-2 border-t border-[#E5E5E7] space-y-2 text-xs">
                          {move.dueDate && (
                            <p className="text-[#86868B]">
                              Due: {new Date(move.dueDate).toLocaleDateString()}
                            </p>
                          )}
                          {move.assignedTo && (
                            <div className="flex items-center gap-1 text-[#1D1D1F]">
                              <User className="w-3 h-3" />
                              {move.assignedTo}
                            </div>
                          )}
                          {move.notes && (
                            <div className="flex items-start gap-1 text-[#1D1D1F]">
                              <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{move.notes}</span>
                            </div>
                          )}
                          {move.attachmentName && (
                            <div className="flex items-center gap-1 text-[#2E7D32]">
                              <Paperclip className="w-3 h-3" />
                              {move.attachmentName}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onMoveRemove(index)}
                      className="opacity-0 group-hover:opacity-100 text-[#86868B] hover:text-[#FF3B30] transition-all flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {movesByStatus[status.id].length === 0 && (
                <p className="text-xs text-[#86868B] text-center py-8 italic">No moves yet</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Move Form */}
      {isAddingMove && (
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-4 space-y-3 mt-4">
          <input
            type="text"
            value={newMove.title}
            onChange={(e) => onNewMoveChange({ ...newMove, title: e.target.value })}
            placeholder="Power move title"
            className="w-full text-sm text-[#1D1D1F] placeholder:text-[#86868B] bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
            autoFocus
          />

          <input
            type="date"
            value={newMove.dueDate || ''}
            onChange={(e) => onNewMoveChange({ ...newMove, dueDate: e.target.value })}
            className="w-full text-sm text-[#1D1D1F] bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
          />

          <div>
            <label className="text-xs text-[#86868B] font-medium mb-1 block">Assignee</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => onShowAssigneeDropdown?.(!showAssigneeDropdown)}
                className="w-full text-sm text-left text-[#1D1D1F] bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg px-3 py-2 flex items-center justify-between hover:border-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent transition-colors"
              >
                <span className={newMove.assignedTo ? 'text-[#1D1D1F]' : 'text-[#86868B]'}>
                  {newMove.assignedTo || 'Select team member'}
                </span>
                <ChevronDown className={`w-4 h-4 text-[#86868B] transition-transform ${showAssigneeDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showAssigneeDropdown && teamMembers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E5E7] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        onNewMoveChange({ ...newMove, assignedTo: member.full_name })
                        onShowAssigneeDropdown?.(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-[#1D1D1F] hover:bg-[#F8F9FB] transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{member.full_name}</p>
                        <p className="text-xs text-[#86868B]">{member.email}</p>
                      </div>
                      {newMove.assignedTo === member.full_name && (
                        <div className="w-2 h-2 bg-[#2E7D32] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <textarea
            value={newMove.notes || ''}
            onChange={(e) => onNewMoveChange({ ...newMove, notes: e.target.value })}
            placeholder="Add notes or paste a link"
            className="w-full text-sm text-[#1D1D1F] placeholder:text-[#86868B] bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
            rows={2}
          />

          <input
            type="file"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onNewMoveChange({
                  ...newMove,
                  attachmentName: e.target.files[0].name,
                  attachmentUrl: URL.createObjectURL(e.target.files[0])
                })
              }
            }}
            className="w-full text-sm text-[#1D1D1F] bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
          />
          {newMove.attachmentName && (
            <p className="text-xs text-[#2E7D32]">✓ {newMove.attachmentName}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onAddMove}
              className="flex-1 px-4 py-2 bg-[#2E7D32] text-white text-sm rounded-lg hover:bg-[#1B5E20] transition-colors font-medium"
            >
              Save
            </button>
            <button
              onClick={onCancelAdd}
              className="px-4 py-2 bg-[#F5F5F7] text-[#1D1D1F] text-sm rounded-lg hover:bg-[#E5E5E7] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
