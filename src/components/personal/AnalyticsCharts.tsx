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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 my-6">
      {/* 1. Monthly Income vs Expenses */}
      <div className="bg-[#181b22] border border-white/5 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Monthly Cash Flow</h3>
            <p className="text-xs text-neutral-400">Income vs Expenses Comparison</p>
          </div>
        </div>

        {monthlyTrends.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-xs text-neutral-500">
            No transaction history recorded yet
          </div>
        ) : (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252a34" vertical={false} />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#181b22",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "14px",
                    color: "#f1f3f5",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value), currency), ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Expense Category Donut */}
      <div className="bg-[#181b22] border border-white/5 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Expense by Category</h3>
            <p className="text-xs text-neutral-400">Monthly Spending Distribution</p>
          </div>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-xs text-neutral-500">
            No expenses logged in this month
          </div>
        ) : (
          <div className="h-60 w-full flex flex-col sm:flex-row items-center">
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
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PALETTE[index % PALETTE.length]}
                        stroke="#181b22"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#181b22",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "14px",
                      color: "#f1f3f5",
                      fontSize: "12px",
                    }}
                    formatter={(value: any) => [formatCurrency(Number(value), currency), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Compact Legend */}
            <div className="w-full sm:w-1/2 pl-0 sm:pl-4 max-h-52 overflow-y-auto space-y-1.5 mt-2 sm:mt-0">
              {categoryBreakdown.map((cat, i) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                    />
                    <span className="text-neutral-300 truncate max-w-[110px]">{cat.category}</span>
                  </div>
                  <div className="font-semibold text-white font-mono text-[11px]">
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
      <div className="bg-[#181b22] border border-white/5 rounded-3xl p-6 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cumulative Spend Velocity</h3>
            <p className="text-xs text-neutral-400">Day-by-Day Burn Curve</p>
          </div>
        </div>

        {dailyTrends.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-xs text-neutral-500">
            No daily spend recorded for this month
          </div>
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252a34" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(d) => d.slice(8)}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#181b22",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "14px",
                    color: "#f1f3f5",
                    fontSize: "12px",
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
