"use client"

import React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface ClientUser {
  id: string
  email: string
  full_name: string
}

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (clientData: { name: string; description: string; brandColor?: string; userId?: string }) => void
  clientUsers: ClientUser[]
}

export function AddClientModal({ isOpen, onClose, onSubmit, clientUsers }: AddClientModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brandColor: "#0071E3",
    userId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onSubmit({
        name: formData.name,
        description: formData.description,
        brandColor: formData.brandColor,
        userId: formData.userId || undefined,
      })
      setFormData({ name: "", description: "", brandColor: "#0071E3", userId: "" })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E7]">
          <h2 className="text-lg font-semibold text-[#1D1D1F]">Add New Client</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F5F5F7] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#86868B]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Client User (Optional)</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-3 py-2 border border-[#D1D1D6] rounded-lg focus:outline-none focus:border-[#0071E3] text-sm"
            >
              <option value="">Select a client user (optional)</option>
              {clientUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Client Organization</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., ABC Manufacturing Pvt Ltd"
              className="w-full px-3 py-2 border border-[#D1D1D6] rounded-lg focus:outline-none focus:border-[#0071E3] text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the client and their business"
              className="w-full px-3 py-2 border border-[#D1D1D6] rounded-lg focus:outline-none focus:border-[#0071E3] text-sm resize-none h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-2">Brand Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.brandColor}
                onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                className="w-12 h-10 border border-[#D1D1D6] rounded-lg cursor-pointer"
              />
              <span className="text-sm text-[#86868B]">{formData.brandColor}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#E5E5E7]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-[#D1D1D6] text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-[#0071E3] text-white hover:bg-[#0077ED] transition-colors text-sm font-medium"
            >
              Create Client
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
