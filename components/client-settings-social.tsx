"use client"

import { useState } from "react"
import { Settings, Check } from "lucide-react"

interface SocialAccountSetup {
  platform: string
  isConnected: boolean
  accountName?: string
}

export function ClientSettingsSocial({ clientId }: { clientId: string }) {
  const [accounts, setAccounts] = useState<SocialAccountSetup[]>([
    { platform: "Facebook", isConnected: false },
    { platform: "Instagram", isConnected: false },
    { platform: "LinkedIn", isConnected: false },
    { platform: "Twitter", isConnected: false },
    { platform: "TikTok", isConnected: false },
    { platform: "YouTube", isConnected: false },
  ])

  async function connectAccount(platform: string) {
    // TODO: Implement OAuth flow for each platform
    console.log("[v0] Connecting to", platform)
    // This would redirect to OAuth provider and handle callback
  }

  async function disconnectAccount(platform: string) {
    // TODO: Revoke tokens and remove from database
    console.log("[v0] Disconnecting from", platform)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-5 h-5 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-medium">Social Media Accounts</h2>
          <p className="text-sm text-muted-foreground">Connect client social accounts to pull real-time data</p>
        </div>
      </div>

      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.platform}
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-background"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-sm font-medium">{account.platform.slice(0, 2).toUpperCase()}</span>
              </div>
              <div>
                <div className="text-sm font-medium">{account.platform}</div>
                {account.isConnected && account.accountName && (
                  <div className="text-xs text-muted-foreground">@{account.accountName}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {account.isConnected ? (
                <>
                  <div className="flex items-center gap-1.5 text-xs text-green-600">
                    <Check className="w-3.5 h-3.5" />
                    Connected
                  </div>
                  <button
                    onClick={() => disconnectAccount(account.platform)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => connectAccount(account.platform)}
                  className="text-sm text-primary hover:underline"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> You'll need API credentials for each platform. Data syncs automatically every 30
          minutes once connected.
        </p>
      </div>
    </div>
  )
}
