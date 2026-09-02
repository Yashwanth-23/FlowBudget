import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateGroupSettlement } from "@/lib/settlement";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const group = await prisma.tripGroup.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, username: true } },
        members: {
          include: {
            user: { select: { id: true, username: true } },
          },
          orderBy: { joinedAt: "asc" },
        },
        expenses: {
          include: {
            paidBy: { select: { id: true, username: true } },
            payers: {
              include: {
                user: { select: { id: true, username: true } },
              },
            },
            splits: {
              include: {
                user: { select: { id: true, username: true } },
              },
            },
          },
          orderBy: { date: "desc" },
        },
        settlements: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Trip group not found" }, { status: 404 });
    }

    // Check membership
    const membership = group.members.find((m) => m.userId === session.id);
    if (!membership) {
      return NextResponse.json({ error: "You are not a member of this group" }, { status: 403 });
    }

    // Transform expenses to format suitable for settlement engine
    const formattedExpenses = group.expenses.map((e) => ({
      id: e.id,
      paidById: e.paidById,
      amount: e.amount,
      description: e.description,
      category: e.category,
      date: e.date,
      payers: e.payers.map((p) => ({
        userId: p.userId,
        username: p.user.username,
        amountPaid: p.amountPaid,
      })),
      splits: e.splits.map((s) => ({
        userId: s.userId,
        username: s.user.username,
        shareAmount: s.shareAmount,
      })),
    }));

    // Compute live balances & Min-Cash-Flow settlement
    const calculations = calculateGroupSettlement(
      group.members,
      formattedExpenses,
      group.settlements
    );

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        code: group.code,
        currency: group.currency,
        totalBudget: group.totalBudget,
        createdById: group.createdById,
        creator: group.creator,
        createdAt: group.createdAt,
        currentUserRole: membership.role,
        isAdmin: membership.role === "ADMIN" || group.createdById === session.id,
      },
      members: group.members.map((m) => ({
        id: m.id,
        userId: m.user.id,
        username: m.user.username,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      expenses: formattedExpenses,
      settlements: group.settlements,
      calculations,
    });
  } catch (err) {
    console.error("Fetch group detail error:", err);
    return NextResponse.json({ error: "Failed to fetch group details" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const group = await prisma.tripGroup.findUnique({
      where: { id },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: session.id,
        },
      },
    });

    if (!membership || (membership.role !== "ADMIN" && group.createdById !== session.id)) {
      return NextResponse.json({ error: "Only group admins can delete this group" }, { status: 403 });
    }

    await prisma.tripGroup.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Group deleted successfully" });
  } catch (err) {
    console.error("Delete group error:", err);
    return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
  }
}
