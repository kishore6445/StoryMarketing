export type User = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "viewer";
  created_at: string;
};

export type Client = {
  id: string;
  team_id: string;
  name: string;
  description: string | null;
  brand_color: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ClientPhase = {
  id: string;
  client_id: string;
  phase_name: string;
  phase_order: number;
  status: "not_started" | "in_progress" | "completed";
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export type PhaseStrategy = {
  id: string;
  client_phase_id: string;
  victory_target: string;
  power_moves: string[];
  created_at: string;
  updated_at: string;
};

export type PhaseSection = {
  id: string;
  client_phase_id: string;
  section_name: string;
  section_order: number;
  created_at: string;
};

export type Task = {
  id: string;
  task_id: string | null;
  section_id: string;
  client_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  status: "todo" | "in_progress" | "in_review" | "done";
  due_date: string | null;
  promised_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  section_id: string;
  client_id: string;
  title: string;
  doc_type: "google_doc" | "google_sheet" | "figma" | "file" | "link";
  url: string | null;
  file_path: string | null;
  created_by: string | null;
  created_at: string;
};

export type SocialAccount = {
  id: string;
  client_id: string;
  platform: "facebook" | "instagram" | "linkedin" | "twitter" | "tiktok" | "youtube";
  account_name: string;
  account_id: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ScheduledPost = {
  id: string;
  client_id: string;
  social_account_id: string;
  platform: string;
  content_text: string;
  media_urls: string[];
  scheduled_for: string;
  status: "scheduled" | "published" | "failed" | "cancelled";
  published_at: string | null;
  platform_post_id: string | null;
  error_message: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialPost = {
  id: string;
  social_account_id: string;
  client_id: string;
  platform: string;
  post_id: string;
  post_type: string | null;
  content_text: string | null;
  media_url: string | null;
  permalink: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PostMetrics = {
  id: string;
  post_id: string;
  impressions: number;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  video_views: number;
  engagement_rate: number | null;
  fetched_at: string;
  created_at: string;
};

export type ChannelPerformance = {
  id: string;
  client_id: string;
  platform: string;
  date: string;
  total_posts: number;
  total_impressions: number;
  total_reach: number;
  total_engagement: number;
  avg_engagement_rate: number | null;
  followers_count: number | null;
  followers_change: number | null;
  created_at: string;
};

export type PlatformMetrics = {
  id: string;
  client_id: string;
  platform: "linkedin" | "email" | "youtube" | "instagram" | "facebook" | "twitter" | "tiktok" | "other";
  period_start: string;
  period_end: string;
  reach: number | null;
  impressions: number | null;
  views: number | null;
  engagement_rate: number | null;
  open_rate: number | null;
  click_rate: number | null;
  leads_generated: number | null;
  conversions: number | null;
  audience_size: number | null;
  custom_metrics: Record<string, unknown> | null;
  notes: string | null;
  recorded_by: string | null;
  status: "draft" | "approved";
  created_at: string;
  updated_at: string;
};

export type ActivityLog = {
  id: string;
  client_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type MetricDefinition = {
  id: string;
  campaign_type: string;
  client_id: string;
  metric_name: string;
  metric_type: "number" | "percentage" | "currency" | "boolean" | "text";
  unit: string | null;
  target_value: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentCampaign = {
  id: string;
  client_id: string;
  campaign_type: string;
  name: string;
  platform: "linkedin" | "email" | "youtube" | "instagram" | "facebook" | "twitter" | "tiktok" | "blog" | "other";
  period_start: string;
  period_end: string;
  status: "active" | "completed" | "archived" | "draft";
  owner_id: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CampaignContentPiece = {
  id: string;
  campaign_id: string;
  content_name: string;
  published_date: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
};

export type MetricRecording = {
  id: string;
  campaign_id: string;
  content_piece_id: string | null;
  recording_date: string;
  metric_values: Record<string, unknown>;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
};
