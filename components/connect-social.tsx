"use client"

import React from "react"

import { useState } from "react"
import { Linkedin, Facebook, Twitter, Youtube } from "lucide-react"

interface ConnectSocialAccount {
  platform: "linkedin" | "facebook" | "instagram" | "twitter" | "tiktok" | "youtube"
  name: string
  icon: React.ReactNode
  color: string
  description: string
}

const SOCIAL_PLATFORMS: ConnectSocialAccount[] = [
  {
    platform: "linkedin",
    name: "LinkedIn",
    icon: <Linkedin className="w-6 h-6" />,
    color: "bg-blue-600",
    description: "Connect your LinkedIn company page to schedule and publish posts",
  },
  {
    platform: "facebook",
    name: "Facebook",
    icon: <Facebook className="w-6 h-6" />,
    color: "bg-blue-500",
    description: "Connect your Facebook page to manage posts and insights",
  },
  {
    platform: "twitter",
    name: "Twitter/X",
    icon: <Twitter className="w-6 h-6" />,
    color: "bg-black",
    description: "Connect your Twitter account to schedule tweets",
  },
  {
    platform: "youtube",
    name: "YouTube",
    icon: <Youtube className="w-6 h-6" />,
    color: "bg-red-600",
    description: "Connect your YouTube channel for video management",
  },
]

interface ConnectSocialProps {
  clientId: string
  onConnected?: (platform: string, accountName: string) => void
}

export function ConnectSocial({ clientId, onConnected }: ConnectSocialProps) {
  const [connecting, setConnecting] = useState<string | null>(null)
  const [connectedAccounts, setConnectedAccounts] = useState<
    Array<{ platform: string; accountName: string }>
  >([])

  const handleConnect = async (platform: string) => {
    setConnecting(platform)

    try {
      if (platform === "linkedin") {
        // Get auth URL from backend
        const response = await fetch(`/api/auth/linkedin?clientId=${clientId}`)
        const { authUrl } = await response.json()

        // Redirect to LinkedIn OAuth
        window.location.href = authUrl
      } else {
        // Placeholder for other platforms
        console.log(`[v0] Connecting to ${platform}`)
      }
    } catch (error) {
      console.error(`[v0] Failed to connect ${platform}:`, error)
      setConnecting(null)
    }
  }

  const isConnected = (platform: string) => {
    return connectedAccounts.some((a) => a.platform === platform)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">Connect Social Media Accounts</h2>
        <p className="text-sm text-[#86868B]">
          Connect your social media accounts to automatically sync posts and schedule content distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOCIAL_PLATFORMS.map((platform) => (
          <div
            key={platform.platform}
            className="p-4 border border-[#E5E5E7] rounded-lg hover:border-[#D1D1D6] transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className={`${platform.color} p-3 rounded-lg text-white`}>
                {platform.icon}
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-[#1D1D1F]">{platform.name}</h3>
                <p className="text-sm text-[#86868B] mt-1">{platform.description}</p>

                {isConnected(platform.platform) ? (
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Connected
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.platform)}
                    disabled={connecting === platform.platform}
                    className="mt-3 px-4 py-2 bg-[#0071E3] text-white text-sm font-medium rounded-lg hover:bg-[#0077ED] disabled:bg-[#D1D1D6] transition-colors"
                  >
                    {connecting === platform.platform ? "Connecting..." : "Connect"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Setup Required:</strong> Before connecting, you need to create an app in each platform's developer
          console and set the OAuth redirect URI to: <code className="bg-white px-2 py-1 rounded">{`${window.location.origin}/api/auth/linkedin/callback`}</code>
        </p>
      </div>
    </div>
  )
}
