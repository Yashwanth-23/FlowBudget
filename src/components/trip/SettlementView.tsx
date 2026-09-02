"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Scale,
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatCurrency } from "@/lib/currencies";
import { GroupCalculationResult, SettlementTransfer } from "@/lib/settlement";

interface SettlementViewProps {
  groupId: string;
  calculations: GroupCalculationResult;
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
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const { memberBalances, settlementTransfers } = calculations;
  const isAllSettled = settlementTransfers.length === 0;

  const handleSettleTransfer = async (transfer: SettlementTransfer) => {
    if (!confirm(`Confirm settlement payment of ${formatCurrency(transfer.amount, currency)} from @${transfer.fromUsername} to @${transfer.toUsername}?`)) {
      return;
    }

    setSettlingId(transfer.id);

    try {
      const res = await fetch(`/api/groups/${groupId}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: transfer.fromUserId,
          toUserId: transfer.toUserId,
          amount: transfer.amount,
        }),
      });

      if (res.ok) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        onSettlementRecorded();
      }
    } catch (err) {
      console.error("Settlement record error:", err);
    } finally {
      setSettlingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Optimal Min-Cash-Flow Transfers Card */}
      <div className="bg-[#181b22] border border-white/5 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Min-Cash-Flow Settlement
              </h3>
              <p className="text-xs text-neutral-400">
                Algorithmically optimized to settle all trip debts in minimal transactions.
              </p>
            </div>
          </div>
        </div>

        {isAllSettled ? (
          <div className="py-12 text-center bg-[#101216] rounded-2xl border border-white/5 p-8 space-y-2">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-1">
              <Sparkles className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold text-white">Everyone is All Settled Up!</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              No outstanding balances remaining among trip members.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {settlementTransfers.map((transfer) => {
              const isFromMe = transfer.fromUserId === currentUserId;
              const isToMe = transfer.toUserId === currentUserId;

              return (
                <div
                  key={transfer.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3.5 transition ${
                    isFromMe
                      ? "bg-rose-500/5 border-rose-500/20"
                      : isToMe
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-[#101216] border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Debtor */}
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                        Payer (Owes)
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white truncate block">
                        @{transfer.fromUsername} {isFromMe && "(You)"}
                      </span>
                    </div>

                    {/* Arrow & Amount */}
                    <div className="flex flex-col items-center shrink-0 px-2">
                      <span className="text-xs font-mono font-black text-emerald-400">
                        {formatCurrency(transfer.amount, currency)}
                      </span>
                      <div className="flex items-center text-neutral-600 my-0.5">
                        <span className="w-5 h-[1px] bg-neutral-700" />
                        <ArrowRight className="h-3 w-3 text-emerald-400" />
                      </div>
                    </div>

                    {/* Creditor */}
                    <div className="text-right min-w-0">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                        Recipient (Gets)
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white truncate block">
                        @{transfer.toUsername} {isToMe && "(You)"}
                      </span>
                    </div>
                  </div>

                  {/* Settle Action Button */}
                  <button
                    onClick={() => handleSettleTransfer(transfer)}
                    disabled={settlingId === transfer.id}
                    className="w-full py-2 px-3 bg-[#181b22] hover:bg-white/5 border border-white/10 text-neutral-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    {settlingId === transfer.id ? (
                      <div className="h-3 w-3 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Record Settlement Paid</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Individual Member Balance Breakdown */}
      <div className="bg-[#181b22] border border-white/5 rounded-3xl p-6 sm:p-7 shadow-sm">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Member Ledger Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {memberBalances.map((mb) => {
            const isMe = mb.userId === currentUserId;
            const isOwed = mb.netBalance > 0.01;
            const owes = mb.netBalance < -0.01;

            return (
              <div
                key={mb.userId}
                className={`bg-[#101216] p-3.5 rounded-2xl border space-y-2.5 ${
                  isMe ? "border-emerald-500/30 shadow-sm" : "border-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-white/5 text-neutral-300 font-bold text-[11px] flex items-center justify-center">
                      {mb.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-white">
                      @{mb.username} {isMe && <span className="text-emerald-400">(You)</span>}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-md ${
                      isOwed
                        ? "bg-emerald-500/10 text-emerald-400"
                        : owes
                        ? "bg-rose-500/10 text-rose-400"
                        : "bg-white/5 text-neutral-400"
                    }`}
                  >
                    {isOwed
                      ? `+${formatCurrency(mb.netBalance, currency)}`
                      : owes
                      ? formatCurrency(mb.netBalance, currency)
                      : "Settled"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-white/5">
                  <div>
                    <span className="text-neutral-500 block">Total Paid</span>
                    <span className="font-mono text-neutral-300 font-semibold">
                      {formatCurrency(mb.totalPaid, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Total Share</span>
                    <span className="font-mono text-neutral-300 font-semibold">
                      {formatCurrency(mb.totalShare, currency)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
