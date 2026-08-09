import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

// Fraunces — editorial serif for headlines
const fraunces = localFont({
  src: [
    {
      path: "../fonts/Fraunces-VariableFont.ttf",
      style: "normal",
    },
    {
      path: "../fonts/Fraunces-Italic-VariableFont.ttf",
      style: "italic",
    },
  ],
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  title: "TopResearch — Every Answer, Verified",
  description:
    "TopResearch is an AI Research Operating System that coordinates specialized agents to plan, search, verify, and synthesize citation-backed research reports you can actually trust.",
  keywords: [
    "AI Research",
    "Research Verification",
    "Citation Engine",
    "Multi-Agent System",
    "Academic Search",
    "Evidence-Based Research",
  ],
  openGraph: {
    title: "TopResearch — Every Answer, Verified",
    description:
      "AI-powered research with source verification. Every claim traced, every source checked.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} ${fraunces.variable}`}
    >
      <body className="bg-[var(--paper-0)] text-[var(--ink-900)] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
