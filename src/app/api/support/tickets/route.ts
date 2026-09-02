import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ADMIN_USERNAMES = ["yash", "admin", "yashwanth"];

// GET /api/support/tickets -> Restricted strictly to App SuperAdmin
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuperAdmin = ADMIN_USERNAMES.includes(session.username.toLowerCase());
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: "Access denied. Only the app administrator can view system tickets." },
        { status: 403 }
      );
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
