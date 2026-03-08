"use client"

import { useState } from "react"
import { Users, Mail, Plus, Trash2, Edit2, Shield, User, CheckCircle2, Clock, X } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "member"
  department: string
  joinDate: string
  status: "active" | "inactive"
}

interface AddMemberForm {
  name: string
  email: string
  role: "admin" | "manager" | "member"
  department: string
}

export function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Sarah Chen",
      email: "sarah@example.com",
      role: "admin",
      department: "Creative",
      joinDate: "2024-01-15",
      status: "active",
    },
    {
      id: "2",
      name: "Alex Rodriguez",
      email: "alex@example.com",
      role: "manager",
      department: "Strategy",
      joinDate: "2024-02-01",
      status: "active",
    },
    {
      id: "3",
      name: "Jordan Taylor",
      email: "jordan@example.com",
      role: "member",
      department: "Creative",
      joinDate: "2024-03-10",
      status: "active",
    },
    {
      id: "4",
      name: "Sam Kim",
      email: "sam@example.com",
      role: "member",
      department: "Operations",
      joinDate: "2024-03-20",
      status: "inactive",
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newMember, setNewMember] = useState<AddMemberForm>({
    name: "",
    email: "",
    role: "member",
    department: "Creative",
  })

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) return

    const member: TeamMember = {
      id: Date.now().toString(),
      ...newMember,
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
    }

    setMembers([...members, member])
    setNewMember({ name: "", email: "", role: "member", department: "Creative" })
    setShowAddForm(false)
  }

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id))
  }

  const handleToggleStatus = (id: string) => {
    setMembers(
      members.map((m) =>
        m.id === id ? { ...m, status: m.status === "active" ? "inactive" : "active" } : m
      )
    )
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-[#FFE5CC] text-[#9E5610]"
      case "manager":
        return "bg-[#D1E3FF] text-[#0051C3]"
      default:
        return "bg-[#E5F2E5] text-[#2E7D32]"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-3 h-3" />
      case "manager":
        return <Users className="w-3 h-3" />
      default:
        return <User className="w-3 h-3" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Team Management</h1>
        <p className="text-sm text-[#86868B]">Manage team members, roles, and permissions</p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E5E7] p-4">
          <div className="text-xs font-medium text-[#86868B] uppercase tracking-wider mb-2">Total Members</div>
          <div className="text-2xl font-bold text-[#1D1D1F]">{members.length}</div>
          <p className="text-xs text-[#86868B] mt-1">{members.filter((m) => m.status === "active").length} active</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E5E7] p-4">
          <div className="text-xs font-medium text-[#86868B] uppercase tracking-wider mb-2">Administrators</div>
          <div className="text-2xl font-bold text-[#1D1D1F]">{members.filter((m) => m.role === "admin").length}</div>
          <p className="text-xs text-[#86868B] mt-1">With full access</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E5E7] p-4">
          <div className="text-xs font-medium text-[#86868B] uppercase tracking-wider mb-2">Departments</div>
          <div className="text-2xl font-bold text-[#1D1D1F]">{new Set(members.map((m) => m.department)).size}</div>
          <p className="text-xs text-[#86868B] mt-1">Represented</p>
        </div>
      </div>

      {/* Add Member Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] transition-colors text-white text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>
      )}

      {/* Add Member Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1D1D1F]">Add New Team Member</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-[#86868B] hover:text-[#1D1D1F] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Name</label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Full name"
                className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Email</label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Department</label>
                <select
                  value={newMember.department}
                  onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
                >
                  <option value="Creative">Creative</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddMember}
                className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg text-sm font-medium hover:bg-[#1B5E20] transition-colors"
              >
                Add Member
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-[#F5F5F7] text-[#1D1D1F] rounded-lg text-sm font-medium hover:bg-[#EBEBED] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F8F9FB] border-b border-[#E5E5E7]">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-[#1D1D1F] text-sm">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-[#1D1D1F] text-sm">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-[#1D1D1F] text-sm">Role</th>
              <th className="text-left py-3 px-4 font-semibold text-[#1D1D1F] text-sm">Department</th>
              <th className="text-left py-3 px-4 font-semibold text-[#1D1D1F] text-sm">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F] text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-[#E5E5E7] hover:bg-[#F8F9FB] transition-colors">
                <td className="py-3 px-4 text-sm text-[#1D1D1F] font-medium">{member.name}</td>
                <td className="py-3 px-4 text-sm text-[#86868B]">{member.email}</td>
                <td className="py-3 px-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {getRoleIcon(member.role)}
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-[#515154]">{member.department}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    {member.status === "active" ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-[#34C759]" />
                        <span className="text-xs font-medium text-[#2E7D32]">Active</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full bg-[#D1D1D6]" />
                        <span className="text-xs font-medium text-[#86868B]">Inactive</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(member.id)}
                      className="text-[#86868B] hover:text-[#007AFF] transition-colors p-1.5 hover:bg-[#F5F5F7] rounded"
                      title={member.status === "active" ? "Deactivate" : "Activate"}
                    >
                      {member.status === "active" ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-[#86868B] hover:text-[#FF3B30] transition-colors p-1.5 hover:bg-[#F5F5F7] rounded"
                      title="Delete member"
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
    </div>
  )
}
