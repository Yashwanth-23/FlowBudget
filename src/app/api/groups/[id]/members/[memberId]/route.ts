import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, memberId } = await params;

    const group = await prisma.tripGroup.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Find the target member record
    const targetMember = await prisma.groupMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.groupId !== id) {
      return NextResponse.json({ error: "Member not found in this group" }, { status: 404 });
    }

    // Check requester permissions
    const requesterMembership = group.members.find((m) => m.userId === session.id);
    if (!requesterMembership) {
      return NextResponse.json({ error: "You are not in this group" }, { status: 403 });
    }

    const isAdmin = requesterMembership.role === "ADMIN" || group.createdById === session.id;
    const isSelf = targetMember.userId === session.id;

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: "Only group admins can remove other members." },
        { status: 403 }
      );
    }

    // Cannot remove creator
    if (targetMember.userId === group.createdById && !isSelf) {
      return NextResponse.json({ error: "Cannot remove the group creator" }, { status: 400 });
    }

    // Remove member
    await prisma.groupMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      success: true,
      message: isSelf ? "You have left the group" : "Member removed successfully",
    });
  } catch (err) {
    console.error("Remove member error:", err);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
