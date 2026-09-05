import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { FluidAuroraBackground } from "@/components/ui/FluidAuroraBackground";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowBudget • Personal Budgeting & Shared Group Expense Splitter",
  description: "Track daily income and expenditures, set category budgets, and split shared group expenses with automated Min-Cash-Flow settlements.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#070a10] text-slate-100 relative overflow-x-hidden selection:bg-cyan-400/30 selection:text-white font-sans">
        {/* Prismatic Opal Aurora Engine */}
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

