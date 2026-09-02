import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPin, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, pin } = body;

    if (!username || !pin) {
      return NextResponse.json(
        { error: "Username and PIN are required" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please check your username or register." },
        { status: 404 }
      );
    }

    // Verify PIN
    const isValid = await verifyPin(pin, user.pinHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid PIN. Please try again." },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user.id,
      username: user.username,
      currency: user.currency,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        currency: user.currency,
      },
      token,
    });

    response.cookies.set("flowbudget_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Failed to login. Please try again." },
      { status: 500 }
    );
  }
}
