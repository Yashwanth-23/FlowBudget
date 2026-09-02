import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculatePersonalAnalytics } from "@/lib/analytics";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";

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
    const currencyFilter = searchParams.get("currency"); // e.g. "USD", "INR", or null

    // Fetch all user transactions
    const allTransactions = await prisma.transaction.findMany({
      where: { userId: session.id },
      orderBy: { date: "desc" },
    });

    // Fetch user budgets
    const budgets = await prisma.budget.findMany({
      where: { userId: session.id },
    });

    // Determine target active currency for analytics calculation
    const targetCurrency = currencyFilter || session.currency || "USD";

    // Compute analytics with strict currency segregation
    const analytics = calculatePersonalAnalytics(
      allTransactions,
      budgets,
      month,
      targetCurrency
    );

    // Apply filters for the transaction table list
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

    if (currencyFilter && currencyFilter !== "ALL") {
      filteredTransactions = filteredTransactions.filter(
        (tx) => (tx.currency || "USD") === currencyFilter
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      filteredTransactions = filteredTransactions.filter(
        (tx) =>
          tx.category.toLowerCase().includes(q) ||
          (tx.notes && tx.notes.toLowerCase().includes(q)) ||
          tx.paymentMethod.toLowerCase().includes(q) ||
          (tx.currency && tx.currency.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      transactions: filteredTransactions,
      analytics,
      budgets: budgets.filter((b) => b.monthYear === month),
      selectedMonth: month,
      selectedCurrency: targetCurrency,
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
    const { type, amount, currency, category, paymentMethod, date, notes } = body;

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

    // Strict future date prevention
    const txDate = date ? new Date(date) : new Date();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    if (txDate > endOfToday) {
      return NextResponse.json(
        { error: "Transactions cannot be recorded for future dates." },
        { status: 400 }
      );
    }

    // Resolve per-transaction currency (default to active session currency if unspecified)
    const validCurrency =
      currency && SUPPORTED_CURRENCIES[currency]
        ? currency
        : session.currency || "USD";

    const newTx = await prisma.transaction.create({
      data: {
        userId: session.id,
        type,
        amount: numAmount,
        currency: validCurrency,
        category: category.trim(),
        paymentMethod: paymentMethod || "CASH",
        date: txDate,
        notes: notes ? notes.trim() : "",
      },
    });

    return NextResponse.json({ success: true, transaction: newTx }, { status: 201 });
  } catch (err) {
    console.error("Create transaction error:", err);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
