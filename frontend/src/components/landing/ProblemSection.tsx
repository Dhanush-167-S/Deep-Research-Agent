"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FileCheck, ShieldAlert, GitCompare } from "lucide-react";

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problemPillars = [
    {
      icon: FileCheck,
      title: "Traceable Sources",
      desc: "Serious research requires knowing exactly where claims came from and inspecting original primary material.",
    },
    {
      icon: ShieldAlert,
      title: "Evidence Verification",
      desc: "Knowing which evidence supports a statement, where data is missing, and where sources disagree.",
    },
    {
      icon: GitCompare,
      title: "Cross-Checked Synthesis",
      desc: "Replacing hallucinated LLM references with an audited, multi-agent factual verification pipeline.",
    },
  ];

  return (
    <section id="research" className="py-[72px] md:py-[120px] bg-[var(--paper-0)]">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column (Problem Statement Copy) */}
          <div className="lg:col-span-7 space-y-6">
            <span className="font-mono-data text-xs uppercase tracking-widest text-[var(--verified)] font-semibold block">
              The Problem
            </span>

            <h2 className="font-fraunces text-3xl sm:text-5xl tracking-tight leading-[1.15] text-[var(--ink-900)]">
              AI can answer your question.
              <br />
              <span className="italic text-[var(--verified)]">But can you verify the answer?</span>
            </h2>

            <p className="text-base sm:text-lg text-[var(--ink-600)] leading-relaxed font-sans">
              Modern AI can summarize information in seconds. But serious research requires more than a confident response. You need to know where claims came from, which evidence supports them, and where sources disagree.
            </p>

            <p className="text-sm font-semibold text-[var(--ink-900)] leading-relaxed font-sans pt-2 border-t border-[var(--rule-line)]">
              TopResearch turns research into a transparent process — from planning and discovery to verification and synthesis.
            </p>
          </div>

          {/* Right Column (Honest Foundational Requirement Cards) */}
          <div ref={ref} className="lg:col-span-5 flex flex-col gap-5">
            {problemPillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ duration: 0.5, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="p-6 bg-[var(--paper-1)] border-l-4 border-[var(--verified)] border-y border-r border-[var(--rule-line)] rounded-[6px] shadow-2xs space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-[var(--verified-tint)] text-[var(--verified)]">
                      <Icon size={18} />
                    </div>
                    <h3 className="font-sans font-bold text-base text-[var(--ink-900)]">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--ink-600)] leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
