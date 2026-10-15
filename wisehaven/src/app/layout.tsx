import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WiseHaven — Give Every Franc a Purpose",
  description:
    "WiseHaven is a smart, time-locked envelope budgeting application for Rwanda. Lock in your priorities. Unlock financial peace of mind.",
  keywords: ["budgeting", "envelope", "Rwanda", "RWF", "savings", "fintech"],
  authors: [{ name: "WiseHaven" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <head>
        {/* Geist and JetBrains Mono via Google Fonts — loaded in globals.css */}
      </head>
      <body className="bg-surface text-on-surface antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
