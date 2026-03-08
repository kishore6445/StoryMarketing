"use client"

import { useState } from "react"
import { Send, Lock, Globe, Reply, Heart, MoreHorizontal, X } from "lucide-react"
import { JSX } from "react/jsx-runtime"; // Import JSX

interface Comment {
  id: string
  author: string
  avatar: string
  content: string
  type: "public" | "private"
  timestamp: Date
  isLiked: boolean
  replies: Comment[]
  mentions?: string[]
}

interface TaskCommentsProps {
  taskId: string
  taskTitle: string
}

export function TaskComments({ taskId, taskTitle }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "Sarah Chen",
      avatar: "SC",
      content: "I'll start with the LinkedIn analysis. @Ravi can you prepare the competitor research?",
      type: "public",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isLiked: true,
      replies: [
        {
          id: "1-1",
          author: "Ravi Patel",
          avatar: "RP",
          content: "@Sarah I've already compiled the top 5 competitors. Check the documents folder.",
          type: "public",
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          isLiked: false,
          replies: [],
          mentions: ["Sarah"],
        },
      ],
      mentions: ["Ravi"],
    },
    {
      id: "2",
      author: "Alex Rodriguez",
      avatar: "AR",
      content: "Make sure we align with the brand guidelines before publishing",
      type: "private",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isLiked: false,
      replies: [],
    },
  ])

  const [newComment, setNewComment] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")

  const teamMembers = [
    { id: "sarah", name: "Sarah Chen", avatar: "SC" },
    { id: "ravi", name: "Ravi Patel", avatar: "RP" },
    { id: "alex", name: "Alex Rodriguez", avatar: "AR" },
    { id: "jordan", name: "Jordan Smith", avatar: "JS" },
  ]

  const handlePostComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        author: "You",
        avatar: "YO",
        content: newComment,
        type: isPrivate ? "private" : "public",
        timestamp: new Date(),
        isLiked: false,
        replies: [],
      }

      if (replyingTo) {
        // Add as reply
        const updateReplies = (comments: Comment[]): Comment[] => {
          return comments.map((c) => {
            if (c.id === replyingTo) {
              return { ...c, replies: [...c.replies, newCommentObj] }
            }
            return { ...c, replies: updateReplies(c.replies) }
          })
        }
        setComments(updateReplies(comments))
        setReplyingTo(null)
      } else {
        setComments([newCommentObj, ...comments])
      }

      setNewComment("")
      setIsPrivate(false)
    }
  }

  const handleMention = (memberName: string) => {
    const atIndex = newComment.lastIndexOf("@")
    if (atIndex !== -1) {
      const before = newComment.substring(0, atIndex)
      const after = newComment.substring(newComment.indexOf(" ", atIndex) || newComment.length)
      setNewComment(before + "@" + memberName + after)
      setShowMentions(false)
      setMentionQuery("")
    }
  }

  const handleCommentChange = (text: string) => {
    setNewComment(text)
    if (text.includes("@")) {
      const atIndex = text.lastIndexOf("@")
      const afterAt = text.substring(atIndex + 1).split(" ")[0]
      setMentionQuery(afterAt)
      setShowMentions(true)
    } else {
      setShowMentions(false)
    }
  }

  const renderCommentThread = (comment: Comment, level = 0) => {
    return (
      <div key={comment.id}>
        {/* Comment */}
        <div className={`flex gap-3 ${level > 0 ? "ml-12 mt-3 pb-3 border-l-2 border-[#E5E5E7] pl-3" : "pb-4"}`}>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
            {comment.avatar}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#1D1D1F]">{comment.author}</span>
                <span className="text-xs text-[#86868B]">{formatTime(comment.timestamp)}</span>
                {comment.type === "private" && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-[#FEE4E2] rounded text-xs text-[#FF3B30]">
                    <Lock className="w-2.5 h-2.5" />
                    Private
                  </div>
                )}
              </div>
              <button className="text-[#86868B] hover:text-[#1D1D1F] transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Comment Text */}
            <p className="text-sm text-[#1D1D1F] mb-2 whitespace-pre-wrap">{renderMentions(comment.content)}</p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-xs text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
              <button className="flex items-center gap-1 text-xs text-[#86868B] hover:text-[#FF3B30] transition-colors">
                <Heart className="w-3 h-3" />
                {comment.isLiked ? "Liked" : "Like"}
              </button>
            </div>
          </div>
        </div>

        {/* Reply Input */}
        {replyingTo === comment.id && (
          <div className="ml-12 mt-3 pb-3 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
              YO
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => handleCommentChange(e.target.value)}
                placeholder="Reply to comment..."
                className="flex-1 text-sm bg-white border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
              <button
                onClick={handlePostComment}
                className="px-3 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0051C3] transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies.map((reply) => renderCommentThread(reply, level + 1))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
      <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Comments</h2>

      <div className="space-y-6">
        {/* Comment Input */}
        <div className="flex gap-3 pb-6 border-b border-[#E5E5E7]">
          <div className="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
            YO
          </div>

          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => handleCommentChange(e.target.value)}
              placeholder="Add a comment... (type @ to mention someone)"
              className="w-full text-sm bg-white border border-[#E5E5E7] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent resize-none"
              rows={3}
            />

            {/* Mentions Dropdown */}
            {showMentions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E5E7] rounded-lg shadow-lg z-10">
                {teamMembers
                  .filter((member) =>
                    member.name.toLowerCase().includes(mentionQuery.toLowerCase())
                  )
                  .map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleMention(member.name)}
                      className="w-full text-left px-4 py-2 text-sm text-[#1D1D1F] hover:bg-[#F8F9FB] transition-colors flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#007AFF] flex items-center justify-center text-xs text-white font-semibold">
                        {member.avatar}
                      </div>
                      {member.name}
                    </button>
                  ))}
              </div>
            )}

            {/* Options */}
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  isPrivate
                    ? "bg-[#FEE4E2] text-[#FF3B30]"
                    : "bg-[#D1E3FF] text-[#007AFF]"
                }`}
              >
                {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                {isPrivate ? "Private" : "Public"}
              </button>

              <button
                onClick={handlePostComment}
                className="px-4 py-1.5 bg-[#007AFF] text-white rounded-lg text-xs font-medium hover:bg-[#0051C3] transition-colors flex items-center gap-2"
              >
                <Send className="w-3 h-3" />
                Post
              </button>
            </div>
          </div>
        </div>

        {/* Comments Thread */}
        <div className="space-y-4">
          {comments.map((comment) => renderCommentThread(comment))}
        </div>
      </div>
    </div>
  )
}

function formatTime(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return date.toLocaleDateString()
}

function renderMentions(text: string): string | JSX.Element {
  const parts = text.split(/(@\w+)/g)
  return parts.map((part, idx) =>
    part.startsWith("@") ? (
      <span key={idx} className="text-[#007AFF] font-medium">
        {part}
      </span>
    ) : (
      part
    )
  )
}
