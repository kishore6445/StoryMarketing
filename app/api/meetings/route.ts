import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Fetching meetings...')
    const user = await getUserFromToken(request)
    if (!user) {
      console.log('[v0] Unauthorized - no user token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const clientId = request.nextUrl.searchParams.get('clientId')

    const isValidUUID = clientId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId)
    
    let query = supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    if (isValidUUID) {
      query = query.eq('client_id', clientId)
    }

    const { data: meetings, error } = await query

    if (error) {
      console.error('[v0] Error fetching meetings from Supabase:', error)
      return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 })
    }

    // Fetch attendees and action items for each meeting
    const meetingsWithDetails = await Promise.all(
      (meetings || []).map(async (meeting) => {
        const [attendeesResult, actionItemsResult] = await Promise.all([
          supabase
            .from('meeting_attendees')
            .select(`
              user_id,
              users (id, full_name, role)
            `)
            .eq('meeting_id', meeting.id),
          supabase
            .from('meeting_action_items')
            .select(`
              id,
              description,
              assigned_to,
              due_date,
              completed,
              users (id, full_name)
            `)
            .eq('meeting_id', meeting.id)
        ])

        return {
          ...meeting,
          attendees: attendeesResult.data?.map(a => ({
            id: a.users?.id,
            full_name: a.users?.full_name,
            role: a.users?.role
          })) || [],
          action_items: actionItemsResult.data?.map(item => ({
            id: item.id,
            description: item.description,
            owner: item.users?.full_name || 'Unassigned',
            dueDate: item.due_date,
            completed: item.completed
          })) || []
        }
      })
    )

    const meetingsWithAttendees = meetingsWithDetails; // Declare the variable

    console.log('[v0] Fetched meetings successfully:', meetingsWithDetails.length)
    return NextResponse.json({ meetings: meetingsWithDetails })
  } catch (error) {
    console.error('[v0] Error fetching meetings:', error)
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Creating meeting...')
    const user = await getUserFromToken(request)
    if (!user) {
      console.log('[v0] Unauthorized - no user token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const body = await request.json()
    const { title, clientId, date, time, repeatWeekly, attendees, notes } = body

    console.log('[v0] Creating meeting with data:', { title, clientId, date, time, repeatWeekly, attendees: attendees?.length })

    // Validate clientId is a UUID or null/empty
    const isValidClientId = !clientId || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId)
    if (clientId && !isValidClientId) {
      console.error('[v0] Invalid clientId format:', clientId)
      return NextResponse.json({ error: 'Invalid client ID format' }, { status: 400 })
    }

    // Insert meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        user_id: user.id,
        title: title || null,
        client_id: clientId || null,
        date,
        time,
        repeat_weekly: repeatWeekly || false,
        notes: notes || '',
        status: 'scheduled'
      })
      .select()
      .single()

    if (meetingError || !meeting) {
      console.error('[v0] Error creating meeting:', meetingError)
      return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 })
    }

    // Insert attendees if provided
    if (attendees && attendees.length > 0) {
      const attendeeRecords = attendees.map((attendeeId: string) => ({
        meeting_id: meeting.id,
        user_id: attendeeId
      }))

      const { error: attendeesError } = await supabase
        .from('meeting_attendees')
        .insert(attendeeRecords)

      if (attendeesError) {
        console.error('[v0] Error adding attendees:', attendeesError)
      }

      // Fetch attendee details
      const { data: attendeeDetails } = await supabase
        .from('meeting_attendees')
        .select(`
          user_id,
          users (id, full_name, role)
        `)
        .eq('meeting_id', meeting.id)

      meeting.attendees = attendeeDetails?.map(a => ({
        id: a.users?.id,
        full_name: a.users?.full_name,
        role: a.users?.role
      })) || []
    } else {
      meeting.attendees = []
    }

    console.log('[v0] Meeting created successfully:', meeting.id)
    return NextResponse.json({ meeting }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating meeting:', error)
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('[v0] Updating meeting...')
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const body = await request.json()
    const { id, clientId, date, time, repeatWeekly, attendees, notes, status } = body

    // Update meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .update({
        client_id: clientId || null,
        date,
        time,
        repeat_weekly: repeatWeekly || false,
        notes: notes || '',
        status: status || 'scheduled'
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (meetingError || !meeting) {
      console.error('[v0] Error updating meeting:', meetingError)
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    // Update attendees
    if (attendees) {
      // Remove existing attendees
      await supabase
        .from('meeting_attendees')
        .delete()
        .eq('meeting_id', id)

      // Insert new attendees
      if (attendees.length > 0) {
        const attendeeRecords = attendees.map((attendeeId: string) => ({
          meeting_id: id,
          user_id: attendeeId
        }))

        await supabase
          .from('meeting_attendees')
          .insert(attendeeRecords)
      }

      // Fetch updated attendee details
      const { data: attendeeDetails } = await supabase
        .from('meeting_attendees')
        .select(`
          user_id,
          users (id, full_name, role)
        `)
        .eq('meeting_id', id)

      meeting.attendees = attendeeDetails?.map(a => ({
        id: a.users?.id,
        full_name: a.users?.full_name,
        role: a.users?.role
      })) || []
    }

    console.log('[v0] Meeting updated successfully')
    return NextResponse.json({ meeting })
  } catch (error) {
    console.error('[v0] Error updating meeting:', error)
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('[v0] Deleting meeting...')
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Meeting ID required' }, { status: 400 })
    }

    // Delete attendees first
    await supabase
      .from('meeting_attendees')
      .delete()
      .eq('meeting_id', id)

    // Delete meeting
    const { data, error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .select()

    if (error || !data || data.length === 0) {
      console.error('[v0] Error deleting meeting:', error)
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    console.log('[v0] Meeting deleted successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting meeting:', error)
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 })
  }
}
