"use client";

import React, { useState } from "react";
import {
  TrendingDown,
  TrendingUp,
  Search,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";
import { formatCurrency } from "@/lib/currencies";
import { TransactionData } from "@/lib/analytics";

interface TransactionListProps {
  transactions: TransactionData[];
  currency: string;
  onDelete: (id: string) => void;
  onExportCSV: () => void;
}

export function TransactionList({
  transactions,
  currency,
  onDelete,
  onExportCSV,
}: TransactionListProps) {
  const [filterType, setFilterType] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = transactions.filter((t) => {
    if (filterType !== "ALL" && t.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCat = t.category.toLowerCase().includes(q);
      const matchNotes = t.notes ? t.notes.toLowerCase().includes(q) : false;
      const matchPay = t.paymentMethod.toLowerCase().includes(q);
      return matchCat || matchNotes || matchPay;
    }
    return true;
  });

  return (
    <div className="bg-[#181b22] border border-white/5 rounded-3xl p-6 sm:p-7 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Daily Ledger Transactions
          </h3>
          <p className="text-xs text-neutral-400">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"} shown
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export Button */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#101216] hover:bg-white/5 text-neutral-300 border border-white/10 transition"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {/* Type Filter - iOS Segmented Style */}
          <div className="flex bg-[#101216] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filterType === "ALL"
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("EXPENSE")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filterType === "EXPENSE"
                  ? "bg-rose-500/20 text-rose-400 font-extrabold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setFilterType("INCOME")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filterType === "INCOME"
                  ? "bg-emerald-500/20 text-emerald-400 font-extrabold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Income
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by category, notes, or payment mode..."
          className="w-full bg-[#101216] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 transition"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-500">
          No transactions match your search criteria.
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {filtered.map((tx) => {
            const isIncome = tx.type === "INCOME";
            const dateStr = new Date(tx.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-white/[0.02] px-2 rounded-xl transition"
              >
                {/* Left info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {isIncome ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white truncate">{tx.category}</p>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span className="font-mono text-neutral-500">{tx.paymentMethod}</span>
                      {tx.notes && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[130px] sm:max-w-[250px] italic text-neutral-400">
                            {tx.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right amount & delete */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-xs sm:text-sm font-black font-mono ${
                      isIncome ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(tx.amount, currency)}
                  </span>

                  <button
                    onClick={() => onDelete(tx.id)}
                    title="Delete transaction"
                    className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
