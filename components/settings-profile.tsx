"use client"

import { useState } from "react"
import { User, Mail, Phone, MapPin, Building, Save, Camera, Edit2, X } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  title: string
  department: string
  location: string
  avatar: string
  bio: string
  joinDate: string
}

interface SettingsProfileProps {
  onSave?: (profile: UserProfile) => void
}

export function SettingsProfile({ onSave }: SettingsProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    id: "user-1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    phone: "+1 (555) 123-4567",
    title: "Creative Director",
    department: "Creative",
    location: "San Francisco, CA",
    avatar: "/placeholder.svg?height=120&width=120",
    bio: "Passionate about storytelling and brand narratives",
    joinDate: "2024-01-15",
  })

  const [editData, setEditData] = useState<UserProfile>(profile)

  const handleSave = () => {
    setProfile(editData)
    setIsEditing(false)
    onSave?.(editData)
  }

  const handleCancel = () => {
    setEditData(profile)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Profile Settings</h1>
        <p className="text-sm text-[#86868B]">Manage your personal information and preferences</p>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E5E7] p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={profile.avatar || "/placeholder.svg"}
                alt={profile.name}
                className="w-24 h-24 rounded-full border-4 border-[#2E7D32]"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center text-white hover:bg-[#1B5E20] transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full text-2xl font-bold text-[#1D1D1F] border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full text-sm text-[#86868B] border border-[#E5E5E7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-[#1D1D1F]">{profile.name}</h2>
                  <p className="text-sm text-[#86868B]">{profile.title}</p>
                </>
              )}
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5F5F7] hover:bg-[#EBEBED] transition-colors text-sm text-[#1D1D1F] font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] transition-colors text-sm text-white font-medium"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5F5F7] hover:bg-[#EBEBED] transition-colors text-sm text-[#1D1D1F] font-medium"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#515154]">
                  <Mail className="w-4 h-4 text-[#86868B]" />
                  {profile.email}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#515154]">
                  <Phone className="w-4 h-4 text-[#86868B]" />
                  {profile.phone}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Department</label>
              {isEditing ? (
                <select
                  value={editData.department}
                  onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
                >
                  <option>Creative</option>
                  <option>Strategy</option>
                  <option>Operations</option>
                  <option>Sales</option>
                </select>
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#515154]">
                  <Building className="w-4 h-4 text-[#86868B]" />
                  {profile.department}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#515154]">
                  <MapPin className="w-4 h-4 text-[#86868B]" />
                  {profile.location}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Bio</label>
            {isEditing ? (
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
              />
            ) : (
              <p className="text-sm text-[#515154]">{profile.bio}</p>
            )}
          </div>

          <div className="pt-4 border-t border-[#E5E5E7]">
            <p className="text-xs text-[#86868B]">
              Member since {new Date(profile.joinDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
