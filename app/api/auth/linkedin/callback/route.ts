import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, getLinkedInProfile } from "@/lib/linkedin"

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")
    const state = request.nextUrl.searchParams.get("state")
    const error = request.nextUrl.searchParams.get("error")
    const errorDescription = request.nextUrl.searchParams.get("error_description")

    // Handle LinkedIn errors
    if (error) {
      console.error("[v0] LinkedIn OAuth error:", error, errorDescription)
      return NextResponse.redirect(
        new URL(`/connect-social?error=${error}&description=${errorDescription}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/connect-social?error=no_code", request.url)
      )
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code, state || "")

    // Get LinkedIn profile info
    const profile = await getLinkedInProfile(tokenData.access_token)

    // TODO: When database is added:
    // 1. Get authenticated user from session
    // 2. Get clientId from stored state
    // 3. Create/update social_account record with:
    //    - platform: "linkedin"
    //    - account_name: profile.localizedFirstName
    //    - account_id: profile.id
    //    - access_token: tokenData.access_token (encrypted)
    //    - refresh_token: tokenData.refresh_token (if provided)
    //    - token_expires_at: calculated from tokenData.expires_in

    // For now, redirect to connection success page with token info
    const params = new URLSearchParams({
      success: "true",
      platform: "linkedin",
      accountName: `${profile.localizedFirstName || ""} ${profile.localizedLastName || ""}`,
    })

    return NextResponse.redirect(
      new URL(`/connect-social?${params.toString()}`, request.url)
    )
  } catch (error) {
    console.error("[v0] LinkedIn callback error:", error)
    return NextResponse.redirect(
      new URL("/connect-social?error=callback_failed", request.url)
    )
  }
}
