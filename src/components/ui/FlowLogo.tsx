import React from "react";
import Image from "next/image";

interface FlowLogoProps {
  size?: number;
  className?: string;
}

export function FlowLogo({ size = 36, className = "" }: FlowLogoProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 flex items-center justify-center select-none ${className}`}
    >
      <Image
        src="/mascot.png"
        alt="FlowBudget Wealth Guardian Mascot"
        width={size * 2}
        height={size * 2}
        priority
        className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(251,146,60,0.25)] hover:scale-105 transition-transform duration-200"
      />
    </div>
  );
}
