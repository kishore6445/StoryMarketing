"use client"

import { useState } from "react"
import { ChevronDown, Plus, Building2, CheckCircle2 } from "lucide-react"

interface ClientSelectorProps {
  clients: Array<{ id: string; name: string; brandColor?: string }>
  selectedClientId: string
  onClientChange: (clientId: string) => void
  onAddClient: () => void
}

export function ClientSelector({ clients, selectedClientId, onClientChange, onAddClient }: ClientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedClient = clients.find((c) => c.id === selectedClientId)

  return (
    <div className="relative">
      {/* Client Selector Button - Improved Design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#0071E3] to-[#0051C3] hover:from-[#005BC3] hover:to-[#004199] transition-all shadow-sm text-white font-medium text-sm"
      >
        <Building2 className="w-4 h-4" />
        <span className="max-w-32 truncate">{selectedClient?.name || "Select Client"}</span>
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu - Eye-Friendly Design */}
      {isOpen && (
        <div className="absolute top-full mt-3 left-0 bg-white border border-[#E5E5E7] rounded-xl shadow-xl z-50 min-w-80 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#F8F9FB] to-[#F3F5F9] border-b border-[#E5E5E7]">
            <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wide">Select a Client</p>
          </div>

          {/* Client List */}
          <div className="p-2 max-h-96 overflow-y-auto">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  onClientChange(client.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  selectedClientId === client.id
                    ? "bg-[#0071E3] text-white shadow-sm"
                    : "hover:bg-[#F5F5F7] text-[#1D1D1F]"
                }`}
              >
                {/* Client Icon */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedClientId === client.id
                      ? "bg-white/20"
                      : "bg-[#E5E5E7]"
                  }`}
                  style={selectedClientId !== client.id ? { backgroundColor: client.brandColor || "#E5E5E7" } : undefined}
                >
                  {selectedClientId === client.id ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Building2 className="w-4 h-4 text-[#86868B]" />
                  )}
                </div>

                {/* Client Name */}
                <span className="flex-1 text-left font-medium">{client.name}</span>

                {/* Selected Indicator */}
                {selectedClientId === client.id && (
                  <div className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-[#E5E5E7]" />

          {/* Add New Client Button */}
          <button
            onClick={() => {
              onAddClient()
              setIsOpen(false)
            }}
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#F5F5F7] text-sm text-[#0071E3] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Client
          </button>
        </div>
      )}
    </div>
  )
}
