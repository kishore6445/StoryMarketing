import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const session = await validateSession(token)
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, full_name, role, profile_photo_url, display_name, personal_motto")
      .eq("id", session.userId)
      .single()

    if (error || !user) {
      console.error("[v0] Error fetching user profile:", error)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (err) {
    console.error("[v0] Error fetching user profile:", err)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const session = await validateSession(token)
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { display_name, personal_motto, profile_photo_url } = await request.json()

    const supabase = getSupabaseAdminClient()
    const { data: user, error } = await supabase
      .from("users")
      .update({
        display_name: display_name || null,
        personal_motto: personal_motto || null,
        profile_photo_url: profile_photo_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.userId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating profile:", error)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json(user)
  } catch (err) {
    console.error("[v0] Error updating user profile:", err)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
