"use client";

import React, { useState } from "react";
import { X, Search, ArrowRight, ShieldCheck, Cpu, BookOpen, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { startResearchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface NewResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewResearchModal({ isOpen, onClose }: NewResearchModalProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { token } = useAuth();

  if (!isOpen) return null;

  const templates = [
    {
      title: "System Architecture Comparison",
      prompt: "Compare Kafka vs RabbitMQ vs Apache Pulsar for high-throughput streaming with benchmark figures.",
    },
    {
      title: "AI & Agentic Framework Survey",
      prompt: "Synthesize latest research papers on LangGraph, AutoGen, and CrewAI multi-agent orchestration.",
    },
    {
      title: "SaaS Auth & Security Architecture",
      prompt: "Design production authentication architecture covering OAuth 2.0, WebAuthn, Better Auth, and session security.",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await startResearchApi(query.trim(), token);
      const sessionId = res.session_id;
      onClose();
      router.push(`/workspace/${sessionId}?q=${encodeURIComponent(query.trim())}`);
    } catch (err: any) {
      console.error("Start research error:", err);
      setError(err.message || "Failed to initiate research session.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--ink-900)]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--paper-1)] border border-[var(--rule-line)] rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--ink-600)] hover:text-[var(--ink-900)] hover:bg-[var(--paper-0)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[var(--rule-line)] bg-[var(--paper-0)] text-[var(--verified)] text-[10px] font-mono-data font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Launch Multi-Agent Research Session</span>
          </div>
          <h2 className="font-fraunces text-2xl text-[var(--ink-900)] font-medium tracking-tight">
            What research topic shall we verify today?
          </h2>
          <p className="text-xs text-[var(--ink-600)] leading-relaxed font-sans">
            TopResearch coordinates Planner, Search, Academic, Verification, and Writer agents to retrieve evidence and synthesize a citation-backed report.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative bg-[var(--paper-0)] rounded-xl border border-[var(--rule-line)] p-3 shadow-xs">
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask complex technical questions, architecture decisions, paper surveys, or benchmark evaluations..."
              className="w-full bg-transparent text-xs sm:text-sm text-[var(--ink-900)] placeholder-[var(--ink-300)] focus:outline-none resize-none font-sans leading-relaxed"
            />
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="btn-verified text-xs px-5 py-2 flex items-center gap-2 shadow-2xs disabled:opacity-50"
              >
                <span>{isLoading ? "Queuing Session..." : "Launch Agents"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Templates */}
        <div className="space-y-2 pt-2 border-t border-[var(--rule-line)]">
          <p className="text-[11px] font-mono-data text-[var(--ink-600)] uppercase font-semibold">Or select a starter prompt:</p>
          <div className="space-y-2">
            {templates.map((tpl, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(tpl.prompt)}
                className="w-full p-2.5 rounded-lg bg-[var(--paper-0)] hover:bg-[var(--verified-tint)]/50 border border-[var(--rule-line)] text-left transition-colors flex items-center justify-between group"
              >
                <span className="text-xs font-semibold text-[var(--ink-900)] group-hover:text-[var(--verified)] truncate">
                  {tpl.title}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--ink-300)] group-hover:text-[var(--verified)] group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
