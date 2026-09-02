"use client";

import React, { useState } from "react";
import {
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Globe,
  HelpCircle,
  KeyRound,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface AuthModalProps {
  onSuccess: (user: { id: string; username: string; currency: string }) => void;
}

const SECURITY_QUESTIONS = [
  "What is your secret backup word?",
  "What is your favorite city / hometown?",
  "What was your first pet's name?",
  "What is your favorite sports team / hobby?",
  "What was the name of your first school?",
];

export function AuthModal({ onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot_pin">("login");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Registration & Security Recovery
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");

  // Forgot PIN State
  const [forgotStep, setForgotStep] = useState<"enter_username" | "enter_answer_and_pin">("enter_username");
  const [fetchedQuestion, setFetchedQuestion] = useState<string>("");
  const [newPin, setNewPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const cleanUsernameInput = (val: string) => {
    return val.toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  };

  const cleanPinInput = (val: string) => {
    return val.replace(/\D/g, "").slice(0, 6);
  };

  const handleFetchQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = cleanUsernameInput(username);
    if (!cleanUser) {
      setError("Please enter your username");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/forgot-pin?username=${cleanUser}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "User not found");
      }
      setFetchedQuestion(data.securityQuestion);
      setForgotStep("enter_answer_and_pin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error looking up username");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!securityAnswer.trim()) {
      setError("Please enter your secret backup word");
      return;
    }

    if (newPin.length < 4) {
      setError("New PIN must be at least 4 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUsernameInput(username),
          securityAnswer: securityAnswer.trim(),
          newPin: newPin.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset PIN");
      }

      setSuccessMsg("PIN reset successfully! Logging you in...");
      setTimeout(() => {
        onSuccess(data.user);
      }, 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error resetting PIN");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanUser = cleanUsernameInput(username);
    const cleanPin = cleanPinInput(pin);

    if (cleanUser.length < 2) {
      setError("Username must be at least 2 characters long");
      return;
    }

    if (cleanPin.length < 4) {
      setError("PIN must be 4 to 6 numeric digits");
      return;
    }

    if (mode === "register" && !securityAnswer.trim()) {
      setError("Please enter a secret backup word for PIN recovery");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { username: cleanUser, pin: cleanPin }
          : {
              username: cleanUser,
              pin: cleanPin,
              currency,
              securityQuestion,
              securityAnswer: securityAnswer.trim(),
            };

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
      setError(err instanceof Error ? err.message : "Authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Matte Dark Glass Card */}
      <div className="relative bg-[#181b22] border border-white/10 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-2xl">
        {/* Fixed Header */}
        <div className="min-h-[56px] mb-5">
          {mode === "forgot_pin" ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setForgotStep("enter_username");
                  setError(null);
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-emerald-400" />
                  <span>Reset Forgotten PIN</span>
                </h2>
                <p className="text-xs text-neutral-400">Recover profile with your secret backup word</p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {mode === "login" ? "Welcome Back" : "Create Profile"}
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {mode === "login"
                  ? "Enter your unique username and numeric PIN."
                  : "Pick a username, 4–6 digit PIN, and secret backup word."}
              </p>
            </>
          )}
        </div>

        {/* Mode Toggle (Segmented iOS Glass Style) */}
        {mode !== "forgot_pin" && (
          <div className="grid grid-cols-2 gap-1 bg-[#101216]/90 p-1 rounded-2xl border border-white/5 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === "login"
                  ? "bg-white/10 text-white shadow-sm font-black"
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
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === "register"
                  ? "bg-emerald-500 text-[#0b1410] shadow-sm font-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Create Profile
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORGOT PIN VIEW */}
        {mode === "forgot_pin" ? (
          forgotStep === "enter_username" ? (
            <form onSubmit={handleFetchQuestion} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Your Username</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500 text-xs font-mono font-bold">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(cleanUsernameInput(e.target.value))}
                    placeholder="alex"
                    autoFocus
                    className="w-full bg-[#101216] border border-white/10 rounded-2xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-[#0b1410] font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 transition"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-[#0b1410] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Next: Verify Security Word</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPinSubmit} className="space-y-4">
              <div className="bg-[#101216] p-3 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Security Question:</span>
                <p className="text-xs font-bold text-emerald-400">{fetchedQuestion}</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Your Secret Backup Word</span>
                </label>
                <input
                  type="text"
                  required
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Enter your backup answer"
                  autoFocus
                  className="w-full bg-[#101216] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Choose New PIN (4–6 Digits)</span>
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(cleanPinInput(e.target.value))}
                  placeholder="••••"
                  className="w-full bg-[#101216] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white tracking-widest placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-[#0b1410] font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 transition"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-[#0b1410] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Reset PIN & Log In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )
        ) : (
          /* STANDARD LOGIN & REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-400" />
                <span>Unique Username</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500 text-xs font-mono font-bold">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(cleanUsernameInput(e.target.value))}
                  placeholder="e.g. alex"
                  className="w-full bg-[#101216] border border-white/10 rounded-2xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition font-mono"
                />
              </div>
            </div>

            {/* PIN Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{mode === "login" ? "4–6 Digit PIN" : "Choose 4–6 Digit PIN"}</span>
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot_pin");
                      setError(null);
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Forgot PIN?
                  </button>
                )}
              </div>
              <input
                type="password"
                inputMode="numeric"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(cleanPinInput(e.target.value))}
                placeholder="••••"
                className="w-full bg-[#101216] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white tracking-widest placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition font-mono"
              />
            </div>

            {/* Registration Extra Fields */}
            {mode === "register" && (
              <>
                {/* Preferred Currency */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Primary Currency</span>
                  </label>
                  <CustomSelect
                    options={Object.values(SUPPORTED_CURRENCIES).map((c) => ({
                      value: c.code,
                      label: `${c.symbol} ${c.code} - ${c.name}`,
                    }))}
                    value={currency}
                    onChange={setCurrency}
                    size="md"
                  />
                </div>

                {/* Security Question */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span>PIN Recovery Question</span>
                  </label>
                  <CustomSelect
                    options={SECURITY_QUESTIONS}
                    value={securityQuestion}
                    onChange={setSecurityQuestion}
                    size="md"
                  />
                </div>

                {/* Secret Backup Word */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Secret Backup Word</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="e.g. Chicago, Max, or Sunrise"
                    className="w-full bg-[#101216] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Used to safely reset your PIN if you ever forget it.
                  </p>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-[#0b1410] font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 transition"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-[#0b1410] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === "login" ? "Log In to FlowBudget" : "Create Profile"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Security Note */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/80" />
          <span>Encrypted with Salted Bcrypt & Neon Cloud PostgreSQL</span>
        </div>
      </div>
    </div>
  );
}
