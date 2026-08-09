"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function TechStrip() {
  const userWorkflow = [
    "Plan",
    "Search",
    "Analyze",
    "Verify",
    "Write",
  ];

  return (
    <section className="py-10 border-y border-[var(--rule-line)] bg-[var(--paper-0)] overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <span className="font-mono-data text-xs uppercase tracking-widest text-[var(--verified)] font-bold whitespace-nowrap">
              Coordinated Workflow
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {userWorkflow.map((step, index) => (
                <div key={step} className="flex items-center gap-6">
                  <span className="font-fraunces text-base font-medium text-[var(--ink-900)]">
                    {step}
                  </span>
                  {index < userWorkflow.length - 1 && (
                    <span className="text-[var(--verified)] font-mono text-xs">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
            <span className="font-mono-data text-xs text-[var(--ink-600)] hidden lg:block">
              Traceable Research Output
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
