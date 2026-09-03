"use client";

import React from "react";

export function FluidAuroraBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Cloud 1: Primary Upper-Left Morphing Aurora (Drifts through Nav & Header across Emerald, Cyan, Indigo, Rose, Amber) */}
      <div
        className="aurora-cloud-1 absolute -top-[20%] left-[5%] w-[850px] h-[650px] rounded-full opacity-85"
        style={{
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(6, 182, 212, 0.22) 55%, transparent 80%)",
        }}
      />

      {/* Cloud 2: Upper-Right Organic Cloud (Spreads across Coral, Amber, Mint, Sky Blue, Violet) */}
      <div
        className="aurora-cloud-2 absolute -top-[15%] -right-[10%] w-[900px] h-[750px] rounded-full opacity-85"
        style={{
          background:
            "radial-gradient(circle, rgba(244, 63, 94, 0.32) 0%, rgba(245, 158, 11, 0.24) 55%, transparent 80%)",
        }}
      />

      {/* Cloud 3: Center Mid-Screen Fluid Nebula (Directly beneath main glass cards, drifting between Sky Cyan, Violet, Rose, Sunny Gold) */}
      <div
        className="aurora-cloud-3 absolute top-[25%] left-[20%] w-[820px] h-[620px] rounded-full opacity-80"
        style={{
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.32) 0%, rgba(139, 92, 246, 0.25) 55%, transparent 80%)",
        }}
      />

      {/* Cloud 4: Deep Right-Side Violet & Magenta Spreading Cloud */}
      <div
        className="aurora-cloud-4 absolute top-[45%] -right-[15%] w-[850px] h-[850px] rounded-full opacity-75"
        style={{
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.30) 0%, rgba(236, 72, 153, 0.22) 60%, transparent 80%)",
        }}
      />

      {/* Cloud 5: Lower-Left Warm Amber, Gold & Coral Liquid Cloud */}
      <div
        className="aurora-cloud-5 absolute top-[60%] -left-[15%] w-[900px] h-[900px] rounded-full opacity-80"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.28) 0%, rgba(239, 68, 68, 0.22) 55%, transparent 80%)",
        }}
      />
    </div>
  );
}
