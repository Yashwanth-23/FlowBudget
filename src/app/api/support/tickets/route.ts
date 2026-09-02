import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/support/tickets -> Retrieves all support tickets
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (err) {
    console.error("Fetch tickets error:", err);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}
