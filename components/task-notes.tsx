"use client"

import { useState } from "react"
import { Lock, Globe, Edit2, Check, X } from "lucide-react"

interface Note {
  id: string
  type: "public" | "private"
  content: string
  author: string
  lastEditedAt: Date
}

interface TaskNotesProps {
  taskId: string
}

export function TaskNotes({ taskId }: TaskNotesProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      type: "public",
      content: "This analysis should focus on LinkedIn's algorithm changes in Q1 2026. Consider engagement metrics, reach patterns, and audience demographics.",
      author: "Sarah Chen",
      lastEditedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: "2",
      type: "private",
      content: "Client mentioned concerns about competitor analysis. Need to validate our methodology with them before publishing.",
      author: "Ravi Patel",
      lastEditedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [newNoteType, setNewNoteType] = useState<"public" | "private">("public")
  const [newNoteContent, setNewNoteContent] = useState("")

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        type: newNoteType,
        content: newNoteContent,
        author: "You",
        lastEditedAt: new Date(),
      }
      setNotes([newNote, ...notes])
      setNewNoteContent("")
      setNewNoteType("public")
    }
  }

  const handleEditNote = (id: string, content: string) => {
    setEditingId(id)
    setEditContent(content)
  }

  const handleSaveEdit = (id: string) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? { ...note, content: editContent, lastEditedAt: new Date() }
          : note
      )
    )
    setEditingId(null)
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
      <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Notes</h2>

      <div className="space-y-6">
        {/* Add Note */}
        <div className="pb-6 border-b border-[#E5E5E7]">
          <div className="mb-3">
            <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide">Note Type</label>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setNewNoteType("public")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  newNoteType === "public"
                    ? "bg-[#D1E3FF] text-[#007AFF] border border-[#007AFF]"
                    : "bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5E7]"
                }`}
              >
                <Globe className="w-3 h-3" />
                Public
              </button>
              <button
                onClick={() => setNewNoteType("private")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  newNoteType === "private"
                    ? "bg-[#FEE4E2] text-[#FF3B30] border border-[#FF3B30]"
                    : "bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5E7]"
                }`}
              >
                <Lock className="w-3 h-3" />
                Private
              </button>
            </div>
          </div>

          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder={`Add a ${newNoteType} note...`}
            className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent resize-none mb-3"
            rows={3}
          />

          <button
            onClick={handleAddNote}
            disabled={!newNoteContent.trim()}
            className="w-full px-4 py-2 bg-[#2E7D32] text-white rounded-lg text-sm font-medium hover:bg-[#1B5E20] transition-colors disabled:opacity-50"
          >
            Save Note
          </button>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="border border-[#E5E5E7] rounded-lg p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {note.type === "public" ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-[#D1E3FF] rounded text-xs text-[#007AFF] font-medium">
                      <Globe className="w-3 h-3" />
                      Public
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-[#FEE4E2] rounded text-xs text-[#FF3B30] font-medium">
                      <Lock className="w-3 h-3" />
                      Private
                    </div>
                  )}
                  <span className="text-xs text-[#86868B]">by {note.author}</span>
                  <span className="text-xs text-[#86868B]">{formatTime(note.lastEditedAt)}</span>
                </div>

                {editingId !== note.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditNote(note.id, note.content)}
                      className="text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                      title="Edit note"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-[#86868B] hover:text-[#FF3B30] transition-colors"
                      title="Delete note"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              {editingId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent resize-none mb-2"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      className="flex-1 px-3 py-1 bg-[#2E7D32] text-white rounded text-xs font-medium hover:bg-[#1B5E20] transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 px-3 py-1 bg-[#F5F5F7] text-[#1D1D1F] rounded text-xs font-medium hover:bg-[#E5E5E7] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#1D1D1F] whitespace-pre-wrap">{note.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
