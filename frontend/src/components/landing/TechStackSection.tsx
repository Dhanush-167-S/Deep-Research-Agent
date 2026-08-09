"use client";

import React from "react";
import { Cpu, Database, ShieldCheck, Code, Server, Layers, Terminal } from "lucide-react";

export function TechStackSection() {
  const stack = [
    {
      name: "Next.js 16 (React 19)",
      category: "Frontend Layer",
      icon: <Code className="w-5 h-5 text-indigo-400" />,
      desc: "App Router, Server Components, Streaming UI, & TailwindCSS v4.",
    },
    {
      name: "FastAPI & Pydantic v2",
      category: "Application Backend",
      icon: <Server className="w-5 h-5 text-cyan-400" />,
      desc: "High-performance Python async backend with type-safe schemas.",
    },
    {
      name: "LangGraph Orchestrator",
      category: "Multi-Agent Engine",
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      desc: "Stateful agent workflow graph supporting loops, branches, & streaming.",
    },
    {
      name: "PostgreSQL + pgvector",
      category: "Database & RAG",
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      desc: "ACID compliant relational storage paired with native vector embeddings.",
    },
    {
      name: "Better Auth",
      category: "Authentication",
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
      desc: "OAuth 2.0 (Google, GitHub), password encryption, & session security.",
    },
    {
      name: "Docker & Cloud Run",
      category: "Infrastructure",
      icon: <Layers className="w-5 h-5 text-rose-400" />,
      desc: "Cloud-native containerized architecture prepared for scale.",
    },
  ];

  return (
    <section id="architecture" className="py-24 relative overflow-hidden text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5" />
            <span>Modern Production Stack</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Built With Modern AI Engineering
          </h2>

          <p className="text-base sm:text-lg text-gray-400">
            No black boxes. Every technology chosen serves modularity, type safety, and scalability.
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {stack.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all duration-300 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">{item.icon}</div>
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">
                  {item.category}
                </span>
              </div>

              <h3 className="font-bold text-base text-white">{item.name}</h3>

              <p className="text-xs text-gray-400 leading-relaxed font-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
