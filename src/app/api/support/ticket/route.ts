import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ADMIN_EMAIL = "yashwanthv@proton.me";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthUser(req);
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required so we can reply" }, { status: 400 });
    }

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message description is required" }, { status: 400 });
    }

    // 1. Save Ticket to Neon PostgreSQL Database
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session?.id || null,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: "OPEN",
      },
    });

    // 2. Forward notification to Admin's Proton Mailbox without exposing the email
    try {
      // Using FormSubmit / Web3Forms server-side relay
      await fetch("https://formsubmit.co/ajax/" + ADMIN_EMAIL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: `[FlowBudget Support] ${subject.trim()} (Ticket #${ticket.id.slice(-6)})`,
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          ticket_id: ticket.id,
          user_account: session ? `@${session.username}` : "Guest / Not logged in",
        }),
      });
    } catch (forwardErr) {
      console.warn("Email forwarding notice:", forwardErr);
      // Non-blocking: Ticket is safely persisted in the database!
    }

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      message: "Ticket submitted successfully! We will review and reply to your email shortly.",
    });
  } catch (err) {
    console.error("Support ticket error:", err);
    return NextResponse.json({ error: "Failed to submit support ticket" }, { status: 500 });
  }
}
