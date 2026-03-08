// SOP (Standard Operating Procedure) Configuration System
// Manages generic and brand-specific SOPs with Google Drive and web links
// Supports linking SOPs to tasks, phases, and workflow steps

export type SOPType = "generic" | "brand-specific" | "phase" | "task"
export type SOPLinkType = "google-drive" | "webpage" | "internal"

export interface SOP {
  id: string
  name: string
  description: string
  type: SOPType
  category: string // e.g., "SEO", "Design", "Content", "Social Media"
  linkType: SOPLinkType
  link: string
  iconUrl?: string
  brandId?: string // For brand-specific SOPs
  clientId?: string // For client-specific SOPs
  tags: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
  version: string
  isActive: boolean
}

export interface SOPCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  isGeneric: boolean
  parentCategory?: string // For sub-categories
}

export interface TaskSOP {
  id: string
  taskId: string
  sopId: string
  sopName: string
  sopLink: string
  linkType: SOPLinkType
  isRequired: boolean
  order: number
  addedAt: string
  addedBy: string
}

export interface PhaseSOP {
  id: string
  phaseId: string
  phaseName: string
  sopId: string
  sopName: string
  sopLink: string
  linkType: SOPLinkType
  stageDescription: string
  order: number
  createdAt: string
}

export interface WorkflowStepSOP {
  id: string
  workflowStepId: string
  stepName: string
  sopId: string
  sopName: string
  sopLink: string
  linkType: SOPLinkType
  requiredForApproval: boolean
  order: number
  addedAt: string
}

export interface EnhancedTask {
  id: string
  title: string
  description?: string
  owner: string
  completed: boolean
  dueDate: string
  priority: "low" | "medium" | "high"
  clientName: string
  phaseName: string
  sectionName: string
  workflowPhase?: string // Current phase in workflow (not_started, in_progress, review, done)
  sops?: TaskSOP[] // Associated SOPs for this task
  nextPhaseWorkflow?: string // Auto-assigned next workflow phase
  nextPhaseSOPs?: WorkflowStepSOP[] // SOPs for next phase
}

// Default Generic SOP Categories
export const GENERIC_SOP_CATEGORIES: SOPCategory[] = [
  {
    id: "gen-1",
    name: "SEO & Keywords",
    description: "Search engine optimization guidelines",
    icon: "🔍",
    color: "#2E7D32",
    isGeneric: true,
  },
  {
    id: "gen-2",
    name: "Content Guidelines",
    description: "Brand voice and content standards",
    icon: "✍️",
    color: "#0071E3",
    isGeneric: true,
  },
  {
    id: "gen-3",
    name: "Social Media",
    description: "Platform-specific posting guidelines",
    icon: "📱",
    color: "#FF9500",
    isGeneric: true,
  },
  {
    id: "gen-4",
    name: "Analytics & Reporting",
    description: "Metrics and reporting standards",
    icon: "📊",
    color: "#A2845C",
    isGeneric: true,
  },
]

// Brand-Specific SOP Categories
export const BRAND_SOP_CATEGORIES: SOPCategory[] = [
  {
    id: "brand-1",
    name: "Brand Colors",
    description: "Color palette and usage guidelines",
    icon: "🎨",
    color: "#FF3B30",
    isGeneric: false,
  },
  {
    id: "brand-2",
    name: "Typography",
    description: "Font selection and sizing",
    icon: "🔤",
    color: "#34C759",
    isGeneric: false,
  },
  {
    id: "brand-3",
    name: "Logo & Assets",
    description: "Logo usage and asset guidelines",
    icon: "🏷️",
    color: "#5856D6",
    isGeneric: false,
  },
  {
    id: "brand-4",
    name: "Brand Voice",
    description: "Tone, messaging, and brand personality",
    icon: "💬",
    color: "#FF2D55",
    isGeneric: false,
  },
]

// Sample Generic SOPs
export const SAMPLE_GENERIC_SOPS: SOP[] = [
  {
    id: "sop-g1",
    name: "SEO Best Practices",
    description: "Comprehensive guide to SEO optimization",
    type: "generic",
    category: "SEO & Keywords",
    linkType: "webpage",
    link: "https://example.com/sop/seo-best-practices",
    tags: ["seo", "keywords", "optimization"],
    createdBy: "Admin",
    createdAt: "2025-01-01",
    updatedAt: "2026-02-01",
    version: "2.1",
    isActive: true,
  },
  {
    id: "sop-g2",
    name: "Content Calendar Process",
    description: "Process for planning and scheduling content",
    type: "generic",
    category: "Content Guidelines",
    linkType: "google-drive",
    link: "https://drive.google.com/file/d/1example/view",
    tags: ["content", "planning", "calendar"],
    createdBy: "Admin",
    createdAt: "2025-01-15",
    updatedAt: "2026-02-01",
    version: "1.5",
    isActive: true,
  },
  {
    id: "sop-g3",
    name: "LinkedIn Posting Guidelines",
    description: "LinkedIn platform-specific posting standards",
    type: "generic",
    category: "Social Media",
    linkType: "webpage",
    link: "https://example.com/sop/linkedin-guidelines",
    tags: ["social", "linkedin", "posting"],
    createdBy: "Admin",
    createdAt: "2025-01-20",
    updatedAt: "2026-01-25",
    version: "3.0",
    isActive: true,
  },
]

// Sample Brand-Specific SOPs
export const SAMPLE_BRAND_SOPS: SOP[] = [
  {
    id: "sop-b1",
    name: "ABC Manufacturing Color Palette",
    description: "Brand colors and application guidelines",
    type: "brand-specific",
    category: "Brand Colors",
    linkType: "google-drive",
    link: "https://drive.google.com/file/d/1abc-colors/view",
    brandId: "brand-abc",
    tags: ["colors", "branding", "guidelines"],
    createdBy: "Designer",
    createdAt: "2025-12-01",
    updatedAt: "2026-01-15",
    version: "1.0",
    isActive: true,
  },
  {
    id: "sop-b2",
    name: "ABC Manufacturing Typography",
    description: "Font selection and sizing for brand",
    type: "brand-specific",
    category: "Typography",
    linkType: "webpage",
    link: "https://example.com/abc/typography",
    brandId: "brand-abc",
    tags: ["typography", "fonts", "branding"],
    createdBy: "Designer",
    createdAt: "2025-12-05",
    updatedAt: "2026-01-10",
    version: "2.0",
    isActive: true,
  },
]

// Exported arrays for use in approval workflows
export const GENERIC_SOPS = SAMPLE_GENERIC_SOPS
export const BRAND_SPECIFIC_SOPS = SAMPLE_BRAND_SOPS
