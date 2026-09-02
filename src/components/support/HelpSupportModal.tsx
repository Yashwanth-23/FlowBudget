"use client";

import React, { useState } from "react";
import {
  X,
  HelpCircle,
  MessageSquare,
  KeyRound,
  Users,
  Receipt,
  Scale,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminContact?: string;
}

export function HelpSupportModal({
  isOpen,
  onClose,
  adminContact = "https://github.com/Yashwanth-23/FlowBudget/issues",
}: HelpSupportModalProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  if (!isOpen) return null;

  const faqs = [
    {
      q: "What if I forget my 4–6 digit PIN?",
      a: "On the login screen, tap 'Forgot PIN?'. Enter your username and your Secret Backup Word (e.g. your favorite city or pet name). You can instantly choose a new PIN and log right in without waiting for emails.",
      icon: KeyRound,
    },
    {
      q: "How do I invite friends to a trip group?",
      a: "Open your trip group, click 'Invite Friends', and copy the 1-click link or share via WhatsApp. Friends simply open the link, login or create a profile in 5 seconds, and join the group.",
      icon: Users,
    },
    {
      q: "How do multiple people paying a single bill work?",
      a: "When adding an expense (like a $300 dinner), select 'Multiple People Paid'. Enter what each person contributed (e.g. Alex $80, Bob $100, Charlie $120). Then choose to split equally across the group or enter custom shares.",
      icon: Receipt,
    },
    {
      q: "How does Min-Cash-Flow debt settlement work?",
      a: "FlowBudget's Min-Cash-Flow graph algorithm calculates the mathematical minimum number of payments needed to settle all debts across group members, so you avoid circular bank transfers.",
      icon: Scale,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#181b22] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Help & Support</h2>
            <p className="text-xs text-neutral-400">Guides, FAQs & direct contact</p>
          </div>
        </div>

        {/* Contact Support Banner */}
        <div className="bg-[#101216] border border-white/5 p-4 rounded-2xl mb-6 space-y-2.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Need Help or Facing an Issue?
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            If you run into any bugs, have questions, or need profile assistance, reach out directly:
          </p>

          <a
            href={adminContact}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0b1410] font-black text-xs rounded-xl transition shadow-md shadow-emerald-500/15"
          >
            <span>Contact Admin / Report Issue</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Frequently Asked Questions
          </h3>

          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            const Icon = faq.icon;

            return (
              <div
                key={idx}
                className="bg-[#101216] border border-white/5 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <Icon className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-neutral-200 truncate">{faq.q}</span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${
                      isOpen ? "rotate-90 text-emerald-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 text-xs text-neutral-400 border-t border-white/5 pt-2 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
