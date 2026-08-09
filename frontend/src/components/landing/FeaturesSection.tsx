"use client";

import React from "react";
import { Brain, Search, BookOpen, ShieldCheck, FileText, Database, Eye, RefreshCw, Zap, Sparkles } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag?: string;
}

function FeatureCard({ icon, title, description, tag }: FeatureCardProps) {
  return (
    <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 hover:border-indigo-500/40 transition-all duration-300 group flex flex-col justify-between text-left space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          {tag && (
            <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">
              {tag}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
          {title}
        </h3>

        <p className="text-sm text-gray-400 leading-relaxed font-normal">
          {description}
        </p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: <Brain className="w-5 h-5 text-purple-400" />,
      title: "Planner Agent & Task Decomposition",
      description: "Breaks down complex natural language queries into prioritized, multi-step subtasks before executing single searches.",
      tag: "LangGraph DAG",
    },
    {
      icon: <Search className="w-5 h-5 text-cyan-400" />,
      title: "Web & Real-Time Search Agent",
      description: "Searches authoritative web sources, parses raw DOM content, extracts key evidence, and filters promotional noise.",
      tag: "Live Search",
    },
    {
      icon: <BookOpen className="w-5 h-5 text-amber-400" />,
      title: "Academic Paper & Literature Agent",
      description: "Directly queries arXiv, IEEE Xplore, and PubMed for peer-reviewed citations, empirical datasets, and scholarly figures.",
      tag: "Academic Search",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: "Verification & Contradiction Engine",
      description: "Cross-checks facts across retrieved sources, flags conflicting claims, and assigns confidence scores before writing.",
      tag: "0% Hallucinations",
    },
    {
      icon: <Database className="w-5 h-5 text-indigo-400" />,
      title: "Vector Search & RAG Memory",
      description: "Stores embedded chunks into PostgreSQL using pgvector, facilitating fast semantic search across past research sessions.",
      tag: "pgvector",
    },
    {
      icon: <FileText className="w-5 h-5 text-rose-400" />,
      title: "Structured PDF & Markdown Export",
      description: "Generates publication-quality technical reports with formatted tables, mermaid diagrams, and numbered inline citations.",
      tag: "Report Generator",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built For Knowledge Workers</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered Like a FAANG Platform.
          </h2>

          <p className="text-base sm:text-lg text-gray-400">
            TopResearch is not another simple wrapper. It is a complete multi-agent operating system designed for deep reasoning.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => (
            <FeatureCard key={index} {...feat} />
          ))}
        </div>
      </div>
    </section>
  );
}
