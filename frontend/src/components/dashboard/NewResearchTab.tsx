"use client";

import React, { useState } from "react";
import { Search, ShieldCheck, ArrowRight, BookOpen, Cpu, Zap, Layers } from "lucide-react";

interface NewResearchTabProps {
  onStartResearch: (prompt: string) => void;
}

export function NewResearchTab({ onStartResearch }: NewResearchTabProps) {
  const [query, setQuery] = useState("");

  const templates = [
    {
      title: "System Architecture Comparison",
      prompt: "Compare Kafka vs RabbitMQ vs Apache Pulsar for high-throughput streaming with benchmark figures.",
      category: "Engineering",
      icon: <Cpu className="w-4 h-4 text-[var(--verified)]" />,
    },
    {
      title: "AI & Agentic Framework Survey",
      prompt: "Synthesize latest 2024-2025 research papers on LangGraph, AutoGen, and CrewAI multi-agent orchestration.",
      category: "Academic AI",
      icon: <BookOpen className="w-4 h-4 text-[var(--verified)]" />,
    },
    {
      title: "Competitor & Market Analysis",
      prompt: "Analyze the competitive landscape of AI coding assistants (GitHub Copilot, Cursor, Windsurf, Supermaven).",
      category: "Product & Market",
      icon: <Zap className="w-4 h-4 text-[var(--verified)]" />,
    },
    {
      title: "SaaS Security & Auth Architecture",
      prompt: "Design production authentication architecture covering OAuth 2.0, WebAuthn, Better Auth, and session security.",
      category: "Security",
      icon: <ShieldCheck className="w-4 h-4 text-[var(--verified)]" />,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onStartResearch(query);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4 text-left">
      {/* Hero Welcome Banner */}
      <div className="bg-[var(--paper-1)] p-8 rounded-xl border border-[var(--rule-line)] space-y-5">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--rule-line)] bg-[var(--paper-0)] text-[var(--verified)] text-xs font-mono-data uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--verified)]" />
            <span>Research Operating System Workspace</span>
          </div>

          <h2 className="font-fraunces text-3xl sm:text-4xl text-[var(--ink-900)] tracking-tight">
            What research topic shall we verify today?
          </h2>

          <p className="text-sm text-[var(--ink-600)] leading-relaxed font-sans">
            Enter any technical, academic, or market prompt. TopResearch coordinates specialized agents to retrieve evidence, verify facts, and compile a citation-backed report.
          </p>
        </div>

        {/* Input Prompt Box */}
        <form onSubmit={handleSubmit} className="pt-2">
          <div className="bg-[var(--paper-0)] p-2 rounded-xl border border-[var(--rule-line)] shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-3 px-3 w-full sm:w-auto flex-1">
              <Search className="w-5 h-5 text-[var(--ink-300)] shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask complex technical questions, architecture decisions, or paper surveys..."
                className="bg-transparent text-sm text-[var(--ink-900)] placeholder-[var(--ink-300)] focus:outline-none w-full py-2 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={!query.trim()}
              className="w-full sm:w-auto btn-verified px-6 py-3 shrink-0 disabled:opacity-50"
            >
              <span>Launch Agents</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Recommended Starter Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-fraunces text-xl text-[var(--ink-900)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--verified)]" />
            Recommended Starter Templates
          </h3>
          <span className="text-xs text-[var(--ink-600)] font-mono-data">Click any template to load prompt</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(tpl.prompt)}
              className="editorial-card p-5 rounded-xl text-left flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-md bg-[var(--paper-0)] border border-[var(--rule-line)]">{tpl.icon}</div>
                  <span className="text-[10px] font-mono-data uppercase px-2 py-0.5 rounded bg-[var(--paper-0)] border border-[var(--rule-line)] text-[var(--ink-600)]">
                    {tpl.category}
                  </span>
                </div>

                <h4 className="font-sans font-semibold text-sm text-[var(--ink-900)] group-hover:text-[var(--verified)] transition-colors">
                  {tpl.title}
                </h4>

                <p className="text-xs text-[var(--ink-600)] line-clamp-2 leading-relaxed font-sans">{tpl.prompt}</p>
              </div>

              <div className="text-[11px] font-mono-data text-[var(--verified)] group-hover:translate-x-1 transition-transform flex items-center gap-1 pt-1">
                <span>Use Prompt</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
