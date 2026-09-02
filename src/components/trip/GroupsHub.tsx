"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plane,
  Plus,
  UserPlus,
  Users,
  ChevronRight,
  Crown,
} from "lucide-react";
import { formatCurrency } from "@/lib/currencies";
import { CreateGroupModal } from "./CreateGroupModal";
import { JoinGroupModal } from "./JoinGroupModal";
import { TripDetailView } from "./TripDetailView";

interface GroupsHubProps {
  user: {
    id: string;
    username: string;
    currency: string;
  };
}

export function GroupsHub({ user }: GroupsHubProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/groups");
      const data = await res.json();
      if (res.ok) {
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.error("Fetch groups error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  if (selectedGroupId) {
    return (
      <TripDetailView
        groupId={selectedGroupId}
        onBack={() => {
          setSelectedGroupId(null);
          fetchGroups();
        }}
        currentUserId={user.id}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Trip & Shared Ledgers</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Split expenses with friends, track trip budgets, and settle up easily.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Join with Code */}
          <button
            onClick={() => setIsJoinOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#181b22] hover:bg-[#1f232c] border border-white/10 text-neutral-200 text-xs font-bold rounded-2xl shadow-sm transition"
          >
            <UserPlus className="h-3.5 w-3.5 text-teal-400" />
            <span>Join with Code</span>
          </button>

          {/* Create Group */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0b1410] text-xs font-black rounded-2xl shadow-lg shadow-emerald-500/15 transition active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Trip</span>
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="py-16 text-center bg-[#181b22] rounded-3xl border border-white/5 p-8 space-y-4">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-2">
            <Plane className="h-7 w-7" />
          </div>
          <h3 className="text-base font-black text-white">No Trips or Groups Yet</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Heading on a trip with friends (e.g. CO fall 26)? Create a group, share the invite link,
            and log shared expenses together!
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0b1410] text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/15"
            >
              + Create Trip (e.g. CO fall 26)
            </button>
            <button
              onClick={() => setIsJoinOpen(true)}
              className="px-4 py-2 bg-[#101216] border border-white/5 hover:bg-white/5 text-neutral-200 text-xs font-bold rounded-xl transition"
            >
              Join Friend&apos;s Trip
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => {
            const isAdmin = group.currentUserRole === "ADMIN";
            return (
              <div
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className="group bg-[#181b22] hover:bg-[#1e222b] border border-white/5 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                      <Plane className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition">
                        {group.name}
                      </h3>
                      <p className="text-[11px] text-neutral-400 font-mono">Code: {group.code}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <span
                      title="You are Group Admin"
                      className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Crown className="h-3 w-3" />
                      <span>Admin</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/5 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                      Total Spent
                    </span>
                    <span className="text-base font-black text-white font-mono">
                      {formatCurrency(group.totalSpent, group.currency)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                      Members
                    </span>
                    <span className="text-base font-black text-emerald-400 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{group.memberCount}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold">
                  <span>Open Trip Ledger</span>
                  <ChevronRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newId) => {
          fetchGroups();
          setSelectedGroupId(newId);
        }}
        defaultCurrency={user.currency}
      />

      <JoinGroupModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={(joinedId) => {
          fetchGroups();
          setSelectedGroupId(joinedId);
        }}
      />
    </div>
  );
}
