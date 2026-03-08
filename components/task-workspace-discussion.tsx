"use client"

import { useState, useEffect } from "react"
import { Send, AtSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  author: { id: string; name: string; avatar?: string }
  text: string
  createdAt: string
  mentions?: string[]
}

interface TeamMember {
  id: string
  full_name: string
  email: string
}

interface TaskWorkspaceDiscussionProps {
  taskId: string
}

export function TaskWorkspaceDiscussion({ taskId }: TaskWorkspaceDiscussionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([])
  const [mentionSearch, setMentionSearch] = useState("")

  // Load team members
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const token = localStorage.getItem("sessionToken")
        const response = await fetch("/api/users", {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          const users = Array.isArray(data.users) ? data.users : Array.isArray(data) ? data : []
          setTeamMembers(users)
          console.log("[v0] Team members loaded for mentions:", users)
        }
      } catch (error) {
        console.error("[v0] Error loading team members:", error)
      }
    }
    loadTeamMembers()
  }, [])

  // Load comments for this task
  useEffect(() => {
    const loadComments = async () => {
      try {
        const token = localStorage.getItem("sessionToken")
        const response = await fetch(`/api/tasks/${taskId}/comments`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Comments loaded:", data)
          setComments(data.map((c: any) => ({
            id: c.id,
            author: { id: c.created_by, name: c.author?.full_name || "Unknown", avatar: undefined },
            text: c.text,
            createdAt: c.created_at,
            mentions: c.mentions
          })))
        }
      } catch (error) {
        console.error("[v0] Error loading comments:", error)
      }
    }
    loadComments()
  }, [taskId])

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setNewComment(text)

    // Check if @ was typed and show mentions
    const lastAtIndex = text.lastIndexOf("@")
    if (lastAtIndex !== -1) {
      const searchText = text.substring(lastAtIndex + 1).toLowerCase()
      setMentionSearch(searchText)
      
      // Filter team members based on search
      const filtered = teamMembers.filter(member =>
        member.full_name.toLowerCase().includes(searchText) ||
        member.email.toLowerCase().includes(searchText)
      )
      setFilteredMembers(filtered)
      setShowMentions(filtered.length > 0)
    } else {
      setShowMentions(false)
      setFilteredMembers([])
    }
  }

  const handleMentionSelect = (member: TeamMember) => {
    const lastAtIndex = newComment.lastIndexOf("@")
    const beforeMention = newComment.substring(0, lastAtIndex)
    const newText = `${beforeMention}@${member.full_name} `
    setNewComment(newText)
    setShowMentions(false)
    setMentionSearch("")
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment })
      })

      if (response.ok) {
        const newCommentData = await response.json()
        console.log("[v0] Comment created:", newCommentData)
        setComments([...comments, {
          id: newCommentData.id,
          author: { id: newCommentData.created_by, name: newCommentData.author?.full_name || "Unknown" },
          text: newCommentData.text,
          createdAt: newCommentData.created_at
        }])
        setNewComment("")
      }
    } catch (error) {
      console.error("[v0] Error submitting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmitComment()
    }
  }

  return (
    <div className="space-y-6">
      {/* Comment Input - At Top */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="relative">
          <textarea
            value={newComment}
            onChange={handleCommentChange}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment... (@ to mention, Ctrl+Enter to submit)"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            rows={4}
          />
          
          {/* Mention Dropdown */}
          {showMentions && filteredMembers.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-full max-h-48 overflow-y-auto">
              <p className="px-3 py-2 text-xs text-gray-500 sticky top-0 bg-gray-50 border-b">Team members</p>
              <div>
                {filteredMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => handleMentionSelect(member)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 border-b last:border-b-0"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-semibold">
                        {member.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{member.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{member.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <AtSign className="w-3 h-3" />
            Type @ to mention team members
          </span>
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              newComment.trim() && !isSubmitting
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
            Post Comment
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-gray-900">Comments ({comments.length})</h3>
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            No comments yet. Start the conversation!
          </p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {comment.author.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-gray-900">{comment.author.name}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()} at{" "}
                    {new Date(comment.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
