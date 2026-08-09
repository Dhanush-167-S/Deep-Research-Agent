"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does TopResearch verify sources?",
      a: "Every source URL cited in a report is checked for accessibility and content match. We cross-reference claims against multiple independent sources and assign confidence scores. Sources that cannot be verified are flagged, not hidden.",
    },
    {
      q: "What AI models does TopResearch use?",
      a: "TopResearch coordinates multiple specialized AI agents powered by Google Gemini and Groq LLMs. Each agent is fine-tuned for its specific role — planning, searching, analyzing, verifying, or writing.",
    },
    {
      q: "Can I use TopResearch for academic papers?",
      a: "Yes. TopResearch generates properly formatted citations (APA, MLA, Chicago, BibTeX) and provides full source provenance chains for literature reviews and systematic research.",
    },
    {
      q: "How is this different from ChatGPT or Perplexity?",
      a: "ChatGPT generates text but does not verify its claims. Perplexity searches the web but does not cross-reference sources. TopResearch runs a full verification pipeline — every claim is traced, every source is checked.",
    },
    {
      q: "Is my research data private?",
      a: "Yes. Your queries and reports are encrypted and never used for public model training. You can delete all report data at any time.",
    },
  ];

  return (
    <section id="faq" className="py-[72px] md:py-[120px] bg-[var(--paper-1)] border-t border-[var(--rule-line)]">
      <div className="max-w-[720px] mx-auto px-6">
        <ScrollReveal className="text-center mb-12">
          <span className="font-mono-data text-xs uppercase tracking-widest text-[var(--verified)] font-medium block mb-4">
            Frequently Asked
          </span>
          <h2 className="font-fraunces text-3xl sm:text-4xl tracking-tight leading-[1.1] text-[var(--ink-900)]">
            Common questions
          </h2>
        </ScrollReveal>

        <div className="border-t border-[var(--rule-line)]">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={faq.q} className="border-b border-[var(--rule-line)]">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-5 flex items-center justify-between text-left font-sans font-semibold text-base sm:text-lg text-[var(--ink-900)] hover:text-[var(--verified)] transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[var(--ink-600)] ml-4 flex-shrink-0"
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-sm text-[var(--ink-600)] leading-relaxed font-sans pr-8">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
