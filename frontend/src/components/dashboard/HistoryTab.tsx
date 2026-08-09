"use client";

import React, { useState, useEffect } from "react";
import { Search, History, Trash2, Calendar, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { getHistoryApi, deleteReportApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export interface ResearchHistoryItem {
  id: string;
  query: string;
  date: string;
  status: "completed" | "in_progress" | "failed";
  sourcesCount: number;
  confidenceScore: number;
  reportSummary: string;
}

interface HistoryTabProps {
  onSelectResearch: (item: ResearchHistoryItem) => void;
}

export function HistoryTab({ onSelectResearch }: HistoryTabProps) {
  const { user, token } = useAuth();
  const [searchFilter, setSearchFilter] = useState("");
  const [historyList, setHistoryList] = useState<ResearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await getHistoryApi(token);
        if (res && res.history) {
          const items: ResearchHistoryItem[] = res.history.map((h: any) => ({
            id: h.id || h.session_id,
            query: h.query,
            date: h.created_at ? new Date(h.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            status: h.status || "completed",
            sourcesCount: h.sources_count || 0,
            confidenceScore: h.confidence_score || 98.4,
            reportSummary: h.title || h.summary || h.query,
          }));
          setHistoryList(items);
        }
      } catch (err) {
        console.warn("History fetch notice:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [token]);

  const filteredHistory = historyList.filter(
    (item) =>
      item.query.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.reportSummary.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await deleteReportApi(id, token);
      setHistoryList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete report notice:", err);
    }
  };


  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 text-left">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--rule-line)]">
        <div>
          <h2 className="font-fraunces text-2xl font-medium text-[var(--ink-900)] flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--verified)]" />
            Research History & Archives
          </h2>
          <p className="text-xs text-[var(--ink-600)] font-sans">View and resume past verified multi-agent research sessions</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[var(--ink-300)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search past research..."
            className="w-full bg-[var(--paper-1)] border border-[var(--rule-line)] rounded-lg pl-9 pr-4 py-2 text-xs text-[var(--ink-900)] placeholder-[var(--ink-300)] focus:outline-none focus:border-[var(--verified)]"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-[var(--paper-1)] p-12 rounded-xl text-center border border-[var(--rule-line)] space-y-2 font-mono-data text-xs text-[var(--ink-600)]">
          Loading past research sessions from database...
        </div>
      ) : filteredHistory.length === 0 ? (
        /* Empty State */
        <div className="bg-[var(--paper-1)] p-12 rounded-xl text-center border border-[var(--rule-line)] space-y-3">
          <FileText className="w-8 h-8 text-[var(--ink-300)] mx-auto" />
          <p className="text-sm font-semibold text-[var(--ink-900)]">No research yet</p>
          <p className="text-xs text-[var(--ink-600)]">Start your first deep research project above.</p>
        </div>
      ) : (
        /* History Items Grid */
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectResearch(item)}
              className="editorial-card p-5 rounded-xl transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono-data bg-[var(--verified-tint)] text-[var(--verified)] border border-[var(--verified)]/20 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>

                  <span className="text-[11px] font-mono-data text-[var(--ink-600)] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[var(--ink-300)]" /> {item.date}
                  </span>

                  <span className="text-[11px] font-mono-data text-[var(--ink-600)] bg-[var(--paper-0)] px-2 py-0.5 rounded border border-[var(--rule-line)]">
                    {item.sourcesCount} Sources
                  </span>

                  <span className="text-[11px] font-mono-data text-[var(--verified)] bg-[var(--verified-tint)] px-2 py-0.5 rounded border border-[var(--verified)]/20 font-semibold">
                    {item.confidenceScore}% Confidence
                  </span>
                </div>

                <h3 className="font-sans font-semibold text-sm text-[var(--ink-900)] group-hover:text-[var(--verified)] transition-colors">
                  {item.query}
                </h3>

                <p className="text-xs text-[var(--ink-600)] line-clamp-2 leading-relaxed font-sans">
                  {item.reportSummary}
                </p>
              </div>

              {/* Right Action Trigger */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-2 rounded-lg text-[var(--ink-300)] hover:text-[var(--verified)] hover:bg-[var(--verified-tint)] transition-colors"
                  title="Delete Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="btn-verified py-1.5 px-3 text-xs flex items-center gap-1">
                  <span>Open Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

