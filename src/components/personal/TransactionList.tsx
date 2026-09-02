"use client";

import React, { useState } from "react";
import {
  TrendingDown,
  TrendingUp,
  Search,
  Trash2,
  FileSpreadsheet,
  Printer,
  Receipt,
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

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-7 transition duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Daily Ledger Transactions
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"} recorded
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print / Save PDF Button */}
          <button
            onClick={handlePrintPDF}
            title="Print or Save Statement as PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#090a0d] hover:bg-white/[0.06] text-neutral-300 border border-white/[0.08] transition duration-150 active:scale-95 no-print"
          >
            <Printer className="h-3.5 w-3.5 text-cyan-400" />
            <span>Print / PDF</span>
          </button>

          {/* CSV Export Button */}
          <button
            onClick={onExportCSV}
            title="Export Raw Data to CSV Spreadsheet"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#090a0d] hover:bg-white/[0.06] text-neutral-300 border border-white/[0.08] transition duration-150 active:scale-95 no-print"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {/* Type Filter - iOS Segmented Style */}
          <div className="flex bg-[#090a0d] p-1 rounded-xl border border-white/[0.08] no-print">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition duration-150 ${
                filterType === "ALL"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("EXPENSE")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition duration-150 ${
                filterType === "EXPENSE"
                  ? "bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setFilterType("INCOME")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition duration-150 ${
                filterType === "INCOME"
                  ? "bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Income
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4 no-print">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by category, notes, or payment mode..."
          className="w-full bg-[#090a0d] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition duration-150"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/[0.06] rounded-2xl bg-[#090a0d]">
          <Receipt className="h-6 w-6 text-neutral-600 mb-2" />
          <p className="text-xs text-neutral-400 font-medium">No transactions found</p>
          <p className="text-[10px] text-neutral-500 mt-0.5">Click &ldquo;Add Transaction&rdquo; to record your first entry</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.05]">
          {filtered.map((tx) => {
            const isIncome = tx.type === "INCOME";
            const dateStr = new Date(tx.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-white/[0.02] px-2 rounded-xl transition duration-150 group"
              >
                {/* Left info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                    }`}
                  >
                    {isIncome ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">{tx.category}</p>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                      <span className="font-mono text-neutral-400">{dateStr}</span>
                      <span>•</span>
                      <span className="font-mono text-neutral-500">{tx.paymentMethod}</span>
                      {tx.notes && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[120px] sm:max-w-[220px] italic text-neutral-400">
                            {tx.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right amount & delete */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs sm:text-sm font-bold font-mono ${
                        isIncome ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(tx.amount, tx.currency || currency)}
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/[0.05] text-neutral-400 border border-white/[0.08]">
                      {tx.currency || currency}
                    </span>
                  </div>

                  <button
                    onClick={() => onDelete(tx.id)}
                    title="Delete transaction"
                    className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition duration-150 no-print"
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
