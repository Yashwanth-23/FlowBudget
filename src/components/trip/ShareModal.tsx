"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check, Share2, MessageSquare } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  groupCode: string;
}

export function ShareModal({
  isOpen,
  onClose,
  groupName,
  groupCode,
}: ShareModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareLink = `${origin}/trips/join?code=${groupCode}`;
  const shareMessage = `Hey! Join our group "${groupName}" on FlowBudget to track shared expenses & split payments: ${shareLink} (Invite Code: ${groupCode})`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(groupCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#12141a] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative my-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Invite Group Members</h2>
            <p className="text-xs text-neutral-400">Share link or code for {groupName}</p>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* Join Code Box */}
          <div className="bg-[#090a0d] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block">
                Group Invite Code
              </span>
              <span className="text-base font-bold text-emerald-400 font-mono tracking-widest">
                {groupCode}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-2 bg-[#12141a] hover:bg-white/5 border border-white/10 text-neutral-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCode ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Share Link Box */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Direct Invite Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="w-full bg-[#090a0d] border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 btn-primary text-xs font-bold rounded-xl shrink-0 flex items-center gap-1 transition"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? "Copied" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Direct Share */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full py-2.5 px-4 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Share via WhatsApp</span>
          </button>

          <p className="text-[10px] text-neutral-500 text-center">
            Friends who click this link can login or create a profile in seconds to join this group.
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
