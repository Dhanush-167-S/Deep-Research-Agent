"use client";

import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TechStrip } from "@/components/landing/TechStrip";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { Testimonials } from "@/components/landing/Testimonials";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--paper-0)] text-[var(--ink-900)] selection:bg-[var(--verified-tint)] selection:text-[var(--ink-900)] font-sans">
      <Navbar />
      <main>
        <HeroSection />
        <TechStrip />
        <ProblemSection />
        <SolutionSection />
        <HowItWorks />
        <FeaturesGrid />
        <Testimonials />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
