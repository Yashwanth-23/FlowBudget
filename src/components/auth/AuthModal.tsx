"use client";

import React, { useState } from "react";
import { Lock, User, KeyRound, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";

interface AuthModalProps {
  onSuccess: (user: { id: string; username: string; currency: string }) => void;
  initialMode?: "login" | "register";
}

export function AuthModal({ onSuccess, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 2) {
      setError("Please enter a username (at least 2 characters)");
      return;
    }

    if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      setError("PIN must be 4 to 6 numeric digits (e.g. 1234)");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        mode === "register"
          ? { username: cleanUsername, pin, currency }
          : { username: cleanUsername, pin };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      onSuccess(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#181b22]/90 border border-white/10 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-2xl">
      {/* Header with Fixed Height to Prevent Any Layout Shifting */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 shadow-inner">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="min-h-[64px] flex flex-col justify-center">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white transition-all">
            {mode === "login" ? "Welcome Back" : "Create Your Profile"}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            {mode === "login"
              ? "Enter your unique username and PIN to continue."
              : "Set a unique username and 4–6 digit PIN. No email required."}
          </p>
        </div>
      </div>

      {/* iOS-Style Glass Segmented Control */}
      <div className="flex bg-[#101216]/80 p-1 rounded-2xl border border-white/5 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            mode === "login"
              ? "bg-emerald-500 text-[#0b1410] shadow-md font-black"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Login with PIN
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            mode === "register"
              ? "bg-emerald-500 text-[#0b1410] shadow-md font-black"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Create Profile
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
            Unique Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="e.g. rahul, alex, sam"
              required
              autoComplete="username"
              className="w-full bg-[#101216] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition"
            />
          </div>
        </div>

        {/* PIN */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
            4–6 Digit Numeric PIN
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <KeyRound className="h-4 w-4" />
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              required
              className="w-full bg-[#101216] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white tracking-widest placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition font-mono"
            />
          </div>
        </div>

        {/* Currency selection on register */}
        {mode === "register" && (
          <div className="animate-in fade-in duration-200">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#101216] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 transition"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol} {c.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-[#0b1410] font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-[#0b1410] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{mode === "login" ? "Enter Dashboard" : "Create Profile & Start"}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Feature Highlights */}
      <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
          <span>Daily Budget & Reports</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
          <span>Shared Trip Splits</span>
        </div>
      </div>
    </div>
  );
}
