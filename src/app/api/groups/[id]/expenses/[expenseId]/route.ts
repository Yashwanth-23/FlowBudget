import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, expenseId } = await params;

    const group = await prisma.tripGroup.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const membership = group.members.find((m) => m.userId === session.id);
    if (!membership) {
      return NextResponse.json({ error: "You are not in this group" }, { status: 403 });
    }

    const expense = await prisma.groupExpense.findUnique({
      where: { id: expenseId },
    });

    if (!expense || expense.groupId !== id) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const isAdmin = membership.role === "ADMIN" || group.createdById === session.id;
    const isPayer = expense.paidById === session.id;

    if (!isAdmin && !isPayer) {
      return NextResponse.json({ error: "Only the payer or group admin can delete this expense" }, { status: 403 });
    }

    await prisma.groupExpense.delete({
      where: { id: expenseId },
    });

    return NextResponse.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    console.error("Delete expense error:", err);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
