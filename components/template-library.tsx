"use client"

import React from "react"

import { useState } from "react"
import { Search, BookOpen, ExternalLink, FolderOpen, Globe, Zap, Eye, Code, Edit2, Download, Heart, Copy } from "lucide-react"

interface SOP {
  id: string
  name: string
  description: string
  category: "generic" | "brand-specific"
  type: "seo" | "content" | "social" | "analytics" | "colors" | "typography" | "logo" | "voice"
  link: string
  linkType: "google-drive" | "webpage" | "internal"
  lastUpdated: string
  author: string
  isRequired: boolean
}

interface ContentTemplate {
  id: string
  name: string
  description: string
  category: string
  content: string
  variables: string[]
  tags: string[]
  usage: number
  rating: number
  isFavorite: boolean
  author: string
}

interface ProcessPlaybook {
  id: string
  name: string
  description: string
  phase: string
  steps: { order: number; title: string; description: string; time: string }[]
  assignedRoles: string[]
  successCriteria: string[]
  commonIssues: { issue: string; solution: string }[]
}

export function TemplateLibrary({ clientId = "client-1" }: { clientId?: string }) {
  const [activeTab, setActiveTab] = useState<"generic" | "brand-specific" | "templates" | "playbooks" | "sop">("generic")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])

  // Generic SOPs - available to all clients
  const genericSOPs: SOP[] = [
    {
      id: "gen-1",
      name: "SEO Best Practices",
      description: "Comprehensive guide on SEO strategies, keyword research, and optimization techniques",
      category: "generic",
      type: "seo",
      link: "https://docs.google.com/document/d/1-generic-seo-guide",
      linkType: "google-drive",
      lastUpdated: "Jan 15, 2025",
      author: "SEO Team",
      isRequired: true,
    },
    {
      id: "gen-2",
      name: "Content Writing Guidelines",
      description: "Tone, style, and best practices for all content creation",
      category: "generic",
      type: "content",
      link: "https://docs.google.com/document/d/1-content-guidelines",
      linkType: "google-drive",
      lastUpdated: "Feb 1, 2025",
      author: "Content Team",
      isRequired: true,
    },
    {
      id: "gen-3",
      name: "Social Media Posting Standards",
      description: "Platform-specific guidelines for LinkedIn, Twitter, Instagram, and Facebook",
      category: "generic",
      type: "social",
      link: "https://example.com/social-media-standards",
      linkType: "webpage",
      lastUpdated: "Jan 20, 2025",
      author: "Social Media Team",
      isRequired: true,
    },
    {
      id: "gen-4",
      name: "Analytics & Reporting Framework",
      description: "How to track, measure, and report on marketing metrics",
      category: "generic",
      type: "analytics",
      link: "https://docs.google.com/document/d/1-analytics-framework",
      linkType: "google-drive",
      lastUpdated: "Jan 25, 2025",
      author: "Analytics Team",
      isRequired: false,
    },
  ]

  // Brand-specific SOPs - per client
  const brandSpecificSOPs: SOP[] = [
    {
      id: "brand-1",
      name: "Brand Color Palette",
      description: "Primary, secondary, and accent colors with HEX codes and usage guidelines",
      category: "brand-specific",
      type: "colors",
      link: "https://drive.google.com/drive/folders/1-brand-colors-abc",
      linkType: "google-drive",
      lastUpdated: "Dec 20, 2024",
      author: "Brand Manager",
      isRequired: true,
    },
    {
      id: "brand-2",
      name: "Typography & Font Library",
      description: "Approved fonts, sizes, weights, and line spacing for all touchpoints",
      category: "brand-specific",
      type: "typography",
      link: "https://docs.google.com/document/d/1-typography-guide",
      linkType: "google-drive",
      lastUpdated: "Dec 15, 2024",
      author: "Design Team",
      isRequired: true,
    },
    {
      id: "brand-3",
      name: "Logo & Asset Usage",
      description: "Logo variations, clear space, sizing rules, and approved asset folder",
      category: "brand-specific",
      type: "logo",
      link: "https://drive.google.com/drive/folders/1-brand-assets",
      linkType: "google-drive",
      lastUpdated: "Jan 10, 2025",
      author: "Brand Manager",
      isRequired: true,
    },
    {
      id: "brand-4",
      name: "Brand Voice & Messaging",
      description: "Brand personality, tone of voice, and key messaging pillars",
      category: "brand-specific",
      type: "voice",
      link: "https://example.com/brand-voice-guide",
      linkType: "webpage",
      lastUpdated: "Jan 5, 2025",
      author: "Marketing Director",
      isRequired: true,
    },
  ]

  const contentTemplates: ContentTemplate[] = []
  const processPlaybooks: ProcessPlaybook[] = []
  const sopDocumentation: any[] = []

  const displayedSOPs = activeTab === "generic" ? genericSOPs : brandSpecificSOPs
  const filteredSOPs = displayedSOPs
    .filter((sop) => sop.name.toLowerCase().includes(searchTerm.toLowerCase()) || sop.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((sop) => !selectedType || sop.type === selectedType)

  const typeColors: Record<string, string> = {
    seo: "bg-blue-100 text-blue-800",
    content: "bg-green-100 text-green-800",
    social: "bg-purple-100 text-purple-800",
    analytics: "bg-orange-100 text-orange-800",
    colors: "bg-pink-100 text-pink-800",
    typography: "bg-indigo-100 text-indigo-800",
    logo: "bg-yellow-100 text-yellow-800",
    voice: "bg-red-100 text-red-800",
  }

  const typeIcons: Record<string, React.ReactNode> = {
    seo: <Zap className="w-4 h-4" />,
    content: <BookOpen className="w-4 h-4" />,
    social: <Globe className="w-4 h-4" />,
    analytics: <Eye className="w-4 h-4" />,
    colors: <div className="w-4 h-4 rounded-full bg-current" />,
    typography: <Code className="w-4 h-4" />,
    logo: <FolderOpen className="w-4 h-4" />,
    voice: <BookOpen className="w-4 h-4" />,
  }

  const categories = [
    { id: "linkedin", name: "LinkedIn", color: "#0A66C2" },
    { id: "instagram", name: "Instagram", color: "#E1306C" },
    { id: "twitter", name: "Twitter", color: "#1DA1F2" },
    { id: "email", name: "Email", color: "#34A853" },
    { id: "blog", name: "Blog", color: "#EA4335" },
  ]

  const filteredTemplates = contentTemplates.filter(
    (template) =>
      (selectedCategory === null || template.category === selectedCategory) &&
      (searchTerm === "" ||
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Template Library & Process Docs</h1>
        <p className="text-sm text-[#86868B]">Reusable templates, playbooks, and standard operating procedures</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-[#E5E5E7]">
        <button
          onClick={() => setActiveTab("generic")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "generic" ? "border-[#2E7D32] text-[#2E7D32]" : "border-transparent text-[#86868B] hover:text-[#515154]"
          }`}
        >
          Generic SOPs
        </button>
        <button
          onClick={() => setActiveTab("brand-specific")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "brand-specific" ? "border-[#2E7D32] text-[#2E7D32]" : "border-transparent text-[#86868B] hover:text-[#515154]"
          }`}
        >
          Brand-Specific SOPs
        </button>
      </div>

      {/* SOP Cards Grid */}
      {activeTab === "generic" || activeTab === "brand-specific" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSOPs.map((sop) => (
            <div key={sop.id} className="border border-[#E5E5E7] rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
              {/* Header with Type Badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1D1D1F] text-sm">{sop.name}</h3>
                  <p className="text-xs text-[#86868B] mt-1">{sop.description}</p>
                </div>
                {sop.isRequired && <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">Required</span>}
              </div>

              {/* Type Badge */}
              <div className="mb-3">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${typeColors[sop.type] || "bg-gray-100 text-gray-800"}`}>
                  {typeIcons[sop.type]}
                  {sop.type.replace("-", " ").toUpperCase()}
                </span>
              </div>

              {/* Footer with Link and Metadata */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E7]">
                <div className="flex items-center gap-2 text-xs text-[#86868B]">
                  <span>{sop.linkType === "google-drive" ? "📁 Drive" : "🔗 Web"}</span>
                  <span>{sop.lastUpdated}</span>
                </div>
                <a
                  href={sop.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#007AFF] hover:text-[#0051C3] font-medium text-sm transition-colors"
                >
                  Open
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Empty State */}
      {filteredSOPs.length === 0 && (
        <div className="bg-[#F8F9FB] border border-dashed border-[#E5E5E7] rounded-lg p-12 text-center">
          <BookOpen className="w-12 h-12 text-[#D1D1D6] mx-auto mb-4" />
          <p className="text-[#86868B] font-medium">No SOPs found</p>
          <p className="text-sm text-[#86868B]">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
