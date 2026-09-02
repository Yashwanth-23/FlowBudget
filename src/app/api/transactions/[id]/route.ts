import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
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
    const { type, amount, category, paymentMethod, date, notes } = body;

    const existingTx = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTx || existingTx.userId !== session.id) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const updatedTx = await prisma.transaction.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(category && { category: category.trim() }),
        ...(paymentMethod && { paymentMethod }),
        ...(date && { date: new Date(date) }),
        ...(notes !== undefined && { notes: notes.trim() }),
      },
    });

    return NextResponse.json({ success: true, transaction: updatedTx });
  } catch (err) {
    console.error("Update transaction error:", err);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
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

    const existingTx = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTx || existingTx.userId !== session.id) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    console.error("Delete transaction error:", err);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
