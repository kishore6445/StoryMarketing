import { NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth"
import { getUser } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Try to get token from Authorization header first, then cookie
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    console.log('[v0] /api/auth/me - Session token:', sessionToken ? 'Found' : 'Missing')
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    console.log('[v0] /api/auth/me - Session validation:', session ? 'Valid' : 'Invalid')
    
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const user = await getUser(session.userId)
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[v0] Auth check error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
