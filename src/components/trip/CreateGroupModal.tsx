"use client";

import React, { useState } from "react";
import { X, Plane, Check, AlertCircle } from "lucide-react";
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from "@/lib/currencies";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (groupId: string) => void;
  defaultCurrency: string;
}

export function CreateGroupModal({
  isOpen,
  onClose,
  onSuccess,
  defaultCurrency,
}: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency || "USD");
  const [totalBudget, setTotalBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const symbol = getCurrencySymbol(currency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setError("Please enter a group/trip name (e.g. 'CO fall 26')");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          currency,
          totalBudget: totalBudget ? parseFloat(totalBudget) : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create trip group");
      }

      onSuccess(data.group.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#181b22] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Plane className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Create Trip / Group</h2>
            <p className="text-xs text-neutral-400">Track shared expenses & settlements</p>
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
              Trip / Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CO fall 26, Europe 2026, Roommates"
              required
              autoFocus
              className="w-full bg-[#101216] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Trip Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#101216] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 transition"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Total Budget (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500 text-xs font-mono">
                  {symbol}
                </span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="e.g. 3000"
                  className="w-full bg-[#101216] border border-white/10 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition font-mono"
                />
              </div>
            </div>
          </div>

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
                  <span>Create Trip</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
