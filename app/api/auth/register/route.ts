import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getSupabaseClient, getSupabaseAdminClient } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    // Validation
    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Invalid email or password (min 8 characters)" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const supabaseAdmin = getSupabaseAdminClient();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      console.error("[v0] Supabase Auth error:", authError);
      return NextResponse.json(
        { error: authError.message || "Failed to create account" },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create user in custom users table - all signups are admins (using admin client to bypass RLS)
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id, // Use the same ID from Supabase Auth
        email,
        full_name: fullName,
        role: 'admin', // All signups are admins
        is_active: true,
      })
      .select()
      .single();

    if (userError) {
      console.error("[v0] User table creation error:", userError);
      // Cleanup: delete from auth if custom table insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // Create session token and return in response body
    const sessionToken = await createSession(user.id, user.role);

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

    return response;
  } catch (error) {
    console.error("[v0] Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
