"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Target, Check, AlertCircle } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currency: string;
  currentMonth: string;
  existingBudgets: { id: string; category: string; monthlyLimit: number }[];
}

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Groceries",
  "Transportation",
  "Housing & Rent",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Health & Fitness",
  "Travel",
  "Other",
];

export function BudgetModal({
  isOpen,
  onClose,
  onSuccess,
  currency,
  currentMonth,
  existingBudgets,
}: BudgetModalProps) {
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const symbol = getCurrencySymbol(currency);

  const handleCategoryChange = (selectedCat: string) => {
    setCategory(selectedCat);
    const existing = existingBudgets.find((b) => b.category === selectedCat);
    if (existing) {
      setMonthlyLimit(existing.monthlyLimit.toString());
    } else {
      setMonthlyLimit("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const limitNum = parseFloat(monthlyLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      setError("Please enter a valid monthly limit");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          monthlyLimit: limitNum,
          monthYear: currentMonth,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to set budget");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving budget");
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#090d16]/40 backdrop-blur-xl overflow-y-auto cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#12141a] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative my-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center font-bold">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Category Budget Cap</h2>
            <p className="text-xs text-neutral-400">Target for {currentMonth}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Select Category
            </label>
            <CustomSelect
              options={EXPENSE_CATEGORIES}
              value={category}
              onChange={handleCategoryChange}
              size="md"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Monthly Limit ({currency})
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-400 font-bold text-base pointer-events-none">
                {symbol}
              </span>
              <input
                type="number"
                step="1"
                min="1"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                placeholder="e.g. 500"
                required
                className="w-full bg-[#090a0d] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-lg font-bold text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500/60 transition font-mono"
              />
            </div>
            <p className="text-[10px] text-neutral-500 mt-1">
              Visual alerts will trigger when spending reaches 80% and 100% of this cap.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-neutral-500">Presets:</span>
            {[100, 250, 500, 1000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setMonthlyLimit(val.toString())}
                className="px-2 py-0.5 text-[11px] font-bold bg-[#090a0d] hover:bg-white/5 border border-white/5 text-neutral-300 rounded-lg transition"
              >
                {symbol}{val}
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#090a0d] border border-white/5 text-neutral-300 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold btn-primary flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-[#04130c] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Set Budget</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
