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
    const {
      amount,
      currency,
      description,
      category,
      date,
      payerMode, // "SINGLE" | "MULTIPLE"
      paidById,
      customPayers, // { [userId: string]: number }
      splitMode, // "EQUAL" | "CUSTOM"
      splitUserIds,
      customSplits, // { [userId: string]: number }
    } = body;

    const group = await prisma.tripGroup.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const isMember = group.members.some((m) => m.userId === session.id);
    if (!isMember) {
      return NextResponse.json({ error: "You are not a member of this group" }, { status: 403 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: "Valid expense amount is required" }, { status: 400 });
    }

    if (!description || typeof description !== "string") {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    // Strict future date prevention
    const expenseDate = date ? new Date(date) : new Date();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    if (expenseDate > endOfToday) {
      return NextResponse.json(
        { error: "Expenses cannot be recorded for future dates." },
        { status: 400 }
      );
    }

    // 1. Process Payers
    const payersToCreate: { userId: string; amountPaid: number }[] = [];

    if (payerMode === "MULTIPLE" && customPayers) {
      let sumPayers = 0;
      for (const [uId, val] of Object.entries(customPayers)) {
        const valNum = parseFloat(val as any) || 0;
        if (valNum > 0) {
          if (!group.members.some((m) => m.userId === uId)) {
            return NextResponse.json({ error: `Invalid payer in group: ${uId}` }, { status: 400 });
          }
          sumPayers += valNum;
          payersToCreate.push({ userId: uId, amountPaid: Math.round(valNum * 100) / 100 });
        }
      }

      if (payersToCreate.length === 0) {
        return NextResponse.json({ error: "Please enter payments for at least one payer" }, { status: 400 });
      }

      if (Math.abs(sumPayers - numAmount) > 0.05) {
        return NextResponse.json(
          {
            error: `Sum of multiple payments ($${sumPayers.toFixed(2)}) must equal total amount ($${numAmount.toFixed(2)})`,
          },
          { status: 400 }
        );
      }
    } else {
      // Single Payer
      const actualPaidById = paidById || session.id;
      const isPayerInGroup = group.members.some((m) => m.userId === actualPaidById);
      if (!isPayerInGroup) {
        return NextResponse.json({ error: "Payer must be a member of this group" }, { status: 400 });
      }
      payersToCreate.push({ userId: actualPaidById, amountPaid: Math.round(numAmount * 100) / 100 });
    }

    // 2. Process Splits (Beneficiaries)
    let targetSplitUsers: string[] = Array.isArray(splitUserIds) && splitUserIds.length > 0
      ? splitUserIds
      : group.members.map((m) => m.userId);

    for (const uId of targetSplitUsers) {
      if (!group.members.some((m) => m.userId === uId)) {
        return NextResponse.json({ error: `Invalid participant in split: ${uId}` }, { status: 400 });
      }
    }

    const splitsToCreate: { userId: string; shareAmount: number }[] = [];

    if (splitMode === "CUSTOM" && customSplits) {
      let sumCustom = 0;
      for (const uId of targetSplitUsers) {
        const val = parseFloat(customSplits[uId]) || 0;
        sumCustom += val;
        splitsToCreate.push({ userId: uId, shareAmount: Math.round(val * 100) / 100 });
      }

      if (Math.abs(sumCustom - numAmount) > 0.05) {
        return NextResponse.json(
          {
            error: `Custom split sum ($${sumCustom.toFixed(2)}) must equal total amount ($${numAmount.toFixed(2)})`,
          },
          { status: 400 }
        );
      }
    } else {
      // Equal split
      const count = targetSplitUsers.length;
      const baseShare = Math.floor((numAmount / count) * 100) / 100;
      let remainder = Math.round((numAmount - baseShare * count) * 100) / 100;

      for (let i = 0; i < count; i++) {
        let share = baseShare;
        if (remainder > 0.001) {
          share += 0.01;
          remainder = Math.round((remainder - 0.01) * 100) / 100;
        }
        splitsToCreate.push({
          userId: targetSplitUsers[i],
          shareAmount: Math.round(share * 100) / 100,
        });
      }
    }

    // 3. Create GroupExpense with Payers & Splits in a Transaction
    const newExpense = await prisma.$transaction(async (tx) => {
      const exp = await tx.groupExpense.create({
        data: {
          groupId: id,
          paidById: payersToCreate[0]?.userId || session.id,
          amount: Math.round(numAmount * 100) / 100,
          currency: currency || group.currency || "USD",
          description: description.trim(),
          category: category || "General",
          date: expenseDate,
        },
      });

      // Create Payers
      for (const payer of payersToCreate) {
        await tx.expensePayer.create({
          data: {
            expenseId: exp.id,
            userId: payer.userId,
            amountPaid: payer.amountPaid,
          },
        });
      }

      // Create Splits
      for (const split of splitsToCreate) {
        await tx.expenseSplit.create({
          data: {
            expenseId: exp.id,
            userId: split.userId,
            shareAmount: split.shareAmount,
          },
        });
      }

      return exp;
    });

    return NextResponse.json({ success: true, expense: newExpense }, { status: 201 });
  } catch (err) {
    console.error("Create group expense error:", err);
    return NextResponse.json({ error: "Failed to add expense" }, { status: 500 });
  }
}
