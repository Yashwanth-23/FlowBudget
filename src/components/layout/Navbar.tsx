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
  currentTab: "personal" | "groups" | "reports";
  onTabChange: (tab: "personal" | "groups" | "reports") => void;
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

  // Close currency dropdown on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCurrencyDropdownOpen(false);
    };
    if (currencyDropdownOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currencyDropdownOpen]);

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#090a0d]/80 backdrop-blur-2xl no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              onClick={() => onTabChange("personal")}
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shadow-inner group-hover:border-emerald-500/50 transition duration-200">
                <Wallet className="h-4 w-4 text-emerald-400 font-bold" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center">
                  Flow<span className="text-emerald-400 font-semibold ml-0.5">Budget</span>
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links - Refined Apple Frosted Dock */}
            {user && (
              <nav className="hidden md:flex items-center gap-1 bg-[#12141a]/90 border border-white/[0.08] p-1 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <button
                  onClick={() => onTabChange("personal")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    currentTab === "personal"
                      ? "bg-white/10 text-white border border-white/15 shadow-sm backdrop-blur-md"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Wallet className="h-3.5 w-3.5" />
                  <span>Personal Finance</span>
                </button>

                <button
                  onClick={() => onTabChange("groups")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    currentTab === "groups"
                      ? "bg-white/10 text-white border border-white/15 shadow-sm backdrop-blur-md"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Shared Groups</span>
                </button>

                <button
                  onClick={() => onTabChange("reports")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    currentTab === "reports"
                      ? "bg-white/10 text-white border border-white/15 shadow-sm backdrop-blur-md"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Analytics & Reports</span>
                </button>
              </nav>
            )}

            {/* User controls, Currency, & Help */}
            <div className="flex items-center gap-2">
              {/* Help & Support Button */}
              <button
                onClick={() => setIsHelpOpen(true)}
                title="Help & Support Desk"
                className="p-2 text-neutral-400 hover:text-white bg-[#12141a] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl transition duration-150 active:scale-95"
              >
                <HelpCircle className="h-4 w-4 text-emerald-400/90" />
              </button>

              {user && (
                <>
                  {/* Currency Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#12141a] border border-white/[0.08] text-neutral-300 hover:text-white hover:border-white/20 transition duration-150 active:scale-95"
                    >
                      <Globe className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="font-mono">{user.currency || "USD"}</span>
                      <ChevronDown className="h-3 w-3 text-neutral-500" />
                    </button>

                    {currencyDropdownOpen && (
                      <>
                        {/* Fixed transparent overlay: click anywhere on screen closes dropdown */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setCurrencyDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#12141a] border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
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
                                  ? "bg-white/10 text-white font-semibold"
                                  : "text-neutral-300 hover:bg-white/[0.04]"
                              }`}
                            >
                              <span>{curr.name}</span>
                              <span className="font-mono text-neutral-400 text-[11px]">
                                {curr.symbol} {curr.code}
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Profile & Security Settings Trigger */}
                  <div className="flex items-center gap-1.5 pl-2 border-l border-white/[0.08]">
                    <button
                      onClick={() => setIsSecurityOpen(true)}
                      title="Profile & Security Settings"
                      className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#12141a] hover:bg-[#181b22] border border-white/[0.08] text-neutral-200 transition duration-150 active:scale-95"
                    >
                      <div className="h-5 w-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium hidden sm:inline">
                        @{user.username}
                      </span>
                      <Shield className="h-3 w-3 text-emerald-400/80 hidden sm:inline" />
                    </button>

                    {/* Logout Button */}
                    <button
                      onClick={onLogout}
                      title="Logout"
                      className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition duration-150 active:scale-95"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Floating Bottom Navigation Dock for Mobile (iOS Native Feel) */}
      {user && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto no-print">
          <div className="bg-[#12141a]/90 backdrop-blur-2xl border border-white/[0.12] rounded-full p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.8)] flex items-center justify-around">
            <button
              onClick={() => onTabChange("personal")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-medium transition-all duration-200 ${
                currentTab === "personal"
                  ? "bg-white/10 text-white font-semibold border border-white/15 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Personal</span>
            </button>

            <button
              onClick={() => onTabChange("groups")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-medium transition-all duration-200 ${
                currentTab === "groups"
                  ? "bg-white/10 text-white font-semibold border border-white/15 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Groups</span>
            </button>

            <button
              onClick={() => onTabChange("reports")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-medium transition-all duration-200 ${
                currentTab === "reports"
                  ? "bg-white/10 text-white font-semibold border border-white/15 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Reports</span>
            </button>
          </div>
        </div>
      )}

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
