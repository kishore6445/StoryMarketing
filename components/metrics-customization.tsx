"use client"

import { useState } from "react"
import { Plus, Trash2, Edit2, X, Eye, BarChart3, TrendingUp, Target } from "lucide-react"

interface CustomMetric {
  id: string
  name: string
  unit: string
  description: string
  category: "engagement" | "reach" | "conversion" | "custom"
  isActive: boolean
  targetValue: number
  frequency: "daily" | "weekly" | "monthly"
}

interface MetricTemplate {
  id: string
  name: string
  description: string
  metrics: string[]
}

export function MetricsCustomization() {
  const [metrics, setMetrics] = useState<CustomMetric[]>([
    {
      id: "1",
      name: "Engagement Rate",
      unit: "%",
      description: "Percentage of audience that engages with content",
      category: "engagement",
      isActive: true,
      targetValue: 8,
      frequency: "daily",
    },
    {
      id: "2",
      name: "Reach",
      unit: "users",
      description: "Total number of unique users reached",
      category: "reach",
      isActive: true,
      targetValue: 250000,
      frequency: "daily",
    },
    {
      id: "3",
      name: "Conversion Rate",
      unit: "%",
      description: "Percentage of engaged users who convert",
      category: "conversion",
      isActive: true,
      targetValue: 3.5,
      frequency: "weekly",
    },
    {
      id: "4",
      name: "Cost Per Lead",
      unit: "$",
      description: "Average cost to acquire one lead",
      category: "conversion",
      isActive: true,
      targetValue: 45,
      frequency: "weekly",
    },
  ])

  const [templates] = useState<MetricTemplate[]>([
    {
      id: "t1",
      name: "Social Media Performance",
      description: "Standard metrics for social media campaigns",
      metrics: ["Engagement Rate", "Reach", "Impressions", "Followers"],
    },
    {
      id: "t2",
      name: "Email Marketing",
      description: "Key metrics for email campaigns",
      metrics: ["Open Rate", "Click Rate", "Conversion Rate", "List Growth"],
    },
    {
      id: "t3",
      name: "Sales Funnel",
      description: "Conversion metrics for sales process",
      metrics: ["Lead Generation", "Conversion Rate", "Customer Acquisition Cost", "Revenue"],
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<CustomMetric>>({
    name: "",
    unit: "",
    description: "",
    category: "custom",
    targetValue: 0,
    frequency: "weekly",
  })

  const handleAddMetric = () => {
    if (!formData.name || !formData.unit) return

    if (editingId) {
      setMetrics(
        metrics.map((m) =>
          m.id === editingId ? { ...m, ...formData } : m
        )
      )
      setEditingId(null)
    } else {
      const newMetric: CustomMetric = {
        id: Date.now().toString(),
        name: formData.name || "",
        unit: formData.unit || "",
        description: formData.description || "",
        category: formData.category || "custom",
        isActive: true,
        targetValue: formData.targetValue || 0,
        frequency: formData.frequency || "weekly",
      }
      setMetrics([...metrics, newMetric])
    }

    setFormData({ name: "", unit: "", description: "", category: "custom", targetValue: 0, frequency: "weekly" })
    setShowAddForm(false)
  }

  const handleDeleteMetric = (id: string) => {
    setMetrics(metrics.filter((m) => m.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setMetrics(metrics.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m)))
  }

  const handleEditMetric = (metric: CustomMetric) => {
    setFormData(metric)
    setEditingId(metric.id)
    setShowAddForm(true)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "engagement":
        return "bg-[#E3F2FD] text-[#0051C3]"
      case "reach":
        return "bg-[#F3E5F5] text-[#5E35B1]"
      case "conversion":
        return "bg-[#E8F5E9] text-[#2E7D32]"
      default:
        return "bg-[#F5F5F7] text-[#515154]"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "engagement":
        return <Eye className="w-4 h-4" />
      case "reach":
        return <TrendingUp className="w-4 h-4" />
      case "conversion":
        return <Target className="w-4 h-4" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Metrics Customization</h1>
        <p className="text-sm text-[#86868B]">Define and manage custom metrics for your campaigns</p>
      </div>

      {/* Quick Templates */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-[#1D1D1F]">Quick Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg border border-[#E5E5E7] p-4 hover:border-[#2E7D32] transition-colors cursor-pointer group">
              <h3 className="text-sm font-semibold text-[#1D1D1F] mb-1">{template.name}</h3>
              <p className="text-xs text-[#86868B] mb-3">{template.description}</p>
              <div className="space-y-1 mb-3">
                {template.metrics.slice(0, 3).map((metric, idx) => (
                  <div key={idx} className="text-xs text-[#515154]">• {metric}</div>
                ))}
                {template.metrics.length > 3 && <div className="text-xs text-[#86868B]">+{template.metrics.length - 3} more</div>}
              </div>
              <button className="w-full px-3 py-1.5 rounded text-xs font-medium bg-[#2E7D32] text-white hover:bg-[#1B5E20] transition-colors opacity-0 group-hover:opacity-100">
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Metric Button */}
      {!showAddForm && (
        <button
          onClick={() => {
            setFormData({ name: "", unit: "", description: "", category: "custom", targetValue: 0, frequency: "weekly" })
            setEditingId(null)
            setShowAddForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] transition-colors text-white text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Custom Metric
        </button>
      )}

      {/* Add/Edit Metric Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1D1D1F]">
              {editingId ? "Edit Metric" : "Add Custom Metric"}
            </h2>
            <button
              onClick={() => {
                setShowAddForm(false)
                setEditingId(null)
              }}
              className="text-[#86868B] hover:text-[#1D1D1F] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Metric Name</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Video Completion Rate"
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Unit</label>
                <input
                  type="text"
                  value={formData.unit || ""}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., % or users"
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Description</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this metric measure?"
                rows={3}
                className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Category</label>
                <select
                  value={formData.category || "custom"}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
                >
                  <option value="engagement">Engagement</option>
                  <option value="reach">Reach</option>
                  <option value="conversion">Conversion</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Target Value</label>
                <input
                  type="number"
                  value={formData.targetValue || ""}
                  onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Frequency</label>
                <select
                  value={formData.frequency || "weekly"}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddMetric}
                className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg text-sm font-medium hover:bg-[#1B5E20] transition-colors"
              >
                {editingId ? "Update Metric" : "Add Metric"}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingId(null)
                }}
                className="px-4 py-2 bg-[#F5F5F7] text-[#1D1D1F] rounded-lg text-sm font-medium hover:bg-[#EBEBED] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics List */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-[#1D1D1F]">Current Metrics ({metrics.length})</h2>

        <div className="space-y-2">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-white rounded-lg border border-[#E5E5E7] p-4 hover:border-[#D1D1D6] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-[#1D1D1F]">
                      {metric.name}
                      <span className="text-xs text-[#86868B] font-normal ml-2">({metric.unit})</span>
                    </h3>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(metric.category)}`}>
                      {getCategoryIcon(metric.category)}
                      {metric.category.charAt(0).toUpperCase() + metric.category.slice(1)}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${metric.isActive ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#F5F5F7] text-[#86868B]"}`}>
                      {metric.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>

                  <p className="text-sm text-[#515154] mb-2">{metric.description}</p>

                  <div className="flex items-center gap-6 text-xs text-[#86868B]">
                    <span>Target: {metric.targetValue}{metric.unit}</span>
                    <span>Frequency: {metric.frequency.charAt(0).toUpperCase() + metric.frequency.slice(1)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEditMetric(metric)}
                    className="text-[#86868B] hover:text-[#007AFF] transition-colors p-2 hover:bg-[#F5F5F7] rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMetric(metric.id)}
                    className="text-[#86868B] hover:text-[#FF3B30] transition-colors p-2 hover:bg-[#F5F5F7] rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button className="px-6 py-3 bg-[#2E7D32] text-white rounded-lg font-medium hover:bg-[#1B5E20] transition-colors">
          Save Metrics Configuration
        </button>
        <button className="px-6 py-3 bg-[#F5F5F7] text-[#1D1D1F] rounded-lg font-medium hover:bg-[#EBEBED] transition-colors">
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}
