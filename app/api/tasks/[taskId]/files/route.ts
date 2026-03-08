import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

const TASK_FILES_BUCKET = "task-files"

const ALLOWED_FILE_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "docx"])
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
])

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

// GET - Fetch files for a task
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

    const supabase: any = getSupabaseAdminClient()
    const { taskId } = await params
    const canonicalTaskId = await resolveTaskUuid(supabase, taskId)

    if (!canonicalTaskId) {
      return NextResponse.json([], { status: 200 })
    }

    console.log("[v0] Fetching files for task:", taskId)

    const { data: files, error }: { data: any[] | null; error: any } = await supabase
      .from("task_files")
      .select(`
        id,
        task_id,
        name,
        url,
        size,
        mime_type,
        uploaded_by,
        uploaded_at
      `)
      .eq("task_id", canonicalTaskId)
      .order("uploaded_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching files:", error)
      return NextResponse.json([])
    }

    // Fallback: if no task_files rows exist, return attachments metadata from tasks table.
    if (!files || files.length === 0) {
      const { data: taskRow }: { data: any } = await supabase
        .from("tasks")
        .select("attachments")
        .eq("id", canonicalTaskId)
        .maybeSingle()

      const attachments = Array.isArray(taskRow?.attachments) ? taskRow.attachments : []
      if (attachments.length > 0) {
        const fallbackFiles = attachments
          .map((attachment: any, index: number) => ({
            id: `attachment-${index}`,
            task_id: canonicalTaskId,
            name: attachment.name || `Attachment ${index + 1}`,
            url: attachment.url || attachment.publicUrl || attachment.fileUrl || "",
            size: attachment.size || 0,
            mime_type: attachment.mimeType || "",
            uploaded_at: attachment.uploadedAt || new Date().toISOString(),
            uploaded_by_user: { full_name: "Unknown" },
            attachment_meta: attachment,
          }))
          .filter((attachment: any) => Boolean(attachment.url))

        if (fallbackFiles.length > 0) {
          return NextResponse.json(fallbackFiles)
        }
      }
    }

    // Enrich files with user data
    let enrichedFiles = files || []
    if (enrichedFiles.length > 0) {
      const userIds = [...new Set(enrichedFiles.map(f => f.uploaded_by))]
      const { data: users }: { data: any[] | null } = await supabase
        .from("users")
        .select("id, full_name, email")
        .in("id", userIds)

      enrichedFiles = enrichedFiles.map(file => ({
        ...file,
        uploaded_by_user: users?.find(u => u.id === file.uploaded_by) || { id: file.uploaded_by, full_name: "Unknown", email: "" }
      }))
    }

    return NextResponse.json(enrichedFiles)
  } catch (error) {
    console.error("[v0] Error in files GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Upload a file to a task
export async function POST(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
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

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || ""
    const isAllowedExtension = ALLOWED_FILE_EXTENSIONS.has(extension)
    const isAllowedMimeType = ALLOWED_MIME_TYPES.has(file.type)
    if (!isAllowedExtension || !isAllowedMimeType) {
      return NextResponse.json({ error: "Unsupported file type. Only PDF, JPG, and DOCX are allowed." }, { status: 400 })
    }

    const supabase: any = getSupabaseAdminClient()
    const { taskId } = await params
    const canonicalTaskId = await resolveTaskUuid(supabase, taskId)

    if (!canonicalTaskId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    console.log("[v0] Uploading file:", file.name, "for task:", taskId)

    // Upload file to storage
    const fileName = `${canonicalTaskId}/${Date.now()}-${file.name}`
    let { error: uploadError } = await supabase.storage
      .from(TASK_FILES_BUCKET)
      .upload(fileName, file)

    if (uploadError && /bucket not found/i.test(uploadError.message || "")) {
      console.warn("[v0] task-files bucket missing, creating bucket and retrying upload")
      const { error: createBucketError } = await supabase.storage.createBucket(TASK_FILES_BUCKET, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
      })

      if (createBucketError && !/already exists/i.test(createBucketError.message || "")) {
        console.error("[v0] Failed to create task-files bucket:", createBucketError)
        return NextResponse.json({ error: "Failed to upload file", details: createBucketError.message }, { status: 400 })
      }

      const retryResult = await supabase.storage
        .from(TASK_FILES_BUCKET)
        .upload(fileName, file)
      uploadError = retryResult.error
    }

    if (uploadError) {
      console.error("[v0] Error uploading file:", uploadError)
      return NextResponse.json({ error: "Failed to upload file", details: uploadError.message }, { status: 400 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(TASK_FILES_BUCKET)
      .getPublicUrl(fileName)

    // Save file metadata to database
    const { data: fileRecord, error: dbError }: { data: any; error: any } = await supabase
      .from("task_files")
      .insert({
        task_id: canonicalTaskId,
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        mime_type: file.type,
        uploaded_by: session.userId,
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error("[v0] Error saving file metadata:", dbError)
      return NextResponse.json({ error: "Failed to save file metadata", details: dbError.message }, { status: 400 })
    }

    // Keep tasks.attachments in sync as append-only metadata.
    const { data: taskRow }: { data: any } = await supabase
      .from("tasks")
      .select("attachments")
      .eq("id", canonicalTaskId)
      .maybeSingle()

    const existingAttachments = Array.isArray(taskRow?.attachments) ? taskRow.attachments : []
    const newAttachmentMeta = {
      name: fileRecord.name,
      url: fileRecord.url,
      size: fileRecord.size,
      mimeType: fileRecord.mime_type,
      uploadedAt: fileRecord.uploaded_at,
    }

    const mergedAttachments = [...existingAttachments, newAttachmentMeta].filter((attachment, index, all) => {
      if (!attachment?.url) return false
      return all.findIndex((candidate) => candidate?.url === attachment.url) === index
    })

    await supabase
      .from("tasks")
      .update({
        attachments: mergedAttachments,
        updated_at: new Date().toISOString(),
      })
      .eq("id", canonicalTaskId)

    return NextResponse.json(fileRecord, { status: 201 })
  } catch (error) {
    console.error("[v0] Error uploading file:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

// DELETE - Remove a file from a task
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
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

    if (!canonicalTaskId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    console.log("[v0] Deleting file:", fileId)

    // Get file record to find storage path
    const { data: fileRecord, error: fetchError }: { data: any; error: any } = await supabase
      .from("task_files")
      .select("url")
      .eq("id", fileId)
      .eq("task_id", canonicalTaskId)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Extract file path from URL
    const url = new URL(fileRecord.url)
    const filePath = url.pathname.split("/object/public/task-files/")[1]

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(TASK_FILES_BUCKET)
      .remove([filePath])

    if (storageError) {
      console.error("[v0] Error deleting file from storage:", storageError)
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("task_files")
      .delete()
      .eq("id", fileId)
      .eq("task_id", canonicalTaskId)

    if (dbError) {
      console.error("[v0] Error deleting file record:", dbError)
      return NextResponse.json({ error: "Failed to delete file", details: dbError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting file:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
