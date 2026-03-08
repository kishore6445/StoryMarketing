"use client"
import dynamic from "next/dynamic";
import { AuthGuard } from "@/components/auth-guard"

const ConnectSocial = dynamic(
  () => import("@/components/connect-social").then(m => m.ConnectSocial),
  { ssr: false }
);

import { useState, useEffect } from "react"

export default function ConnectSocialPage() {
  const [clientId, setClientId] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Get query parameters
    const params = new URLSearchParams(window.location.search)
    const successParam = params.get("success")
    const platform = params.get("platform")
    const accountName = params.get("accountName")
    const errorParam = params.get("error")

    if (successParam === "true" && platform && accountName) {
      setSuccess(`Successfully connected ${platform} account: ${accountName}`)
    } else if (errorParam) {
      setError(`Connection failed: ${errorParam}`)
    }

    // Get clientId from localStorage or session
    const storedClientId = localStorage.getItem("selectedClientId") || "default"
    setClientId(storedClientId)
  }, [])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FAFBFC] p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-[#1D1D1F]">Social Media Integration</h1>
            <p className="text-sm text-[#86868B] mt-2">
              Manage and connect all your social media accounts in one place
            </p>
          </div>

          {/* Alerts */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}

          {/* Connect Social Component */}
          <div className="bg-white border border-[#E5E5E7] rounded-lg p-8">
            <ConnectSocial clientId={clientId} />
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
