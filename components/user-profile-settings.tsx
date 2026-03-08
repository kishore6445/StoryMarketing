"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Upload } from "lucide-react"
import useSWR from "swr"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  profile_photo_url: string | null
  display_name: string | null
  personal_motto: string | null
}

export function UserProfileSettings() {
  const [displayName, setDisplayName] = useState("")
  const [personalMotto, setPersonalMotto] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null

  const { data: profile, error: profileError } = useSWR(
    token ? "/api/user/profile" : null,
    async (url: string) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch profile")
      return res.json() as Promise<UserProfile>
    }
  )

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || profile.full_name || "")
      setPersonalMotto(profile.personal_motto || "")
      setPhotoUrl(profile.profile_photo_url || "")
    }
  }, [profile])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage("")

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          display_name: displayName,
          personal_motto: personalMotto,
          profile_photo_url: photoUrl,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save profile")
      }

      setMessage("Profile updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      setMessage("Error saving profile. Please try again.")
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (profileError) return <div className="text-red-600">Error loading profile</div>
  if (!profile) return <div className="text-[#86868B]">Loading profile...</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-[#1D1D1F] mb-6">Profile Settings</h2>
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your display name"
          className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-sm text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF]"
        />
        <p className="text-xs text-[#86868B] mt-1">This name will appear in the dashboard header</p>
      </div>

      {/* Personal Motto */}
      <div>
        <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">Personal Motto / Quote</label>
        <textarea
          value={personalMotto}
          onChange={(e) => setPersonalMotto(e.target.value)}
          placeholder="Your personal quote or motto"
          rows={3}
          className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-sm text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF] resize-none"
        />
        <p className="text-xs text-[#86868B] mt-1">Displayed under your name in the dashboard</p>
      </div>

      {/* Photo URL */}
      <div>
        <label className="block text-sm font-semibold text-[#1D1D1F] mb-2">Profile Photo URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="flex-1 px-3 py-2 border border-[#E5E5E7] rounded-lg text-sm text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF]"
          />
          <button
            onClick={() => copyToClipboard(photoUrl)}
            className="px-3 py-2 rounded-lg bg-[#F5F5F7] hover:bg-[#E5E5E7] transition-colors text-[#86868B]"
            title="Copy URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-[#86868B] mt-1">Your profile avatar image URL</p>
      </div>

      {/* Preview */}
      {photoUrl && (
        <div className="p-4 bg-[#F5F5F7] rounded-lg">
          <p className="text-xs font-semibold text-[#86868B] mb-2">Preview:</p>
          <img src={photoUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full px-4 py-2 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-[#0051D5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving..." : "Save Profile"}
      </button>

      {/* Message */}
      {message && (
        <div className={`text-sm p-3 rounded-lg ${
          message.includes("successfully") 
            ? "bg-emerald-50 text-emerald-700" 
            : "bg-red-50 text-red-700"
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}
