import { TrendingUp, FileText, Users } from "lucide-react"

export function VisibilitySnapshot() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
      <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4">Visibility Snapshot</h3>

      <div className="space-y-4">
        {/* Content Published */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F5F5F7] flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#1D1D1F]" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-[#86868B]">Content this week</div>
            <div className="text-2xl font-semibold text-[#1D1D1F] mt-1">8</div>
          </div>
        </div>

        {/* Engagement */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#D1FADF] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-[#86868B]">Engagement</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-2xl font-semibold text-[#1D1D1F]">+24%</div>
              <div className="text-xs text-[#2E7D32]">↑</div>
            </div>
          </div>
        </div>

        {/* Leads Generated */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F5F5F7] flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-[#1D1D1F]" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-[#86868B]">Leads generated</div>
            <div className="text-2xl font-semibold text-[#1D1D1F] mt-1">42</div>
          </div>
        </div>
      </div>
    </div>
  )
}
