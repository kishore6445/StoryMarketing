"use client"

import { useState, useEffect } from "react"
import { User, Search, Filter, Command, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useClient } from "@/contexts/client-context"
import { ClientSelector } from "./client-selector"
import { NotificationBell } from "./notification-bell"
import { GlobalSearch } from "./global-search"
import { FilterPanel } from "./filter-panel"
import { SaveFilterModal, SavedFiltersBar } from "./saved-filters"
import { StoryOPsLogo } from "./storyops-logo"
import type { FilterState } from "./filter-panel"

interface TopNavProps {
  unreadNotifications?: number
  hideClientSelector?: boolean
}

interface SavedFilter {
  id: string
  name: string
  filters: FilterState
  isFavorite: boolean
  createdAt: Date
}

export function TopNav({
  unreadNotifications = 1,
  hideClientSelector = false,
}: TopNavProps) {
  const { logout, user } = useAuth()
  const { selectedClientId, setSelectedClientId } = useClient()
  
  const userRole = user?.role || "user"
  const isClient = userRole === "client"
  const [clients, setClients] = useState<Array<{ id: string; name: string; brandColor?: string }>>([])
  const [showSearch, setShowSearch] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [showSaveFilter, setShowSaveFilter] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/clients', {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      })
      const data = await response.json()
      if (data.clients) {
        const activeClients = data.clients.filter((c: any) => c.is_active).map((c: any) => ({
          id: c.id,
          name: c.name,
          brandColor: c.brand_color,
        }))
        setClients(activeClients)
        if (activeClients.length > 0 && !selectedClientId) {
          setSelectedClientId(activeClients[0].id)
        }
      }
    } catch (error) {
      console.error("[v0] Failed to fetch clients:", error)
    }
  }

  const handleClientChange = (clientId: string) => {
    console.log("[v0] Client changed to:", clientId)
    setSelectedClientId(clientId)
  }
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
    {
      id: "1",
      name: "My Active Tasks",
      filters: { status: ["in-progress"], priority: [], assignee: ["sarah"], dueDate: [], category: [] },
      isFavorite: true,
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "High Priority",
      filters: { status: [], priority: ["high"], assignee: [], dueDate: [], category: [] },
      isFavorite: false,
      createdAt: new Date(),
    },
  ])

  const handleSaveFilter = (name: string, filters: FilterState) => {
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters,
      isFavorite: false,
      createdAt: new Date(),
    }
    setSavedFilters([newFilter, ...savedFilters])
  }

  const handleDeleteFilter = (id: string) => {
    setSavedFilters(savedFilters.filter((f) => f.id !== id))
  }

  const handleToggleFavorite = (id: string) => {
    setSavedFilters(
      savedFilters.map((f) =>
        f.id === id ? { ...f, isFavorite: !f.isFavorite } : f
      )
    )
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E5E7] z-50">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left: StoryOPs Logo */}
          <div className="scale-90 origin-left">
            <StoryOPsLogo />
          </div>

          {/* Center: Client Selector */}
          {!isClient && !hideClientSelector && (
            <>
              {clients.length > 0 ? (
                <ClientSelector
                  clients={clients}
                  selectedClientId={selectedClientId || ""}
                  onClientChange={handleClientChange}
                  onAddClient={() => {}}
                />
              ) : (
                <div className="text-sm text-[#86868B]">No clients yet</div>
              )}
            </>
          )}
          {isClient && (
            <div className="text-sm text-[#86868B]">Client Portal</div>
          )}

          {/* Right: Status & Profile */}
          <div className="flex items-center gap-4">
            {/* Journey Status */}
            <div className="px-3 py-1.5 rounded-full bg-[#F5F5F7] text-xs font-medium text-[#1D1D1F]">Day 23 of 180</div>

            {/* Search */}
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F5F5F7] hover:bg-[#EBEBED] transition-colors text-xs text-[#86868B]"
              title="Press Cmd+K to search"
            >
              <Search className="w-4 h-4" />
              <Command className="w-3 h-3" />
              K
            </button>

            {/* Filter */}
            <button
              onClick={() => setShowFilter(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F5F5F7] hover:bg-[#EBEBED] transition-colors text-xs text-[#86868B]"
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Health Indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#34C759]" />
            </div>

            {/* Notifications */}
            <NotificationBell unreadCount={unreadNotifications} />

            {/* Profile with dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full bg-[#E5E5E7] hover:bg-[#D1D1D6] transition-colors flex items-center justify-center"
              >
                <User className="w-4 h-4 text-[#1D1D1F]" />
              </button>
              
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E5E5E7] py-1 z-50">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        logout()
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#1D1D1F] hover:bg-[#F5F5F7] flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Saved Filters Bar */}
      <SavedFiltersBar
        savedFilters={savedFilters}
        onSelectFilter={(filter) => {
          // Apply selected filter
        }}
        onDeleteFilter={handleDeleteFilter}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Modals */}
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <FilterPanel
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onApplyFilters={(filters) => {
          setShowSaveFilter(true)
          // Apply filters
        }}
      />
      <SaveFilterModal
        isOpen={showSaveFilter}
        filters={{}}
        onClose={() => setShowSaveFilter(false)}
        onSave={handleSaveFilter}
      />
    </>
  )
}
