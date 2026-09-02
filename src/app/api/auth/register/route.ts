import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPin, hashSecretAnswer, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, pin, currency, securityQuestion, securityAnswer } = body;

    // Validate Username
    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 2 || cleanUsername.length > 20) {
      return NextResponse.json(
        { error: "Username must be between 2 and 20 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_.-]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, hyphens, and underscores" },
        { status: 400 }
      );
    }

    // Validate 4-6 digit numeric PIN
    if (!pin || typeof pin !== "string" || !/^\d{4,6}$/.test(pin.trim())) {
      return NextResponse.json(
        { error: "PIN must be 4 to 6 numeric digits" },
        { status: 400 }
      );
    }

    // Validate Secret Backup Word
    if (!securityAnswer || typeof securityAnswer !== "string" || securityAnswer.trim().length < 2) {
      return NextResponse.json(
        { error: "Please provide a secret backup word (e.g. your favorite city or pet)" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existing = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Username @${cleanUsername} is already taken. Please choose another.` },
        { status: 409 }
      );
    }

    const pinHash = await hashPin(pin.trim());
    const securityAnswerHash = await hashSecretAnswer(securityAnswer.trim());

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        pinHash,
        securityQuestion: securityQuestion?.trim() || "What is your secret backup word?",
        securityAnswerHash,
        currency: currency || "USD",
      },
    });

    const token = createSessionToken({
      id: user.id,
      username: user.username,
      currency: user.currency,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          currency: user.currency,
        },
      },
      { status: 201 }
    );

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
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
