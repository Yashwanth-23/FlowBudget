"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  HelpCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Users,
  Receipt,
  Scale,
  ChevronRight,
  MessageSquarePlus,
  BookOpen,
  Inbox,
  Mail,
  Trash2,
  Check,
} from "lucide-react";

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUsername?: string;
}

const TICKET_CATEGORIES = [
  "General Question / Help",
  "Forgot PIN / Account Recovery",
  "Trip Group & Splits Issue",
  "Bug Report / Calculation Glitch",
  "Feature Suggestion / Feedback",
];

export function HelpSupportModal({
  isOpen,
  onClose,
  defaultUsername,
}: HelpSupportModalProps) {
  const [activeTab, setActiveTab] = useState<"ticket" | "faq" | "inbox">("ticket");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Ticket Form
  const [name, setName] = useState(defaultUsername ? `@${defaultUsername}` : "");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState(TICKET_CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // Admin Inbox State
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await fetch("/api/support/tickets");
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Fetch tickets error:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (isOpen && defaultUsername) {
      fetchTickets();
    }
  }, [isOpen, defaultUsername]);

  if (!isOpen) return null;

  const handleToggleResolve = async (ticketId: string, currentStatus: string) => {
    const newStatus = currentStatus === "RESOLVED" ? "OPEN" : "RESOLVED";
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchTickets();
      }
    } catch (err) {
      console.error("Update ticket status error:", err);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Delete this support ticket record?")) return;
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTickets();
      }
    } catch (err) {
      console.error("Delete ticket error:", err);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name or username");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address so we can reply back to you");
      return;
    }

    const finalSubject = subject.trim() || category;
    if (!message.trim()) {
      setError("Please describe your question or issue");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: `[${category}] ${finalSubject}`,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit ticket");
      }

      setSubmittedTicketId(data.ticketId);
      setSubject("");
      setMessage("");
      fetchTickets();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error submitting ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedTicketId(null);
    setError(null);
  };

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
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Help & Support Desk</h2>
            <p className="text-xs text-neutral-400">Submit a support ticket or view user guides</p>
          </div>
        </div>

        {/* Segmented iOS Toggle */}
        <div
          className={`grid gap-1 bg-[#101216] p-1 rounded-2xl border border-white/5 mb-5 ${
            defaultUsername ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab("ticket")}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "ticket"
                ? "bg-emerald-500 text-[#0b1410] font-black shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>Open Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("faq")}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "faq"
                ? "bg-emerald-500 text-[#0b1410] font-black shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>FAQs</span>
          </button>

          {defaultUsername && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("inbox");
                fetchTickets();
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === "inbox"
                  ? "bg-emerald-500 text-[#0b1410] font-black shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Inbox className="h-3.5 w-3.5" />
              <span>Inbox ({tickets.length})</span>
            </button>
          )}
        </div>

        {/* TAB 1: IN-APP SUPPORT TICKET FORM */}
        {activeTab === "ticket" && (
          <div>
            {submittedTicketId ? (
              <div className="py-8 text-center bg-[#101216] rounded-2xl border border-white/5 p-6 space-y-3">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black text-white">Ticket Submitted Successfully!</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                  Your ticket <span className="font-mono text-emerald-400 font-bold">#{submittedTicketId.slice(-6)}</span> has been recorded in the support desk. We will review and reply to your email shortly.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 py-2 bg-[#181b22] hover:bg-white/5 border border-white/10 text-neutral-200 text-xs font-bold rounded-xl transition"
                  >
                    Submit Another Question
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3.5">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Your Name / Username
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full bg-[#101216] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Your Reply Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full bg-[#101216] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#101216] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/60 transition"
                    >
                      {TICKET_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Subject (Brief)
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Question on bill split"
                      className="w-full bg-[#101216] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Describe your issue or question
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details so we can assist you quickly..."
                    className="w-full bg-[#101216] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/60 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-[#0b1410] font-black text-xs rounded-xl shadow-lg shadow-emerald-500/15 transition flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-[#0b1410] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Support Ticket</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: FAQ ACCORDION */}
        {activeTab === "faq" && (
          <div className="space-y-2">
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
        )}

        {/* TAB 3: ADMIN TICKET INBOX */}
        {activeTab === "inbox" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 pb-1">
              <span>All Received Support Tickets ({tickets.length})</span>
              <button onClick={fetchTickets} className="text-emerald-400 hover:underline">
                Refresh
              </button>
            </div>

            {loadingTickets ? (
              <div className="py-10 flex items-center justify-center">
                <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500 bg-[#101216] rounded-2xl border border-white/5">
                No tickets received yet.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {tickets.map((t) => {
                  const isResolved = t.status === "RESOLVED";
                  const replyMailto = `mailto:${t.email}?subject=Re: ${encodeURIComponent(
                    t.subject
                  )}&body=Hi ${encodeURIComponent(t.name)},%0D%0A%0D%0ARegarding your FlowBudget ticket (#${t.id.slice(
                    -6
                  )}):%0D%0A`;

                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-2xl border transition space-y-2 ${
                        isResolved
                          ? "bg-[#101216]/50 border-white/5 opacity-70"
                          : "bg-[#101216] border-emerald-500/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{t.name}</span>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              ({t.email})
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                            {t.subject}
                          </p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isResolved
                              ? "bg-white/5 text-neutral-400"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <div className="bg-[#181b22] p-2.5 rounded-xl border border-white/5 text-xs text-neutral-300 leading-relaxed font-sans">
                        &ldquo;{t.message}&rdquo;
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-neutral-500 font-mono text-[10px]">
                          {new Date(t.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        <div className="flex items-center gap-2">
                          <a
                            href={replyMailto}
                            title="Reply to user"
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-[#0b1410] font-bold rounded-lg text-[11px] transition"
                          >
                            <Mail className="h-3 w-3" />
                            <span>Reply</span>
                          </a>

                          <button
                            onClick={() => handleToggleResolve(t.id, t.status)}
                            title="Toggle Resolved"
                            className="p-1 text-neutral-400 hover:text-white bg-[#181b22] hover:bg-white/10 rounded-lg transition"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteTicket(t.id)}
                            title="Delete Ticket"
                            className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
