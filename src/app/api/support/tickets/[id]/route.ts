import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ADMIN_USERNAMES = ["yash", "admin", "yashwanth"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuperAdmin = ADMIN_USERNAMES.includes(session.username.toLowerCase());
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status: status || "RESOLVED" },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (err) {
    console.error("Update ticket error:", err);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
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

    const isSuperAdmin = ADMIN_USERNAMES.includes(session.username.toLowerCase());
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.supportTicket.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Ticket deleted" });
  } catch (err) {
    console.error("Delete ticket error:", err);
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 });
  }
}
