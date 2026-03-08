"use client"

import { useState } from "react"
import { Send, X } from "lucide-react"

interface Comment {
  id: string
  author: string
  text: string
  timestamp: Date
}

interface TaskCommentsProps {
  taskId: string
  taskTitle: string
  initialComments?: Comment[]
  onAddComment?: (comment: Comment) => void
}

export function TaskComments({
  taskId,
  taskTitle,
  initialComments = [],
  onAddComment,
}: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: "You",
      text: newComment,
      timestamp: new Date(),
    }

    setComments([...comments, comment])
    setNewComment("")
    onAddComment?.(comment)
  }

  return (
    <div className="bg-[#F8F9FB] rounded-lg border border-[#E5E5E7] p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-3"
      >
        <h3 className="text-sm font-semibold text-[#1D1D1F]">
          Comments ({comments.length})
        </h3>
        {isExpanded ? (
          <X className="w-4 h-4 text-[#86868B]" />
        ) : (
          <span className="text-xs text-[#86868B]">Show</span>
        )}
      </button>

      {isExpanded && (
        <>
          {/* Existing Comments */}
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white p-3 rounded border border-[#E5E5E7]">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-medium text-[#1D1D1F]">{comment.author}</span>
                  <span className="text-xs text-[#86868B]">
                    {comment.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-[#515154]">{comment.text}</p>
              </div>
            ))}
          </div>

          {/* Add Comment Form */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleAddComment()
              }}
              className="flex-1 text-sm bg-white border border-[#E5E5E7] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="p-2 bg-[#007AFF] text-white rounded hover:bg-[#0056CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
