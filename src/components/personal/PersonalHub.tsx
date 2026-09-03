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
  Coins,
} from "lucide-react";
import { formatCurrency, getCurrencySymbol } from "@/lib/currencies";
import { PersonalAnalyticsResult, TransactionData } from "@/lib/analytics";
import { AddTransactionModal } from "./AddTransactionModal";
import { BudgetModal } from "./BudgetModal";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { TransactionList } from "./TransactionList";
import { MonthYearPickerModal } from "./MonthYearPickerModal";

interface PersonalHubProps {
  user: {
    id: string;
    username: string;
    currency: string;
  };
}

// Dynamic current month formatted as YYYY-MM
function getCurrentMonthString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function PersonalHub({ user }: PersonalHubProps) {
  const [currentMonth, setCurrentMonth] = useState(() => getCurrentMonthString());
  const [selectedCurrency, setSelectedCurrency] = useState(user.currency || "USD");

  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [analytics, setAnalytics] = useState<PersonalAnalyticsResult | null>(null);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  useEffect(() => {
    if (user.currency) {
      setSelectedCurrency(user.currency);
    }
  }, [user.currency]);

  const fetchPersonalData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/transactions?month=${currentMonth}&currency=${selectedCurrency}`
      );
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
  }, [currentMonth, selectedCurrency]);

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
    const prevY = prevDate.getFullYear();
    const prevM = String(prevDate.getMonth() + 1).padStart(2, "0");
    setCurrentMonth(`${prevY}-${prevM}`);
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    const nextDate = new Date(y, m, 1);
    const nextY = nextDate.getFullYear();
    const nextM = String(nextDate.getMonth() + 1).padStart(2, "0");
    setCurrentMonth(`${nextY}-${nextM}`);
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
      t.currency || selectedCurrency,
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

  const [yearNum, monthNum] = currentMonth.split("-").map(Number);
  const monthDate = new Date(yearNum, monthNum - 1, 1);
  const monthLabel = monthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const activeCurr = analytics?.activeCurrency || selectedCurrency;

  const summary = analytics?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
    avgDailyExpense: 0,
    projectedMonthEndExpense: 0,
  };

  const multiSummaries = analytics?.multiCurrencySummaries || {};
  const hasMultipleCurrencies =
    analytics?.availableCurrencies && analytics.availableCurrencies.length > 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-tab-switch pb-24 md:pb-12">
      {/* Month Navigation & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Personal Finance Ledger</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Multi-currency tracking, category budget caps & real-time analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 no-print">
          {/* Month Controller with Quick Calendar Picker Popover */}
          <div className="flex items-center glass-dock rounded-2xl p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition duration-150 active:scale-95"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Clickable Month Capsule -> Opens Calendar Month-Year Picker */}
            <button
              onClick={() => setIsMonthPickerOpen(true)}
              title="Click to jump to any Month or Year"
              className="px-2.5 sm:px-3 py-1 hover:bg-white/[0.06] rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 min-w-[120px] sm:min-w-[140px] justify-center select-none transition duration-150"
            >
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              <span>{monthLabel}</span>
            </button>

            <button
              onClick={handleNextMonth}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition duration-150 active:scale-95"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Budget button */}
          <button
            onClick={() => setIsBudgetOpen(true)}
            className="btn-secondary flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs font-medium rounded-2xl"
          >
            <Target className="h-3.5 w-3.5 text-emerald-400/90" />
            <span>Set Budget Cap</span>
          </button>

          {/* Add Transaction Button */}
          <button
            onClick={() => setIsAddTxOpen(true)}
            className="btn-primary flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-2xl"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* MULTI-CURRENCY SEGREGATION CONTROLLER (Shows when transactions exist in >1 currency) */}
      {hasMultipleCurrencies && (
        <div className="glass-card rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border border-emerald-500/20 shadow-lg">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
              <Coins className="h-4 w-4 text-emerald-400" />
              <span>Multi-Currency Active ({analytics.availableCurrencies.length}):</span>
            </div>
            <div className="flex items-center gap-1.5">
              {analytics.availableCurrencies.map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition duration-150 flex items-center gap-1.5 ${
                    activeCurr === curr
                      ? "bg-emerald-500 text-[#04130c] shadow-md shadow-emerald-500/20"
                      : "bg-[#090a0d] border border-white/10 text-neutral-300 hover:text-white"
                  }`}
                >
                  <span>{curr}</span>
                  <span className="opacity-75">({getCurrencySymbol(curr)})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Net Balances per Currency */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[10px] uppercase font-bold text-neutral-500">Totals:</span>
            {Object.values(multiSummaries).map((s: any) => (
              <div
                key={s.currency}
                onClick={() => setSelectedCurrency(s.currency)}
                className={`px-2.5 py-1 rounded-lg border font-mono text-xs cursor-pointer transition ${
                  activeCurr === s.currency
                    ? "bg-white/10 border-white/20 text-white font-bold"
                    : "bg-[#090a0d] border-white/5 text-neutral-400 hover:text-neutral-200"
                }`}
                title={`Click to switch dashboard to ${s.currency}`}
              >
                <span className="text-neutral-400 font-semibold">{s.currency}: </span>
                <span className={s.netSavings >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {formatCurrency(s.netSavings, s.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Summary KPI Grid - Cleanly Segregated by Currency */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Income */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 relative overflow-hidden group transition duration-200">
          <div className="flex items-center justify-between text-neutral-400 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Total Inflow ({activeCurr})
            </span>
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(summary.totalIncome, activeCurr)}
          </p>
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[10px] text-neutral-400 font-medium">
            <span className="text-emerald-400/90 font-semibold">Income</span>
            <span>•</span>
            <span className="truncate">{monthLabel}</span>
          </div>
        </div>

        {/* 2. Total Expenses */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 relative overflow-hidden group transition duration-200">
          <div className="flex items-center justify-between text-neutral-400 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Total Outflow ({activeCurr})
            </span>
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <TrendingDown className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(summary.totalExpense, activeCurr)}
          </p>
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[10px] text-neutral-400 font-medium">
            <span className="text-rose-400/90 font-semibold">Expenses</span>
            <span>•</span>
            <span className="truncate">{monthLabel}</span>
          </div>
        </div>

        {/* 3. Net Savings */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 relative overflow-hidden group transition duration-200">
          <div className="flex items-center justify-between text-neutral-400 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Net Cash Flow ({activeCurr})
            </span>
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <PiggyBank className="h-3.5 w-3.5" />
            </div>
          </div>
          <p
            className={`text-xl sm:text-2xl lg:text-3xl font-bold font-mono tracking-tight ${
              summary.netSavings > 0
                ? "text-emerald-400"
                : summary.netSavings < 0
                ? "text-rose-400"
                : "text-white"
            }`}
          >
            {formatCurrency(summary.netSavings, activeCurr)}
          </p>
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[10px] text-neutral-400 font-medium">
            <span className="text-neutral-300 font-semibold">Savings Rate:</span>
            <span className="font-mono text-emerald-400/90 font-semibold">{summary.savingsRate}%</span>
          </div>
        </div>

        {/* 4. Spend Velocity */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 relative overflow-hidden group transition duration-200">
          <div className="flex items-center justify-between text-neutral-400 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Daily Velocity ({activeCurr})
            </span>
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(summary.avgDailyExpense, activeCurr)}
            <span className="text-xs sm:text-sm font-normal text-neutral-500 ml-1">/day</span>
          </p>
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[10px] text-neutral-400 font-medium truncate">
            <span>Est. Month End:</span>
            <span className="font-mono text-neutral-300 font-semibold truncate">
              {formatCurrency(summary.projectedMonthEndExpense, activeCurr)}
            </span>
          </div>
        </div>
      </div>

      {/* Category Budgets Tracker */}
      {analytics && analytics.budgetHealth.length > 0 && (
        <div className="glass-card rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Monthly Category Budgets ({activeCurr})
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">Real-time spend vs monthly limits</p>
            </div>
            <button
              onClick={() => setIsBudgetOpen(true)}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              + Adjust Budgets
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {analytics.budgetHealth.map((item) => {
              const isOver = item.status === "EXCEEDED";
              const isWarn = item.status === "WARNING";
              return (
                <div
                  key={item.category}
                  className="bg-[#090a0d] p-3.5 rounded-2xl border border-white/[0.06] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{item.category}</span>
                    <span
                      className={`font-mono font-bold ${
                        isOver ? "text-rose-400" : isWarn ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {item.percentUsed}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#161820] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isOver ? "bg-rose-500" : isWarn ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(item.percentUsed, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                    <span>Spent: {formatCurrency(item.spent, activeCurr)}</span>
                    <span>Cap: {formatCurrency(item.monthlyLimit, activeCurr)}</span>
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
          currency={activeCurr}
        />
      )}

      {/* Daily Transaction Ledger Table */}
      <TransactionList
        transactions={transactions}
        currency={activeCurr}
        onDelete={handleDeleteTx}
        onExportCSV={exportCSV}
      />

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSuccess={fetchPersonalData}
        currency={activeCurr}
      />

      <BudgetModal
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        onSuccess={fetchPersonalData}
        currency={activeCurr}
        currentMonth={currentMonth}
        existingBudgets={budgets}
      />

      {/* Quick Month-Year Calendar Picker */}
      <MonthYearPickerModal
        isOpen={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        currentMonth={currentMonth}
        onSelectMonth={(newMonth) => setCurrentMonth(newMonth)}
      />
    </div>
  );
}
