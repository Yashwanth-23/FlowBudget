"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  UserPlus,
  ChevronRight,
  Crown,
  Receipt,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-tab-switch pb-24 md:pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Shared Groups & Expense Splitter</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Split expenses for dinners, roommates, events & group trips.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Join with Code */}
          <button
            onClick={() => setIsJoinOpen(true)}
            className="btn-secondary flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs font-medium rounded-2xl"
          >
            <UserPlus className="h-3.5 w-3.5 text-emerald-400/90" />
            <span>Join with Code</span>
          </button>

          {/* Create Group */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-2xl"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Group</span>
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="h-7 w-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="py-16 text-center glass-card rounded-3xl p-8 space-y-4 max-w-lg mx-auto">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Shared Groups Yet</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Going to dinner, sharing rent with roommates, or planning an event? Create a group, share the invite code,
            and log shared expenses together!
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="btn-primary px-4 py-2 text-xs rounded-xl"
            >
              + Create Group
            </button>
            <button
              onClick={() => setIsJoinOpen(true)}
              className="btn-secondary px-4 py-2 text-xs rounded-xl"
            >
              Join Group
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const isAdmin = group.currentUserRole === "ADMIN";
            return (
              <div
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className="glass-card rounded-3xl p-5 sm:p-6 cursor-pointer transition duration-200 hover:-translate-y-0.5 group relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition">
                        {group.name}
                      </h3>
                      <p className="text-[11px] text-neutral-400 font-mono">Code: {group.code}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <span
                      title="You are Group Admin"
                      className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Crown className="h-3 w-3" />
                      <span>Admin</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/[0.06] mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                      Total Spent
                    </span>
                    <span className="text-base font-bold text-white font-mono">
                      {formatCurrency(group.totalSpent, group.currency)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                      Members
                    </span>
                    <span className="text-base font-bold text-emerald-400 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{group.memberCount}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
                  <span>Open Group Ledger</span>
                  <ChevronRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition duration-150" />
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
