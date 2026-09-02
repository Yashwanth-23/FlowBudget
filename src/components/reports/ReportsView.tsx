"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/currencies";
import { PersonalAnalyticsResult, TransactionData } from "@/lib/analytics";

interface ReportsViewProps {
  user: {
    id: string;
    username: string;
    currency: string;
  };
}

export function ReportsView({ user }: ReportsViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7);
  });
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [analytics, setAnalytics] = useState<PersonalAnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/transactions?month=${currentMonth}`);
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions || []);
        setAnalytics(data.analytics || null);
      }
    } catch (err) {
      console.error("Report fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setCurrentMonth(prevDate.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    const nextDate = new Date(y, m, 1);
    setCurrentMonth(nextDate.toISOString().slice(0, 7));
  };

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    if (transactions.length === 0) {
      alert("No transactions to export");
      return;
    }
    const headers = ["ID", "Type", "Amount", "Currency", "Category", "Payment Method", "Date", "Notes"];
    const rows = transactions.map((t) => [
      t.id,
      t.type,
      t.amount,
      user.currency,
      `"${t.category}"`,
      t.paymentMethod,
      new Date(t.date).toISOString().slice(0, 10),
      `"${t.notes || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flowbudget_report_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthLabel = new Date(`${currentMonth}-01T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const summary = analytics?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
    avgDailyExpense: 0,
    projectedMonthEndExpense: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-in fade-in">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Financial Statement & Audit</h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Generate and export monthly income, expense, and category summary statements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Controller */}
          <div className="flex items-center bg-[#181b22] border border-white/5 rounded-2xl p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="px-3 text-xs font-black text-white flex items-center gap-1.5 min-w-[120px] justify-center">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              <span>{monthLabel}</span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#181b22] hover:bg-[#1f232c] border border-white/10 text-neutral-200 text-xs font-bold rounded-2xl transition"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0b1410] text-xs font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition active:scale-[0.99]"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-[#181b22] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-sm space-y-7 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5 print:border-neutral-300 gap-4">
          <div>
            <span className="text-xl font-black text-white print:text-black">
              Flow<span className="text-emerald-400">Budget</span> Statement
            </span>
            <p className="text-xs text-neutral-400 print:text-neutral-600 mt-0.5">
              Account: @{user.username} | Period: {monthLabel}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              Generated On
            </span>
            <span className="text-xs font-mono text-neutral-300 print:text-black">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Executive Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-[#101216] print:bg-neutral-100 p-4 rounded-2xl border border-white/5 print:border-neutral-300">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">
              Total Inflow (Income)
            </span>
            <span className="text-xl font-black font-mono text-emerald-400 print:text-emerald-700">
              {formatCurrency(summary.totalIncome, user.currency)}
            </span>
          </div>

          <div className="bg-[#101216] print:bg-neutral-100 p-4 rounded-2xl border border-white/5 print:border-neutral-300">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">
              Total Outflow (Expenses)
            </span>
            <span className="text-xl font-black font-mono text-rose-400 print:text-rose-700">
              {formatCurrency(summary.totalExpense, user.currency)}
            </span>
          </div>

          <div className="bg-[#101216] print:bg-neutral-100 p-4 rounded-2xl border border-white/5 print:border-neutral-300">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">
              Net Savings (Rate: {summary.savingsRate}%)
            </span>
            <span
              className={`text-xl font-black font-mono ${
                summary.netSavings >= 0
                  ? "text-emerald-400 print:text-emerald-700"
                  : "text-rose-400 print:text-rose-700"
              }`}
            >
              {formatCurrency(summary.netSavings, user.currency)}
            </span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div>
          <h3 className="text-xs font-bold text-white print:text-black uppercase tracking-wider mb-3">
            Category Breakdown
          </h3>
          {analytics && analytics.categoryBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 print:border-neutral-300 text-neutral-400 print:text-neutral-600 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Entries</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                    <th className="py-2.5 px-3 text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-neutral-200">
                  {analytics.categoryBreakdown.map((cat) => (
                    <tr key={cat.category}>
                      <td className="py-2.5 px-3 font-semibold text-neutral-200 print:text-black">
                        {cat.category}
                      </td>
                      <td className="py-2.5 px-3 text-center text-neutral-400 print:text-neutral-700">
                        {cat.count}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white print:text-black">
                        {formatCurrency(cat.amount, user.currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400 print:text-emerald-700 font-bold">
                        {cat.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-4">No expense categories logged for this month.</p>
          )}
        </div>

        {/* Detailed Itemized Ledger Table */}
        <div>
          <h3 className="text-xs font-bold text-white print:text-black uppercase tracking-wider mb-3">
            Itemized Transactions ({transactions.length})
          </h3>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 print:border-neutral-300 text-neutral-400 print:text-neutral-600 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Payment Mode</th>
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-neutral-200">
                  {transactions.map((tx) => {
                    const isInc = tx.type === "INCOME";
                    const dStr = new Date(tx.date).toISOString().slice(0, 10);
                    return (
                      <tr key={tx.id}>
                        <td className="py-2.5 px-3 font-mono text-neutral-400 print:text-neutral-700">
                          {dStr}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isInc
                                ? "bg-emerald-500/10 text-emerald-400 print:text-emerald-700"
                                : "bg-rose-500/10 text-rose-400 print:text-rose-700"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-neutral-200 print:text-black">
                          {tx.category}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-neutral-400 print:text-neutral-700">
                          {tx.paymentMethod}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-400 print:text-neutral-700 italic">
                          {tx.notes || "-"}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono font-bold ${
                            isInc
                              ? "text-emerald-400 print:text-emerald-700"
                              : "text-rose-400 print:text-rose-700"
                          }`}
                        >
                          {isInc ? "+" : "-"}
                          {formatCurrency(tx.amount, user.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-4">No transactions recorded for this month.</p>
          )}
        </div>
      </div>
    </div>
  );
}
