"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { formatCurrency, getCurrencySymbol } from "@/lib/currencies";
import { CategoryStat, MonthlyTrend, DailySpend } from "@/lib/analytics";
import { BarChart3, PieChart as PieIcon, Activity } from "lucide-react";

interface AnalyticsChartsProps {
  monthlyTrends: MonthlyTrend[];
  categoryBreakdown: CategoryStat[];
  dailyTrends: DailySpend[];
  currency: string;
}

const PALETTE = [
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f97316", // orange
  "#eab308", // yellow
  "#14b8a6", // teal
  "#ec4899", // pink
  "#6366f1", // indigo
  "#f43f5e", // rose
];

export function AnalyticsCharts({
  monthlyTrends,
  categoryBreakdown,
  dailyTrends,
  currency,
}: AnalyticsChartsProps) {
  const symbol = getCurrencySymbol(currency);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-6">
      {/* 1. Monthly Income vs Expenses */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 transition duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Monthly Cash Flow
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Income vs Outflow Comparison</p>
          </div>
          <div className="h-7 w-7 rounded-xl bg-white/[0.04] border border-white/[0.06] text-neutral-400 flex items-center justify-center">
            <BarChart3 className="h-3.5 w-3.5" />
          </div>
        </div>

        {monthlyTrends.length === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/[0.06] rounded-2xl bg-[#090a0d]">
            <BarChart3 className="h-6 w-6 text-neutral-600 mb-2" />
            <p className="text-xs text-neutral-400 font-medium">No cash flow data recorded yet</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Transactions you log will graph automatically here</p>
          </div>
        ) : (
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1f26" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#12141a",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "14px",
                    color: "#f8fafc",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value), currency), ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Expense Category Donut */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 transition duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Expense by Category
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Monthly Spending Distribution</p>
          </div>
          <div className="h-7 w-7 rounded-xl bg-white/[0.04] border border-white/[0.06] text-neutral-400 flex items-center justify-center">
            <PieIcon className="h-3.5 w-3.5" />
          </div>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/[0.06] rounded-2xl bg-[#090a0d]">
            <PieIcon className="h-6 w-6 text-neutral-600 mb-2" />
            <p className="text-xs text-neutral-400 font-medium">No expenses logged in this month</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Category breakdown will visualize upon adding expenses</p>
          </div>
        ) : (
          <div className="h-52 w-full flex flex-col sm:flex-row items-center">
            <div className="h-full w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PALETTE[index % PALETTE.length]}
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
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    }}
                    formatter={(value: any) => [formatCurrency(Number(value), currency), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Compact Legend */}
            <div className="w-full sm:w-1/2 pl-0 sm:pl-3 max-h-48 overflow-y-auto space-y-1.5 mt-2 sm:mt-0">
              {categoryBreakdown.map((cat, i) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                    />
                    <span className="text-neutral-300 truncate max-w-[100px]">{cat.category}</span>
                  </div>
                  <div className="font-semibold text-white font-mono text-[11px] shrink-0">
                    {formatCurrency(cat.amount, currency)}{" "}
                    <span className="text-neutral-500 text-[10px]">({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Daily Spending Velocity Area Chart */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 lg:col-span-2 transition duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Cumulative Spend Velocity
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Day-by-Day Burn Curve</p>
          </div>
          <div className="h-7 w-7 rounded-xl bg-white/[0.04] border border-white/[0.06] text-neutral-400 flex items-center justify-center">
            <Activity className="h-3.5 w-3.5" />
          </div>
        </div>

        {dailyTrends.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/[0.06] rounded-2xl bg-[#090a0d]">
            <Activity className="h-6 w-6 text-neutral-600 mb-2" />
            <p className="text-xs text-neutral-400 font-medium">No daily spend recorded for this month</p>
          </div>
        ) : (
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1f26" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(d) => d.slice(8)}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#12141a",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "14px",
                    color: "#f8fafc",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  }}
                  formatter={(value: any, name: any) => [
                    formatCurrency(Number(value), currency),
                    name === "cumulative" ? "Cumulative Spend" : "Daily Spend",
                  ]}
                  labelFormatter={(l) => `Date: ${l}`}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#spendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
