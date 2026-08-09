"use client";

import { ScrollReveal, StaggerContainer, staggerChild } from "@/components/ui/ScrollReveal";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Cpu, BarChart3, Rocket, Feather } from "lucide-react";

export function Testimonials() {
  const userTypes = [
    {
      icon: BookOpen,
      role: "Researchers",
      desc: "Synthesize literature and cross-check evidence across academic sources without manual hallucination verification.",
    },
    {
      icon: GraduationCap,
      role: "Students",
      desc: "Explore complex technical domains with structured reports and verified citation trails.",
    },
    {
      icon: Cpu,
      role: "Engineers",
      desc: "Evaluate architectural trade-offs, system benchmarks, and production implementation mechanics.",
    },
    {
      icon: BarChart3,
      role: "Analysts",
      desc: "Compare technical proposals, industry trends, and conflicting empirical data points.",
    },
    {
      icon: Rocket,
      role: "Founders",
      desc: "Perform rapid due diligence, technical strategy reviews, and competitive landscape analyses.",
    },
    {
      icon: Feather,
      role: "Writers",
      desc: "Draft well-supported technical whitepapers, articles, and documentation backed by verified evidence.",
    },
  ];

  return (
    <section id="trust" className="py-[72px] md:py-[120px] bg-[var(--paper-0)]">
      <div className="max-w-[1240px] mx-auto px-6">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-mono-data text-xs uppercase tracking-widest text-[var(--verified)] font-semibold block">
            Target Use Cases
          </span>
          <h2 className="font-fraunces text-3xl sm:text-5xl tracking-tight leading-[1.1] text-[var(--ink-900)]">
            Built for people who need evidence, not just answers.
          </h2>
          <p className="text-base text-[var(--ink-600)] font-sans">
            Designed for individuals and teams where accuracy, source verification, and citation integrity matter.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTypes.map((u) => {
            const Icon = u.icon;
            return (
              <motion.div
                key={u.role}
                variants={staggerChild}
                className="editorial-card p-7 flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-[6px] bg-[var(--verified-tint)] text-[var(--verified)] flex items-center justify-center border border-[var(--verified)]/20">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-sans text-xl font-semibold text-[var(--ink-900)]">
                    {u.role}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm leading-relaxed text-[var(--ink-600)]">
                    {u.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--rule-line)] mt-6">
                  <span className="font-mono-data text-[10px] font-semibold text-[var(--verified)] uppercase tracking-wider">
                    Verified Workflow Focus
                  </span>
                </div>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
