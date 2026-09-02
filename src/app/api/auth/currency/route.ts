import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currency } = await req.json();
    if (!currency || !SUPPORTED_CURRENCIES[currency]) {
      return NextResponse.json({ error: "Invalid currency code" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: { currency },
      select: { id: true, username: true, currency: true },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Currency update error:", err);
    return NextResponse.json({ error: "Failed to update currency" }, { status: 500 });
  }
}
