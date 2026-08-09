"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  LayoutDashboard,
  Globe,
  BookOpen,
  ShieldCheck,
  PenTool,
  CheckCircle2,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const agents = [
    {
      step: "01",
      name: "Planner",
      role: "Research Strategy",
      icon: LayoutDashboard,
      desc: "Breaks complex questions into focused research tasks.",
      isVerifier: false,
    },
    {
      step: "02",
      name: "Searcher",
      role: "Web & Academic Discovery",
      icon: Globe,
      desc: "Finds relevant sources across the web and academic repositories.",
      isVerifier: false,
    },
    {
      step: "03",
      name: "Researcher",
      role: "Evidence Extraction",
      icon: BookOpen,
      desc: "Reads and organizes useful evidence from retrieved sources.",
      isVerifier: false,
    },
    {
      step: "04",
      name: "Verifier",
      role: "Evidence Verification",
      icon: ShieldCheck,
      desc: "Cross-checks evidence and identifies unsupported or conflicting claims.",
      isVerifier: true,
    },
    {
      step: "05",
      name: "Writer",
      role: "Research Synthesis",
      icon: PenTool,
      desc: "Turns verified findings into a structured research report with citations.",
      isVerifier: false,
    },
  ];

  return (
    <section id="agents" className="py-[72px] md:py-[120px] bg-[var(--paper-0)]">
      <div className="max-w-[1240px] mx-auto px-6">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="font-mono-data text-xs uppercase tracking-widest text-[var(--verified)] font-semibold block">
            The Multi-Agent Workflow
          </span>
          <h2 className="font-fraunces text-3xl sm:text-5xl tracking-tight leading-[1.1] text-[var(--ink-900)]">
            Five agents. One verified report.
          </h2>
          <p className="text-base text-[var(--ink-600)] font-sans">
            TopResearch coordinates specialized AI agents to handle each phase of the research process.
          </p>
        </ScrollReveal>

        {/* Pipeline Container */}
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-3 relative">
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative"
              >
                {/* Agent Card */}
                <div
                  className={`h-full p-6 flex flex-col justify-between transition-all duration-300 rounded-[8px] ${
                    agent.isVerifier
                      ? "bg-[var(--verified-tint)]/40 border-2 border-[var(--verified)] shadow-sm"
                      : "bg-[var(--paper-1)] border border-[var(--rule-line)] hover:border-[var(--ink-300)]"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono-data text-xs font-semibold text-[var(--ink-600)]">
                        {agent.step}
                      </span>
                      {agent.isVerifier ? (
                        <motion.span
                          initial={{ scale: 0.85 }}
                          animate={isInView ? { scale: [0.85, 1.08, 1] } : { scale: 0.85 }}
                          transition={{ duration: 0.3, delay: 0.55 }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[var(--verified)] text-[var(--paper-0)] font-mono-data text-[10px] font-bold uppercase tracking-wider"
                        >
                          <CheckCircle2 size={12} />
                          VERIFIER
                        </motion.span>
                      ) : (
                        <div className="w-8 h-8 rounded-[4px] bg-[var(--paper-0)] border border-[var(--rule-line)] flex items-center justify-center text-[var(--ink-600)]">
                          <Icon size={16} strokeWidth={1.5} />
                        </div>
                      )}
                    </div>

                    {/* Agent Name */}
                    <h3 className="font-sans text-lg font-semibold text-[var(--ink-900)] mb-1">
                      {agent.name}
                    </h3>
                    <p className="font-mono-data text-xs text-[var(--verified)] font-semibold mb-3">
                      {agent.role}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-[var(--ink-600)] leading-relaxed font-sans">
                      {agent.desc}
                    </p>
                  </div>

                  {/* Flow Indicator */}
                  {index < agents.length - 1 && (
                    <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-[var(--ink-300)] font-mono text-xs">
                      →
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
