"use client"

export const STORY_PHASES = [
  {
    id: "research",
    name: "Story Research",
    tagline: "Define the narrative roles",
    description: "Research and identify key narrative elements",
  },
  {
    id: "writing",
    name: "Story Writing",
    tagline: "Create the messages",
    description: "Craft compelling messaging and content",
  },
  {
    id: "design",
    name: "Story Design & Video",
    tagline: "Visualize the story",
    description: "Create visual content and video materials",
  },
  {
    id: "website",
    name: "Story Tech",
    tagline: "Anchor the story",
    description: "Build the digital home for your story",
  },
  {
    id: "distribution",
    name: "Story Distribution",
    tagline: "Spread the story",
    description: "Share your story across channels",
  },
  {
    id: "analytics",
    name: "Story Analytics",
    tagline: "Observe reality",
    description: "Track and measure story performance",
  },
  {
    id: "learning",
    name: "Story Learning",
    tagline: "Improve the story",
    description: "Learn and optimize based on results",
  },
]

export function getPhaseById(id: string) {
  return STORY_PHASES.find((phase) => phase.id === id)
}

export function getPhaseNameById(id: string) {
  return getPhaseById(id)?.name || ""
}

export function getPhaseTaglineById(id: string) {
  return getPhaseById(id)?.tagline || ""
}
