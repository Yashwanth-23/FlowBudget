import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "yashwanthv@proton.me";

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

    // 2. Send Real-Time Email Alert to Admin
    // Method A: Resend API (Official Next.js Standard - 100% Proton Mail Delivery)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "FlowBudget Support <onboarding@resend.dev>",
          to: ADMIN_EMAIL,
          replyTo: email.trim(),
          subject: `[FlowBudget Ticket #${ticket.id.slice(-6)}] ${subject.trim()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #101216; color: #ffffff; border-radius: 16px; border: 1px solid #27272a;">
              <h2 style="color: #10b981; margin-bottom: 8px;">New FlowBudget Support Ticket</h2>
              <p style="color: #a1a1aa; font-size: 13px; margin-top: 0;">Ticket ID: <strong style="color: #ffffff;">#${ticket.id}</strong></p>
              <hr style="border: none; border-top: 1px solid #27272a; margin: 16px 0;" />
              
              <div style="margin-bottom: 12px;">
                <span style="color: #71717a; font-size: 11px; text-transform: uppercase; font-weight: bold;">From:</span>
                <p style="margin: 2px 0; font-size: 14px; font-weight: bold;">${name.trim()} &lt;${email.trim()}&gt;</p>
                <p style="margin: 2px 0; font-size: 12px; color: #10b981;">Account: ${session ? `@${session.username}` : "Guest / Not Logged In"}</p>
              </div>

              <div style="margin-bottom: 16px;">
                <span style="color: #71717a; font-size: 11px; text-transform: uppercase; font-weight: bold;">Subject:</span>
                <p style="margin: 2px 0; font-size: 14px; font-weight: bold;">${subject.trim()}</p>
              </div>

              <div style="background-color: #181b22; padding: 14px; border-radius: 12px; border: 1px solid #27272a; margin-bottom: 16px;">
                <span style="color: #71717a; font-size: 11px; text-transform: uppercase; font-weight: bold;">Message:</span>
                <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.5; color: #e4e4e7;">${message.trim().replace(/\n/g, "<br/>")}</p>
              </div>

              <a href="mailto:${email.trim()}?subject=Re: ${encodeURIComponent(subject.trim())}" style="display: inline-block; padding: 10px 18px; background-color: #10b981; color: #0b1410; font-weight: bold; text-decoration: none; border-radius: 10px; font-size: 13px;">
                Reply to ${name.trim()}
              </a>
            </div>
          `,
        });
      } catch (resendErr) {
        console.error("Resend delivery error:", resendErr);
      }
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
