"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from "@/lib/currencies";

interface CurrencySelectProps {
  value: string;
  onChange: (code: string) => void;
  className?: string;
  variant?: "inline" | "standalone" | "badge";
}

export function CurrencySelect({
  value,
  onChange,
  className = "",
  variant = "inline",
}: CurrencySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCurrency = SUPPORTED_CURRENCIES[value] || {
    code: value,
    symbol: getCurrencySymbol(value),
    name: value,
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const isInline = variant === "inline";
  const isBadge = variant === "badge";

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-1.5 font-mono font-bold transition duration-150 select-none focus:outline-none cursor-pointer ${
          isInline
            ? "h-full px-3 text-xs bg-white/[0.03] hover:bg-white/[0.08] text-white rounded-l-xl"
            : isBadge
            ? "px-2.5 py-1 rounded-full text-xs bg-white/[0.06] text-white border border-white/15 hover:border-white/30 hover:bg-white/[0.12] active:scale-95"
            : "h-10 px-3 rounded-xl bg-[#070a10] border border-white/10 hover:border-white/20 text-white text-xs"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-white font-black">{activeCurrency.code}</span>
          <span className="text-neutral-400">({activeCurrency.symbol})</span>
        </div>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : "text-neutral-400"
          }`}
        />
      </button>

      {/* Compact Popover: Short height (max-h-36 ~144px) so it sits neatly inside the card */}
      {isOpen && (
        <div
          className={`absolute ${
            isBadge ? "left-0 sm:left-auto sm:right-0" : "left-0"
          } top-full mt-1.5 z-[200] w-56 max-h-36 overflow-y-auto rounded-2xl glass-popover p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Select Currency
          </div>
          {Object.values(SUPPORTED_CURRENCIES).map((c) => {
            const isSelected = c.code === value;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onChange(c.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-mono text-left transition duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-white/[0.14] text-white font-bold border border-white/25 shadow-sm"
                    : "text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-white">{c.code}</span>
                  <span className="text-neutral-400">({c.symbol})</span>
                  <span className="text-[10px] text-neutral-500 truncate">{c.name}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-white shrink-0 ml-1.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
