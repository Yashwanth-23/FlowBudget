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
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CurrencySelect } from "@/components/ui/CurrencySelect";
import { LiquidGlassDatePicker } from "@/components/ui/LiquidGlassDatePicker";

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
  const [txCurrency, setTxCurrency] = useState(currency || "USD");
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

  useEffect(() => {
    if (isOpen) {
      setDate(getLocalDateString());
      setTxCurrency(currency || "USD");
      setError(null);
    }
  }, [isOpen, currency]);

  // Close on Escape key press
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

  const symbol = getCurrencySymbol(txCurrency);
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
          currency: txCurrency,
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#090d16]/40 backdrop-blur-xl overflow-y-auto cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-5">Log New Transaction</h2>

        {/* Type Toggle - Apple iOS Clean Segmented Control */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#0a0c10] p-1.5 rounded-2xl border border-white/[0.08] mb-6">
          <button
            type="button"
            onClick={() => {
              setType("EXPENSE");
              setCategory(EXPENSE_CATEGORIES[0]);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              type === "EXPENSE"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <TrendingDown className="h-4 w-4 text-rose-400" />
            <span>Expense (Spent)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType("INCOME");
              setCategory(INCOME_CATEGORIES[0]);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              type === "INCOME"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <TrendingUp className="h-4 w-4 text-emerald-400" />
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
          {/* Amount with Integrated Currency Selector (No overflow-hidden to allow dropdown to pop out!) */}
          <div>
            <div className="flex items-center justify-between h-5 mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Amount & Currency
              </label>
              <span className="text-[10px] text-neutral-500 font-mono">Select currency</span>
            </div>
            <div className="flex items-center h-12 rounded-xl bg-[#090a0d] border border-white/10 focus-within:border-emerald-500/60 transition relative">
              <CurrencySelect
                value={txCurrency}
                onChange={setTxCurrency}
                variant="inline"
              />
              <div className="h-6 w-[1px] bg-white/10 shrink-0" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                autoFocus
                className="h-full flex-1 bg-transparent px-3 text-base font-bold font-mono text-white placeholder-neutral-600 focus:outline-none"
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

          {/* Category with Premium CustomSelect */}
          <div>
            <div className="flex items-center justify-between h-5 mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-emerald-400" />
                <span>Category</span>
              </label>
              <span className="text-[10px] text-neutral-500">Expense classification</span>
            </div>
            <CustomSelect
              options={categories}
              value={category}
              onChange={setCategory}
              size="md"
            />
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
            <div className="flex items-center justify-between h-5 mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span>Date</span>
              </label>
              <span className="text-[10px] text-neutral-500">Future dates disabled</span>
            </div>
            <LiquidGlassDatePicker
              value={date}
              onChange={setDate}
              max={todayStr}
              className="w-full"
            />
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between h-5 mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-emerald-400" />
                <span>Notes / Description (Optional)</span>
              </label>
              <span className="text-[10px] text-neutral-500">Memo</span>
            </div>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dinner with team, Grocery run, Gas"
              className="w-full h-12 bg-[#090a0d] border border-white/10 rounded-xl px-3.5 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl text-xs sm:text-sm font-bold bg-[#090a0d] border border-white/5 text-neutral-300 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 h-12 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-lg ${
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
