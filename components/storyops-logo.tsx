import React from 'react'

export function StoryOPsLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Icon - Flat solid S in deep charcoal circle */}
      <div className="relative w-[30px] h-[30px] flex items-center justify-center flex-shrink-0">
        <div className="w-[30px] h-[30px] rounded-full bg-[#1C1C1E] flex items-center justify-center">
          <span className="text-[#F5F5F7] font-semibold text-sm tracking-tight">S</span>
        </div>
      </div>
      {/* Text Logo */}
      <div className="flex flex-col gap-0.25">
        <div className="font-semibold text-base tracking-tight text-[#1D1D1F] leading-tight">
          Story<span className="text-[#D17A54]">OPs</span>
        </div>
        <div className="text-[0.65rem] text-[#A1A1A6] font-normal tracking-[0.01em] leading-tight">
          Story. System. Scale.
        </div>
      </div>
    </div>
  )
}

export function StoryOPsLogoCompact() {
  return (
    <div className="relative w-[30px] h-[30px] flex items-center justify-center flex-shrink-0">
      <div className="w-[30px] h-[30px] rounded-full bg-[#1C1C1E] flex items-center justify-center">
        <span className="text-[#F5F5F7] font-semibold text-sm tracking-tight">S</span>
      </div>
    </div>
  )
}
