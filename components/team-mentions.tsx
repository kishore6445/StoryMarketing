"use client"

import { useState } from "react"
import { AtSign, Search, X } from "lucide-react"

const teamMembers = ["Ravi", "Soujanya", "Alex", "Sarah", "Jordan"]

interface TeamMentionsProps {
  onMention?: (member: string) => void
  placeholder?: string
}

export function TeamMentions({ onMention, placeholder = "Type @ to mention..." }: TeamMentionsProps) {
  const [input, setInput] = useState("")
  const [showMentions, setShowMentions] = useState(false)
  const [mentions, setMentions] = useState<string[]>([])

  const handleInputChange = (e: string) => {
    setInput(e)
    if (e.includes("@")) {
      setShowMentions(true)
    } else {
      setShowMentions(false)
    }
  }

  const handleMention = (member: string) => {
    const mentionText = `@${member}`
    setMentions([...mentions, mentionText])
    setInput("")
    setShowMentions(false)
    onMention?.(member)
  }

  const removeMention = (idx: number) => {
    setMentions(mentions.filter((_, i) => i !== idx))
  }

  const filteredMembers = teamMembers.filter((member) =>
    member.toLowerCase().includes(input.replace("@", "").toLowerCase())
  )

  return (
    <div className="space-y-3">
      {/* Input */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-white border border-[#E5E5E7] rounded-lg px-3 py-2">
          <AtSign className="w-4 h-4 text-[#86868B]" />
          <input
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            className="flex-1 text-sm outline-none"
          />
        </div>

        {/* Mention Dropdown */}
        {showMentions && filteredMembers.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E5E7] rounded-lg shadow-lg z-10">
            {filteredMembers.map((member) => (
              <button
                key={member}
                onClick={() => handleMention(member)}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#F5F5F7] text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="w-6 h-6 rounded-full bg-[#007AFF] flex items-center justify-center text-white text-xs font-semibold">
                  {member[0]}
                </div>
                <span className="text-[#1D1D1F]">{member}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Mentions */}
      {mentions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mentions.map((mention, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1 bg-[#007AFF]/10 text-[#007AFF] px-3 py-1 rounded-full text-sm font-medium"
            >
              {mention}
              <button
                onClick={() => removeMention(idx)}
                className="ml-1 hover:text-[#0056CC]"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
