// LinkedIn OAuth Configuration
// Setup your LinkedIn app here: https://www.linkedin.com/developers/apps

export const LINKEDIN_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || "",
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/linkedin/callback`,
  scopes: [
    "r_liteprofile",
    "r_emailaddress",
    "w_member_social",
    "r_organization_social",
  ],
}

export const getLinkedInAuthUrl = () => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: LINKEDIN_CONFIG.clientId,
    redirect_uri: LINKEDIN_CONFIG.redirectUri,
    scope: LINKEDIN_CONFIG.scopes.join(" "),
    state: generateRandomState(), // CSRF protection
  })

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
}

function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string, state: string) {
  try {
    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: LINKEDIN_CONFIG.redirectUri,
        client_id: LINKEDIN_CONFIG.clientId,
        client_secret: LINKEDIN_CONFIG.clientSecret,
      }).toString(),
    })

    if (!response.ok) {
      throw new Error("Failed to exchange code for token")
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] LinkedIn token exchange error:", error)
    throw error
  }
}

// Get LinkedIn profile information
export async function getLinkedInProfile(accessToken: string) {
  try {
    const response = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch LinkedIn profile")
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] LinkedIn profile fetch error:", error)
    throw error
  }
}

// Get LinkedIn organization/company pages
export async function getLinkedInOrganizations(accessToken: string) {
  try {
    const response = await fetch(
      "https://api.linkedin.com/v2/organizationalAcounts?q=roleAssignee",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Accept": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error("Failed to fetch LinkedIn organizations")
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] LinkedIn organizations fetch error:", error)
    throw error
  }
}
