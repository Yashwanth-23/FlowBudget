"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/auth/AuthModal";
import { PersonalHub } from "@/components/personal/PersonalHub";
import { GroupsHub } from "@/components/trip/GroupsHub";
import { ReportsView } from "@/components/reports/ReportsView";
import { HelpSupportModal } from "@/components/support/HelpSupportModal";
import { FlowLogo } from "@/components/ui/FlowLogo";
import { Wallet, Sparkles, Users, BarChart3, HelpCircle } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  currency: string;
}

function normalizeTab(tab: string | null): "personal" | "groups" | "reports" {
  if (!tab) return "personal";
  const lower = tab.toLowerCase();
  if (lower === "trips" || lower === "groups") return "groups";
  if (lower === "reports") return "reports";
  return "personal";
}

function MainAppContent() {
  const searchParams = useSearchParams();
  const initialTab = normalizeTab(searchParams.get("tab"));

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<"personal" | "groups" | "reports">(initialTab);
  const [isLandingHelpOpen, setIsLandingHelpOpen] = useState(false);

  // Sync tab with URL on load/change
  useEffect(() => {
    const rawTab = searchParams.get("tab");
    const resolvedTab = normalizeTab(rawTab);
    setCurrentTab(resolvedTab);

    if (typeof window !== "undefined" && rawTab !== resolvedTab) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", resolvedTab);
      window.history.replaceState(null, "", url.toString());
    }
  }, [searchParams]);

  const handleTabChange = (newTab: "personal" | "groups" | "reports") => {
    setCurrentTab(newTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      window.history.replaceState(null, "", url.toString());
    }
  };

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
      <div className="min-h-screen bg-[#070a10] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Landing Page with Stable 12-column Grid Alignment
  if (!user) {
    return (
      <div className="min-h-screen bg-transparent text-[#f8fafc] flex flex-col justify-between selection:bg-cyan-400/30 selection:text-white">
        {/* Top Navbar - Pure Liquid Glass Header */}
        <header className="bg-transparent px-4 sm:px-6 py-4 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FlowLogo size={36} />
              <span className="text-lg font-bold tracking-tight text-white flex items-center">
                Flow<span className="aurora-brand-text ml-0.5">Budget</span>
              </span>
            </div>

            {/* Help & Support Button */}
            <button
              onClick={() => setIsLandingHelpOpen(true)}
              className="glass-dock flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white transition"
            >
              <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
              <span>Help & Support</span>
            </button>
          </div>
        </header>

        {/* Stable Grid Layout */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dock text-cyan-400 text-xs font-semibold shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Personal Finance + Shared Group Expense Splitter</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Manage daily finances & <br className="hidden sm:inline" />
                <span className="text-cyan-400">split group expenses</span> effortlessly.
              </h1>

              <p className="text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed">
                Track daily income & expenditures, set monthly budget caps, and view visual analytics.
                Sharing expenses with friends, roommates, dinners, or trips? Create a shared group and settle debts in the minimum possible payments.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="glass-card p-5 rounded-3xl hover:border-cyan-500/40 transition duration-300 group shadow-lg">
                  <div className="h-10 w-10 rounded-2xl bg-white/[0.06] border border-cyan-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition duration-200">
                    <Wallet className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Personal Ledger</h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    Log income and expenses with categories, notes & PDF exports.
                  </p>
                </div>

                <div className="glass-card p-5 rounded-3xl hover:border-teal-500/40 transition duration-300 group shadow-lg">
                  <div className="h-10 w-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition duration-200">
                    <Users className="h-5 w-5 text-teal-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Shared Groups</h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    1-click shareable codes with multi-payer expense splits.
                  </p>
                </div>

                <div className="glass-card p-5 rounded-3xl hover:border-cyan-500/40 transition duration-300 group shadow-lg">
                  <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition duration-200">
                    <BarChart3 className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Min-Cash Settle</h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    Minimizes bank transactions so everyone settles up smoothly.
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
        <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-neutral-500">
          FlowBudget • Personal Finance & Shared Group Expense Management
        </footer>

        {/* Help & Support Modal */}
        <HelpSupportModal
          isOpen={isLandingHelpOpen}
          onClose={() => setIsLandingHelpOpen(false)}
        />
      </div>
    );
  }

  // Authenticated Workspace
  return (
    <div className="min-h-screen bg-transparent text-[#f8fafc] selection:bg-cyan-400/30 selection:text-white">
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        user={user}
        onLogout={handleLogout}
        onCurrencyChange={handleCurrencyChange}
        onUserUpdated={(updated) => setUser(updated)}
      />

      <main className="max-w-7xl mx-auto min-h-[calc(100vh-4rem)] pb-28 md:pb-12">
        {currentTab === "groups" && <GroupsHub user={user} />}
        {currentTab === "reports" && <ReportsView user={user} />}
        {currentTab !== "groups" && currentTab !== "reports" && <PersonalHub user={user} />}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070a10] flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MainAppContent />
    </Suspense>
  );
}
