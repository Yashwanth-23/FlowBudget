"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface LiquidGlassDatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
}

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function LiquidGlassDatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Select date",
  className = "",
}: LiquidGlassDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse current date or fallback to today
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const initialDate = selectedDate || new Date();

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Update coords when opening or on resize/scroll
  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 288; // 18rem = 288px
      let left = rect.left;
      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - popoverWidth - 16;
      }
      if (left < 16) left = 16;

      let top = rect.bottom + 8;
      // If overflowing bottom of window, flip up
      if (top + 340 > window.innerHeight && rect.top > 340) {
        top = rect.top - 340 - 8;
      }

      setCoords({ top, left });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateCoords();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      window.addEventListener("resize", updateCoords);
      window.addEventListener("scroll", updateCoords, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Navigate months
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Generate calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const handleSelectDate = (year: number, month: number, day: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    if (min && dateStr < min) return;
    if (max && dateStr > max) return;

    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSetToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;
    onChange(todayStr);
    setViewYear(y);
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  const formatDisplay = (val: string) => {
    if (!val) return placeholder;
    const parts = val.split("-");
    if (parts.length !== 3) return val;
    const [y, m, d] = parts;
    const mNum = parseInt(m, 10) - 1;
    return `${MONTH_NAMES[mNum]?.slice(0, 3)} ${d}, ${y}`;
  };

  const today = new Date();
  const isCurrentToday = (d: number, m: number, y: number) =>
    today.getDate() === d && today.getMonth() === m && today.getFullYear() === y;

  const isSelected = (d: number, m: number, y: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === d &&
      selectedDate.getMonth() === m &&
      selectedDate.getFullYear() === y
    );
  };

  const isDisabled = (d: number, m: number, y: number) => {
    const str = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (min && str < min) return true;
    if (max && str > max) return true;
    return false;
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Date Trigger Pill (Liquid Glass) */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`glass-dock px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono font-medium transition duration-200 cursor-pointer shadow-sm group ${
          isOpen ? "text-emerald-400 border-emerald-500/50" : "text-neutral-200 hover:text-white"
        }`}
      >
        <CalendarIcon className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition duration-150" />
        <span>{formatDisplay(value)}</span>
      </button>

      {/* Floating Apple Liquid Glass Calendar Popover (Rendered via createPortal to body) */}
      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 999999,
            }}
            className="w-72 glass-popover rounded-2xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95),0_0_32px_rgba(16,185,129,0.25)] border border-white/20 animate-in fade-in zoom-in-95 duration-150 select-none"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">
                  {MONTH_NAMES[viewMonth]}
                </span>
                <span className="font-mono text-sm text-emerald-400 font-bold">
                  {viewYear}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
                  title="Previous Month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
                  title="Next Month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Previous Month trailing days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => {
                const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
                const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
                const prevYearVal = viewMonth === 0 ? viewYear - 1 : viewYear;
                const disabled = isDisabled(dayNum, prevMonthIdx, prevYearVal);
                return (
                  <button
                    key={`prev-${i}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectDate(prevYearVal, prevMonthIdx, dayNum)}
                    className={`h-8 w-8 rounded-xl text-xs font-mono flex items-center justify-center transition ${
                      disabled
                        ? "text-neutral-700 cursor-not-allowed"
                        : "text-neutral-600 hover:text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}

              {/* Current Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const selected = isSelected(dayNum, viewMonth, viewYear);
                const isToday = isCurrentToday(dayNum, viewMonth, viewYear);
                const disabled = isDisabled(dayNum, viewMonth, viewYear);

                return (
                  <button
                    key={`cur-${dayNum}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectDate(viewYear, viewMonth, dayNum)}
                    className={`h-8 w-8 rounded-xl text-xs font-mono font-semibold flex items-center justify-center relative transition duration-150 ${
                      disabled
                        ? "text-neutral-600 cursor-not-allowed opacity-40"
                        : selected
                        ? "bg-emerald-500 text-neutral-950 font-black shadow-lg shadow-emerald-500/40 scale-105"
                        : isToday
                        ? "text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/20"
                        : "text-neutral-200 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {dayNum}
                    {isToday && !selected && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Quick Controls */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs">
              <button
                type="button"
                onClick={handleClear}
                className="text-neutral-400 hover:text-rose-400 transition font-medium"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSetToday}
                className="text-emerald-400 hover:text-emerald-300 transition font-bold"
              >
                Today
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
