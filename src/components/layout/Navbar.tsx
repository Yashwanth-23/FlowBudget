"use client";

import React, { useState } from "react";
import {
  Wallet,
  Users,
  BarChart3,
  LogOut,
  Globe,
  ChevronDown,
  Shield,
  HelpCircle,
} from "lucide-react";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { SecuritySettingsModal } from "../auth/SecuritySettingsModal";
import { HelpSupportModal } from "../support/HelpSupportModal";

interface NavbarProps {
  currentTab: "personal" | "trips" | "reports";
  onTabChange: (tab: "personal" | "trips" | "reports") => void;
  user: {
    id: string;
    username: string;
    currency: string;
  } | null;
  onLogout: () => void;
  onCurrencyChange: (curr: string) => void;
  onUserUpdated?: (user: { id: string; username: string; currency: string }) => void;
}

export function Navbar({
  currentTab,
  onTabChange,
  user,
  onLogout,
  onCurrencyChange,
  onUserUpdated,
}: NavbarProps) {
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#101216]/85 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => onTabChange("personal")}
            >
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                <Wallet className="h-5 w-5 text-emerald-400 font-bold" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                  Flow<span className="text-emerald-400">Budget</span>
                </span>
              </div>
            </div>

            {/* Navigation Links - iOS Segmented Glass Style */}
            {user && (
              <nav className="hidden md:flex items-center gap-1 bg-[#181b22] border border-white/5 p-1 rounded-2xl shadow-inner">
                <button
                  onClick={() => onTabChange("personal")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    currentTab === "personal"
                      ? "bg-emerald-500 text-[#0b1410] shadow-sm font-black"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Wallet className="h-3.5 w-3.5" />
                  Personal Finance
                </button>

                <button
                  onClick={() => onTabChange("trips")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    currentTab === "trips"
                      ? "bg-emerald-500 text-[#0b1410] shadow-sm font-black"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Trips & Groups
                </button>

                <button
                  onClick={() => onTabChange("reports")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    currentTab === "reports"
                      ? "bg-emerald-500 text-[#0b1410] shadow-sm font-black"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Analytics & Reports
                </button>
              </nav>
            )}

            {/* User controls, Currency, & Help */}
            <div className="flex items-center gap-2">
              {/* Help & Support Button */}
              <button
                onClick={() => setIsHelpOpen(true)}
                title="Help & Support Desk"
                className="p-2 text-neutral-400 hover:text-white bg-[#181b22] hover:bg-white/5 border border-white/10 rounded-xl transition"
              >
                <HelpCircle className="h-4 w-4 text-emerald-400" />
              </button>

              {user && (
                <>
                  {/* Currency Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#181b22] border border-white/10 text-neutral-300 hover:text-white hover:border-white/20 transition"
                    >
                      <Globe className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{user.currency || "USD"}</span>
                      <ChevronDown className="h-3 w-3 text-neutral-400" />
                    </button>

                    {currencyDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#181b22] border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in duration-150">
                        <div className="px-3 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          Select Currency
                        </div>
                        {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                          <button
                            key={curr.code}
                            onClick={() => {
                              onCurrencyChange(curr.code);
                              setCurrencyDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg text-left transition ${
                              user.currency === curr.code
                                ? "bg-emerald-500/10 text-emerald-400 font-bold"
                                : "text-neutral-300 hover:bg-white/5"
                            }`}
                          >
                            <span>{curr.name}</span>
                            <span className="font-mono text-neutral-400">
                              {curr.symbol} {curr.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Profile & Security Settings Trigger */}
                  <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                    <button
                      onClick={() => setIsSecurityOpen(true)}
                      title="Profile & Security Settings (Backup Word, Change PIN)"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181b22] hover:bg-[#1f232c] border border-white/10 text-neutral-200 transition"
                    >
                      <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold hidden sm:inline">
                        @{user.username}
                      </span>
                      <Shield className="h-3.5 w-3.5 text-emerald-400" />
                    </button>

                    {/* Logout Button */}
                    <button
                      onClick={onLogout}
                      title="Logout"
                      className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Bottom/Sub Navigation */}
          {user && (
            <div className="md:hidden flex items-center justify-around py-2 border-t border-white/5 bg-[#101216]">
              <button
                onClick={() => onTabChange("personal")}
                className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
                  currentTab === "personal" ? "text-emerald-400" : "text-neutral-400"
                }`}
              >
                <Wallet className="h-4 w-4" />
                <span>Personal</span>
              </button>
              <button
                onClick={() => onTabChange("trips")}
                className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
                  currentTab === "trips" ? "text-emerald-400" : "text-neutral-400"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Trips</span>
              </button>
              <button
                onClick={() => onTabChange("reports")}
                className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
                  currentTab === "reports" ? "text-emerald-400" : "text-neutral-400"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Reports</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Security & Backup Word Settings Modal */}
      {user && (
        <SecuritySettingsModal
          isOpen={isSecurityOpen}
          onClose={() => setIsSecurityOpen(false)}
          user={user}
          onUserUpdated={(updatedUser) => {
            if (onUserUpdated) onUserUpdated(updatedUser);
          }}
        />
      )}

      {/* Help & Support In-App Ticket Modal */}
      <HelpSupportModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        defaultUsername={user?.username}
      />
    </>
  );
}
