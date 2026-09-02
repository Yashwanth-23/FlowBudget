import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hashPin, verifyPin, hashSecretAnswer } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        username: true,
        currency: true,
        securityQuestion: true,
        securityAnswerHash: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        currency: user.currency,
        securityQuestion: user.securityQuestion || "What is your secret backup word?",
        hasSecurityAnswer: Boolean(user.securityAnswerHash),
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      securityQuestion,
      securityAnswer,
      currentPin,
      newPin,
      currency,
    } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    // 1. Update Security Backup Word
    if (securityAnswer && typeof securityAnswer === "string" && securityAnswer.trim().length >= 2) {
      updateData.securityQuestion = securityQuestion?.trim() || "What is your secret backup word?";
      updateData.securityAnswerHash = await hashSecretAnswer(securityAnswer.trim());
    }

    // 2. Change PIN (Requires verifying current PIN if user has one)
    if (newPin) {
      if (typeof newPin !== "string" || !/^\d{4,6}$/.test(newPin.trim())) {
        return NextResponse.json({ error: "New PIN must be 4 to 6 numeric digits" }, { status: 400 });
      }

      if (currentPin) {
        const isCurrentValid = await verifyPin(currentPin, user.pinHash);
        if (!isCurrentValid) {
          return NextResponse.json({ error: "Current PIN is incorrect" }, { status: 400 });
        }
      }

      updateData.pinHash = await hashPin(newPin.trim());
    }

    // 3. Update Currency
    if (currency) {
      updateData.currency = currency;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        currency: true,
        securityQuestion: true,
        securityAnswerHash: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile security settings updated successfully!",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        currency: updatedUser.currency,
        securityQuestion: updatedUser.securityQuestion,
        hasSecurityAnswer: Boolean(updatedUser.securityAnswerHash),
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Failed to update profile settings" }, { status: 500 });
  }
}
