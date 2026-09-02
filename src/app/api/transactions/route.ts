import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculatePersonalAnalytics } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7); // e.g. "2026-09"
    const type = searchParams.get("type"); // "INCOME" | "EXPENSE" | null
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Fetch all user transactions for trend computation
    const allTransactions = await prisma.transaction.findMany({
      where: { userId: session.id },
      orderBy: { date: "desc" },
    });

    // Fetch user budgets
    const budgets = await prisma.budget.findMany({
      where: { userId: session.id },
    });

    // Compute analytics
    const analytics = calculatePersonalAnalytics(allTransactions, budgets, month);

    // Apply specific filters for the transaction table list
    let filteredTransactions = allTransactions;

    if (month && month !== "ALL") {
      filteredTransactions = filteredTransactions.filter(
        (tx) => new Date(tx.date).toISOString().slice(0, 7) === month
      );
    }

    if (type && type !== "ALL") {
      filteredTransactions = filteredTransactions.filter((tx) => tx.type === type);
    }

    if (category && category !== "ALL") {
      filteredTransactions = filteredTransactions.filter((tx) => tx.category === category);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      filteredTransactions = filteredTransactions.filter(
        (tx) =>
          tx.category.toLowerCase().includes(q) ||
          (tx.notes && tx.notes.toLowerCase().includes(q)) ||
          tx.paymentMethod.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      transactions: filteredTransactions,
      analytics,
      budgets: budgets.filter((b) => b.monthYear === month),
      selectedMonth: month,
    });
  } catch (err) {
    console.error("Fetch transactions error:", err);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, amount, category, paymentMethod, date, notes } = body;

    if (!type || !["INCOME", "EXPENSE"].includes(type)) {
      return NextResponse.json({ error: "Type must be INCOME or EXPENSE" }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    if (!category || typeof category !== "string") {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const newTx = await prisma.transaction.create({
      data: {
        userId: session.id,
        type,
        amount: numAmount,
        category: category.trim(),
        paymentMethod: paymentMethod || "CASH",
        date: date ? new Date(date) : new Date(),
        notes: notes ? notes.trim() : "",
      },
    });

    return NextResponse.json({ success: true, transaction: newTx }, { status: 201 });
  } catch (err) {
    console.error("Create transaction error:", err);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
