import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getUserFromRequest } from "@/lib/auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 })
    }

    console.log('[v0] Updating post status:', { id, status })

    const { data, error } = await supabase
      .from("scheduled_posts")
      .update({ status })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Error updating post status:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[v0] Post status updated successfully')

    return NextResponse.json({ success: true, post: data })
  } catch (error) {
    console.error('[v0] Status update error:', error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}
