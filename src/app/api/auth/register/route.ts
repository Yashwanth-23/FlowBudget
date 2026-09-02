import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPin, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, pin, currency } = body;

    if (!username || typeof username !== "string" || username.trim().length < 2) {
      return NextResponse.json(
        { error: "Username must be at least 2 characters" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    if (!pin || typeof pin !== "string" || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN must be 4 to 6 numeric digits" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken. Choose another username or login." },
        { status: 409 }
      );
    }

    // Hash PIN
    const pinHash = await hashPin(pin);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        pinHash,
        currency: currency || "USD",
      },
    });

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

    // Set cookie
    response.cookies.set("flowbudget_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Failed to register user. Please try again." },
      { status: 500 }
    );
  }
}
