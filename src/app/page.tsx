"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/auth/AuthModal";
import { PersonalHub } from "@/components/personal/PersonalHub";
import { GroupsHub } from "@/components/trip/GroupsHub";
import { ReportsView } from "@/components/reports/ReportsView";
import { HelpSupportModal } from "@/components/support/HelpSupportModal";
import { Wallet, Sparkles, Users, BarChart3, HelpCircle } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  currency: string;
}

function MainAppContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as "personal" | "trips" | "reports") || "personal";

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<"personal" | "trips" | "reports">(initialTab);
  const [isLandingHelpOpen, setIsLandingHelpOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleCurrencyChange = async (newCurrency: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/auth/currency", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: newCurrency }),
      });
      if (res.ok) {
        setUser({ ...user, currency: newCurrency });
      }
    } catch (err) {
      console.error("Failed to update currency:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101216] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Landing Page with Stable 12-column Grid Alignment (No Vertical Layout Jumps)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#101216] text-[#f1f3f5] flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
        {/* Top Navbar */}
        <header className="border-b border-white/5 bg-[#101216]/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                <Wallet className="h-5 w-5 text-emerald-400 font-bold" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Flow<span className="text-emerald-400">Budget</span>
              </span>
            </div>

            {/* Help & Support Button */}
            <button
              onClick={() => setIsLandingHelpOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181b22] hover:bg-white/5 border border-white/10 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition"
            >
              <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>Help & Support</span>
            </button>
          </div>
        </header>

        {/* Stable Grid Layout: Items Top-Aligned */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Hero Text & Features (Permanently Stable) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Personal Budgeting + Group Trip Expense Splitter</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Manage daily finances & <br className="hidden sm:inline" />
                <span className="text-emerald-400">split trip expenses</span> effortlessly.
              </h1>

              <p className="text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed">
                Track daily income & expenditures, set category caps, and view visual analytics.
                Planning a trip with friends? Create a shared ledger and settle debts in the minimum
                possible payments.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="bg-[#181b22] p-4 rounded-2xl border border-white/5 shadow-sm">
                  <Wallet className="h-5 w-5 text-emerald-400 mb-2" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Daily Ledger</h4>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Log income and expenses with payment modes and notes.
                  </p>
                </div>

                <div className="bg-[#181b22] p-4 rounded-2xl border border-white/5 shadow-sm">
                  <Users className="h-5 w-5 text-teal-400 mb-2" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Group Splits</h4>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    1-click shareable trip links with multi-payer expense splits.
                  </p>
                </div>

                <div className="bg-[#181b22] p-4 rounded-2xl border border-white/5 shadow-sm">
                  <BarChart3 className="h-5 w-5 text-cyan-400 mb-2" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Min-Cash Settle</h4>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Minimizes transactions so everyone settles up smoothly.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Auth Card */}
            <div className="lg:col-span-5 w-full max-w-md mx-auto lg:mx-0">
              <AuthModal onSuccess={(authenticatedUser) => setUser(authenticatedUser)} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 text-center text-xs text-neutral-500">
          FlowBudget • Personal & Trip Expense Management
        </footer>

        {/* Help & Support Modal */}
        <HelpSupportModal
          isOpen={isLandingHelpOpen}
          onClose={() => setIsLandingHelpOpen(false)}
          adminContact="https://github.com/Yashwanth-23/FlowBudget/issues"
        />
      </div>
    );
  }

  // Authenticated Workspace
  return (
    <div className="min-h-screen bg-[#101216] text-[#f1f3f5] selection:bg-emerald-500 selection:text-black">
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        user={user}
        onLogout={handleLogout}
        onCurrencyChange={handleCurrencyChange}
        onUserUpdated={(updated) => setUser(updated)}
      />

      <main className="max-w-7xl mx-auto">
        {currentTab === "personal" && <PersonalHub user={user} />}
        {currentTab === "trips" && <GroupsHub user={user} />}
        {currentTab === "reports" && <ReportsView user={user} />}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#101216] flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MainAppContent />
    </Suspense>
  );
}
