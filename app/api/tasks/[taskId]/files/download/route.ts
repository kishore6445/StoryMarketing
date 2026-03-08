import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

async function resolveTaskUuid(supabase: any, rawTaskId: string): Promise<string | null> {
  const decodedTaskId = decodeURIComponent(rawTaskId)

  const { data: byId } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", decodedTaskId)
    .maybeSingle()

  if (byId?.id) {
    return byId.id
  }

  const { data: byBusinessId } = await supabase
    .from("tasks")
    .select("id")
    .eq("task_id", decodedTaskId)
    .maybeSingle()

  return byBusinessId?.id || null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    const sessionToken = authHeader?.replace("Bearer ", "") || request.cookies.get("session")?.value
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("fileId")
    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    const supabase: any = getSupabaseAdminClient()
    const { taskId } = await params
    const canonicalTaskId = await resolveTaskUuid(supabase, taskId)

    let fileRecord: any = null
    let fileError: any = null

    if (canonicalTaskId) {
      const scopedLookup = await supabase
        .from("task_files")
        .select("id, task_id, name, url, mime_type")
        .eq("id", fileId)
        .eq("task_id", canonicalTaskId)
        .maybeSingle()
      fileRecord = scopedLookup.data
      fileError = scopedLookup.error
    }

    if (!fileRecord) {
      const directLookup = await supabase
        .from("task_files")
        .select("id, task_id, name, url, mime_type")
        .eq("id", fileId)
        .maybeSingle()
      fileRecord = directLookup.data
      fileError = directLookup.error
    }

    let resolvedFile = fileRecord

    if (fileError || !fileRecord) {
      // Fallback for attachments stored only in tasks.attachments JSON.
      if (!fileId.startsWith("attachment-")) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }

      if (!canonicalTaskId) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 })
      }

      const attachmentIndex = Number(fileId.replace("attachment-", ""))
      if (!Number.isInteger(attachmentIndex) || attachmentIndex < 0) {
        return NextResponse.json({ error: "Invalid attachment reference" }, { status: 400 })
      }

      const { data: taskRow } = await supabase
        .from("tasks")
        .select("attachments")
        .eq("id", canonicalTaskId)
        .maybeSingle()

      const attachments = Array.isArray(taskRow?.attachments) ? taskRow.attachments : []
      const attachment = attachments[attachmentIndex]
      const attachmentUrl = attachment?.url || attachment?.publicUrl || attachment?.fileUrl

      if (!attachment) {
        return NextResponse.json({ error: "Attachment not found" }, { status: 404 })
      }

      let resolvedAttachmentUrl = attachmentUrl
      if (!resolvedAttachmentUrl && attachment?.name) {
        const { data: matchedFileByName } = await supabase
          .from("task_files")
          .select("url, mime_type, name")
          .eq("task_id", canonicalTaskId)
          .eq("name", attachment.name)
          .order("uploaded_at", { ascending: false })
          .maybeSingle()

        if (matchedFileByName?.url) {
          resolvedAttachmentUrl = matchedFileByName.url
        }
      }

      if (!resolvedAttachmentUrl) {
        return NextResponse.json({ error: "Attachment URL missing" }, { status: 404 })
      }

      const remoteResponse = await fetch(resolvedAttachmentUrl)
      if (!remoteResponse.ok) {
        return NextResponse.json({ error: "Failed to fetch attachment" }, { status: 400 })
      }

      const attachmentBytes = await remoteResponse.arrayBuffer()
      const fallbackName = (attachment?.name || "attachment").replace(/\"/g, "")
      const fallbackMime = attachment?.mimeType || remoteResponse.headers.get("content-type") || "application/octet-stream"

      return new NextResponse(Buffer.from(attachmentBytes), {
        status: 200,
        headers: {
          "Content-Type": fallbackMime,
          "Content-Disposition": `attachment; filename="${fallbackName}"`,
          "Cache-Control": "no-store",
        },
      })
    }

    resolvedFile = fileRecord

    const url = new URL(resolvedFile.url)
    const filePath = url.pathname.split("/object/public/task-files/")[1]

    if (!filePath) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 })
    }

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("task-files")
      .download(filePath)

    if (downloadError || !fileBlob) {
      return NextResponse.json({ error: "Failed to download file" }, { status: 400 })
    }

    const arrayBuffer = await fileBlob.arrayBuffer()
    const safeFileName = (resolvedFile.name || "download").replace(/\"/g, "")

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": resolvedFile.mime_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("[v0] Error downloading file:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
