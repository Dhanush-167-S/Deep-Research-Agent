"use client";

import React from "react";
import { Brain, Search, BookOpen, ShieldCheck, FileText, CheckCircle2, Loader2, Circle } from "lucide-react";

export interface TimelineStep {
  id: string;
  name: string;
  role: string;
  status: "completed" | "running" | "idle";
  duration?: string;
  details?: string;
}

interface AgentTimelineProps {
  steps: TimelineStep[];
  currentStepIndex: number;
}

export function AgentTimeline({ steps, currentStepIndex }: AgentTimelineProps) {
  const getIcon = (id: string, status: string) => {
    if (status === "running") return <Loader2 className="w-4 h-4 text-[var(--verified)] animate-spin" />;
    if (status === "completed") return <ShieldCheck className="w-4 h-4 text-[var(--verified)]" />;

    switch (id) {
      case "planner":
        return <Brain className="w-4 h-4 text-[var(--ink-600)]" />;
      case "search":
        return <Search className="w-4 h-4 text-[var(--ink-600)]" />;
      case "academic":
        return <BookOpen className="w-4 h-4 text-[var(--ink-600)]" />;
      case "verification":
        return <ShieldCheck className="w-4 h-4 text-[var(--ink-600)]" />;
      case "writer":
        return <FileText className="w-4 h-4 text-[var(--ink-600)]" />;
      default:
        return <Circle className="w-4 h-4 text-[var(--ink-300)]" />;
    }
  };

  return (
    <div className="bg-[var(--paper-1)] p-4 rounded-xl border border-[var(--rule-line)] space-y-3 text-left">
      <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--rule-line)]">
        <span className="font-fraunces font-medium text-[var(--ink-900)] text-sm tracking-wide">Multi-Agent Execution Pipeline</span>
        <span className="text-[var(--ink-600)] text-[11px] font-mono-data">
          Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {steps.map((step) => {
          const isDone = step.status === "completed";
          const isRunning = step.status === "running";

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border text-left transition-all ${
                isRunning
                  ? "bg-[var(--verified-tint)] border-[var(--verified)] shadow-xs"
                  : isDone
                  ? "bg-[var(--paper-0)] border-[var(--rule-line)]"
                  : "bg-[var(--paper-0)] border-[var(--rule-line)] opacity-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {getIcon(step.id, step.status)}
                  <span className="font-semibold text-xs text-[var(--ink-900)] truncate">{step.name}</span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--ink-600)] truncate font-sans">{step.role}</p>
              {step.duration && <p className="text-[9px] font-mono-data text-[var(--ink-300)] mt-1">{step.duration}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
