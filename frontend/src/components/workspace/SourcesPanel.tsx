"use client";

import React, { useState } from "react";
import { BookOpen, ExternalLink, Globe, ShieldCheck } from "lucide-react";

export interface EvidenceSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  type: "academic" | "web";
  confidence: number;
  snippet: string;
  citationRef: string;
}

interface SourcesPanelProps {
  sources: EvidenceSource[];
  onSelectCitation?: (ref: string) => void;
}

export function SourcesPanel({ sources, onSelectCitation }: SourcesPanelProps) {
  const [filterType, setFilterType] = useState<"all" | "academic" | "web">("all");

  const filteredSources = sources.filter((s) => (filterType === "all" ? true : s.type === filterType));

  return (
    <div className="bg-[var(--paper-1)] h-full rounded-xl border border-[var(--rule-line)] p-4 sm:p-5 flex flex-col justify-between text-left space-y-4 shadow-xs">
      {/* Header & Filter Controls */}
      <div className="space-y-3 pb-3 border-b border-[var(--rule-line)]">
        <div className="flex items-center justify-between">
          <h3 className="font-fraunces font-medium text-base text-[var(--ink-900)] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--verified)]" />
            Evidence Sources ({sources.length})
          </h3>
          <span className="text-[10px] font-mono-data text-[var(--verified)] bg-[var(--verified-tint)] px-2 py-0.5 rounded border border-[var(--verified)]/20 font-semibold flex items-center gap-1">
            <ShieldCheck size={12} />
            Verified
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="grid grid-cols-3 p-1 bg-[var(--paper-0)] border border-[var(--rule-line)] rounded-md text-[11px] font-mono-data text-[var(--ink-600)]">
          <button
            onClick={() => setFilterType("all")}
            className={`py-1 rounded transition-all ${
              filterType === "all" ? "bg-[var(--verified)] text-[var(--paper-0)] font-semibold shadow-2xs" : "hover:text-[var(--ink-900)]"
            }`}
          >
            All ({sources.length})
          </button>
          <button
            onClick={() => setFilterType("academic")}
            className={`py-1 rounded transition-all ${
              filterType === "academic" ? "bg-[var(--verified)] text-[var(--paper-0)] font-semibold shadow-2xs" : "hover:text-[var(--ink-900)]"
            }`}
          >
            Academic
          </button>
          <button
            onClick={() => setFilterType("web")}
            className={`py-1 rounded transition-all ${
              filterType === "web" ? "bg-[var(--verified)] text-[var(--paper-0)] font-semibold shadow-2xs" : "hover:text-[var(--ink-900)]"
            }`}
          >
            Web
          </button>
        </div>
      </div>

      {/* Sources Scrollable List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredSources.map((source) => (
          <div
            key={source.id}
            onClick={() => onSelectCitation?.(source.citationRef)}
            className="p-3.5 rounded-lg bg-[var(--paper-0)] border border-[var(--rule-line)] hover:border-[var(--verified)] transition-all space-y-2 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-data font-bold text-[var(--verified)] bg-[var(--verified-tint)] px-1.5 py-0.5 rounded border border-[var(--verified)]/20">
                {source.citationRef}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-data text-[var(--verified)] font-semibold">
                  {source.confidence}% match
                </span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[var(--ink-300)] hover:text-[var(--ink-900)] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <h4 className="font-sans font-semibold text-xs text-[var(--ink-900)] group-hover:text-[var(--verified)] transition-colors line-clamp-1">
              {source.title}
            </h4>

            <p className="text-[11px] text-[var(--ink-600)] line-clamp-2 leading-relaxed font-sans">
              {source.snippet}
            </p>

            <div className="flex items-center justify-between text-[10px] text-[var(--ink-600)] font-mono-data pt-1 border-t border-[var(--rule-line)]/50">
              <span className="flex items-center gap-1">
                {source.type === "academic" ? (
                  <BookOpen className="w-3 h-3 text-[var(--verified)]" />
                ) : (
                  <Globe className="w-3 h-3 text-[var(--ink-600)]" />
                )}
                {source.domain}
              </span>
              <span className="uppercase font-semibold">{source.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
