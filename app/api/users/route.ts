import { NextRequest, NextResponse } from "next/server"
import { getSupabaseClient, getSupabaseAdminClient, getUserByEmail } from "@/lib/db"
import { validateSession } from "@/lib/auth"

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    // Validate session - check Authorization header first, then cookie
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Any authenticated user can view the team member list for task assignment
    const supabase = getSupabaseClient()
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("[v0] Failed to fetch users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST - Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    // Validate session - check Authorization header first, then cookie
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const data = await request.json()
    const { name, email, password, role, clientName, clientDescription } = data

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    if (role === 'client' && !clientName) {
      return NextResponse.json(
        { error: "Client organization name is required for client users" },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdminClient()

    // Create user in Supabase Auth first (using admin to bypass email confirmation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
      },
    })

    if (authError) {
      console.error("[v0] Supabase Auth error:", authError)
      return NextResponse.json(
        { error: authError.message || "Failed to create account" },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user in Auth" },
        { status: 500 }
      )
    }

    // Create user in custom users table (using admin client to bypass RLS)
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id, // Use the same ID from Supabase Auth
        email,
        full_name: name,
        role,
        is_active: true,
      })
      .select('id, email, full_name, role, is_active, created_at')
      .single()

    if (error) {
      console.error("[v0] Failed to create user:", error)
      // Cleanup: delete from auth if custom table insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // If role is client, create a client organization linked to this user
    if (role === 'client' && clientName) {
      const { error: clientError } = await supabaseAdmin
        .from('clients')
        .insert({
          user_id: newUser.id, // Link to the client user
          name: clientName,
          description: clientDescription || '',
          is_active: true,
        })

      if (clientError) {
        console.error("[v0] Failed to create client organization:", clientError)
        // Don't fail the user creation, but log the error
      }
    }

    return NextResponse.json({ user: newUser, success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}

// PUT - Update user (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Validate session - check Authorization header first, then cookie
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const data = await request.json()
    const { id, name, email, role, isActive } = data

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const updateData: any = {}
    
    if (name !== undefined) updateData.full_name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.is_active = isActive

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, full_name, role, is_active, created_at')
      .single()

    if (error) {
      console.error("[v0] Failed to update user:", error)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json({ user: updatedUser, success: true })
  } catch (error) {
    console.error("[v0] Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Validate session - check Authorization header first, then cookie
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const data = await request.json()
    const { id } = data

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Prevent deleting yourself
    if (id === session.userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdminClient()
    
    // Delete from custom users table (using admin client to bypass RLS)
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error("[v0] Failed to delete user:", error)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    // Delete from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (authError) {
      console.error("[v0] Failed to delete user from Auth:", authError)
      // Continue anyway since custom table deletion succeeded
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
