"use client";

import React, { useState } from "react";
import {
  Scale,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Banknote,
} from "lucide-react";
import { formatCurrency } from "@/lib/currencies";

interface SettlementViewProps {
  groupId: string;
  calculations: any;
  currency: string;
  currentUserId: string;
  onSettlementRecorded: () => void;
}

export function SettlementView({
  groupId,
  calculations,
  currency,
  currentUserId,
  onSettlementRecorded,
}: SettlementViewProps) {
  const { memberBalances = [], settlements = [] } = calculations;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMarkSettled = async (fromUserId: string, toUserId: string, amount: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/groups/${groupId}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId, toUserId, amount }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record settlement");
      }

      onSettlementRecorded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Settlement error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Min-Cash-Flow Optimal Transfers Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-7">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Min-Cash-Flow Optimal Transfers</h3>
              <p className="text-xs text-neutral-400">
                Minimum mathematical payments needed to settle all trip debts
              </p>
            </div>
          </div>
        </div>

        {settlements.length === 0 ? (
          <div className="py-10 text-center space-y-2 border border-dashed border-white/[0.06] rounded-2xl bg-[#090a0d] my-4 p-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">All Debts are 100% Settled!</h4>
            <p className="text-xs text-neutral-400">Everyone in this group is squared up.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05] mt-4">
            {settlements.map((tx: any, idx: number) => {
              const isSender = tx.fromUserId === currentUserId;
              const isReceiver = tx.toUserId === currentUserId;
              const isUserInvolved = isSender || isReceiver;

              return (
                <div
                  key={idx}
                  className={`py-3.5 px-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition duration-150 ${
                    isUserInvolved ? "bg-emerald-500/[0.04] border border-emerald-500/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#090a0d] border border-white/[0.08] flex items-center justify-center font-bold text-xs text-neutral-200">
                      {tx.fromUsername.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-white">
                        @{tx.fromUsername} {isSender && <span className="text-emerald-400 font-semibold">(You)</span>}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-neutral-500" />
                      <span className="font-bold text-white">
                        @{tx.toUsername} {isReceiver && <span className="text-emerald-400 font-semibold">(You)</span>}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <span className="text-sm sm:text-base font-bold font-mono text-emerald-400">
                      {formatCurrency(tx.amount, currency)}
                    </span>

                    <button
                      onClick={() => handleMarkSettled(tx.fromUserId, tx.toUserId, tx.amount)}
                      disabled={loading}
                      className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Record Payment</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Individual Net Balance Breakdown */}
      <div className="glass-card rounded-3xl p-5 sm:p-7">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Individual Net Balances
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {memberBalances.map((mb: any) => {
            const isOwed = mb.netBalance > 0.01;
            const owes = mb.netBalance < -0.01;

            return (
              <div
                key={mb.userId}
                className="bg-[#090a0d] p-4 rounded-2xl border border-white/[0.08] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">@{mb.username}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOwed
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : owes
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-white/5 text-neutral-400"
                    }`}
                  >
                    {isOwed ? "Gets back" : owes ? "Owes group" : "Settled"}
                  </span>
                </div>

                <div className="text-lg font-bold font-mono">
                  <span className={isOwed ? "text-emerald-400" : owes ? "text-rose-400" : "text-neutral-400"}>
                    {formatCurrency(Math.abs(mb.netBalance), currency)}
                  </span>
                </div>

                <div className="text-[10px] text-neutral-400 flex items-center justify-between pt-1 border-t border-white/[0.04]">
                  <span>Paid: {formatCurrency(mb.totalPaid, currency)}</span>
                  <span>Share: {formatCurrency(mb.totalOwed, currency)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
