"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  Target,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Calendar,
} from "lucide-react";
import { formatCurrency } from "@/lib/currencies";
import { PersonalAnalyticsResult, TransactionData } from "@/lib/analytics";
import { AddTransactionModal } from "./AddTransactionModal";
import { BudgetModal } from "./BudgetModal";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { TransactionList } from "./TransactionList";

interface PersonalHubProps {
  user: {
    id: string;
    username: string;
    currency: string;
  };
}

export function PersonalHub({ user }: PersonalHubProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7);
  });

  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [analytics, setAnalytics] = useState<PersonalAnalyticsResult | null>(null);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);

  const fetchPersonalData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/transactions?month=${currentMonth}`);
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions || []);
        setAnalytics(data.analytics || null);
        setBudgets(data.budgets || []);
      }
    } catch (err) {
      console.error("Error fetching personal ledger:", err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchPersonalData();
  }, [fetchPersonalData]);

  const handleDeleteTx = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPersonalData();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

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
    link.setAttribute("download", `flowbudget_statement_${currentMonth}.csv`);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Month Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Personal Finance Ledger</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Daily income, expenses, category budgets, and financial health.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Controller */}
          <div className="flex items-center bg-[#181b22] border border-white/5 rounded-2xl p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition"
              title="Previous Month"
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
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Budget button */}
          <button
            onClick={() => setIsBudgetOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#181b22] hover:bg-[#1f232c] border border-white/10 text-neutral-200 text-xs font-bold rounded-2xl shadow-sm transition"
          >
            <Target className="h-3.5 w-3.5 text-teal-400" />
            <span>Set Budget Cap</span>
          </button>

          {/* Add Transaction Button */}
          <button
            onClick={() => setIsAddTxOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0b1410] text-xs font-black rounded-2xl shadow-lg shadow-emerald-500/15 transition active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Active Budget Alerts */}
      {analytics && analytics.alerts.length > 0 && (
        <div className="space-y-2">
          {analytics.alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs font-medium ${
                alert.type === "DANGER"
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-300"
              }`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Income */}
        <div className="bg-[#181b22] border border-white/5 rounded-3xl p-5 shadow-sm relative">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Income</span>
            <div className="h-7 w-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">
            {formatCurrency(summary.totalIncome, user.currency)}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 inline-block">
            Inflow for {monthLabel}
          </span>
        </div>

        {/* 2. Total Expenses */}
        <div className="bg-[#181b22] border border-white/5 rounded-3xl p-5 shadow-sm relative">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Expenses</span>
            <div className="h-7 w-7 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <TrendingDown className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">
            {formatCurrency(summary.totalExpense, user.currency)}
          </p>
          <span className="text-[10px] text-rose-400 font-semibold mt-1 inline-block">
            Outflow for {monthLabel}
          </span>
        </div>

        {/* 3. Net Savings */}
        <div className="bg-[#181b22] border border-white/5 rounded-3xl p-5 shadow-sm relative">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Cash Flow</span>
            <div className="h-7 w-7 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <PiggyBank className="h-3.5 w-3.5" />
            </div>
          </div>
          <p
            className={`text-xl sm:text-2xl font-black font-mono ${
              summary.netSavings >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {formatCurrency(summary.netSavings, user.currency)}
          </p>
          <span className="text-[10px] text-neutral-400 font-semibold mt-1 inline-block">
            Savings Rate: {summary.savingsRate}%
          </span>
        </div>

        {/* 4. Spend Velocity */}
        <div className="bg-[#181b22] border border-white/5 rounded-3xl p-5 shadow-sm relative">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Daily Velocity</span>
            <div className="h-7 w-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">
            {formatCurrency(summary.avgDailyExpense, user.currency)}
            <span className="text-xs font-normal text-neutral-500">/day</span>
          </p>
          <span className="text-[10px] text-neutral-400 font-semibold mt-1 inline-block">
            Projected: {formatCurrency(summary.projectedMonthEndExpense, user.currency)}
          </span>
        </div>
      </div>

      {/* Category Budgets Tracker */}
      {analytics && analytics.budgetHealth.length > 0 && (
        <div className="bg-[#181b22] border border-white/5 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Monthly Category Budgets
              </h3>
              <p className="text-xs text-neutral-400">Real-time spend vs budget limits</p>
            </div>
            <button
              onClick={() => setIsBudgetOpen(true)}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              + Adjust Budgets
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {analytics.budgetHealth.map((item) => {
              const isOver = item.status === "EXCEEDED";
              const isWarn = item.status === "WARNING";
              return (
                <div
                  key={item.category}
                  className="bg-[#101216] p-3.5 rounded-2xl border border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{item.category}</span>
                    <span
                      className={`font-mono font-bold ${
                        isOver ? "text-rose-400" : isWarn ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {item.percentUsed}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#181b22] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all rounded-full ${
                        isOver ? "bg-rose-500" : isWarn ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(item.percentUsed, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Spent: {formatCurrency(item.spent, user.currency)}</span>
                    <span>Cap: {formatCurrency(item.monthlyLimit, user.currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Analytics Charts */}
      {analytics && (
        <AnalyticsCharts
          monthlyTrends={analytics.monthlyTrends}
          categoryBreakdown={analytics.categoryBreakdown}
          dailyTrends={analytics.dailyTrends}
          currency={user.currency}
        />
      )}

      {/* Daily Transaction Ledger Table */}
      <TransactionList
        transactions={transactions}
        currency={user.currency}
        onDelete={handleDeleteTx}
        onExportCSV={exportCSV}
      />

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSuccess={fetchPersonalData}
        currency={user.currency}
      />

      <BudgetModal
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        onSuccess={fetchPersonalData}
        currency={user.currency}
        currentMonth={currentMonth}
        existingBudgets={budgets}
      />
    </div>
  );
}
