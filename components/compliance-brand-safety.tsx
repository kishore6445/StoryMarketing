"use client"

import { useState } from "react"
import { Check, Plus, Trash2, AlertCircle, Shield, Eye } from "lucide-react"

interface ApprovalStep {
  id: string
  name: string
  role: string
  order: number
  required: boolean
  skipIfCompliance: boolean
}

interface ComplianceRule {
  id: string
  name: string
  description: string
  category: "brand" | "legal" | "content" | "platform"
  severity: "critical" | "high" | "medium" | "low"
  regex?: string
  examples: string[]
}

interface AuditEntry {
  id: string
  action: string
  user: string
  timestamp: Date
  details: string
  status: "success" | "warning" | "error"
}

interface ComplianceBrandSafetyProps {
  clientId?: string
  clientName?: string
}

export function ComplianceBrandSafety({ clientId = "client-1", clientName = "ABC Client" }: ComplianceBrandSafetyProps) {
  const [activeTab, setActiveTab] = useState<"chains" | "rules" | "audit" | "checklist">("chains")
  const [approvalChains, setApprovalChains] = useState<ApprovalStep[]>([
    { id: "1", name: "Content Review", role: "Content Manager", order: 1, required: true, skipIfCompliance: false },
    { id: "2", name: "Brand Check", role: "Brand Manager", order: 2, required: true, skipIfCompliance: false },
    { id: "3", name: "Compliance Review", role: "Legal/Compliance", order: 3, required: true, skipIfCompliance: false },
    { id: "4", name: "Client Approval", role: "Client", order: 4, required: false, skipIfCompliance: true },
  ])

  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([
    {
      id: "1",
      name: "No Sensitive Language",
      description: "Flag posts containing sensitive terms for manual review",
      category: "brand",
      severity: "high",
      examples: ["Racist terms", "Offensive slurs"],
    },
    {
      id: "2",
      name: "Financial Disclaimer Required",
      description: "Posts about investments must include required disclaimers",
      category: "legal",
      severity: "critical",
      regex: "invest|return|profit|guarantee",
      examples: ["We guarantee 20% returns", "Invest now for profits"],
    },
    {
      id: "3",
      name: "Healthcare Claims",
      description: "Medical/health claims need regulatory review",
      category: "legal",
      severity: "critical",
      regex: "cure|treat|prevent|disease",
      examples: ["This will cure your headache"],
    },
    {
      id: "4",
      name: "Brand Logo Usage",
      description: "Only approved logo versions can be used",
      category: "brand",
      severity: "medium",
      examples: ["Logo must be on white background", "Minimum size 100px"],
    },
    {
      id: "5",
      name: "Platform Policy Violations",
      description: "Content violating platform policies will be blocked",
      category: "platform",
      severity: "critical",
      examples: ["Misleading claims", "Engagement bait"],
    },
    {
      id: "6",
      name: "Competitor Mentions",
      description: "Flag posts mentioning competitors for review",
      category: "brand",
      severity: "medium",
      regex: "competitor|rival|alternative",
      examples: ["Better than XYZ", "Unlike our competitors"],
    },
  ])

  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    {
      id: "1",
      action: "Post Submitted for Review",
      user: "Sarah Chen",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      details: "LinkedIn post about company updates",
      status: "success",
    },
    {
      id: "2",
      action: "Compliance Check Failed",
      user: "System",
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
      details: "Financial claim without disclaimer detected",
      status: "error",
    },
    {
      id: "3",
      action: "Brand Safety Review Completed",
      user: "Alex Rodriguez",
      timestamp: new Date(Date.now() - 1000 * 60 * 1),
      details: "Content approved - matches brand guidelines",
      status: "success",
    },
    {
      id: "4",
      action: "Post Published",
      user: "System",
      timestamp: new Date(),
      details: "Content published to all approved channels",
      status: "success",
    },
  ])

  const [complianceChecklist] = useState([
    { id: "1", item: "Brand voice guidelines followed", completed: true },
    { id: "2", item: "No prohibited language used", completed: true },
    { id: "3", item: "Legal disclaimers included where needed", completed: false },
    { id: "4", item: "Links verified and active", completed: true },
    { id: "5", item: "Images have alt text", completed: true },
    { id: "6", item: "No competitor mentions without approval", completed: true },
    { id: "7", item: "Hashtags compliant with platform policies", completed: false },
    { id: "8", item: "CTA is clear and non-misleading", completed: true },
  ])

  const [newStep, setNewStep] = useState({ name: "", role: "" })
  const [newRule, setNewRule] = useState({ name: "", category: "brand" as const })

  const handleAddApprovalStep = () => {
    if (newStep.name && newStep.role) {
      setApprovalChains([
        ...approvalChains,
        {
          id: Date.now().toString(),
          name: newStep.name,
          role: newStep.role,
          order: approvalChains.length + 1,
          required: true,
          skipIfCompliance: false,
        },
      ])
      setNewStep({ name: "", role: "" })
    }
  }

  const handleDeleteStep = (id: string) => {
    setApprovalChains(approvalChains.filter((step) => step.id !== id))
  }

  const handleDeleteRule = (id: string) => {
    setComplianceRules(complianceRules.filter((rule) => rule.id !== id))
  }

  const completionRate = Math.round(
    (complianceChecklist.filter((item) => item.completed).length / complianceChecklist.length) * 100
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Compliance & Brand Safety</h1>
        <p className="text-sm text-[#86868B]">Manage approval chains, compliance rules, and brand safety checks for {clientName}</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-[#E5E5E7] overflow-x-auto">
        {[
          { id: "chains", label: "Approval Chains" },
          { id: "rules", label: "Compliance Rules" },
          { id: "checklist", label: "Safety Checklist" },
          { id: "audit", label: "Audit Trail" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-[#2E7D32] text-[#2E7D32]"
                : "border-transparent text-[#86868B] hover:text-[#515154]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Approval Chains */}
      {activeTab === "chains" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
            <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Approval Workflow</h2>

            <div className="space-y-3 mb-6">
              {approvalChains.map((step, index) => (
                <div key={step.id} className="flex items-center gap-4 p-4 bg-[#F8F9FB] rounded-lg border border-[#E5E5E7]">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2E7D32] text-white text-sm font-bold">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-[#1D1D1F]">{step.name}</p>
                    <p className="text-sm text-[#86868B]">Role: {step.role}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {step.required && (
                      <span className="px-2 py-1 bg-[#FFEBEE] text-[#C62828] rounded text-xs font-medium">
                        Required
                      </span>
                    )}
                    {step.skipIfCompliance && (
                      <span className="px-2 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded text-xs font-medium">
                        Skip if Pass
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteStep(step.id)}
                      className="p-2 hover:bg-[#EBEBED] rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-[#FF3B30]" />
                    </button>
                  </div>

                  {index < approvalChains.length - 1 && (
                    <div className="absolute left-16 w-0.5 h-12 bg-[#E5E5E7] -my-6" />
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-[#E5E5E7] pt-4">
              <h3 className="text-sm font-semibold text-[#1D1D1F] mb-3">Add New Approval Step</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Step name (e.g., Legal Review)"
                  value={newStep.name}
                  onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
                  className="flex-1 px-3 py-2 border border-[#E5E5E7] rounded-lg text-sm focus:outline-none focus:border-[#2E7D32]"
                />
                <input
                  type="text"
                  placeholder="Role (e.g., Lawyer)"
                  value={newStep.role}
                  onChange={(e) => setNewStep({ ...newStep, role: e.target.value })}
                  className="flex-1 px-3 py-2 border border-[#E5E5E7] rounded-lg text-sm focus:outline-none focus:border-[#2E7D32]"
                />
                <button
                  onClick={handleAddApprovalStep}
                  className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg font-medium text-sm hover:bg-[#1B5E20] transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Compliance Rules */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceRules.map((rule) => (
              <div key={rule.id} className="bg-white border border-[#E5E5E7] rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-[#1D1D1F] text-sm">{rule.name}</h3>
                  <button onClick={() => handleDeleteRule(rule.id)} className="p-1 hover:bg-[#F5F5F7] rounded">
                    <Trash2 className="w-4 h-4 text-[#FF3B30]" />
                  </button>
                </div>

                <p className="text-xs text-[#86868B] mb-2">{rule.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      rule.severity === "critical"
                        ? "bg-[#FFEBEE] text-[#C62828]"
                        : rule.severity === "high"
                          ? "bg-[#FFF3E0] text-[#E65100]"
                          : rule.severity === "medium"
                            ? "bg-[#FFF8E1] text-[#9E5610]"
                            : "bg-[#E8F5E9] text-[#2E7D32]"
                    }`}
                  >
                    {rule.severity.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded text-xs font-medium capitalize">
                    {rule.category}
                  </span>
                </div>

                <div className="text-xs text-[#86868B]">
                  <p className="font-medium mb-1">Examples:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {rule.examples.slice(0, 2).map((example, idx) => (
                      <li key={idx} className="text-[11px]">
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Safety Checklist */}
      {activeTab === "checklist" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-base font-semibold text-[#1D1D1F]">Pre-Publication Safety Checklist</h2>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#2E7D32]">{completionRate}%</p>
                <p className="text-xs text-[#86868B]">Complete</p>
              </div>
            </div>

            <div className="w-full h-2 bg-[#E5E5E7] rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-[#2E7D32] rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>

            <div className="space-y-2">
              {complianceChecklist.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-[#F8F9FB] rounded-lg border border-[#E5E5E7]">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      item.completed
                        ? "bg-[#2E7D32] border-[#2E7D32]"
                        : "border-[#D1D1D6]"
                    }`}
                  >
                    {item.completed && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${item.completed ? "text-[#86868B] line-through" : "text-[#1D1D1F]"}`}>
                    {item.item}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-[#E8F5E9] border border-[#C8E6C9] rounded-lg flex gap-3">
              <Shield className="w-5 h-5 text-[#2E7D32] flex-shrink-0" />
              <div>
                <p className="font-medium text-[#2E7D32] text-sm">All compliance checks passing</p>
                <p className="text-xs text-[#1B5E20] mt-1">Content is safe to publish pending final approvals</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Audit Trail */}
      {activeTab === "audit" && (
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
          <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Audit Log</h2>

          <div className="space-y-3">
            {auditLog.map((entry) => (
              <div key={entry.id} className="flex gap-4 p-4 bg-[#F8F9FB] rounded-lg border border-[#E5E5E7]">
                <div className="flex-shrink-0">
                  {entry.status === "success" && (
                    <div className="w-2 h-2 rounded-full bg-[#34C759] mt-2" />
                  )}
                  {entry.status === "error" && (
                    <div className="w-2 h-2 rounded-full bg-[#FF3B30] mt-2" />
                  )}
                  {entry.status === "warning" && (
                    <div className="w-2 h-2 rounded-full bg-[#FFB547] mt-2" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#1D1D1F] text-sm">{entry.action}</p>
                      <p className="text-xs text-[#86868B]">{entry.details}</p>
                    </div>
                    {entry.status === "error" && <AlertCircle className="w-4 h-4 text-[#FF3B30] flex-shrink-0" />}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-[#86868B]">
                    <span>{entry.user}</span>
                    <span>{entry.timestamp.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
