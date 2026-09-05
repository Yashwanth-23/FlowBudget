"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Users, Check, AlertCircle } from "lucide-react";
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from "@/lib/currencies";
import { CustomSelect } from "../ui/CustomSelect";

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
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency || "USD");
  const [totalBudget, setTotalBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (defaultCurrency) {
      setCurrency(defaultCurrency);
    }
  }, [defaultCurrency, isOpen]);

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

  const symbol = getCurrencySymbol(currency);

  const currencyOptions = Object.values(SUPPORTED_CURRENCIES).map((c) => ({
    value: c.code,
    label: `${c.symbol} ${c.code} - ${c.name}`,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setError("Please enter a group name");
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
        throw new Error(data.error || "Failed to create group");
      }

      onSuccess(data.group.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating group");
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
        className="w-full max-w-md glass-modal rounded-3xl p-6 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Create Shared Group</h2>
            <p className="text-xs text-neutral-400">Track shared expenses & split debts</p>
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
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dinner with Friends, Roommates, Household Bills, Vacation"
              required
              autoFocus
              className="w-full bg-[#070a10] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Currency
              </label>
              <CustomSelect
                options={currencyOptions}
                value={currency}
                onChange={setCurrency}
                size="md"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Budget Cap (Optional)
              </label>
              <div className="relative flex items-center h-11 sm:h-12 rounded-xl bg-[#0c0e14] border border-white/10 focus-within:border-white/30 transition">
                <span className="pl-3.5 pr-1 text-neutral-500 text-xs sm:text-sm font-mono font-bold select-none">
                  {symbol}
                </span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full h-full bg-transparent pl-1 pr-3.5 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none font-mono tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#070a10] border border-white/5 text-neutral-300 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-[#04130c] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Create Group</span>
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
