import { NextRequest, NextResponse } from "next/server"
import { getLinkedInAuthUrl } from "@/lib/linkedin"

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId")

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 })
    }

    // Store clientId in session/state for callback verification
    // TODO: When database is added, store this mapping temporarily
    const authUrl = getLinkedInAuthUrl()

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("[v0] LinkedIn auth URL generation error:", error)
    return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 })
  }
}
