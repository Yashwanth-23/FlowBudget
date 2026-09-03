import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { FluidAuroraBackground } from "@/components/ui/FluidAuroraBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowBudget • Personal Budgeting & Shared Group Expense Splitter",
  description: "Track daily income and expenditures, set category budgets, and split shared group expenses with automated Min-Cash-Flow settlements.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#080b12] text-slate-100 relative overflow-x-hidden selection:bg-emerald-500 selection:text-black">
        {/* Apple Intelligence & Gemini Living Multicolor Aurora Engine */}
        <FluidAuroraBackground />

        {/* Foreground Content Stack */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
