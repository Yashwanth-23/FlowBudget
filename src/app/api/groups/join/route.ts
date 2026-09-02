import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please login or create a profile first." }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Group join code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Find group
    const group = await prisma.tripGroup.findUnique({
      where: { code: cleanCode },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true } },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Trip group not found with this code. Please check the code or invite link." },
        { status: 404 }
      );
    }

    // Check if already a member
    const isAlreadyMember = group.members.some((m) => m.userId === session.id);
    if (isAlreadyMember) {
      return NextResponse.json({
        success: true,
        message: "You are already a member of this trip!",
        groupId: group.id,
      });
    }

    // Add user as member
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: session.id,
        role: "MEMBER",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully joined ${group.name}!`,
      groupId: group.id,
    });
  } catch (err) {
    console.error("Join group error:", err);
    return NextResponse.json({ error: "Failed to join trip group" }, { status: 500 });
  }
}
