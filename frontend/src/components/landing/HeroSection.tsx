"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center items-center pt-28 pb-20 px-6 paper-grain overflow-hidden">
      <motion.div
        className="max-w-[1240px] w-full mx-auto flex flex-col items-center text-center z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow Tag */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--rule-line)] bg-[var(--paper-1)] rounded-[2px] font-mono-data text-xs uppercase tracking-widest text-[var(--ink-600)]">
            <ShieldCheck size={14} className="text-[var(--verified)]" />
            AI Research Operating System
          </span>
        </motion.div>

        {/* Display Headline */}
        <motion.div variants={itemVariants} className="mb-6 relative max-w-4xl">
          <h1 className="font-fraunces text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[1.05] text-[var(--ink-900)]">
            Every Answer,{" "}
            <span className="relative inline-block text-[var(--verified)]">
              Verified.
              <motion.svg
                className="absolute left-0 -bottom-2 w-full h-3 text-[var(--verified)]"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.path
                  d="M2 8C50 2 150 2 198 8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </motion.svg>
            </span>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl font-normal text-[var(--ink-600)] max-w-[660px] mb-10 leading-relaxed font-sans"
        >
          TopResearch coordinates specialized AI agents to research complex questions, verify evidence, and produce structured reports with traceable sources.
        </motion.p>

        {/* CTA Row */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-4 mb-14"
        >
          <Link href="/dashboard" className="btn-verified text-base px-7 py-3.5 shadow-2xs">
            <span>Start Researching</span>
            <ArrowRight size={18} />
          </Link>

          <Link href="#agents" className="btn-ghost text-base px-7 py-3.5">
            <span>See how it works</span>
          </Link>
        </motion.div>

        {/* Honest Value Subline */}
        <motion.div
          variants={itemVariants}
          className="pt-8 border-t border-[var(--rule-line)]/60 w-full max-w-xl flex items-center justify-center text-center"
        >
          <span className="font-mono-data text-xs text-[var(--ink-600)] uppercase tracking-wider font-semibold">
            Built for people who need evidence, not just answers.
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
