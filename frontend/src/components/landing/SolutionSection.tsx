"use client";

import { ScrollReveal, StaggerContainer, staggerChild } from "@/components/ui/ScrollReveal";
import { GitBranch, ShieldCheck, FileCheck2 } from "lucide-react";
import { motion } from "framer-motion";

export function SolutionSection() {
  const pillars = [
    {
      icon: GitBranch,
      title: "Coordinated Multi-Agent Process",
      description:
        "Rather than relying on a single AI response, TopResearch coordinates specialized agents across planning, search, extraction, verification, and synthesis.",
    },
    {
      icon: ShieldCheck,
      title: "Audited Source Verification",
      description:
        "Retrieved evidence is cross-checked for claim relevance and source integrity before being synthesized into the final report.",
    },
    {
      icon: FileCheck2,
      title: "Structured Synthesis & Citations",
      description:
        "Findings are compiled into organized, readable research reports complete with formatted sections and inline citation badges.",
    },
  ];

  return (
    <section id="solution" className="py-[72px] md:py-[120px] bg-[var(--paper-1)] border-y border-[var(--rule-line)]">
      <div className="max-w-[1240px] mx-auto px-6">
        <ScrollReveal className="max-w-2xl mb-16 space-y-4">
          <span className="font-mono-data text-xs uppercase tracking-widest text-[var(--verified)] font-semibold block">
            The Solution
          </span>
          <h2 className="font-fraunces text-3xl sm:text-5xl tracking-tight leading-[1.1] text-[var(--ink-900)]">
            Research you can trace.
            <br />
            <span className="italic text-[var(--verified)]">Answers you can defend.</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--ink-600)] leading-relaxed font-sans">
            TopResearch performs research as a coordinated process rather than a single AI response.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                variants={staggerChild}
                className="editorial-card p-8 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-12 h-12 rounded-[6px] bg-[var(--verified-tint)] text-[var(--verified)] flex items-center justify-center mb-6 border border-[var(--verified)]/20">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-sans text-xl font-semibold text-[var(--ink-900)] mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[var(--ink-600)] leading-relaxed font-sans">
                    {pillar.description}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[var(--rule-line)] flex items-center gap-2 text-xs font-mono-data text-[var(--verified)] font-semibold">
                  <span>Transparent Process</span>
                  <span>→</span>
                </div>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
