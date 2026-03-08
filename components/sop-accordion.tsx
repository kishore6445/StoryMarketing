"use client"

import { useState } from "react"
import { ChevronDown, BookOpen, ExternalLink, CheckCircle2 } from "lucide-react"
import type { SOP } from "@/lib/sop-config"

interface SOPAccordionProps {
  sopIds: string[]
  allSOPs: SOP[]
  requiredAcknowledgement?: boolean
  onAcknowledge?: (sopId: string) => void
  acknowledgedSOPs?: string[]
}

export function SOPAccordion({
  sopIds,
  allSOPs,
  requiredAcknowledgement = false,
  onAcknowledge,
  acknowledgedSOPs = [],
}: SOPAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sops = allSOPs.filter((sop) => sopIds.includes(sop.id))
  const allAcknowledged = requiredAcknowledgement ? sops.every((sop) => acknowledgedSOPs.includes(sop.id)) : true

  if (sops.length === 0) return null

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#F8F9FB] border-b border-[#E5E5E7]">
        <BookOpen className="w-4 h-4 text-[#86868B]" />
        <span className="text-sm font-semibold text-[#1D1D1F]">Required Guidelines</span>
        {requiredAcknowledgement && (
          <span className={`ml-auto px-2 py-1 rounded text-xs font-medium ${
            allAcknowledged
              ? "bg-[#E8F5E9] text-[#2E7D32]"
              : "bg-[#FFF3E0] text-[#E65100]"
          }`}>
            {allAcknowledged ? "All acknowledged" : "Needs review"}
          </span>
        )}
      </div>

      {/* SOPs List */}
      <div className="space-y-1 p-2">
        {sops.map((sop) => {
          const isExpanded = expandedId === sop.id
          const isAcknowledged = acknowledgedSOPs.includes(sop.id)

          return (
            <div key={sop.id} className="border border-[#E5E5E7] rounded-lg overflow-hidden">
              {/* Accordion Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : sop.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F8F9FB] transition-colors text-left"
              >
                {/* Checkbox / Status */}
                {requiredAcknowledgement && (
                  <div className="flex-shrink-0">
                    {isAcknowledged ? (
                      <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#D1D1D6]" />
                    )}
                  </div>
                )}

                {/* SOP Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1D1D1F] text-sm">{sop.name}</p>
                  <p className="text-xs text-[#86868B] mt-0.5 line-clamp-1">{sop.description}</p>
                </div>

                {/* Type Badge */}
                <span className="flex-shrink-0 px-2 py-1 bg-[#E5E5E7] text-[#515154] rounded text-xs font-medium">
                  {sop.type.replace("-", " ")}
                </span>

                {/* Chevron */}
                <ChevronDown
                  className={`flex-shrink-0 w-4 h-4 text-[#86868B] transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="bg-[#F8F9FB] border-t border-[#E5E5E7] px-4 py-4 space-y-3">
                  <p className="text-sm text-[#515154] leading-relaxed">{sop.description}</p>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-3 text-xs text-[#86868B] pt-2 border-t border-[#E5E5E7]">
                    <span>Category: {sop.category.replace("-", " ")}</span>
                    <span>Type: {sop.type.replace("-", " ")}</span>
                    <span>Updated: {new Date(sop.lastUpdated).toLocaleDateString()}</span>
                  </div>

                  {/* Link */}
                  <div className="flex gap-2">
                    <a
                      href={sop.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-[#0071E3] hover:bg-[#0051C3] text-white rounded text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Guidelines
                    </a>

                    {requiredAcknowledgement && !isAcknowledged && onAcknowledge && (
                      <button
                        onClick={() => onAcknowledge(sop.id)}
                        className="px-3 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded text-xs font-medium transition-colors"
                      >
                        I've Reviewed
                      </button>
                    )}

                    {isAcknowledged && (
                      <div className="px-3 py-2 bg-[#E8F5E9] border border-[#2E7D32] rounded text-xs font-medium text-[#2E7D32] flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Acknowledged
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
