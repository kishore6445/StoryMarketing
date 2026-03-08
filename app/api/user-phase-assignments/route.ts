import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { query } from "@/lib/db" // Declare the query variable

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const supabase = getSupabaseAdminClient()

    if (userId) {
      // Get assignments for a specific user
      const { data, error } = await supabase
        .from("user_phase_assignments")
        .select("*")
        .eq("user_id", userId)
        .order("client_id")
        .order("phase_id")

      if (error) {
        console.error("[v0] Error fetching phase assignments:", error)
        return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
      }

      return NextResponse.json({ assignments: data || [] })
    }

    // Get all assignments
    const { data, error } = await supabase
      .from("user_phase_assignments")
      .select(`
        *,
        users (name),
        clients (name)
      `)
      .order("user_id")
      .order("client_id")
      .order("phase_id")

    if (error) {
      console.error("[v0] Error fetching all assignments:", error)
      return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
    }

    return NextResponse.json({ assignments: data || [] })
  } catch (error) {
    console.error("[v0] Error fetching phase assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can assign phases
    if (authResult.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userId, clientId, phaseId } = await request.json()

    if (!userId || !clientId || !phaseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Check if assignment already exists
    const { data: existing } = await supabase
      .from("user_phase_assignments")
      .select("*")
      .eq("user_id", userId)
      .eq("client_id", clientId)
      .eq("phase_id", phaseId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ assignment: existing })
    }

    // Create new assignment
    const { data, error } = await supabase
      .from("user_phase_assignments")
      .insert({
        user_id: userId,
        client_id: clientId,
        phase_id: phaseId,
        assigned_by: authResult.user.id
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating phase assignment:", error)
      return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 })
    }

    return NextResponse.json({ assignment: data })
  } catch (error) {
    console.error("[v0] Error creating phase assignment:", error)
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can delete assignments
    if (authResult.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const clientId = searchParams.get("clientId")
    const phaseId = searchParams.get("phaseId")

    if (!userId || !clientId || !phaseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { error } = await supabase
      .from("user_phase_assignments")
      .delete()
      .eq("user_id", userId)
      .eq("client_id", clientId)
      .eq("phase_id", phaseId)

    if (error) {
      console.error("[v0] Error deleting phase assignment:", error)
      return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting phase assignment:", error)
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 })
  }
}
