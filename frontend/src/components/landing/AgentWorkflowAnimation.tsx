"use client";

import React, { useState, useEffect } from "react";
import { Brain, Search, BookOpen, CheckCircle2, FileText, Play, RotateCcw, Sparkles, Layers, ShieldCheck } from "lucide-react";

interface AgentStep {
  id: string;
  name: string;
  role: string;
  icon: React.ReactNode;
  status: "idle" | "running" | "completed";
  outputSnippet: string;
  evidenceCount?: number;
}

const INITIAL_STEPS: AgentStep[] = [
  {
    id: "planner",
    name: "Planner Agent",
    role: "Task Decomposition",
    icon: <Brain className="w-4 h-4 text-purple-400" />,
    status: "completed",
    outputSnippet: "Decomposed goal into 4 subtasks: 1. Architecture comparison 2. Benchmark data 3. Security assessment 4. Final synthesis.",
  },
  {
    id: "search",
    name: "Search Agent",
    role: "Web Retrieval",
    icon: <Search className="w-4 h-4 text-cyan-400" />,
    status: "completed",
    outputSnippet: "Discovered 14 relevant web sources across official docs, benchmarks, and engineering blogs.",
    evidenceCount: 14,
  },
  {
    id: "academic",
    name: "Academic Agent",
    role: "Literature Retrieval",
    icon: <BookOpen className="w-4 h-4 text-amber-400" />,
    status: "completed",
    outputSnippet: "Queried arXiv & IEEE Xplore. Retrieved 6 peer-reviewed papers on distributed event streams.",
    evidenceCount: 6,
  },
  {
    id: "verification",
    name: "Verification Agent",
    role: "Evidence Cross-Checking",
    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    status: "running",
    outputSnippet: "Cross-referencing throughput figures. 0 contradictions found. High confidence (98.4%).",
  },
  {
    id: "writer",
    name: "Writer Agent",
    role: "Synthesis & Citations",
    icon: <FileText className="w-4 h-4 text-indigo-400" />,
    status: "idle",
    outputSnippet: "Waiting for evidence verification matrix...",
  },
];

export function AgentWorkflowAnimation() {
  const [steps, setSteps] = useState<AgentStep[]>(INITIAL_STEPS);
  const [activeStepIndex, setActiveStepIndex] = useState(3);
  const [isSimulating, setIsSimulating] = useState(true);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        const nextIndex = (prev + 1) % INITIAL_STEPS.length;
        setSteps((currentSteps) =>
          currentSteps.map((step, idx) => {
            if (idx < nextIndex) {
              return { ...step, status: "completed" };
            } else if (idx === nextIndex) {
              return { ...step, status: "running" };
            } else {
              return { ...step, status: "idle" };
            }
          })
        );
        return nextIndex;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const resetSimulation = () => {
    setActiveStepIndex(0);
    setSteps(
      INITIAL_STEPS.map((step, idx) => ({
        ...step,
        status: idx === 0 ? "running" : "idle",
      }))
    );
    setIsSimulating(true);
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">LangGraph Multi-Agent Execution Pipeline</h3>
            <p className="text-xs text-gray-400">Live DAG state visualization & evidence streaming</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 flex items-center gap-1.5 transition-colors"
          >
            {isSimulating ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Simulating Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-indigo-400" />
                <span>Play Simulation</span>
              </>
            )}
          </button>
          <button
            onClick={resetSimulation}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
            title="Reset Workflow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid: Agent Pipeline Steps (Left) + Live Streamed Report Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Left Column: Agent Steps */}
        <div className="lg:col-span-5 space-y-3">
          {steps.map((step, idx) => {
            const isRunning = step.status === "running";
            const isDone = step.status === "completed";

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border transition-all duration-300 ${
                  isRunning
                    ? "bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                    : isDone
                    ? "bg-white/[0.02] border-white/10"
                    : "bg-white/[0.01] border-white/5 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">{step.icon}</div>
                    <div>
                      <span className="font-semibold text-xs text-white block">{step.name}</span>
                      <span className="text-[11px] text-gray-400">{step.role}</span>
                    </div>
                  </div>

                  <div>
                    {isRunning && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse">
                        Executing...
                      </span>
                    )}
                    {isDone && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {step.status === "idle" && (
                      <span className="text-[10px] font-mono text-gray-500">Queued</span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-gray-300 font-mono leading-relaxed pl-9">
                  {step.outputSnippet}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Simulated Live Generated Output / Citations preview */}
        <div className="lg:col-span-7 bg-[#090a0f] rounded-xl border border-white/10 p-5 flex flex-col justify-between font-mono text-xs text-gray-300 space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-gray-400 text-[11px]">
              <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Live Synthesis Stream
              </span>
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Confidence: 98.4%
              </span>
            </div>

            <div className="pt-4 space-y-3">
              <h4 className="text-sm font-semibold text-white font-sans">
                # High-Throughput Event Streaming: Kafka vs RabbitMQ
              </h4>
              <p className="text-gray-300 leading-relaxed font-sans text-xs">
                In high-volume streaming architectures (&gt;500k ops/sec), Apache Kafka utilizes a commit log retention pattern yielding sequential disk write performance <span className="text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded border border-indigo-500/20 text-[11px] font-mono">[Ref 1: arXiv:2304.1029]</span>.
              </p>
              <p className="text-gray-300 leading-relaxed font-sans text-xs">
                Conversely, RabbitMQ provides flexible AMQP 0-9-1 routing exchange topologies, optimized for complex message filtering rather than immutable replay <span className="text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded border border-indigo-500/20 text-[11px] font-mono">[Ref 2: IEEE-Trans-2024]</span>.
              </p>
            </div>
          </div>

          {/* Citation Panel Footnote */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
            <span className="flex items-center gap-1 text-cyan-400">
              <BookOpen className="w-3 h-3" /> 20 Total Verified Sources
            </span>
            <span className="text-gray-500">Latency: 380ms streaming</span>
          </div>
        </div>
      </div>
    </div>
  );
}
