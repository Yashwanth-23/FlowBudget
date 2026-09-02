import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthYear = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.id,
        monthYear,
      },
    });

    return NextResponse.json({ budgets });
  } catch (err) {
    console.error("Fetch budgets error:", err);
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category, monthlyLimit, monthYear } = body;

    if (!category || typeof category !== "string") {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const limitNum = parseFloat(monthlyLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      return NextResponse.json({ error: "Limit must be a positive number" }, { status: 400 });
    }

    const targetMonth = monthYear || new Date().toISOString().slice(0, 7);

    // Upsert budget for category + month
    const budget = await prisma.budget.upsert({
      where: {
        userId_category_monthYear: {
          userId: session.id,
          category: category.trim(),
          monthYear: targetMonth,
        },
      },
      update: {
        monthlyLimit: limitNum,
      },
      create: {
        userId: session.id,
        category: category.trim(),
        monthlyLimit: limitNum,
        monthYear: targetMonth,
      },
    });

    return NextResponse.json({ success: true, budget });
  } catch (err) {
    console.error("Save budget error:", err);
    return NextResponse.json({ error: "Failed to save budget" }, { status: 500 });
  }
}
