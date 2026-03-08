import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const body = await request.json()
    const { title, summary, keyDecisions, actionItems } = body
    const meetingId = params.id

    console.log('[v0] Updating meeting details for:', meetingId)

    // Update meeting title, summary and key decisions
    const { error: updateError } = await supabase
      .from('meetings')
      .update({
        title: title || null,
        summary: summary || null,
        key_decisions: keyDecisions || []
      })
      .eq('id', meetingId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('[v0] Error updating meeting:', updateError)
      return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 })
    }

    // Delete existing action items
    await supabase
      .from('meeting_action_items')
      .delete()
      .eq('meeting_id', meetingId)

    // Insert new action items
    if (actionItems && actionItems.length > 0) {
      const actionItemRecords = actionItems.map((item: any) => ({
        meeting_id: meetingId,
        description: item.description,
        assigned_to: item.assignedTo || null,
        due_date: item.dueDate || null,
        completed: false
      }))

      const { error: actionItemsError } = await supabase
        .from('meeting_action_items')
        .insert(actionItemRecords)

      if (actionItemsError) {
        console.error('[v0] Error inserting action items:', actionItemsError)
        return NextResponse.json({ error: 'Failed to save action items' }, { status: 500 })
      }
    }

    console.log('[v0] Meeting details updated successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error updating meeting details:', error)
    return NextResponse.json({ error: 'Failed to update meeting details' }, { status: 500 })
  }
}
