"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { AddClientModal } from "./add-client-modal"

interface Client {
  id: string
  name: string
  description: string
  is_active: boolean
}

interface ClientUser {
  id: string
  email: string
  full_name: string
}

export function ManageClientsSection() {
  const [clients, setClients] = useState<Client[]>([])
  const [clientUsers, setClientUsers] = useState<ClientUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchClients()
    fetchClientUsers()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/clients', {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      })
      const data = await response.json()
      if (data.clients) {
        setClients(data.clients.filter((c: Client) => c.is_active))
      }
    } catch (error) {
      console.error("[v0] Failed to fetch clients:", error)
      alert("Failed to load clients")
    } finally {
      setLoading(false)
    }
  }

  const fetchClientUsers = async () => {
    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/users', {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      })
      const data = await response.json()
      if (data.users) {
        // Filter only client role users
        setClientUsers(data.users.filter((u: any) => u.role === 'client'))
      }
    } catch (error) {
      console.error("[v0] Failed to fetch client users:", error)
    }
  }

  const handleAddClient = async (clientData: { name: string; description: string; brandColor?: string; userId?: string }) => {
    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(clientData),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to create client")
        return
      }

      await fetchClients()
      setShowAddModal(false)
      alert("Client created successfully!")
    } catch (error) {
      console.error("[v0] Failed to create client:", error)
      alert("Failed to create client")
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) {
      return
    }

    try {
      const token = localStorage.getItem('sessionToken')
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to delete client")
        return
      }

      await fetchClients()
      alert("Client deleted successfully!")
    } catch (error) {
      console.error("[v0] Failed to delete client:", error)
      alert("Failed to delete client")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F]">Manage Clients</h1>
          <p className="text-sm text-[#86868B] mt-1">View and manage all clients in your team</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0051C3] transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Clients List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[#86868B]">Loading clients...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="flex items-center justify-center py-12 bg-white border-2 border-dashed border-[#E5E5E7] rounded-lg">
          <p className="text-[#86868B]">No clients yet. Click "Add Client" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-white border-2 border-[#00A8E8] rounded-lg p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#1D1D1F] mb-1">{client.name}</h3>
                  <p className="text-sm text-[#86868B] mb-3">{client.description || 'No description'}</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        client.is_active ? "bg-[#34C759]" : "bg-[#86868B]"
                      }`}
                    />
                    <span className="text-sm font-medium text-[#34C759]">
                      {client.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-[#86868B] hover:bg-[#F5F5F7] rounded-lg transition-colors"
                    title="Edit client"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-2 text-[#86868B] hover:bg-[#FFEBEE] hover:text-[#D32F2F] rounded-lg transition-colors"
                    title="Delete client"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddClient}
        clientUsers={clientUsers}
      />
    </div>
  )
}
