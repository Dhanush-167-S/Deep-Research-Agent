"use client";

import React from "react";
import { MessageSquare, GitMerge, ShieldAlert, Sparkles, ArrowRight, Layers } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      icon: <MessageSquare className="w-5 h-5 text-indigo-400" />,
      title: "Input Complex Query",
      description: "Ask open-ended technical questions, market queries, system design challenges, or academic topics.",
    },
    {
      step: "02",
      icon: <GitMerge className="w-5 h-5 text-purple-400" />,
      title: "Multi-Agent Planning",
      description: "Planner Agent decomposes the prompt into sub-queries for parallel execution across Web & Academic APIs.",
    },
    {
      step: "03",
      icon: <ShieldAlert className="w-5 h-5 text-emerald-400" />,
      title: "Verification & Ranking",
      description: "Verification Agent evaluates source authority, removes conflicting statistics, and ranks evidence confidence.",
    },
    {
      step: "04",
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      title: "Synthesize & Export",
      description: "Writer Agent streams a citation-backed report complete with diagrams, tables, and PDF/Markdown export.",
    },
  ];

  return (
    <section id="workflow" className="py-24 bg-[#090a0f] relative overflow-hidden text-center border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>4-Step Automated Pipeline</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How TopResearch Operates
          </h2>

          <p className="text-base sm:text-lg text-gray-400">
            From raw natural language input to structured knowledge reports in minutes.
          </p>
        </div>

        {/* Workflow Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-2xl border border-white/10 relative flex flex-col justify-between space-y-6 group hover:border-indigo-500/30 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-gray-600 group-hover:text-indigo-400 transition-colors">
                    {item.step}
                  </span>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">{item.icon}</div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-400 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
