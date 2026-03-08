"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X, Command, Clock, FileText, CheckSquare, Filter } from "lucide-react"

interface SearchResult {
  id: string
  title: string
  category: "task" | "campaign" | "document" | "phase" | "client"
  description?: string
  metadata?: string
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Mock data for search
  const mockSearchableContent: SearchResult[] = [
    { id: "1", title: "Review LinkedIn engagement metrics", category: "task", description: "Due today", metadata: "ABC Manufacturing" },
    { id: "2", title: "Finalize hero story copy", category: "task", description: "Due tomorrow", metadata: "TechStartup XYZ" },
    { id: "3", title: "LinkedIn Campaign Q1", category: "campaign", description: "Active campaign", metadata: "ABC Manufacturing" },
    { id: "4", title: "Email Campaign Performance Report", category: "document", description: "Last updated 2 days ago", metadata: "TechStartup XYZ" },
    { id: "5", title: "Story Research", category: "phase", description: "100% complete", metadata: "5 of 5 tasks done" },
    { id: "6", title: "ABC Manufacturing", category: "client", description: "Industrial equipment", metadata: "Active" },
    { id: "7", title: "Analyze competitor messaging", category: "task", description: "In progress", metadata: "ABC Manufacturing" },
    { id: "8", title: "Design mockups review", category: "task", description: "Awaiting review", metadata: "TechStartup XYZ" },
  ]

  // Filter results based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setResults([])
      return
    }

    const filtered = mockSearchableContent.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    setResults(filtered)
    setSelectedIndex(0)
  }, [searchQuery])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
          break
        case "Enter":
          e.preventDefault()
          if (results[selectedIndex]) {
            // Handle selection
            onClose()
          }
          break
        case "Escape":
          onClose()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        // Toggle search
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "task":
        return <CheckSquare className="w-4 h-4" />
      case "document":
        return <FileText className="w-4 h-4" />
      case "phase":
        return <Filter className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "task":
        return "bg-[#D1E3FF] text-[#007AFF]"
      case "campaign":
        return "bg-[#FEE4E2] text-[#FF3B30]"
      case "document":
        return "bg-[#E8F5E9] text-[#2E7D32]"
      case "phase":
        return "bg-[#F3E5AB] text-[#9E5610]"
      case "client":
        return "bg-[#F0E5FF] text-[#7C3AED]"
      default:
        return "bg-[#F3F3F6] text-[#86868B]"
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      {/* Search Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-50">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-[#E5E5E7]">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E5E7]">
            <Search className="w-5 h-5 text-[#86868B]" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, campaigns, documents, phases..."
              className="flex-1 bg-transparent outline-none text-[#1D1D1F] placeholder:text-[#86868B]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="divide-y divide-[#E5E5E7]">
                {results.map((result, idx) => (
                  <button
                    key={result.id}
                    onClick={() => onClose()}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                      idx === selectedIndex ? "bg-[#F8F9FB]" : "hover:bg-[#F8F9FB]"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${getCategoryColor(result.category)}`}>
                      {getCategoryIcon(result.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1D1D1F] truncate">{result.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {result.description && (
                          <span className="text-xs text-[#86868B]">{result.description}</span>
                        )}
                        {result.metadata && (
                          <span className="text-xs text-[#86868B] px-2 py-0.5 bg-[#F3F3F6] rounded">
                            {result.metadata}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-[#86868B]">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="px-4 py-8">
                <p className="text-xs text-[#86868B] uppercase tracking-wide mb-3">Recent Searches</p>
                <div className="space-y-2">
                  {["LinkedIn engagement", "Design review", "Campaign metrics"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setSearchQuery(item)}
                      className="w-full text-left text-sm text-[#1D1D1F] hover:text-[#007AFF] py-2 px-3 rounded hover:bg-[#F8F9FB] transition-colors flex items-center gap-2"
                    >
                      <Clock className="w-3 h-3 text-[#86868B]" />
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-[#F8F9FB] border-t border-[#E5E5E7] flex items-center justify-between text-xs text-[#86868B]">
            <div className="flex items-center gap-1">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>Enter Select</span>
              <span>Esc Close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
