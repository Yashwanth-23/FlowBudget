"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Calendar, Sparkles, Check } from "lucide-react";

interface MonthYearPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string; // "YYYY-MM"
  onSelectMonth: (monthYear: string) => void;
}

const MONTH_NAMES = [
  { num: "01", short: "Jan", full: "January" },
  { num: "02", short: "Feb", full: "February" },
  { num: "03", short: "Mar", full: "March" },
  { num: "04", short: "Apr", full: "April" },
  { num: "05", short: "May", full: "May" },
  { num: "06", short: "Jun", full: "June" },
  { num: "07", short: "Jul", full: "July" },
  { num: "08", short: "Aug", full: "August" },
  { num: "09", short: "Sep", full: "September" },
  { num: "10", short: "Oct", full: "October" },
  { num: "11", short: "Nov", full: "November" },
  { num: "12", short: "Dec", full: "December" },
];

export function MonthYearPickerModal({
  isOpen,
  onClose,
  currentMonth,
  onSelectMonth,
}: MonthYearPickerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const y = parseInt(currentMonth.split("-")[0]);
    return isNaN(y) ? new Date().getFullYear() : y;
  });

  const currentYearNow = new Date().getFullYear();
  const currentMonthNow = String(new Date().getMonth() + 1).padStart(2, "0");
  const actualCurrentMonthYear = `${currentYearNow}-${currentMonthNow}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const y = parseInt(currentMonth.split("-")[0]);
      if (!isNaN(y)) setSelectedYear(y);
    }
  }, [isOpen, currentMonth]);

  if (!isOpen || !mounted) return null;

  const [activeYearStr, activeMonthStr] = currentMonth.split("-");

  const handlePickMonth = (monthNum: string) => {
    const newMonthYear = `${selectedYear}-${monthNum}`;
    onSelectMonth(newMonthYear);
    onClose();
  };

  const handleJumpToNow = () => {
    onSelectMonth(actualCurrentMonthYear);
    onClose();
  };

  // Quick years around current
  const quickYears = [selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1, selectedYear + 2];

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md bg-[#12141a] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Select Month & Year</h2>
            <p className="text-xs text-neutral-400">Quickly jump to any ledger period</p>
          </div>
        </div>

        {/* Year Selector */}
        <div className="bg-[#090a0d] border border-white/[0.08] rounded-2xl p-2.5 mb-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedYear((y) => y - 1)}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition"
              title="Previous Year"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-lg font-bold font-mono text-white">
              {selectedYear}
            </span>

            <button
              type="button"
              onClick={() => setSelectedYear((y) => y + 1)}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition"
              title="Next Year"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Year Pills */}
          <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-white/[0.04]">
            {quickYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition ${
                  selectedYear === yr
                    ? "bg-white/10 text-white font-bold border border-white/15"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* 12 Months Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5">
          {MONTH_NAMES.map((m) => {
            const isSelected =
              String(selectedYear) === activeYearStr && m.num === activeMonthStr;
            const isCurrentMonthNow =
              String(selectedYear) === String(currentYearNow) && m.num === currentMonthNow;

            return (
              <button
                key={m.num}
                type="button"
                onClick={() => handlePickMonth(m.num)}
                className={`p-3 rounded-2xl border text-center transition duration-150 flex flex-col items-center gap-0.5 active:scale-95 ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-md shadow-emerald-500/10"
                    : "bg-[#090a0d] border-white/[0.06] text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <span className="text-xs font-bold">{m.short}</span>
                <span className="text-[10px] text-neutral-500 font-mono">{m.num}</span>
                {isSelected && <Check className="h-3 w-3 text-emerald-400 mt-0.5" />}
                {!isSelected && isCurrentMonthNow && (
                  <span className="text-[9px] text-emerald-400 font-semibold mt-0.5">Now</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Actions / Jump to current */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={handleJumpToNow}
            className="flex-1 py-2 px-3 bg-[#090a0d] hover:bg-white/[0.06] border border-white/[0.08] text-neutral-300 hover:text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Current Month ({new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })})</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
