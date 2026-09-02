import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Helper to generate a clean, readable join code without duplicate dashes
function generateJoinCode(name: string): string {
  const sanitized = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-") // collapse multiple non-alphanumeric chars into a single dash
    .replace(/^-+|-+$/g, "")    // trim leading and trailing dashes
    .slice(0, 12)
    .replace(/-+$/g, "");        // trim trailing dash if sliced

  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${sanitized || "TRIP"}-${randomSuffix}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await prisma.groupMember.findMany({
      where: { userId: session.id },
      include: {
        group: {
          include: {
            creator: { select: { id: true, username: true } },
            members: {
              include: {
                user: { select: { id: true, username: true } },
              },
            },
            expenses: {
              select: { amount: true },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    const groups = memberships.map((m) => {
      const g = m.group;
      const totalSpent = g.expenses.reduce((sum, e) => sum + e.amount, 0);
      return {
        id: g.id,
        name: g.name,
        code: g.code,
        currency: g.currency,
        totalBudget: g.totalBudget,
        totalSpent: Math.round(totalSpent * 100) / 100,
        memberCount: g.members.length,
        members: g.members.map((mem) => ({
          id: mem.id,
          userId: mem.user.id,
          username: mem.user.username,
          role: mem.role,
        })),
        currentUserRole: m.role,
        createdAt: g.createdAt,
      };
    });

    return NextResponse.json({ groups });
  } catch (err) {
    console.error("Fetch groups error:", err);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, currency, totalBudget } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    let code = generateJoinCode(name);
    // Ensure code uniqueness
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.tripGroup.findUnique({ where: { code } });
      if (!existing) break;
      code = generateJoinCode(name);
      attempts++;
    }

    const budgetNum = totalBudget ? parseFloat(totalBudget) : 0;

    // Create Group & automatically make current user the ADMIN member
    const group = await prisma.tripGroup.create({
      data: {
        name: name.trim(),
        code,
        currency: currency || session.currency || "USD",
        totalBudget: isNaN(budgetNum) ? 0 : budgetNum,
        createdById: session.id,
        members: {
          create: {
            userId: session.id,
            role: "ADMIN",
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, group }, { status: 201 });
  } catch (err) {
    console.error("Create group error:", err);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
