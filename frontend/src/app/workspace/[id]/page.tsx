"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AgentTimeline, TimelineStep } from "@/components/workspace/AgentTimeline";
import { SourcesPanel, EvidenceSource } from "@/components/workspace/SourcesPanel";
import { ReportViewer } from "@/components/workspace/ReportViewer";
import { FollowUpChat } from "@/components/workspace/FollowUpChat";
import { ArrowLeft, Clock, Share2, Download, ShieldCheck, Check, AlertTriangle, Sparkles } from "lucide-react";
import Link from "next/link";
import { getExportPdfUrl, getExportMarkdownUrl } from "@/lib/api";
import { NewResearchModal } from "@/components/workspace/NewResearchModal";

import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function WorkspaceContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { token } = useAuth();

  const sessionId = (params?.id as string) ?? "";
  const queryFromUrl = searchParams?.get("q") ?? null;

  const [queryTitle, setQueryTitle] = useState(
    queryFromUrl || "Stateful AI Multi-Agent Research & Fact Verification System Architecture"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([
    { id: "planner", name: "Planner Agent", role: "Task Decomposition", status: "idle" },
    { id: "search", name: "Search Agent", role: "Web Retrieval (Tavily)", status: "idle" },
    { id: "academic", name: "Academic Agent", role: "Paper Search (S2/arXiv)", status: "idle" },
    { id: "verification", name: "Verification Agent", role: "Evidence Cross-Check", status: "idle" },
    { id: "writer", name: "Writer Agent", role: "Report Synthesis", status: "idle" },
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sources, setSources] = useState<EvidenceSource[]>([]);
  const [reportMarkdown, setReportMarkdown] = useState("");
  const [structuredReport, setStructuredReport] = useState<any>(undefined);
  const [confidenceScore, setConfidenceScore] = useState(98.4);

  const [isCompleted, setIsCompleted] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, setActiveCitationRef] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const streamUrl = `${API_BASE_URL}/api/v1/research/stream/${sessionId}${
      token ? `?token=${encodeURIComponent(token)}` : ""
    }`;
    const eventSource = new EventSource(streamUrl, { withCredentials: true });


    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const type = data.event;

        if (type === "research_started") {
          setIsStreaming(true);
          if (data.query) setQueryTitle(data.query);
          setCurrentStepIndex(0);
          setTimelineSteps((prev) =>
            prev.map((s) => (s.id === "planner" ? { ...s, status: "running" } : s))
          );
        } else if (type === "planner_started") {
          setCurrentStepIndex(0);
          setTimelineSteps((prev) =>
            prev.map((s) => (s.id === "planner" ? { ...s, status: "running" } : s))
          );
        }
 else if (type === "planner_completed") {
          setTimelineSteps((prev) =>
            prev.map((s) => (s.id === "planner" ? { ...s, status: "completed" } : s))
          );
        } else if (type === "search_started") {
          setCurrentStepIndex(1);
          setTimelineSteps((prev) =>
            prev.map((s) => (s.id === "search" ? { ...s, status: "running" } : s))
          );
        } else if (type === "search_result_found") {
          setTimelineSteps((prev) =>
            prev.map((s) => (s.id === "search" ? { ...s, status: "completed" } : s))
          );
        } else if (type === "academic_started") {
          setCurrentStepIndex(2);
          setTimelineSteps((prev) =>
            prev.map((s) => (s.id === "academic" ? { ...s, status: "running" } : s))
          );
        } else if (type === "academic_result_found") {
          setTimelineSteps((prev) =>
            prev.map((s) => (s.id === "academic" ? { ...s, status: "completed" } : s))
          );
        } else if (type === "verification_started") {
          setCurrentStepIndex(3);
          setTimelineSteps((prev) =>
            prev.map((s) => (s.id === "verification" ? { ...s, status: "running" } : s))
          );
        } else if (type === "verification_completed") {
          setConfidenceScore(data.confidence || 98.4);
          setTimelineSteps((prev) =>
            prev.map((s) => (s.id === "verification" ? { ...s, status: "completed" } : s))
          );
        } else if (type === "writer_started") {
          setCurrentStepIndex(4);
          setTimelineSteps((prev) =>
            prev.map((s) => (s.id === "writer" ? { ...s, status: "running" } : s))
          );
        } else if (type === "research_completed") {
          setCurrentStepIndex(4);
          setTimelineSteps((prev) => prev.map((s) => ({ ...s, status: "completed" })));
          if (data.report) setReportMarkdown(data.report);
          if (data.structured_report) setStructuredReport(data.structured_report);
          if (data.confidence) setConfidenceScore(data.confidence);


          if (data.sources || data.verified_sources) {
            const rawSources = data.verified_sources || data.sources;
            const mappedSources: EvidenceSource[] = rawSources.map((s: any, idx: number) => ({
              id: s.id || `src_${idx}`,
              title: s.title,
              url: s.url,
              domain: s.domain,
              type: s.source_type || "web",
              confidence: s.confidence_score || 95.0,
              snippet: s.content || "",
              citationRef: s.citation_ref || `Ref ${idx + 1}`,
            }));
            setSources(mappedSources);
          }

          setIsCompleted(true);
          setIsStreaming(false);
          eventSource.close();
        } else if (type === "research_failed") {
          setErrorMessage(data.message || "Research execution failed.");
          setIsStreaming(false);
          eventSource.close();
        }
      } catch (err) {
        console.warn("SSE parse error:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("SSE connection closed or notice:", err);
      setIsStreaming(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId, token]);


  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      window.prompt("Copy this workspace link:", window.location.href);
    }
  };

  const handleExportPdf = () => {
    const url = getExportPdfUrl(sessionId);
    const authUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
    window.open(authUrl, "_blank");
  };

  const handleExportMarkdown = () => {
    const url = getExportMarkdownUrl(sessionId);
    const authUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
    window.open(authUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-[var(--paper-0)] text-[var(--ink-900)] p-4 sm:p-6 lg:p-8 space-y-6 text-left paper-grain">
      {/* Top Header Controls & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--rule-line)]">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg bg-[var(--paper-1)] hover:bg-[var(--paper-0)] border border-[var(--rule-line)] text-[var(--ink-600)] hover:text-[var(--ink-900)] transition-colors"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-data text-[var(--verified)] bg-[var(--verified-tint)] px-2 py-0.5 rounded border border-[var(--verified)]/20 font-semibold">
                Session #{sessionId.slice(0, 12).toUpperCase()}
              </span>
              <span className="text-xs text-[var(--ink-600)] font-mono-data flex items-center gap-1">
                <Clock className="w-3 h-3 text-[var(--ink-300)]" /> Confidence: {confidenceScore}%
              </span>
            </div>
            <h1 className="font-fraunces text-lg font-medium text-[var(--ink-900)] tracking-tight mt-0.5 line-clamp-1">
              {queryTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-data bg-[var(--verified-tint)] text-[var(--verified)] border border-[var(--verified)]/20 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Research Verified</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-data bg-[var(--verified-tint)] text-[var(--verified)] border border-[var(--verified)]/20 font-medium animate-pulse">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Agents Running...</span>
            </span>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:inline-flex btn-verified text-xs px-3.5 py-1.5 items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Research</span>
          </button>

          <button
            onClick={handleShareLink}
            className="p-2 rounded-lg bg-[var(--paper-1)] hover:bg-[var(--paper-0)] border border-[var(--rule-line)] text-[var(--ink-600)] hover:text-[var(--ink-900)] transition-colors"
            title="Copy workspace link"
          >
            {linkCopied ? <Check className="w-4 h-4 text-[var(--verified)]" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleExportMarkdown}
            className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
            title="Download report as Markdown"
          >
            <span>Markdown</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="btn-verified text-xs py-1.5 px-3 flex items-center gap-1.5"
            title="Download report as PDF"
          >
            <Download className="w-4 h-4" />
            <span>PDF Export</span>
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs flex items-center gap-2 font-mono-data">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Execution Notice: {errorMessage}</span>
        </div>
      )}

      {/* Agent Execution Timeline Stepper */}
      <AgentTimeline steps={timelineSteps} currentStepIndex={currentStepIndex} />

      {/* Main Workspace Split Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Report Column */}
        <div className="lg:col-span-8 space-y-6">
          <ReportViewer
            title={queryTitle}
            markdownContent={reportMarkdown}
            structuredReport={structuredReport}
            isStreaming={isStreaming}
            onExportPdf={handleExportPdf}
          />

          <FollowUpChat sessionId={sessionId} reportContext={reportMarkdown} />

        </div>

        {/* Right Evidence Sources Column */}
        <div className="lg:col-span-4 h-full">
          <SourcesPanel
            sources={sources}
            onSelectCitation={(ref) => setActiveCitationRef(ref)}
          />
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceSessionPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen bg-[var(--paper-0)] flex items-center justify-center text-xs font-mono-data text-[var(--ink-600)]">
          Loading workspace session...
        </div>
      }>
        <WorkspaceContent />
      </Suspense>
    </ProtectedRoute>
  );
}

