import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

// POST - Create a new section
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { clientPhaseId, sectionName, sectionOrder } = await request.json()

    if (!clientPhaseId || !sectionName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    
    const { data: section, error } = await supabase
      .from('phase_sections')
      .insert({
        client_phase_id: clientPhaseId,
        section_name: sectionName,
        section_order: sectionOrder || 0,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating section:", error)
      return NextResponse.json({ error: "Failed to create section" }, { status: 500 })
    }

    return NextResponse.json({ section, success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating section:", error)
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 })
  }
}

// PUT - Update a section
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { sectionId, sectionName, sectionOrder } = await request.json()

    if (!sectionId) {
      return NextResponse.json({ error: "Section ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    const updateData: any = {}
    
    if (sectionName !== undefined) updateData.section_name = sectionName
    if (sectionOrder !== undefined) updateData.section_order = sectionOrder

    const { data: section, error } = await supabase
      .from('phase_sections')
      .update(updateData)
      .eq('id', sectionId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating section:", error)
      return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
    }

    return NextResponse.json({ section, success: true })
  } catch (error) {
    console.error("[v0] Error updating section:", error)
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
  }
}

// DELETE - Delete a section
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const url = new URL(request.url)
    const sectionId = url.searchParams.get('sectionId')

    if (!sectionId) {
      return NextResponse.json({ error: "Section ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    
    const { error } = await supabase
      .from('phase_sections')
      .delete()
      .eq('id', sectionId)

    if (error) {
      console.error("[v0] Error deleting section:", error)
      return NextResponse.json({ error: "Failed to delete section" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting section:", error)
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 })
  }
}
