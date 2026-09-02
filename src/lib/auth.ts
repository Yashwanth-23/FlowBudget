import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "flowbudget-secret-key-production-ready-2026-super-secure";

export interface SessionUser {
  id: string;
  username: string;
  currency: string;
}

export async function hashPin(pin: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pin, salt);
}

export async function verifyPin(pin: string, pinHash: string): Promise<boolean> {
  return bcrypt.compare(pin, pinHash);
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      currency: user.currency,
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return {
      id: decoded.id,
      username: decoded.username,
      currency: decoded.currency,
    };
  } catch {
    return null;
  }
}

export async function getAuthUser(req: NextRequest): Promise<SessionUser | null> {
  // 1. Check Cookie
  const tokenCookie = req.cookies.get("flowbudget_token")?.value;
  if (tokenCookie) {
    const user = verifyToken(tokenCookie);
    if (user) return user;
  }

  // 2. Check Authorization Header (Bearer token)
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);
    if (user) return user;
  }

  return null;
}
