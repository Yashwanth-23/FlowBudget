import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "flowbudget-secret-key-production-ready-2026";
const COOKIE_NAME = "flowbudget_token";

export interface UserSession {
  id: string;
  username: string;
  currency: string;
}

// 1. Hash & verify numeric 4-6 digit PIN
export async function hashPin(pin: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pin, salt);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

// 2. Hash & verify Secret Backup Word (normalized to lowercase)
export async function hashSecretAnswer(answer: string): Promise<string> {
  const normalized = answer.trim().toLowerCase();
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(normalized, salt);
}

export async function verifySecretAnswer(answer: string, hash: string): Promise<boolean> {
  const normalized = answer.trim().toLowerCase();
  return bcrypt.compare(normalized, hash);
}

// 3. JWT Session Tokens
export function createSessionToken(user: UserSession): string {
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

export const signToken = createSessionToken;

export function verifySessionToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    return decoded;
  } catch {
    return null;
  }
}

// 4. Extract authenticated user session from NextRequest cookies
export async function getAuthUser(req: NextRequest): Promise<UserSession | null> {
  const token =
    req.cookies.get("flowbudget_token")?.value ||
    req.cookies.get("flowbudget_session")?.value;

  if (!token) return null;

  const session = verifySessionToken(token);
  if (!session) return null;

  // Verify user still exists in database
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, username: true, currency: true },
  });

  return user ? { id: user.id, username: user.username, currency: user.currency } : null;
}

export { COOKIE_NAME };
