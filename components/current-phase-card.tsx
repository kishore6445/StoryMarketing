export function CurrentPhaseCard() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[#1D1D1F]">Current Phase: Story Writing</h2>
          <p className="text-sm text-[#86868B]">Crafting compelling narratives that resonate with your audience</p>
        </div>

        {/* Progress Items */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-2" />
            <div>
              <div className="text-sm font-medium text-[#1D1D1F]">What is being worked on</div>
              <div className="text-sm text-[#86868B] mt-1">Creating customer success stories and case studies</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF9500] mt-2" />
            <div>
              <div className="text-sm font-medium text-[#1D1D1F]">What is pending</div>
              <div className="text-sm text-[#86868B] mt-1">Final review and approval from client stakeholders</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#34C759] mt-2" />
            <div>
              <div className="text-sm font-medium text-[#1D1D1F]">What happens next</div>
              <div className="text-sm text-[#86868B] mt-1">Move to Story Design phase for visual content creation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
