"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { formatCurrency, getCurrencySymbol } from "@/lib/currencies";
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
  LineChart,
  Line,
} from "recharts";

interface ReportsViewProps {
  user: {
    id: string;
    username: string;
    currency: string;
  };
}

const PALETTE = [
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#f97316",
  "#eab308",
  "#ec4899",
  "#14b8a6",
];

export function ReportsView({ user }: ReportsViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/transactions?month=all");
      const json = await res.json();
      if (res.ok) {
        setData(json.analytics || null);
      }
    } catch (err) {
      console.error("Fetch reports error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const symbol = getCurrencySymbol(user.currency);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-tab-switch pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Financial Analytics & Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Long-term cash flow trends, savings velocity & categorical breakdown.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-emerald-400 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Real-time Financial Intelligence</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="h-7 w-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data ? (
        <div className="py-16 text-center glass-card rounded-3xl p-8 space-y-3">
          <BarChart3 className="h-8 w-8 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Financial History Available</h3>
          <p className="text-xs text-neutral-400">
            Log transactions in your Personal Finance ledger to unlock visual analytics reports.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly Comparison */}
          <div className="glass-card rounded-3xl p-5 sm:p-7">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4">
              Annual Inflow vs Outflow
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyTrends || []}>
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
                    }}
                    formatter={(val: any) => [formatCurrency(Number(val), user.currency), ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Categorical Distribution */}
          <div className="glass-card rounded-3xl p-5 sm:p-7">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4">
              All-Time Spending Distribution
            </h3>
            <div className="h-60 w-full flex flex-col sm:flex-row items-center">
              <div className="h-full w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown || []}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {(data.categoryBreakdown || []).map((_: any, idx: number) => (
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
                      formatter={(val: any) => [formatCurrency(Number(val), user.currency), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full sm:w-1/2 space-y-1.5 max-h-52 overflow-y-auto pl-2 mt-2 sm:mt-0">
                {(data.categoryBreakdown || []).map((cat: any, i: number) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                      />
                      <span className="text-neutral-300 truncate max-w-[100px]">{cat.category}</span>
                    </div>
                    <span className="font-semibold text-white font-mono text-[11px] shrink-0">
                      {formatCurrency(cat.amount, user.currency)}{" "}
                      <span className="text-neutral-500 text-[10px]">({cat.percentage}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
