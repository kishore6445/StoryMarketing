import { createClient } from '@supabase/supabase-js'

// Supabase singleton client (anon key)
let supabaseClient: ReturnType<typeof createClient> | null = null
// Supabase admin client (service role key)
let supabaseAdminClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    // Try both server-side and client-side env variable formats
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('[v0] Supabase URL:', supabaseUrl ? 'Found' : 'Missing')
      console.error('[v0] Supabase Key:', supabaseKey ? 'Found' : 'Missing')
      throw new Error('Missing Supabase environment variables')
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey)
  }
  return supabaseClient
}

// Export supabase as a named export for convenience
export const supabase = getSupabaseClient()

export function getSupabaseAdminClient() {
  if (!supabaseAdminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    // Try multiple possible environment variable names for service role key
    const supabaseServiceKey = 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.supabase_service_role_key ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.supabase_service_key

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[v0] Supabase URL:', supabaseUrl ? 'Found' : 'Missing')
      console.error('[v0] Service Role Key:', supabaseServiceKey ? 'Found' : 'Missing')
      console.error('[v0] Checked env variables: SUPABASE_SERVICE_ROLE_KEY, supabase_service_role_key, SUPABASE_SERVICE_KEY, supabase_service_key')
      throw new Error('Missing Supabase admin environment variables')
    }

    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return supabaseAdminClient
}

export async function getUser(userId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  
  if (error) return null
  return data
}

export async function getUserByEmail(email: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle()
  
  if (error) return null
  return data
}

export async function getTeam(teamId: string) {
  // TODO: Replace with actual database query
  return null;
}

export async function getTeamMembers(teamId: string) {
  // TODO: Replace with actual database query
  return [];
}

export async function getClient(clientId: string) {
  // TODO: Replace with actual database query
  return null;
}

export async function getClientPhases(clientId: string) {
  // TODO: Replace with actual database query
  return [];
}

export async function getPhaseStrategy(clientPhaseId: string) {
  // TODO: Replace with actual database query
  return null;
}

export async function getPhaseSection(sectionId: string) {
  // TODO: Replace with actual database query
  return null;
}

export async function getSectionTasks(sectionId: string) {
  // TODO: Replace with actual database query
  return [];
}

export async function getUserTasks(userId: string) {
  // TODO: Replace with actual database query
  return [];
}

export async function getSectionDocuments(sectionId: string) {
  // TODO: Replace with actual database query
  return [];
}

export async function getClientSocialAccounts(clientId: string) {
  // TODO: Replace with actual database query
  return [];
}

export async function getScheduledPosts(clientId: string) {
  // TODO: Replace with actual database query
  return [];
}

export async function getSocialPostMetrics(postId: string) {
  // TODO: Replace with actual database query
  return null;
}

export async function getChannelPerformance(clientId: string, platform: string, days: number = 30) {
  // TODO: Replace with actual database query
  return [];
}

export async function getActivityLog(clientId: string, limit: number = 50) {
  // TODO: Replace with actual database query
  return [];
}

// Write operations
export async function createTask(sectionId: string, title: string, assignedTo?: string) {
  // TODO: Replace with actual database insert
  return null;
}

export async function updateTaskStatus(taskId: string, status: "todo" | "in_progress" | "done") {
  // TODO: Replace with actual database update
  return null;
}

export async function createDocument(sectionId: string, title: string, url: string) {
  // TODO: Replace with actual database insert
  return null;
}

export async function publishPost(postId: string, platformPostId: string) {
  // TODO: Replace with actual database update
  return null;
}

export async function logActivity(clientId: string, action: string, entityType: string, userId?: string) {
  // TODO: Replace with actual database insert
  return null;
}

// SQL query helper for direct SQL queries
export async function query(sql: string, params?: any[]) {
  const supabase = getSupabaseAdminClient()
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: sql,
      params: params || []
    })
    
    if (error) {
      console.error('[v0] Query error:', error)
      throw error
    }
    
    return { rows: data || [] }
  } catch (error) {
    console.error('[v0] Database query failed:', error)
    throw error
  }
}
