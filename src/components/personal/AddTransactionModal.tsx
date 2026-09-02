"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  TrendingDown,
  TrendingUp,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  Check,
  AlertCircle,
} from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currency: string;
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

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investments",
  "Gifts & Bonus",
  "Rental Income",
  "Other Income",
];

const PAYMENT_METHODS = [
  { id: "CARD", label: "Debit/Credit Card" },
  { id: "CASH", label: "Cash" },
  { id: "UPI", label: "UPI / PhonePe / GPay" },
  { id: "BANK_TRANSFER", label: "Bank Transfer" },
];

// Helper for dynamic local date YYYY-MM-DD
function getLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  currency,
}: AddTransactionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [date, setDate] = useState(() => getLocalDateString());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = getLocalDateString();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update date dynamically when modal opens
  useEffect(() => {
    if (isOpen) {
      setDate(getLocalDateString());
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const symbol = getCurrencySymbol(currency);
  const categories = type === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleQuickAdd = (increment: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + increment).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    // Strict future date check
    if (date > todayStr) {
      setError("Transactions cannot be recorded for future dates.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: numAmount,
          category,
          paymentMethod,
          date,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record transaction");
      }

      setAmount("");
      setNotes("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving transaction");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-[#12141a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-5">Log New Transaction</h2>

        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-[#090a0d] p-1 rounded-2xl border border-white/5 mb-6">
          <button
            type="button"
            onClick={() => {
              setType("EXPENSE");
              setCategory(EXPENSE_CATEGORIES[0]);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              type === "EXPENSE"
                ? "bg-rose-500 text-white shadow-sm font-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <TrendingDown className="h-4 w-4" />
            <span>Expense (Spent)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType("INCOME");
              setCategory(INCOME_CATEGORIES[0]);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              type === "INCOME"
                ? "bg-emerald-500 text-[#0b1410] shadow-sm font-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Income (Earned)</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-400 font-bold text-lg pointer-events-none">
                {symbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                autoFocus
                className="w-full bg-[#090a0d] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xl font-bold text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition font-mono"
              />
            </div>

            {/* Quick Increment pills */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-neutral-500 font-semibold">Quick add:</span>
              {[10, 25, 50, 100].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => handleQuickAdd(inc)}
                  className="px-2.5 py-1 text-[10px] font-bold bg-[#090a0d] hover:bg-white/5 border border-white/5 text-neutral-300 rounded-lg transition"
                >
                  +{symbol}{inc}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-emerald-400" />
              <span>Category</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#090a0d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 transition"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
              <span>Payment Mode</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-left transition ${
                    paymentMethod === method.id
                      ? "bg-emerald-500/10 border-emerald-500/60 text-emerald-400"
                      : "bg-[#090a0d] border-white/5 text-neutral-400 hover:text-white"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker (No future dates allowed) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span>Date</span>
              </label>
              <span className="text-[10px] text-neutral-500">Future dates disabled</span>
            </div>
            <input
              type="date"
              max={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#090a0d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 transition font-mono"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-emerald-400" />
              <span>Notes / Description (Optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dinner, Grocery run, Gas"
              className="w-full bg-[#090a0d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition"
            />
          </div>

          {/* Submit */}
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
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg ${
                type === "EXPENSE"
                  ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
                  : "btn-primary"
              }`}
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save {type === "EXPENSE" ? "Expense" : "Income"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
