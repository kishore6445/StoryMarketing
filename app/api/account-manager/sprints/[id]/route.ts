import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, startDate, endDate, status } = body
    const sprintId = params.id

    const supabase = getSupabaseClient()
    
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (startDate !== undefined) updateData.start_date = startDate
    if (endDate !== undefined) updateData.end_date = endDate
    if (status !== undefined) updateData.status = status

    const { data: sprint, error } = await supabase
      .from('sprints')
      .update(updateData)
      .eq('id', sprintId)
      .select()
      .single()

    if (error) {
      console.error('[v0] Error updating sprint:', error)
      return NextResponse.json({ error: 'Failed to update sprint' }, { status: 500 })
    }

    return NextResponse.json({ success: true, sprint })
  } catch (error) {
    console.error('[v0] Error in PUT /api/account-manager/sprints/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sprintId = params.id
    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from('sprints')
      .delete()
      .eq('id', sprintId)

    if (error) {
      console.error('[v0] Error deleting sprint:', error)
      return NextResponse.json({ error: 'Failed to delete sprint' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in DELETE /api/account-manager/sprints/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
