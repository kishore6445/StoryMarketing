"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Trash2, Edit2, Mail, Shield } from "lucide-react"
import type { UserRole } from "@/lib/rbac"
import { getRoleLabel } from "@/lib/rbac"

interface User {
  id: string
  full_name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
  profile_photo_url?: string
  display_name?: string
  personal_motto?: string
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddUser, setShowAddUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState<string | null>(null)
  const [showPhaseAssignment, setShowPhaseAssignment] = useState<string | null>(null)
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
  const [phaseAssignments, setPhaseAssignments] = useState<Record<string, string[]>>({})
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as UserRole,
    clientName: "",
    clientDescription: "",
  })
  const [editFormData, setEditFormData] = useState({
    displayName: "",
    personalMotto: "",
    profilePhotoUrl: "",
  })

  // Fetch users and clients on mount
  useEffect(() => {
    fetchUsers()
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
        setClients(data.clients)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch clients:", error)
    }
  }

  const fetchPhaseAssignments = async (userId: string) => {
    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch(`/api/user-phase-assignments?userId=${userId}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      })
      const data = await response.json()
      if (data.assignments) {
        const assignmentMap: Record<string, string[]> = {}
        for (const assignment of data.assignments) {
          const key = `${assignment.client_id}-${assignment.phase_id}`
          assignmentMap[key] = [...(assignmentMap[key] || []), assignment.phase_id]
        }
        setPhaseAssignments(assignmentMap)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch phase assignments:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/users', {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      })
      const data = await response.json()
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch users:", error)
      alert("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill in all fields")
      return
    }

    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters")
      return
    }

    if (formData.role === "client" && !formData.clientName) {
      alert("Client organization name is required for client users")
      return
    }

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to create user")
        return
      }

      await fetchUsers()
      setFormData({ name: "", email: "", password: "", role: "user", clientName: "", clientDescription: "" })
      setShowAddUser(false)
      alert("User created successfully!")
    } catch (error) {
      console.error("[v0] Failed to create user:", error)
      alert("Failed to create user")
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to delete user")
        return
      }

      await fetchUsers()
      alert("User deleted successfully!")
    } catch (error) {
      console.error("[v0] Failed to delete user:", error)
      alert("Failed to delete user")
    }
  }

  const handleToggleActive = async (id: string) => {
    const user = users.find((u) => u.id === id)
    if (!user) return

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, isActive: !user.is_active }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to update user")
        return
      }

      await fetchUsers()
    } catch (error) {
      console.error("[v0] Failed to update user:", error)
      alert("Failed to update user")
    }
  }

  const handleEditUser = (user: User) => {
    setEditFormData({
      displayName: user.display_name || "",
      personalMotto: user.personal_motto || "",
      profilePhotoUrl: user.profile_photo_url || "",
    })
    setShowEditUser(user.id)
  }

  const handleSaveUserProfile = async () => {
    if (!showEditUser) return

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          display_name: editFormData.displayName,
          personal_motto: editFormData.personalMotto,
          profile_photo_url: editFormData.profilePhotoUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to update user profile")
        return
      }

      await fetchUsers()
      setShowEditUser(null)
      alert("User profile updated successfully!")
    } catch (error) {
      console.error("[v0] Failed to update user profile:", error)
      alert("Failed to update user profile")
    }
  }

  const handleAssignPhase = async (userId: string, clientId: string, phaseId: string) => {
    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/user-phase-assignments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId, clientId, phaseId }),
      })

      if (!response.ok) {
        throw new Error('Failed to assign phase')
      }

      // Refresh assignments
      await fetchPhaseAssignments(userId)
    } catch (error) {
      console.error("[v0] Failed to assign phase:", error)
      alert("Failed to assign phase")
    }
  }

  const handleUnassignPhase = async (userId: string, clientId: string, phaseId: string) => {
    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch(`/api/user-phase-assignments?userId=${userId}&clientId=${clientId}&phaseId=${phaseId}`, {
        method: 'DELETE',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      })

      if (!response.ok) {
        throw new Error('Failed to unassign phase')
      }

      // Refresh assignments
      await fetchPhaseAssignments(userId)
    } catch (error) {
      console.error("[v0] Failed to unassign phase:", error)
      alert("Failed to unassign phase")
    }
  }

  const getRoleColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      admin: "bg-[#FFEBEE] text-[#D32F2F]",
      manager: "bg-[#FFF3E0] text-[#E65100]",
      user: "bg-[#E3F2FD] text-[#0051C3]",
      client: "bg-[#E8F5E9] text-[#2E7D32]",
    }
    return colors[role]
  }

  const phases = [
    { id: "research", name: "Research" },
    { id: "design", name: "Design" },
    { id: "writing", name: "Writing" },
    { id: "website", name: "Website" },
    { id: "distribution", name: "Distribution" },
    { id: "analytics", name: "Analytics" },
    { id: "learning", name: "Learning" },
  ]

  // Force cache invalidation - rebuild required
  const __cacheVersion = Math.random().toString()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] flex items-center gap-2">
            <Users className="w-6 h-6" />
            User Management
          </h1>
          <p className="text-sm text-[#86868B] mt-1">Manage team members, admins, and clients</p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0051C3] transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Edit User Profile Modal */}
      {showEditUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Edit User Profile</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Display Name</label>
                <input
                  type="text"
                  placeholder="Enter display name (e.g., Ravi)"
                  value={editFormData.displayName}
                  onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Personal Motto/Quote</label>
                <textarea
                  placeholder="Enter your personal quote or motto"
                  value={editFormData.personalMotto}
                  onChange={(e) => setEditFormData({ ...editFormData, personalMotto: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Profile Photo URL</label>
                <input
                  type="text"
                  placeholder="Enter photo URL"
                  value={editFormData.profilePhotoUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, profilePhotoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditUser(null)}
                className="flex-1 px-4 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUserProfile}
                className="flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0051C3] transition-colors font-medium"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase Assignment Modal */}
      {showPhaseAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Assign Phases to User</h2>
            <p className="text-sm text-[#86868B] mb-6">
              Select which phases this user can access for each client. They will see power moves from only their assigned phases.
            </p>

            <div className="space-y-6">
              {clients.map((client) => (
                <div key={client.id} className="border border-[#E5E5E7] rounded-lg p-4">
                  <h3 className="font-medium text-[#1D1D1F] mb-3">{client.name}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {phases.map((phase) => {
                      const key = `${client.id}-${phase.id}`
                      const isAssigned = phaseAssignments[key]?.includes(phase.id)
                      
                      return (
                        <label
                          key={phase.id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-[#F5F5F7] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleAssignPhase(showPhaseAssignment, client.id, phase.id)
                              } else {
                                handleUnassignPhase(showPhaseAssignment, client.id, phase.id)
                              }
                            }}
                            className="w-4 h-4 text-[#007AFF] border-[#E5E5E7] rounded focus:ring-2 focus:ring-[#007AFF]"
                          />
                          <span className="text-sm text-[#1D1D1F]">{phase.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowPhaseAssignment(null)}
                className="px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0051C3] transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Add New User</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Enter user name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                >
                  <option value="user">Team Member</option>
                  {/* <option value="manager">Manager</option> */}
                  <option value="admin">Administrator</option>
                  <option value="client">Client</option>
                </select>
              </div>

              {/* Show client organization fields if role is client */}
              {formData.role === "client" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Client Organization Name</label>
                    <input
                      type="text"
                      placeholder="Enter client organization name"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#1D1D1F] block mb-1">Organization Description</label>
                    <textarea
                      placeholder="Enter organization description"
                      value={formData.clientDescription}
                      onChange={(e) => setFormData({ ...formData, clientDescription: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddUser(false)}
                className="flex-1 px-4 py-2 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0051C3] transition-colors font-medium"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[#86868B]">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E5E7] bg-[#F5F5F7]">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#1D1D1F]">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#1D1D1F]">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#1D1D1F]">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#1D1D1F]">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#1D1D1F]">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#1D1D1F]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E7]">
                {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#F5F5F7] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#1D1D1F]">{user.full_name || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#86868B]">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)} inline-block`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(user.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        user.is_active
                          ? "bg-[#E8F5E9] text-[#2E7D32]"
                          : "bg-[#F5F5F7] text-[#86868B]"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#86868B]">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {(user.role === "user" || user.role === "manager") && (
                        <button
                          onClick={() => {
                            setShowPhaseAssignment(user.id)
                            fetchPhaseAssignments(user.id)
                          }}
                          className="px-3 py-1 text-xs font-medium text-[#007AFF] hover:bg-[#E3F2FD] rounded-lg transition-colors"
                          title="Assign phases"
                        >
                          <Shield className="w-4 h-4 inline mr-1" />
                          Phases
                        </button>
                      )}
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-[#86868B] hover:bg-[#F5F5F7] rounded-lg transition-colors"
                        title="Edit user profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-[#86868B] hover:bg-[#FFEBEE] hover:text-[#D32F2F] rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E5E7] p-4">
          <p className="text-xs text-[#86868B] uppercase tracking-wide mb-2">Total Users</p>
          <p className="text-2xl font-bold text-[#1D1D1F]">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E7] p-4">
          <p className="text-xs text-[#86868B] uppercase tracking-wide mb-2">Admins</p>
          <p className="text-2xl font-bold text-[#D32F2F]">{users.filter((u) => u.role === "admin").length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E7] p-4">
          <p className="text-xs text-[#86868B] uppercase tracking-wide mb-2">Managers</p>
          <p className="text-2xl font-bold text-[#E65100]">{users.filter((u) => u.role === "manager").length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E7] p-4">
          <p className="text-xs text-[#86868B] uppercase tracking-wide mb-2">Clients</p>
          <p className="text-2xl font-bold text-[#2E7D32]">{users.filter((u) => u.role === "client").length}</p>
        </div>
      </div>
    </div>
  )
}
