import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPin, verifySecretAnswer, createSessionToken, COOKIE_NAME } from "@/lib/auth";

// GET /api/auth/forgot-pin?username=xxx -> Fetches the user's security question prompt
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { username: cleanUsername },
      select: { username: true, securityQuestion: true, securityAnswerHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "No profile found with this username" }, { status: 404 });
    }

    if (!user.securityAnswerHash) {
      return NextResponse.json(
        {
          error: "No secret backup word was configured for this profile. Please contact trip admin or support.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      username: user.username,
      securityQuestion: user.securityQuestion || "What is your secret backup word?",
    });
  } catch (err) {
    console.error("Forgot PIN prompt error:", err);
    return NextResponse.json({ error: "Failed to fetch security question" }, { status: 500 });
  }
}

// POST /api/auth/forgot-pin -> Verifies security answer and resets PIN
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, securityAnswer, newPin } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (!user) {
      return NextResponse.json({ error: "No profile found with this username" }, { status: 404 });
    }

    if (!user.securityAnswerHash) {
      return NextResponse.json(
        { error: "No secret backup word was set up for this profile." },
        { status: 400 }
      );
    }

    if (!securityAnswer || typeof securityAnswer !== "string") {
      return NextResponse.json({ error: "Please enter your secret backup word" }, { status: 400 });
    }

    // Verify secret answer
    const isAnswerValid = await verifySecretAnswer(securityAnswer, user.securityAnswerHash);
    if (!isAnswerValid) {
      return NextResponse.json(
        { error: "Incorrect secret backup word. Please try again." },
        { status: 400 }
      );
    }

    // Validate new 4-6 digit numeric PIN
    if (!newPin || typeof newPin !== "string" || !/^\d{4,6}$/.test(newPin.trim())) {
      return NextResponse.json(
        { error: "New PIN must be 4 to 6 numeric digits" },
        { status: 400 }
      );
    }

    // Hash new PIN and update
    const newPinHash = await hashPin(newPin.trim());
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { pinHash: newPinHash },
    });

    const token = createSessionToken({
      id: updatedUser.id,
      username: updatedUser.username,
      currency: updatedUser.currency,
    });

    const response = NextResponse.json({
      success: true,
      message: "PIN reset successfully!",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        currency: updatedUser.currency,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Forgot PIN reset error:", err);
    return NextResponse.json({ error: "Failed to reset PIN" }, { status: 500 });
  }
}
