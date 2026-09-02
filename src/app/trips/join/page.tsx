"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plane, Sparkles, ArrowRight, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";

function JoinPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code") || "";

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if session exists
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          // If code is present and user is logged in, auto-join
          if (code) {
            joinGroupWithCode(code);
          }
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [code]);

  const joinGroupWithCode = async (inviteCode: string) => {
    setJoining(true);
    setError(null);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to join group");
      }

      setStatusMessage("Joined trip successfully! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/?tab=trips");
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error joining group");
    } finally {
      setJoining(false);
    }
  };

  const handleAuthSuccess = async (user: any) => {
    setCurrentUser(user);
    if (code) {
      await joinGroupWithCode(code);
    } else {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is not logged in, prompt quick profile login/creation
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center px-4">
        {code && (
          <div className="max-w-md mx-auto mb-4 bg-slate-900 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 text-xs text-emerald-300">
            <Plane className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>
              You were invited to join trip with code: <b className="font-mono text-white">{code}</b>. Login or create your quick profile below to join!
            </span>
          </div>
        )}
        <AuthModal onSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <Plane className="h-8 w-8" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white">Join Trip Group</h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="text-emerald-400 font-bold">@{currentUser.username}</span>
          </p>
        </div>

        {code && (
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Invite Code
            </span>
            <span className="text-xl font-black text-emerald-400 font-mono tracking-widest">
              {code}
            </span>
          </div>
        )}

        {statusMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {!statusMessage && (
          <button
            onClick={() => joinGroupWithCode(code)}
            disabled={joining || !code}
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {joining ? (
              <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Confirm & Join Group</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
}
