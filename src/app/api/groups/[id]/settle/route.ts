import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { fromUserId, toUserId, amount } = body;

    const group = await prisma.tripGroup.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const isMember = group.members.some((m) => m.userId === session.id);
    if (!isMember) {
      return NextResponse.json({ error: "You are not in this group" }, { status: 403 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: "Invalid settlement amount" }, { status: 400 });
    }

    // Record settlement
    const settlement = await prisma.groupSettlement.create({
      data: {
        groupId: id,
        fromUserId,
        toUserId,
        amount: Math.round(numAmount * 100) / 100,
        isSettled: true,
        settledAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, settlement }, { status: 201 });
  } catch (err) {
    console.error("Settle group error:", err);
    return NextResponse.json({ error: "Failed to record settlement" }, { status: 500 });
  }
}
