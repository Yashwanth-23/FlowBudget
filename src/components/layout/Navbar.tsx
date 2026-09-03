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
  const currencyMenuRef = React.useRef<HTMLDivElement>(null);

  // Close currency dropdown on outside click or touch
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        currencyMenuRef.current &&
        !currencyMenuRef.current.contains(event.target as Node)
      ) {
        setCurrencyDropdownOpen(false);
      }
    }
    if (currencyDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [currencyDropdownOpen]);

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
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090d16]/35 backdrop-blur-2xl no-print">
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

            {/* Desktop Navigation Links - Apple iOS Liquid Glass Dock */}
            {user && (
              <nav className="hidden md:flex items-center gap-1 glass-dock p-1.5 rounded-full">
                <button
                  onClick={() => onTabChange("personal")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                    currentTab === "personal"
                      ? "glass-dock-item-active"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <Wallet className="h-3.5 w-3.5" />
                  <span>Personal Finance</span>
                </button>

                <button
                  onClick={() => onTabChange("groups")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                    currentTab === "groups"
                      ? "glass-dock-item-active"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Shared Groups</span>
                </button>

                <button
                  onClick={() => onTabChange("reports")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                    currentTab === "reports"
                      ? "glass-dock-item-active"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.06]"
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
                className="p-2 text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.12] backdrop-blur-2xl border border-white/[0.10] hover:border-white/[0.22] rounded-xl transition duration-200 active:scale-95 cursor-pointer shadow-sm"
              >
                <HelpCircle className="h-4 w-4 text-emerald-400/90" />
              </button>

              {user && (
                <>
                  {/* Currency Dropdown */}
                  <div ref={currencyMenuRef} className="relative">
                    <button
                      onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.12] backdrop-blur-2xl border border-white/[0.10] hover:border-white/[0.22] text-neutral-200 hover:text-white transition duration-200 active:scale-95 cursor-pointer shadow-sm"
                    >
                      <Globe className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="font-mono">{user.currency || "USD"}</span>
                      <ChevronDown
                        className={`h-3 w-3 text-neutral-400 transition-transform duration-200 ${
                          currencyDropdownOpen ? "rotate-180 text-emerald-400" : ""
                        }`}
                      />
                    </button>

                    {currencyDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 rounded-2xl glass-popover p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Select Currency
                        </div>
                        {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                          <button
                            key={curr.code}
                            onClick={() => {
                              onCurrencyChange(curr.code);
                              setCurrencyDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition duration-150 ${
                              user.currency === curr.code
                                ? "bg-white/[0.08] text-white font-bold border border-white/20 shadow-sm"
                                : "text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                            }`}
                          >
                            <span className="font-medium">{curr.name}</span>
                            <span className="font-mono text-neutral-400 text-[11px]">
                              {curr.symbol} {curr.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Profile & Security Settings Trigger */}
                  <div className="flex items-center gap-1.5 pl-2 border-l border-white/[0.08]">
                    <button
                      onClick={() => setIsSecurityOpen(true)}
                      title="Profile & Security Settings"
                      className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.12] backdrop-blur-2xl border border-white/[0.10] hover:border-white/[0.22] text-neutral-200 hover:text-white transition duration-200 active:scale-95 cursor-pointer shadow-sm"
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
                      className="p-2 text-neutral-400 hover:text-rose-400 bg-white/[0.04] hover:bg-white/[0.12] backdrop-blur-2xl border border-white/[0.10] hover:border-rose-500/30 rounded-xl transition duration-200 active:scale-95 cursor-pointer shadow-sm"
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

      {/* Floating Bottom Navigation Dock for Mobile (Apple iOS Liquid Glass Capsule with Scrim) */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-4 pt-8 px-4 bg-gradient-to-t from-[#080b12] via-[#080b12]/80 to-transparent no-print">
          <div className="max-w-sm mx-auto pointer-events-auto">
            <div className="glass-dock-mobile p-1.5 rounded-full flex items-center justify-around">
              <button
                onClick={() => onTabChange("personal")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-bold transition-all duration-300 ${
                  currentTab === "personal"
                    ? "glass-dock-item-active"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>Personal</span>
              </button>

              <button
                onClick={() => onTabChange("groups")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-bold transition-all duration-300 ${
                  currentTab === "groups"
                    ? "glass-dock-item-active"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Groups</span>
              </button>

              <button
                onClick={() => onTabChange("reports")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-bold transition-all duration-300 ${
                  currentTab === "reports"
                    ? "glass-dock-item-active"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Reports</span>
              </button>
            </div>
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
