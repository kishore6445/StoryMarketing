"use client"

import { useState } from "react"
import { Save, Trash2, Star, X } from "lucide-react"
import { FilterState } from "@/components/filter-panel"

interface SavedFilter {
  id: string
  name: string
  filters: FilterState
  isFavorite: boolean
  createdAt: Date
}

interface SaveFilterModalProps {
  isOpen: boolean
  filters: FilterState
  onClose: () => void
  onSave: (name: string, filters: FilterState) => void
}

export function SaveFilterModal({ isOpen, filters, onClose, onSave }: SaveFilterModalProps) {
  const [filterName, setFilterName] = useState("")

  const handleSave = () => {
    if (filterName.trim()) {
      onSave(filterName, filters)
      setFilterName("")
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 bg-white rounded-xl shadow-2xl border border-[#E5E5E7]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1D1D1F]">Save Filter</h2>
            <button onClick={onClose} className="text-[#86868B] hover:text-[#1D1D1F]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            autoFocus
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Filter name (e.g., My Active Tasks)"
            className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent mb-4"
            onKeyPress={(e) => e.key === "Enter" && handleSave()}
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-[#1D1D1F] bg-[#F5F5F7] rounded-lg hover:bg-[#E5E5E7] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!filterName.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#2E7D32] rounded-lg hover:bg-[#1B5E20] transition-colors disabled:opacity-50"
            >
              Save Filter
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

interface SavedFiltersBarProps {
  savedFilters: SavedFilter[]
  onSelectFilter: (filter: SavedFilter) => void
  onDeleteFilter: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function SavedFiltersBar({ savedFilters, onSelectFilter, onDeleteFilter, onToggleFavorite }: SavedFiltersBarProps) {
  const [showMenu, setShowMenu] = useState<string | null>(null)

  if (savedFilters.length === 0) return null

  const favoriteFilters = savedFilters.filter((f) => f.isFavorite).slice(0, 3)
  const recentFilters = savedFilters.slice(0, 5)

  return (
    <div className="bg-white border-b border-[#E5E5E7] px-6 py-3">
      <p className="text-xs font-medium text-[#86868B] uppercase tracking-wide mb-2">Saved Filters</p>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {(favoriteFilters.length > 0 ? favoriteFilters : recentFilters).map((filter) => (
          <div key={filter.id} className="relative">
            <button
              onClick={() => onSelectFilter(filter)}
              className="whitespace-nowrap px-3 py-1.5 bg-[#F8F9FB] border border-[#E5E5E7] rounded-full text-xs font-medium text-[#1D1D1F] hover:border-[#007AFF] transition-colors flex items-center gap-2"
            >
              {filter.isFavorite && <Star className="w-3 h-3 text-[#FFB547] fill-[#FFB547]" />}
              {filter.name}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(showMenu === filter.id ? null : filter.id)
                }}
                className="text-[#86868B] hover:text-[#1D1D1F]"
              >
                ×
              </button>
            </button>

            {showMenu === filter.id && (
              <div className="absolute top-full mt-1 right-0 bg-white border border-[#E5E5E7] rounded-lg shadow-lg z-10 min-w-max">
                <button
                  onClick={() => {
                    onToggleFavorite(filter.id)
                    setShowMenu(null)
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#1D1D1F] hover:bg-[#F8F9FB] transition-colors flex items-center gap-2"
                >
                  <Star className="w-3 h-3" />
                  {filter.isFavorite ? "Remove from favorites" : "Add to favorites"}
                </button>
                <button
                  onClick={() => {
                    onDeleteFilter(filter.id)
                    setShowMenu(null)
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#FF3B30] hover:bg-[#FEE4E2] transition-colors flex items-center gap-2 border-t border-[#E5E5E7]"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
