import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getSupabaseClient, getUserByEmail } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    console.log('[v0] Login attempt for email:', email)

    const supabase = getSupabaseClient();

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('[v0] Supabase auth result:', authError ? `Error: ${authError.message}` : 'Success')

    if (authError || !authData.user) {
      console.error("[v0] Supabase Auth login error:", authError?.message);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get user from custom users table
    const user = await getUserByEmail(email);
    console.log('[v0] User from database:', user ? `Found: ${user.id}` : 'Not found')
    
    if (!user) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: "Account is inactive" },
        { status: 401 }
      );
    }

    // Create session token
    console.log('[v0] Creating session token for user:', user.id)
    const sessionToken = await createSession(user.id, user.role);
    console.log('[v0] Session token created successfully')

    // Return session token in response body (cookie method not working in dev)
    const response = NextResponse.json({
      success: true,
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });

    console.log('[v0] Login successful - Returning session token')

    return response;
  } catch (error) {
    console.error("[v0] Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
