"use client";

import { ScrollReveal, StaggerContainer, staggerChild } from "@/components/ui/ScrollReveal";
import {
  Search,
  Activity,
  Quote,
  ShieldCheck,
  Download,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesGrid() {
  const features = [
    {
      icon: Search,
      title: "Deep Research",
      desc: "Search across relevant web and academic sources concurrently to gather rich technical context.",
      colSpan: "lg:col-span-2",
      badge: "Multi-Source",
    },
    {
      icon: Activity,
      title: "Live Research Progress",
      desc: "See what the research system is doing in real-time while your report is being prepared.",
      colSpan: "lg:col-span-1",
      badge: "Live Telemetry",
    },
    {
      icon: Quote,
      title: "Citation Traceability",
      desc: "Connect claims in the report directly to underlying sources with clean, clickable citation badges.",
      colSpan: "lg:col-span-1",
      badge: "Full Audit",
    },
    {
      icon: ShieldCheck,
      title: "Source Verification",
      desc: "Check retrieved evidence before it becomes part of the final report to eliminate unsupported statements.",
      colSpan: "lg:col-span-2",
      badge: "Audited Evidence",
    },
    {
      icon: FileText,
      title: "Structured Reports",
      desc: "Receive organized, highly readable research reports with executive summaries, key findings, and formatted tables.",
      colSpan: "lg:col-span-2",
      badge: "Editorial Format",
    },
    {
      icon: Download,
      title: "Export Options",
      desc: "Download completed research reports as publication-ready PDF or Markdown documents with one click.",
      colSpan: "lg:col-span-1",
      badge: "PDF / Markdown",
    },
  ];

  return (
    <section id="capabilities" className="py-[72px] md:py-[120px] bg-[var(--paper-1)] border-y border-[var(--rule-line)]">
      <div className="max-w-[1240px] mx-auto px-6">
        <ScrollReveal className="max-w-2xl mb-16 space-y-3">
          <span className="font-mono-data text-xs uppercase tracking-widest text-[var(--verified)] font-semibold block">
            Capabilities
          </span>
          <h2 className="font-fraunces text-3xl sm:text-5xl tracking-tight leading-[1.1] text-[var(--ink-900)]">
            Built for real-world research.
          </h2>
          <p className="text-base text-[var(--ink-600)] font-sans">
            Every feature is designed to turn complex questions into verified, traceable research reports.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={staggerChild}
                className={`editorial-card p-8 flex flex-col justify-between shadow-xs ${feat.colSpan}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-[4px] bg-[var(--paper-0)] border border-[var(--rule-line)] flex items-center justify-center text-[var(--verified)]">
                      <Icon size={20} strokeWidth={1.5} />
                    </div>
                    <span className="font-mono-data text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-[var(--paper-0)] border border-[var(--rule-line)] text-[var(--ink-600)] rounded-[2px]">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-sans text-xl font-semibold text-[var(--ink-900)] mb-3">
                    {feat.title}
                  </h3>

                  <p className="text-sm text-[var(--ink-600)] leading-relaxed font-sans">
                    {feat.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
