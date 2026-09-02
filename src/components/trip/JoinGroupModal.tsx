"use client";

import React, { useState } from "react";
import { X, UserPlus, ArrowRight, AlertCircle } from "lucide-react";

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (groupId: string) => void;
}

export function JoinGroupModal({ isOpen, onClose, onSuccess }: JoinGroupModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError("Please enter a group invite code");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to join group");
      }

      onSuccess(data.groupId);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error joining group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#181b22] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center font-bold">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Join Trip Group</h2>
            <p className="text-xs text-neutral-400">Enter the code shared by your friend</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Trip Invite Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. CO-FALL-26-4A9"
              required
              autoFocus
              className="w-full bg-[#101216] border border-white/10 rounded-xl px-4 py-3 text-center text-base font-black text-white tracking-widest placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition font-mono uppercase"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#101216] border border-white/5 text-neutral-300 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-[#0b1410] flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-[#0b1410] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Join Trip</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
