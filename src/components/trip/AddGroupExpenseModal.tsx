"use client";

import React, { useState } from "react";
import { X, Receipt, Check, Users, User, AlertCircle, PlusCircle } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";

interface AddGroupExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currency: string;
  groupId: string;
  members: { id: string; userId: string; username: string }[];
  currentUserId: string;
}

const TRIP_CATEGORIES = [
  "Food & Drinks",
  "Accommodation",
  "Transportation & Gas",
  "Activities & Tickets",
  "Groceries & Snacks",
  "Shopping & Souvenirs",
  "General / Other",
];

export function AddGroupExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  currency,
  groupId,
  members,
  currentUserId,
}: AddGroupExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(TRIP_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Payer Mode: SINGLE or MULTIPLE
  const [payerMode, setPayerMode] = useState<"SINGLE" | "MULTIPLE">("SINGLE");
  const [singlePaidById, setSinglePaidById] = useState(currentUserId);
  const [customPayers, setCustomPayers] = useState<{ [userId: string]: string }>({});

  // Split Mode: EQUAL or CUSTOM
  const [splitMode, setSplitMode] = useState<"EQUAL" | "CUSTOM">("EQUAL");
  const [selectedSplitUserIds, setSelectedSplitUserIds] = useState<string[]>(() =>
    members.map((m) => m.userId)
  );
  const [customSplits, setCustomSplits] = useState<{ [userId: string]: string }>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const symbol = getCurrencySymbol(currency);
  const numAmount = parseFloat(amount) || 0;

  // Calculate sum of multiple payers entered so far
  const currentPayersSum = Object.values(customPayers).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );

  // Calculate sum of custom splits entered so far
  const currentSplitsSum = Object.values(customSplits).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );

  const toggleSelectSplitUser = (uId: string) => {
    if (selectedSplitUserIds.includes(uId)) {
      if (selectedSplitUserIds.length === 1) return;
      setSelectedSplitUserIds(selectedSplitUserIds.filter((id) => id !== uId));
    } else {
      setSelectedSplitUserIds([...selectedSplitUserIds, uId]);
    }
  };

  const handleCustomPayerChange = (uId: string, val: string) => {
    setCustomPayers({
      ...customPayers,
      [uId]: val,
    });
  };

  const handleCustomSplitChange = (uId: string, val: string) => {
    setCustomSplits({
      ...customSplits,
      [uId]: val,
    });
  };

  const calculatedEqualShare =
    selectedSplitUserIds.length > 0 ? (numAmount / selectedSplitUserIds.length).toFixed(2) : "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError("Please enter a description for this expense");
      return;
    }

    if (numAmount <= 0) {
      setError("Please enter a valid total amount greater than 0");
      return;
    }

    // Validate multiple payers sum
    if (payerMode === "MULTIPLE") {
      if (Math.abs(currentPayersSum - numAmount) > 0.05) {
        setError(
          `Total multiple payments (${symbol}${currentPayersSum.toFixed(2)}) must equal the expense total (${symbol}${numAmount.toFixed(2)})`
        );
        return;
      }
    }

    // Validate splits
    if (splitMode === "CUSTOM") {
      if (Math.abs(currentSplitsSum - numAmount) > 0.05) {
        setError(
          `Total custom splits (${symbol}${currentSplitsSum.toFixed(2)}) must equal the expense total (${symbol}${numAmount.toFixed(2)})`
        );
        return;
      }
    } else {
      if (selectedSplitUserIds.length === 0) {
        setError("Please select at least one person to split the expense with");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          amount: numAmount,
          category,
          date,
          payerMode,
          paidById: payerMode === "SINGLE" ? singlePaidById : undefined,
          customPayers: payerMode === "MULTIPLE" ? customPayers : undefined,
          splitMode,
          splitUserIds: selectedSplitUserIds,
          customSplits: splitMode === "CUSTOM" ? customSplits : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to log trip expense");
      }

      setDescription("");
      setAmount("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#181b22] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Log Group Expense</h2>
            <p className="text-xs text-neutral-400">Single or multi-payer with flexible splits</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Description / Expense Item
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner, Airbnb Booking, Rental Car Gas"
              required
              autoFocus
              className="w-full bg-[#101216] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition"
            />
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Total Bill Amount ({currency})
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 font-bold text-sm pointer-events-none">
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
                  className="w-full bg-[#101216] border border-white/10 rounded-xl pl-7 pr-3 py-2.5 text-base font-black text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#101216] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 transition"
              >
                {TRIP_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 1: WHO PAID? (Single vs Multiple Payers) */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-400" />
                <span>1. Who Paid the Bill?</span>
              </label>

              {/* iOS Segmented Toggle */}
              <div className="flex bg-[#101216] p-0.5 rounded-lg border border-white/5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setPayerMode("SINGLE")}
                  className={`px-2.5 py-1 rounded-md font-bold transition ${
                    payerMode === "SINGLE" ? "bg-white/10 text-emerald-400 font-black" : "text-neutral-400"
                  }`}
                >
                  Single Person
                </button>
                <button
                  type="button"
                  onClick={() => setPayerMode("MULTIPLE")}
                  className={`px-2.5 py-1 rounded-md font-bold transition ${
                    payerMode === "MULTIPLE" ? "bg-white/10 text-emerald-400 font-black" : "text-neutral-400"
                  }`}
                >
                  Multiple People Paid
                </button>
              </div>
            </div>

            {payerMode === "SINGLE" ? (
              <select
                value={singlePaidById}
                onChange={(e) => setSinglePaidById(e.target.value)}
                className="w-full bg-[#101216] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 transition font-semibold"
              >
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.userId === currentUserId ? `You (@${m.username}) paid full amount` : `@${m.username} paid full amount`}
                  </option>
                ))}
              </select>
            ) : (
              /* Multiple Payers Entry */
              <div className="space-y-1.5 bg-[#101216] p-3 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between text-[10px] text-neutral-400 pb-1">
                  <span>Enter what each contributor paid:</span>
                  <span
                    className={`font-mono font-bold ${
                      Math.abs(currentPayersSum - numAmount) < 0.05 ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    Sum: {symbol}{currentPayersSum.toFixed(2)} / {symbol}{numAmount.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {members.map((m) => (
                    <div
                      key={m.userId}
                      className="flex items-center justify-between bg-[#181b22] p-2 rounded-xl border border-white/5"
                    >
                      <span className="text-xs font-semibold text-neutral-200">
                        @{m.username} {m.userId === currentUserId && <span className="text-emerald-400">(You)</span>}
                      </span>
                      <div className="flex items-center gap-1 w-28">
                        <span className="text-xs text-neutral-500 font-mono">{symbol}</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={customPayers[m.userId] || ""}
                          onChange={(e) => handleCustomPayerChange(m.userId, e.target.value)}
                          className="w-full bg-[#101216] border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono text-right focus:outline-none focus:border-emerald-500/60"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: SPLIT BETWEEN (Equal vs Custom Shares) */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                <span>2. Split Between</span>
              </label>

              {/* iOS Segmented Toggle */}
              <div className="flex bg-[#101216] p-0.5 rounded-lg border border-white/5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setSplitMode("EQUAL")}
                  className={`px-2.5 py-1 rounded-md font-bold transition ${
                    splitMode === "EQUAL" ? "bg-white/10 text-emerald-400 font-black" : "text-neutral-400"
                  }`}
                >
                  Split Equally
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode("CUSTOM")}
                  className={`px-2.5 py-1 rounded-md font-bold transition ${
                    splitMode === "CUSTOM" ? "bg-white/10 text-emerald-400 font-black" : "text-neutral-400"
                  }`}
                >
                  Custom Unequal
                </button>
              </div>
            </div>

            {splitMode === "EQUAL" ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-neutral-400 pb-0.5">
                  <span>Selected: {selectedSplitUserIds.length} members sharing cost</span>
                  {numAmount > 0 && selectedSplitUserIds.length > 0 && (
                    <span className="font-mono text-emerald-400 font-bold">
                      ~{symbol}{calculatedEqualShare} / person
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {members.map((m) => {
                    const isSelected = selectedSplitUserIds.includes(m.userId);
                    return (
                      <button
                        key={m.userId}
                        type="button"
                        onClick={() => toggleSelectSplitUser(m.userId)}
                        className={`py-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                            : "bg-[#101216] border-white/5 text-neutral-500 hover:text-neutral-400"
                        }`}
                      >
                        <span className="truncate">@{m.username}</span>
                        {isSelected && <Check className="h-3 w-3 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Custom Unequal Split Shares */
              <div className="space-y-1.5 bg-[#101216] p-3 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between text-[10px] text-neutral-400 pb-1">
                  <span>Enter each person&apos;s share owed:</span>
                  <span
                    className={`font-mono font-bold ${
                      Math.abs(currentSplitsSum - numAmount) < 0.05 ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    Sum: {symbol}{currentSplitsSum.toFixed(2)} / {symbol}{numAmount.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {members.map((m) => (
                    <div
                      key={m.userId}
                      className="flex items-center justify-between bg-[#181b22] p-2 rounded-xl border border-white/5"
                    >
                      <span className="text-xs font-semibold text-neutral-200">@{m.username}</span>
                      <div className="flex items-center gap-1 w-28">
                        <span className="text-xs text-neutral-500 font-mono">{symbol}</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={customSplits[m.userId] || ""}
                          onChange={(e) => handleCustomSplitChange(m.userId, e.target.value)}
                          className="w-full bg-[#101216] border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono text-right focus:outline-none focus:border-emerald-500/60"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#101216] border border-white/5 text-neutral-300 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-[#0b1410] flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-[#0b1410] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save Group Expense</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
