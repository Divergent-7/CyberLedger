import { Analytics } from "@vercel/analytics/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "cyberLedger — Stop attacks before they escalate",
    template: "%s — cyberLedger",
  },
  description:
    "cyberLedger watches your Linux servers in real time, explains every threat in plain language, and blocks attackers automatically.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  other: {
    "darkreader-lock": "true",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#14120B",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-canvas text-ink min-h-screen font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
