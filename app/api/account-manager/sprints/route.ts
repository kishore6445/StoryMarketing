import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    const supabase = getSupabaseClient()
    
    let query = supabase
      .from('sprints')
      .select('*')
      .order('start_date', { ascending: false })

    if (clientId && clientId !== 'all') {
      query = query.eq('client_id', clientId)
    }

    const { data: sprints, error } = await query

    if (error) {
      console.error('[v0] Error fetching sprints:', error)
      return NextResponse.json({ error: 'Failed to fetch sprints' }, { status: 500 })
    }

    return NextResponse.json({ success: true, sprints: sprints || [] })
  } catch (error) {
    console.error('[v0] Error in GET /api/account-manager/sprints:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, name, startDate, endDate, status } = body

    if (!clientId || !name || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { data: sprint, error } = await supabase
      .from('sprints')
      .insert({
        client_id: clientId,
        name,
        start_date: startDate,
        end_date: endDate,
        status: status || 'planning'
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating sprint:', error)
      return NextResponse.json({ error: 'Failed to create sprint' }, { status: 500 })
    }

    return NextResponse.json({ success: true, sprint })
  } catch (error) {
    console.error('[v0] Error in POST /api/account-manager/sprints:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
