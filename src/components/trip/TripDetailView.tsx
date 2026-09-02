"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Plus,
  Share2,
  Users,
  Receipt,
  Scale,
  BarChart3,
  Trash2,
  UserX,
  Crown,
  Printer,
} from "lucide-react";
import { formatCurrency, SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { AddGroupExpenseModal } from "./AddGroupExpenseModal";
import { SettlementView } from "./SettlementView";
import { ShareModal } from "./ShareModal";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface TripDetailViewProps {
  groupId: string;
  onBack: () => void;
  currentUserId: string;
  userCurrency: string;
}

const PALETTE = [
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#eab308",
  "#14b8a6",
];

export function TripDetailView({ groupId, onBack, currentUserId, userCurrency }: TripDetailViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"expenses" | "settlement" | "analytics">("expenses");

  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const fetchGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${groupId}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (err) {
      console.error("Fetch group details error:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroupDetails();
  }, [fetchGroupDetails, userCurrency]);

  const handleUpdateGroupCurrency = async (newCurr: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: newCurr }),
      });
      if (res.ok) {
        fetchGroupDetails();
      }
    } catch (err) {
      console.error("Failed to update group currency:", err);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this group expense?")) return;
    try {
      const res = await fetch(`/api/groups/${groupId}/expenses/${expenseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchGroupDetails();
      }
    } catch (err) {
      console.error("Delete expense error:", err);
    }
  };

  const handleRemoveMember = async (memberId: string, memberUsername: string) => {
    if (!confirm(`Are you sure you want to remove @${memberUsername} from this group?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: "DELETE",
      });
      const resJson = await res.json();
      if (!res.ok) {
        alert(resJson.error || "Failed to remove member");
        return;
      }
      fetchGroupDetails();
    } catch (err) {
      console.error("Remove member error:", err);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading && !data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="h-7 w-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-sm text-neutral-400">Group not found or you are not a member.</p>
        <button
          onClick={onBack}
          className="btn-secondary mt-4 px-4 py-2 text-xs rounded-xl"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  const { group, members, expenses, calculations } = data;
  const currency = group.currency || userCurrency || "USD";
  const totalSpent = calculations.totalSpent || 0;
  const totalBudget = group.totalBudget || 0;
  const budgetPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-tab-switch pb-24 md:pb-12">
      {/* Top Bar with Back Button and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-[#12141a] hover:bg-white/[0.06] border border-white/[0.08] text-neutral-300 rounded-xl transition duration-150 active:scale-95 no-print"
            title="Back to All Groups"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{group.name}</h1>
              {group.isAdmin ? (
                <select
                  value={currency}
                  onChange={(e) => handleUpdateGroupCurrency(e.target.value)}
                  title="Change group currency (Admin setting)"
                  className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 focus:outline-none cursor-pointer transition"
                >
                  {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#12141a] text-white">
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {currency}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Group code: <span className="font-mono text-emerald-400 font-semibold">{group.code}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 no-print">
          {/* Print PDF Button */}
          <button
            onClick={handlePrintPDF}
            title="Print or Export Group Statement as PDF"
            className="btn-secondary flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs font-medium rounded-2xl"
          >
            <Printer className="h-3.5 w-3.5 text-cyan-400" />
            <span>Print / PDF</span>
          </button>

          {/* Share Invite Link */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="btn-secondary flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs font-medium rounded-2xl"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-400/90" />
            <span>Invite Members</span>
          </button>

          {/* Add Group Expense */}
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="btn-primary flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-2xl"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Budget & Spend Summary Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-7">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
              Total Group Spend
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
              {formatCurrency(totalSpent, currency)}
            </span>
          </div>

          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
              Group Budget Cap
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-neutral-300 font-mono tracking-tight">
              {totalBudget > 0 ? formatCurrency(totalBudget, currency) : "No Limit Set"}
            </span>
          </div>

          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
              Members Joined
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400">
              {members.length} {members.length === 1 ? "Person" : "People"}
            </span>
          </div>
        </div>

        {totalBudget > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-400">Group Budget Consumed</span>
              <span
                className={`font-mono font-bold ${
                  budgetPercent > 100
                    ? "text-rose-400"
                    : budgetPercent > 80
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {budgetPercent}%
              </span>
            </div>
            <div className="w-full bg-[#090a0d] rounded-full h-2 overflow-hidden border border-white/[0.06]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  budgetPercent > 100
                    ? "bg-rose-500"
                    : budgetPercent > 80
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Members Drawer / Pills with Admin Controls */}
      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Group Participants ({members.length})
            </h3>
          </div>
          {group.isAdmin && (
            <span className="text-[10px] text-neutral-400 italic">
              (Admin permissions active)
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {members.map((m: any) => {
            const isMe = m.userId === currentUserId;
            const isCreator = m.userId === group.createdById;
            const isMemberAdmin = m.role === "ADMIN" || isCreator;

            return (
              <div
                key={m.id}
                className="flex items-center gap-2 bg-[#090a0d] border border-white/[0.08] pl-3 pr-2 py-1.5 rounded-xl text-xs"
              >
                <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center">
                  {m.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-neutral-200">
                  @{m.username} {isMe && <span className="text-emerald-400 font-semibold">(You)</span>}
                </span>

                {isMemberAdmin && (
                  <span title="Group Admin">
                    <Crown className="h-3 w-3 text-amber-400 shrink-0" />
                  </span>
                )}

                {/* Admin Kick / Remove Member Action */}
                {group.isAdmin && !isCreator && !isMe && (
                  <button
                    onClick={() => handleRemoveMember(m.id, m.username)}
                    title={`Remove @${m.username} from group`}
                    className="p-1 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition duration-150 no-print"
                  >
                    <UserX className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* iOS Segmented Sub-Navigation */}
      <div className="flex items-center bg-[#12141a] p-1 rounded-2xl border border-white/[0.08] max-w-md no-print">
        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
            activeTab === "expenses"
              ? "bg-white/10 text-white border border-white/15 shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Receipt className="h-3.5 w-3.5" />
          <span>Expenses ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settlement")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
            activeTab === "settlement"
              ? "bg-white/10 text-white border border-white/15 shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Scale className="h-3.5 w-3.5" />
          <span>Settlement</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
            activeTab === "analytics"
              ? "bg-white/10 text-white border border-white/15 shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Analytics</span>
        </button>
      </div>

      {/* Tab 1: Expenses Ledger Feed */}
      {activeTab === "expenses" && (
        <div className="glass-card rounded-3xl p-5 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Group Expense Feed</h3>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition no-print"
            >
              + Add Expense
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/[0.06] rounded-2xl bg-[#090a0d]">
              <Receipt className="h-6 w-6 text-neutral-600 mb-2" />
              <p className="text-xs text-neutral-400 font-medium">No group expenses logged yet</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">Click &ldquo;Add Expense&rdquo; to start recording shared costs</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {expenses.map((exp: any) => {
                const dateStr = new Date(exp.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                let payersLabel = "";
                if (exp.payers && exp.payers.length > 1) {
                  payersLabel = `Paid by ${exp.payers
                    .map((p: any) => `@${p.username} (${formatCurrency(p.amountPaid, currency)})`)
                    .join(", ")}`;
                } else if (exp.payers && exp.payers.length === 1) {
                  payersLabel = `Paid by @${exp.payers[0].username}`;
                } else {
                  payersLabel = `Paid by @${exp.paidByUsername || "Member"}`;
                }

                const isOneOfPayers = exp.payers
                  ? exp.payers.some((p: any) => p.userId === currentUserId)
                  : exp.paidById === currentUserId;
                const canDelete = isOneOfPayers || group.isAdmin;

                return (
                  <div
                    key={exp.id}
                    className="py-3.5 flex items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] px-2 rounded-xl transition duration-150"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">{exp.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                          <span className="font-semibold text-emerald-400">
                            {payersLabel}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{dateStr}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded bg-[#090a0d] border border-white/[0.08] text-neutral-400">
                            {exp.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1">
                          Split among {exp.splits.length} members (
                          {exp.splits.map((s: any) => `@${s.username}`).join(", ")})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm sm:text-base font-bold font-mono text-white">
                        {formatCurrency(exp.amount, currency)}
                      </span>

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          title="Delete Expense"
                          className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition duration-150 no-print"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Min-Cash-Flow Settlement View */}
      {activeTab === "settlement" && (
        <SettlementView
          groupId={groupId}
          calculations={calculations}
          currency={currency}
          currentUserId={currentUserId}
          onSettlementRecorded={fetchGroupDetails}
        />
      )}

      {/* Tab 3: Group Analytics View */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-3xl p-5 sm:p-6">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4">
              Group Spending by Category
            </h3>
            {calculations.categoryBreakdown.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/[0.06] rounded-2xl bg-[#090a0d]">
                <p className="text-xs text-neutral-400">No group expense data yet</p>
              </div>
            ) : (
              <div className="h-52 flex flex-col sm:flex-row items-center">
                <div className="h-full w-full sm:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={calculations.categoryBreakdown}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={4}
                      >
                        {calculations.categoryBreakdown.map((_: any, idx: number) => (
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
                        formatter={(val: any) => [formatCurrency(Number(val), currency), ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 space-y-1.5 max-h-44 overflow-y-auto pl-2">
                  {calculations.categoryBreakdown.map((cat: any, i: number) => (
                    <div key={cat.category} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                        />
                        <span className="text-neutral-300 truncate max-w-[100px]">{cat.category}</span>
                      </div>
                      <span className="font-semibold text-white font-mono text-[11px] shrink-0">
                        {formatCurrency(cat.amount, currency)}{" "}
                        <span className="text-neutral-400 text-[10px]">({cat.percentage}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass-card rounded-3xl p-5 sm:p-6">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4">
              Total Paid per Member
            </h3>
            <div className="space-y-3">
              {calculations.memberBalances.map((mb: any) => {
                const pct = totalSpent > 0 ? Math.round((mb.totalPaid / totalSpent) * 100) : 0;
                return (
                  <div key={mb.userId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-200">@{mb.username}</span>
                      <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                        {formatCurrency(mb.totalPaid, currency)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#090a0d] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddGroupExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSuccess={fetchGroupDetails}
        currency={currency}
        groupId={groupId}
        members={members}
        currentUserId={currentUserId}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        groupName={group.name}
        groupCode={group.code}
      />
    </div>
  );
}
