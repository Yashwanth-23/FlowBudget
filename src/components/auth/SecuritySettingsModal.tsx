"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Shield,
  KeyRound,
  Lock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    username: string;
    currency: string;
  };
  onUserUpdated: (user: { id: string; username: string; currency: string }) => void;
}

const SECURITY_QUESTIONS = [
  "What is your secret backup word?",
  "What is your favorite city / hometown?",
  "What was your first pet's name?",
  "What is your favorite sports team / hobby?",
  "What was the name of your first school?",
];

export function SecuritySettingsModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}: SecuritySettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<"backup_word" | "change_pin">("backup_word");

  // Profile Data
  const [hasBackupConfigured, setHasBackupConfigured] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");

  // PIN Change
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
      // Fetch latest profile security state
      fetch("/api/auth/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setHasBackupConfigured(data.user.hasSecurityAnswer);
            if (data.user.securityQuestion) {
              setSecurityQuestion(data.user.securityQuestion);
            }
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSaveBackupWord = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!securityAnswer.trim() || securityAnswer.trim().length < 2) {
      setError("Please enter a secret backup word with at least 2 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          securityQuestion,
          securityAnswer: securityAnswer.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update backup word");
      }

      setHasBackupConfigured(true);
      setSecurityAnswer("");
      setSuccess("Secret Backup Word configured! You can now recover your account anytime.");
      onUserUpdated(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving backup word");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPin.length < 4 || newPin.length > 6) {
      setError("New PIN must be 4 to 6 numeric digits");
      return;
    }

    if (newPin !== confirmPin) {
      setError("New PIN and Confirm PIN do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPin,
          newPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change PIN");
      }

      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setSuccess("Your PIN has been changed successfully!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error changing PIN");
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#090d16]/40 backdrop-blur-xl overflow-y-auto cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#12141a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Profile & Security Settings</h2>
            <p className="text-xs text-neutral-400">Manage PIN, backup recovery word & profile options</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-5 p-3 rounded-2xl bg-[#090a0d] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-white/5 text-neutral-300 font-bold text-xs flex items-center justify-center">
              @{user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">@{user.username}</span>
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-neutral-500" />
                <span>Active Profile</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                hasBackupConfigured
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {hasBackupConfigured ? "✓ Backup Protected" : "⚠️ No Backup Word Set"}
            </span>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="grid grid-cols-2 gap-1 bg-[#090a0d] p-1 rounded-2xl border border-white/5 mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveSection("backup_word");
              setError(null);
              setSuccess(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              activeSection === "backup_word"
                ? "bg-white/10 text-white font-semibold border border-white/15"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Backup Word
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection("change_pin");
              setError(null);
              setSuccess(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              activeSection === "change_pin"
                ? "bg-white/10 text-white font-semibold border border-white/15"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Change PIN
          </button>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* SECTION 1: SET / UPDATE SECRET BACKUP WORD */}
        {activeSection === "backup_word" && (
          <form onSubmit={handleSaveBackupWord} className="space-y-4">
            <p className="text-xs text-neutral-400">
              Your secret backup word is used to instantly recover your profile and reset your PIN if you ever forget it.
            </p>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>Select Security Question</span>
              </label>
              <CustomSelect
                options={SECURITY_QUESTIONS}
                value={securityQuestion}
                onChange={setSecurityQuestion}
                size="md"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
                <span>{hasBackupConfigured ? "New Secret Backup Word" : "Set Secret Backup Word"}</span>
              </label>
              <input
                type="text"
                required
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="e.g. Chicago, Max, or Sunrise"
                className="w-full bg-[#090a0d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Answers are case-insensitive and hashed with salted Bcrypt.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 btn-primary text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-[#04130c] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Save Secret Backup Word</span>
              )}
            </button>
          </form>
        )}

        {/* SECTION 2: CHANGE 4-6 DIGIT PIN */}
        {activeSection === "change_pin" && (
          <form onSubmit={handleChangePin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span>Current PIN</span>
              </label>
              <input
                type="password"
                inputMode="numeric"
                required
                maxLength={6}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full bg-[#090a0d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white tracking-widest placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  New PIN (4–6 Digits)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full bg-[#090a0d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white tracking-widest placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full bg-[#090a0d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white tracking-widest placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 btn-primary text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-[#04130c] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Update PIN</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
