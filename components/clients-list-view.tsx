"use client"

import { Archive, Edit2, Settings } from "lucide-react"

interface Client {
  id: string
  name: string
  description?: string
  brandColor?: string
  is_active: boolean
}

interface ClientsListViewProps {
  clients: Client[]
  selectedClientId: string
  onSelectClient: (clientId: string) => void
  onEditClient: (clientId: string) => void
  onArchiveClient: (clientId: string) => void
}

export function ClientsListView({
  clients,
  selectedClientId,
  onSelectClient,
  onEditClient,
  onArchiveClient,
}: ClientsListViewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Manage Clients</h2>
        <p className="text-sm text-[#86868B] mb-6">View and manage all clients in your team</p>
      </div>

      <div className="space-y-2">
        {clients.length === 0 ? (
          <div className="text-center py-8 text-[#86868B]">No clients yet. Create your first client to get started.</div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                selectedClientId === client.id
                  ? "bg-blue-50 border-[#0071E3]"
                  : "bg-[#F5F5F7] border-[#E5E5E7] hover:border-[#D1D1D6]"
              }`}
              onClick={() => onSelectClient(client.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-[#1D1D1F]">{client.name}</h3>
                  {client.description && (
                    <p className="text-sm text-[#86868B] mt-1">{client.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {client.brandColor && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: client.brandColor }}
                      />
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      client.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {client.is_active ? "Active" : "Archived"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditClient(client.id)
                    }}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-[#86868B]" />
                  </button>
                  {client.is_active && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onArchiveClient(client.id)
                      }}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <Archive className="w-4 h-4 text-[#86868B]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
