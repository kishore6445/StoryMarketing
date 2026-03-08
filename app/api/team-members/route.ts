import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Fetching team members...')
    const user = await getUserFromToken(request)
    if (!user) {
      console.log('[v0] Unauthorized - no user token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const role = request.nextUrl.searchParams.get('role')

    let query = supabase
      .from('users')
      .select('id, full_name, email, role')
      .order('full_name', { ascending: true })

    if (role) {
      query = query.eq('role', role)
    } 
    // else {
    //   // Get team members (non-client users)
    //   query = query.neq('role', 'client')
    // }

    const { data: users, error } = await query

    if (error) {
      console.error('[v0] Error fetching team members from Supabase:', error)
      return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
    }

    console.log('[v0] Fetched team members successfully:', users?.length || 0)
    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('[v0] Error fetching team members:', error)
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}
