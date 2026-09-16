import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPin, signToken } from "@/lib/auth";

/**
 * Progressive Exponential Backoff — "iPhone Passcode" Method
 *
 * Attempts 1–4: instant check, zero delay.
 * Attempt 5:    30-second lockout window.
 * Attempt 6:    60-second lockout window.
 * Attempt 7+:   300-second (5-minute) lockout window.
 *
 * On correct PIN at ANY point → counter resets to 0 immediately.
 */
function getLockoutSeconds(failedAttempts: number): number {
  if (failedAttempts < 5) return 0;
  if (failedAttempts === 5) return 30;
  if (failedAttempts === 6) return 60;
  return 300; // 7+
}

function formatWaitMessage(seconds: number): string {
  if (seconds < 60) return `Too many attempts. Please wait ${seconds} seconds before trying again.`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (remaining === 0) return `Too many attempts. Please wait ${minutes} minute${minutes > 1 ? "s" : ""} before trying again.`;
  return `Too many attempts. Please wait ${minutes}m ${remaining}s before trying again.`;
}

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

    // ── CHECK ACTIVE LOCKOUT ──────────────────────────────────────────
    if (user.lockoutExpiresAt) {
      const now = new Date();
      const lockoutEnd = new Date(user.lockoutExpiresAt);
      if (now < lockoutEnd) {
        const remainingMs = lockoutEnd.getTime() - now.getTime();
        const retryAfterSeconds = Math.ceil(remainingMs / 1000);
        return NextResponse.json(
          {
            error: formatWaitMessage(retryAfterSeconds),
            retryAfterSeconds,
            locked: true,
          },
          { status: 429 }
        );
      }
    }

    // ── VERIFY PIN ────────────────────────────────────────────────────
    const isValid = await verifyPin(pin, user.pinHash);

    if (!isValid) {
      // Increment failed attempts and compute next lockout window
      const newFailedCount = user.failedLoginAttempts + 1;
      const lockoutSeconds = getLockoutSeconds(newFailedCount);

      const lockoutExpiresAt =
        lockoutSeconds > 0
          ? new Date(Date.now() + lockoutSeconds * 1000)
          : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedCount,
          lockoutExpiresAt,
        },
      });

      // If this attempt triggers a lockout, tell the frontend immediately
      if (lockoutSeconds > 0) {
        return NextResponse.json(
          {
            error: formatWaitMessage(lockoutSeconds),
            retryAfterSeconds: lockoutSeconds,
            locked: true,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Invalid PIN. Please try again." },
        { status: 401 }
      );
    }

    // ── SUCCESS: Reset counter and issue session ──────────────────────
    if (user.failedLoginAttempts > 0 || user.lockoutExpiresAt) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockoutExpiresAt: null,
        },
      });
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
