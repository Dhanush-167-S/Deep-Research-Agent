"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function FinalCta() {
  return (
    <section className="py-[96px] md:py-[120px] bg-[var(--ink-900)] text-[var(--paper-0)] relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#FAF9F6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-[800px] mx-auto px-6 text-center relative z-10 space-y-6">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--ink-600)]/30 border border-[var(--ink-600)]/40 rounded-[2px] mb-4">
            <ShieldCheck size={14} className="text-[var(--verified)]" />
            <span className="font-mono-data text-xs uppercase tracking-widest text-[var(--paper-0)] font-semibold">
              Verifiable Evidence
            </span>
          </div>

          <h2 className="font-fraunces text-4xl sm:text-6xl tracking-tight leading-[1.08] text-[var(--paper-0)] mb-6">
            Start researching.
          </h2>

          <p className="text-base sm:text-lg text-[var(--ink-300)] max-w-lg mx-auto mb-10 font-sans leading-relaxed">
            Turn your next complex question into a research report you can actually trace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="btn-verified text-base px-8 py-3.5 shadow-lg"
            >
              <span>Start Researching</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
