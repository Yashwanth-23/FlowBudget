"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Printer,
  Sparkles,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Flame,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Coins,
  Filter,
} from "lucide-react";
import { formatCurrency, getCurrencySymbol, SUPPORTED_CURRENCIES } from "@/lib/currencies";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ReportsViewProps {
  user: {
    id: string;
    username: string;
    currency: string;
  };
}

type PeriodType = "MONTHLY" | "QUARTERLY" | "ANNUAL" | "LIFETIME" | "CUSTOM";

const PALETTE = [
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#f97316",
  "#eab308",
  "#ec4899",
  "#14b8a6",
  "#a855f7",
];

function getLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ReportsView({ user }: ReportsViewProps) {
  const todayStr = getLocalDateString();
  const currentYear = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth() + 1;

  // Period Controls State
  const [periodType, setPeriodType] = useState<PeriodType>("MONTHLY");
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentYear}-${String(currentMonthNum).padStart(2, "0")}`
  );
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil(currentMonthNum / 3));
  const [customStart, setCustomStart] = useState(`${currentYear}-01-01`);
  const [customEnd, setCustomEnd] = useState(todayStr);

  // Active reporting currency
  const [selectedCurrency, setSelectedCurrency] = useState(user.currency || "USD");

  // Data State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sync user currency if updated
  useEffect(() => {
    if (user.currency) {
      setSelectedCurrency(user.currency);
    }
  }, [user.currency]);

  // Compute query URL based on period configuration
  const buildQueryUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("currency", selectedCurrency);

    if (periodType === "MONTHLY") {
      params.set("month", selectedMonth);
    } else if (periodType === "QUARTERLY") {
      const qStartMonth = (selectedQuarter - 1) * 3 + 1;
      const qEndMonth = qStartMonth + 2;
      const startStr = `${selectedYear}-${String(qStartMonth).padStart(2, "0")}-01`;
      const endDay = new Date(selectedYear, qEndMonth, 0).getDate();
      const endStr = `${selectedYear}-${String(qEndMonth).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
      params.set("startDate", startStr);
      params.set("endDate", endStr);
    } else if (periodType === "ANNUAL") {
      params.set("startDate", `${selectedYear}-01-01`);
      params.set("endDate", `${selectedYear}-12-31`);
    } else if (periodType === "LIFETIME") {
      params.set("month", "ALL");
    } else if (periodType === "CUSTOM") {
      params.set("startDate", customStart);
      params.set("endDate", customEnd);
    }

    return `/api/transactions?${params.toString()}`;
  }, [periodType, selectedMonth, selectedYear, selectedQuarter, customStart, customEnd, selectedCurrency]);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const url = buildQueryUrl();
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok) {
        setTransactions(json.transactions || []);
        setAnalytics(json.analytics || null);
      }
    } catch (err) {
      console.error("Fetch reports error:", err);
    } finally {
      setLoading(false);
    }
  }, [buildQueryUrl]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    if (transactions.length === 0) {
      alert("No transactions in this period to export");
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
    link.setAttribute("download", `flowbudget_report_${periodType.toLowerCase()}_${selectedCurrency}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevY = prevDate.getFullYear();
    const prevM = String(prevDate.getMonth() + 1).padStart(2, "0");
    setSelectedMonth(`${prevY}-${prevM}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const nextDate = new Date(y, m, 1);
    const nextY = nextDate.getFullYear();
    const nextM = String(nextDate.getMonth() + 1).padStart(2, "0");
    setSelectedMonth(`${nextY}-${nextM}`);
  };

  // Human-readable period title
  const getPeriodTitle = () => {
    if (periodType === "MONTHLY") {
      const [y, m] = selectedMonth.split("-").map(Number);
      return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    if (periodType === "QUARTERLY") {
      return `Q${selectedQuarter} ${selectedYear} (Quarterly Report)`;
    }
    if (periodType === "ANNUAL") {
      return `Full Year ${selectedYear} (Annual Report)`;
    }
    if (periodType === "LIFETIME") {
      return "All-Time Lifetime Overview";
    }
    return `${customStart} to ${customEnd} (Custom Period)`;
  };

  const activeSymbol = getCurrencySymbol(selectedCurrency);
  const summary = analytics?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
    avgDailyExpense: 0,
    transactionCount: 0,
  };

  const hasMonthlyTrends =
    analytics?.monthlyTrends && analytics.monthlyTrends.some((t: any) => t.income > 0 || t.expense > 0);
  const hasCategoryBreakdown =
    analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0;

  const availableCurrencies: string[] = analytics?.availableCurrencies || [user.currency || "USD"];
  if (!availableCurrencies.includes(selectedCurrency)) {
    availableCurrencies.push(selectedCurrency);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-tab-switch pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Financial Analytics & Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Audit periods, compare cash flow velocity & inspect category distributions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 no-print">
          <button
            onClick={exportCSV}
            title="Export this period as CSV"
            className="btn-secondary flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl"
          >
            <Download className="h-3.5 w-3.5 text-neutral-300" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            title="Print or Save Financial Report as PDF"
            className="btn-secondary flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl"
          >
            <Printer className="h-3.5 w-3.5 text-cyan-400" />
            <span>Print / PDF Report</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-emerald-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Real-time Intelligence</span>
          </div>
        </div>
      </div>

      {/* FILTER DASHBOARD: PERIODS & CURRENCY SELECTOR */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 space-y-4 no-print border border-white/10 shadow-xl">
        {/* ROW 1: PRIMARY PERIOD SELECTOR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Period Scope:
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 bg-[#090a0d] p-1 rounded-2xl border border-white/5 text-xs font-bold">
            {(["MONTHLY", "QUARTERLY", "ANNUAL", "LIFETIME", "CUSTOM"] as PeriodType[]).map(
              (p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriodType(p)}
                  className={`py-2 px-3 rounded-xl transition duration-150 text-center ${
                    periodType === p
                      ? "bg-emerald-500 text-[#04130c] font-black shadow-md shadow-emerald-500/20"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {p === "MONTHLY"
                    ? "Monthly"
                    : p === "QUARTERLY"
                    ? "Quarterly"
                    : p === "ANNUAL"
                    ? "Annual / YTD"
                    : p === "LIFETIME"
                    ? "Lifetime"
                    : "Custom Range"}
                </button>
              )
            )}
          </div>
        </div>

        {/* ROW 2: DYNAMIC SUB-CONTROLS BASED ON SELECTED PERIOD */}
        <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Sub-controls for MONTHLY */}
          {periodType === "MONTHLY" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium">Selected Month:</span>
              <div className="flex items-center bg-[#090a0d] border border-white/10 rounded-xl p-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-xs font-mono font-bold text-white">
                  {getPeriodTitle()}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Sub-controls for QUARTERLY */}
          {periodType === "QUARTERLY" && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-neutral-400 font-medium">Year:</span>
                <div className="flex gap-1 bg-[#090a0d] p-1 rounded-xl border border-white/10 text-xs">
                  {[currentYear, currentYear - 1, currentYear - 2].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(yr)}
                      className={`px-2.5 py-1 rounded-lg font-mono font-bold transition ${
                        selectedYear === yr
                          ? "bg-white/10 text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-neutral-400 font-medium">Quarter:</span>
                <div className="flex gap-1 bg-[#090a0d] p-1 rounded-xl border border-white/10 text-xs">
                  {[
                    { q: 1, label: "Q1 (Jan–Mar)" },
                    { q: 2, label: "Q2 (Apr–Jun)" },
                    { q: 3, label: "Q3 (Jul–Sep)" },
                    { q: 4, label: "Q4 (Oct–Dec)" },
                  ].map((item) => (
                    <button
                      key={item.q}
                      onClick={() => setSelectedQuarter(item.q)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        selectedQuarter === item.q
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-controls for ANNUAL */}
          {periodType === "ANNUAL" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium">Select Year:</span>
              <div className="flex gap-1.5 bg-[#090a0d] p-1 rounded-xl border border-white/10 text-xs font-mono font-bold">
                {[currentYear, currentYear - 1, currentYear - 2].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      selectedYear === yr
                        ? "bg-emerald-500 text-[#04130c]"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sub-controls for LIFETIME */}
          {periodType === "LIFETIME" && (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Auditing complete all-time ledger history</span>
            </div>
          )}

          {/* Sub-controls for CUSTOM */}
          {periodType === "CUSTOM" && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400 font-medium">From:</span>
                <input
                  type="date"
                  max={todayStr}
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-[#090a0d] border border-white/10 rounded-xl px-2.5 py-1 text-white font-mono"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400 font-medium">To:</span>
                <input
                  type="date"
                  max={todayStr}
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-[#090a0d] border border-white/10 rounded-xl px-2.5 py-1 text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* CURRENCY SELECTOR PILLS */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              <Coins className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-semibold">Currency:</span>
            </div>
            <div className="flex items-center gap-1 bg-[#090a0d] p-1 rounded-xl border border-white/10">
              {availableCurrencies.map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    selectedCurrency === curr
                      ? "bg-emerald-500 text-[#04130c] shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {curr} ({getCurrencySymbol(curr)})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY EXECUTIVE HEADER */}
      <div className="hidden print:block border-b border-black pb-4 mb-6">
        <h2 className="text-2xl font-black text-black uppercase tracking-tight">
          FlowBudget Executive Statement
        </h2>
        <div className="flex justify-between text-sm text-neutral-600 mt-1">
          <span>
            Report Period: <strong>{getPeriodTitle()}</strong>
          </span>
          <span>
            Currency: <strong>{selectedCurrency} ({activeSymbol})</strong>
          </span>
          <span>
            Generated: <strong>{new Date().toLocaleDateString()}</strong>
          </span>
        </div>
      </div>

      {/* LOADING SPINNER */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* EXECUTIVE KPI SUMMARY CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Inflow */}
            <div className="glass-card rounded-3xl p-4 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Total Inflow
                </span>
                <div className="h-7 w-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
                {formatCurrency(summary.totalIncome, selectedCurrency)}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1 truncate">
                Gross Income in Period
              </p>
            </div>

            {/* Total Outflow */}
            <div className="glass-card rounded-3xl p-4 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Total Outflow
                </span>
                <div className="h-7 w-7 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <TrendingDown className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
                {formatCurrency(summary.totalExpense, selectedCurrency)}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1 truncate">
                Gross Expenditures in Period
              </p>
            </div>

            {/* Net Savings */}
            <div className="glass-card rounded-3xl p-4 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Net Cash Flow
                </span>
                <div className="h-7 w-7 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
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
                {formatCurrency(summary.netSavings, selectedCurrency)}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1">
                Savings Rate: <span className="text-emerald-400 font-bold">{summary.savingsRate}%</span>
              </p>
            </div>

            {/* Velocity / Run-rate */}
            <div className="glass-card rounded-3xl p-4 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Daily Velocity
                </span>
                <div className="h-7 w-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Flame className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
                {formatCurrency(summary.avgDailyExpense, selectedCurrency)}
                <span className="text-xs sm:text-sm font-normal text-neutral-500 ml-1">/day</span>
              </p>
              <p className="text-[10px] text-neutral-400 mt-1">
                {summary.transactionCount} transactions recorded
              </p>
            </div>
          </div>

          {/* VISUAL CHARTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart 1: Cash Flow Trends */}
            <div className="glass-card rounded-3xl p-5 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Cash Flow Timeline ({selectedCurrency})
                </h3>
                <span className="text-[10px] text-neutral-500 font-mono">Inflow vs Outflow</span>
              </div>

              {!hasMonthlyTrends ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/[0.06] rounded-2xl bg-[#090a0d]">
                  <p className="text-xs text-neutral-400">No cash flow recorded for {selectedCurrency} in this period</p>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1c1f26" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(v) => `${activeSymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#12141a",
                          borderColor: "rgba(255,255,255,0.1)",
                          borderRadius: "14px",
                          color: "#f8fafc",
                          fontSize: "12px",
                        }}
                        formatter={(val: any) => [formatCurrency(Number(val), selectedCurrency), ""]}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 2: Categorical Spending Breakdown */}
            <div className="glass-card rounded-3xl p-5 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Categorical Distribution ({selectedCurrency})
                </h3>
                <span className="text-[10px] text-neutral-500 font-mono">Percentage share</span>
              </div>

              {!hasCategoryBreakdown ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/[0.06] rounded-2xl bg-[#090a0d]">
                  <p className="text-xs text-neutral-400">No expense categories recorded for {selectedCurrency}</p>
                </div>
              ) : (
                <div className="h-64 w-full flex flex-col sm:flex-row items-center">
                  <div className="h-full w-full sm:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.categoryBreakdown || []}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={4}
                        >
                          {(analytics.categoryBreakdown || []).map((_: any, idx: number) => (
                            <Cell
                              key={`cell-${idx}`}
                              fill={PALETTE[idx % PALETTE.length]}
                              stroke="#12141a"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#12141a",
                            borderColor: "rgba(255,255,255,0.1)",
                            borderRadius: "14px",
                            color: "#f8fafc",
                            fontSize: "12px",
                          }}
                          formatter={(val: any) => [formatCurrency(Number(val), selectedCurrency), ""]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full sm:w-1/2 space-y-1.5 max-h-56 overflow-y-auto pl-2 mt-2 sm:mt-0">
                    {(analytics.categoryBreakdown || []).map((cat: any, i: number) => (
                      <div key={cat.category} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                          />
                          <span className="text-neutral-300 truncate max-w-[110px]">{cat.category}</span>
                        </div>
                        <span className="font-semibold text-white font-mono text-[11px] shrink-0">
                          {formatCurrency(cat.amount, selectedCurrency)}{" "}
                          <span className="text-neutral-500 text-[10px]">({cat.percentage}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AUDIT STATEMENT TABLE: TRANSACTIONS IN PERIOD */}
          <div className="glass-card rounded-3xl p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Audit Statement Ledger ({getPeriodTitle()})
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Showing all transactions recorded for {selectedCurrency} in this period
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-400">
                {transactions.length} Records
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="py-10 text-center text-xs text-neutral-500 bg-[#090a0d] rounded-2xl border border-white/5">
                No transactions found for this period in {selectedCurrency}.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05] max-h-96 overflow-y-auto">
                {transactions.map((tx) => {
                  const isIncome = tx.type === "INCOME";
                  const dateStr = new Date(tx.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <div
                      key={tx.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isIncome
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {isIncome ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-white truncate">
                            {tx.category}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                            <span className="font-mono">{dateStr}</span>
                            <span>•</span>
                            <span className="font-mono">{tx.paymentMethod}</span>
                            {tx.notes && (
                              <>
                                <span>•</span>
                                <span className="italic truncate max-w-[150px]">{tx.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-xs sm:text-sm font-bold font-mono ${
                            isIncome ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(tx.amount, tx.currency || selectedCurrency)}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/[0.05] text-neutral-400 border border-white/[0.08]">
                          {tx.currency || selectedCurrency}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
