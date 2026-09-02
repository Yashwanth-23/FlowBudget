"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface OptionItem {
  value: string;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: (string | OptionItem)[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className = "",
  size = "md",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options
  const normalizedOptions: OptionItem[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: "h-9 px-2.5 text-xs",
    md: "h-11 sm:h-12 px-3 text-xs sm:text-sm",
    lg: "h-12 sm:h-14 px-4 text-sm sm:text-base",
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full ${sizeClasses[size]} rounded-xl bg-[#090a0d] border ${
          isOpen ? "border-emerald-500/60 ring-1 ring-emerald-500/30" : "border-white/10 hover:border-white/20"
        } flex items-center justify-between text-left text-white transition duration-150 select-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 text-neutral-400 border border-white/10">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-emerald-400" : ""
          }`}
        />
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[120] max-h-60 overflow-y-auto rounded-2xl bg-[#12141a] border border-white/15 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in duration-150">
          {normalizedOptions.length === 0 ? (
            <div className="p-3 text-center text-xs text-neutral-500">No options available</div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm text-left transition duration-150 ${
                    isSelected
                      ? "bg-emerald-500/10 text-emerald-400 font-bold"
                      : "text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && (
                      <span className="shrink-0 px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/5 text-neutral-400 border border-white/10">
                        {opt.badge}
                      </span>
                    )}
                  </div>

                  {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
