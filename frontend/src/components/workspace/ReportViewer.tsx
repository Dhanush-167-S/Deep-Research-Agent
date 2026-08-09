"use client";

import React, { useState } from "react";
import { Download, Copy, Check, ShieldCheck, FileText, ExternalLink, BookOpen, Globe, Award, Sparkles } from "lucide-react";

export interface SourceItem {
  citation_number?: number;
  title: string;
  url: string;
  domain: string;
  source_type?: string;
  snippet?: string;
  confidence_score?: number;
}

export interface StructuredReportData {
  title?: string;
  executive_summary?: string;
  key_findings?: string[];
  sections?: {
    id?: string;
    number?: string;
    heading: string;
    content: string;
  }[];
  conclusion?: string;
  confidence_score?: number;
  sources?: SourceItem[];
  raw_markdown?: string;
}

interface ReportViewerProps {
  title: string;
  markdownContent?: string;
  structuredReport?: StructuredReportData;
  isStreaming?: boolean;
  onExportPdf?: () => void;
  onSelectCitation?: (ref: string) => void;
}

export function ReportViewer({
  title,
  markdownContent = "",
  structuredReport,
  isStreaming = false,
  onExportPdf,
  onSelectCitation,
}: ReportViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent || title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format inline text with clean bold, italic, code formatting and clickable citation badges [1], [2]
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Split text by citation pattern like [1], [2], [3]
    const parts = text.split(/(\[\d+\])/g);

    return parts.map((part, idx) => {
      const citeMatch = part.match(/^\[(\d+)\]$/);
      if (citeMatch) {
        const cNum = citeMatch[1];
        return (
          <button
            key={idx}
            onClick={() => onSelectCitation && onSelectCitation(`Ref ${cNum}`)}
            className="inline-flex items-center gap-0.5 mx-0.5 px-1.5 py-0.2 rounded bg-[var(--verified-tint)] text-[var(--verified)] border border-[var(--verified)]/30 font-mono-data text-[10px] font-bold hover:scale-105 transition-transform"
            title={`View evidence source ${cNum}`}
          >
            [{cNum}]
          </button>
        );
      }

      // Handle simple inline bold **text** or `code`
      const boldParts = part.split(/(\*\*.*?\*\*|`.*?`)/g);
      return boldParts.map((sub, sIdx) => {
        if (sub.startsWith("**") && sub.endsWith("**")) {
          return <strong key={sIdx} className="font-semibold text-[var(--ink-900)]">{sub.slice(2, -2)}</strong>;
        }
        if (sub.startsWith("`") && sub.endsWith("`")) {
          return (
            <code key={sIdx} className="px-1.5 py-0.5 rounded bg-[var(--paper-0)] border border-[var(--rule-line)] font-mono-data text-xs text-[var(--verified)]">
              {sub.slice(1, -1)}
            </code>
          );
        }
        return sub;
      });
    });
  };

  // Helper renderer for table blocks
  const renderTableBlock = (rows: string[][], key: string) => {
    if (rows.length === 0) return null;
    const headerRow = rows[0];
    const bodyRows = rows.slice(1).filter((r) => !r.every((cell) => cell.includes("---") || cell.includes(":")));

    return (
      <div key={key} className="overflow-x-auto border border-[var(--rule-line)] rounded-xl my-4 shadow-2xs">
        <table className="w-full text-left text-xs border-collapse bg-[var(--paper-0)]">
          <thead>
            <tr className="border-b border-[var(--rule-line)] bg-[var(--paper-1)] font-mono-data text-[var(--ink-600)]">
              {headerRow.map((col, idx) => (
                <th key={idx} className="p-3 font-semibold uppercase tracking-wider">{renderFormattedText(col)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--rule-line)] font-sans text-[var(--ink-900)]">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-[var(--paper-1)]/50 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-3">{renderFormattedText(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Parse markdown content into structured blocks if structuredReport object is not passed
  const parseMarkdownFallback = (content: string): StructuredReportData => {
    if (!content) return { title };
    const lines = content.split("\n");

    let execSummary = "";
    const keyFindings: string[] = [];
    const sections: { number: string; heading: string; content: string }[] = [];
    let conclusion = "";

    let currentNum = "";
    let currentHeading = "";
    let currentLines: string[] = [];
    let secCounter = 1;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("## Executive Summary") || trimmed.startsWith("## Key Findings")) continue;

      if (trimmed.startsWith("## ")) {
        if (currentHeading) {
          sections.push({
            number: currentNum,
            heading: currentHeading,
            content: currentLines.join("\n").trim(),
          });
        }
        currentNum = String(secCounter++);
        currentHeading = trimmed.replace(/^##\s+/, "").replace(/^\d+[\.\)]\s*/, "");
        currentLines = [];
      } else if (currentHeading) {
        currentLines.push(line);
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        keyFindings.push(trimmed.replace(/^[-*]\s+/, ""));
      } else if (trimmed && !execSummary && !trimmed.startsWith("#")) {
        execSummary = trimmed;
      }
    }

    if (currentHeading) {
      sections.push({
        number: currentNum,
        heading: currentHeading,
        content: currentLines.join("\n").trim(),
      });
    }


    return {
      title,
      executive_summary: execSummary,
      key_findings: keyFindings,
      sections,
      conclusion,
      raw_markdown: content,
    };
  };

  const report = structuredReport || parseMarkdownFallback(markdownContent);

  if (!markdownContent && !structuredReport) {
    return (
      <div className="bg-[var(--paper-1)] rounded-xl border border-[var(--rule-line)] p-12 text-center text-xs font-mono-data text-[var(--ink-600)] space-y-3 shadow-xs">
        <FileText className="w-8 h-8 text-[var(--verified)] mx-auto animate-pulse" />
        <p className="font-semibold text-sm text-[var(--ink-900)]">Synthesizing Verified Technical Report...</p>
        <p className="text-[11px] text-[var(--ink-600)] max-w-md mx-auto">
          TopResearch agents are currently gathering web sources, searching academic papers, cross-checking evidence, and synthesizing clean structured sections.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--paper-1)] rounded-xl border border-[var(--rule-line)] p-6 sm:p-8 flex flex-col text-left space-y-8 shadow-xs max-w-4xl mx-auto">
      {/* Report Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[var(--rule-line)]">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono-data uppercase px-2.5 py-0.5 rounded-full bg-[var(--verified-tint)] text-[var(--verified)] border border-[var(--verified)]/30 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Technical Report
            </span>

            {report.confidence_score && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono-data px-2.5 py-0.5 rounded-full bg-[var(--paper-0)] text-[var(--ink-900)] border border-[var(--rule-line)] font-semibold">
                <Award className="w-3.5 h-3.5 text-[var(--verified)]" />
                <span>Confidence {report.confidence_score}%</span>
              </span>
            )}
          </div>
          <h1 className="font-fraunces text-2xl sm:text-3xl text-[var(--ink-900)] tracking-tight leading-snug font-medium">
            {report.title || title}
          </h1>
        </div>

        {/* Export Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleCopy} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5">
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--verified)]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[var(--ink-600)]" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          {onExportPdf && (
            <button onClick={onExportPdf} className="btn-verified text-xs px-3.5 py-1.5 flex items-center gap-1.5 shadow-2xs">
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Dedicated Executive Summary Card */}
      {report.executive_summary && (
        <div className="bg-[var(--paper-0)] p-6 rounded-xl border border-[var(--rule-line)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-fraunces text-lg text-[var(--ink-900)] font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--verified)]" />
              Executive Summary
            </h2>
            <span className="text-[10px] font-mono-data uppercase px-2 py-0.5 rounded bg-[var(--verified-tint)] text-[var(--verified)] font-bold">
              Verified Synthesis
            </span>
          </div>
          <div className="text-xs sm:text-sm text-[var(--ink-900)] leading-relaxed font-sans font-normal">
            {renderFormattedText(report.executive_summary)}
          </div>
        </div>
      )}

      {/* Key Findings Callout Card */}
      {report.key_findings && report.key_findings.length > 0 && (
        <div className="bg-[var(--paper-0)] p-6 rounded-xl border border-[var(--rule-line)] space-y-3">
          <h3 className="font-fraunces text-base text-[var(--ink-900)] font-medium">Key Findings & Empirical Trade-offs</h3>
          <ul className="space-y-2">
            {report.key_findings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[var(--ink-900)] leading-relaxed">
                <span className="text-[var(--verified)] font-bold shrink-0 mt-0.5">•</span>
                <span>{renderFormattedText(finding)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Numbered Technical Sections */}
      {report.sections && report.sections.length > 0 ? (
        <div className="space-y-8 pt-2">
          {report.sections.map((sec, idx) => (
            <section key={sec.id || idx} className="space-y-3 text-left">
              <h2 className="font-fraunces text-xl text-[var(--ink-900)] font-medium pb-2 border-b border-[var(--rule-line)] flex items-center gap-2">
                <span className="text-[var(--verified)] font-mono-data text-sm font-bold">{sec.number || idx + 1}.</span>
                <span>{sec.heading}</span>
              </h2>

              <div className="space-y-3 text-xs sm:text-sm text-[var(--ink-900)] leading-relaxed font-sans">
                {(() => {
                  const content = sec.content || "";
                  const lines = content.split("\n");
                  const elements: React.ReactNode[] = [];
                  let tableRows: string[][] = [];

                  const flushTable = (key: string) => {
                    if (tableRows.length === 0) return;
                    const headerRow = tableRows[0];
                    const bodyRows = tableRows.slice(1).filter((r) => !r.every((cell) => cell.includes("---") || cell.includes(":")));

                    elements.push(
                      <div key={key} className="overflow-x-auto border border-[var(--rule-line)] rounded-xl my-4 shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse bg-[var(--paper-0)]">
                          <thead>
                            <tr className="border-b border-[var(--rule-line)] bg-[var(--paper-1)] font-mono-data text-[var(--ink-600)]">
                              {headerRow.map((col, cIdx) => (
                                <th key={cIdx} className="p-3 font-semibold uppercase tracking-wider">{renderFormattedText(col)}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--rule-line)] font-sans text-[var(--ink-900)]">
                            {bodyRows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-[var(--paper-1)]/60 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-3">{renderFormattedText(cell)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                    tableRows = [];
                  };

                  for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const trimmed = line.trim();
                    if (!trimmed) {
                      flushTable(`tbl_${i}`);
                      continue;
                    }

                    if (trimmed.startsWith("|")) {
                      const parts = trimmed.split("|");
                      const cells = parts.slice(1, trimmed.endsWith("|") ? -1 : undefined).map((c) => c.trim());
                      if (cells.length > 0) {
                        tableRows.push(cells);
                        continue;
                      }
                    }

                    flushTable(`tbl_${i}`);

                    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                      elements.push(
                        <li key={i} className="ml-4 list-disc text-xs sm:text-sm text-[var(--ink-900)] my-1">
                          {renderFormattedText(trimmed.replace(/^[-*]\s+/, ""))}
                        </li>
                      );
                    } else if (trimmed.startsWith("> ")) {
                      elements.push(
                        <blockquote key={i} className="p-3 rounded bg-[var(--paper-0)] border-l-3 border-[var(--verified)] text-xs text-[var(--ink-600)] italic my-2">
                          {renderFormattedText(trimmed.replace(/^>\s+/, ""))}
                        </blockquote>
                      );
                    } else {
                      elements.push(
                        <p key={i} className="my-1.5">{renderFormattedText(trimmed)}</p>
                      );
                    }
                  }

                  flushTable("tbl_end");
                  return elements;
                })()}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* Fallback raw content renderer if structured sections missing */
        <div className="space-y-4 text-xs sm:text-sm text-[var(--ink-900)] leading-relaxed font-sans">
          {markdownContent.split("\n\n").map((block, idx) => (
            <p key={idx}>{renderFormattedText(block)}</p>
          ))}
        </div>
      )}


      {/* Conclusion Section */}
      {report.conclusion && (
        <div className="space-y-3 pt-4 text-left border-t border-[var(--rule-line)]">
          <h3 className="font-fraunces text-lg text-[var(--ink-900)] font-medium">Conclusion & Strategic Recommendations</h3>
          <p className="text-xs sm:text-sm text-[var(--ink-900)] leading-relaxed font-sans">{renderFormattedText(report.conclusion)}</p>
        </div>
      )}

      {/* Dedicated References & Mapped Evidence Section */}
      {report.sources && report.sources.length > 0 && (
        <div className="pt-6 border-t border-[var(--rule-line)] space-y-4 text-left">
          <h3 className="font-fraunces text-base text-[var(--ink-900)] font-medium flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--verified)]" />
            References & Mapped Evidence ({report.sources.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.sources.map((src, idx) => (
              <a
                key={idx}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[var(--paper-0)] p-3.5 rounded-xl border border-[var(--rule-line)] hover:border-[var(--verified)] transition-all group flex flex-col justify-between space-y-2 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[var(--verified-tint)] text-[var(--verified)] text-[10px] font-mono-data font-bold flex items-center justify-center shrink-0">
                      {src.citation_number || idx + 1}
                    </span>
                    <span className="text-[10px] font-mono-data uppercase px-2 py-0.5 rounded bg-[var(--paper-1)] border border-[var(--rule-line)] text-[var(--ink-600)]">
                      {src.source_type || "web"}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--ink-300)] group-hover:text-[var(--verified)] transition-colors shrink-0" />
                </div>

                <p className="text-xs font-semibold text-[var(--ink-900)] group-hover:text-[var(--verified)] transition-colors line-clamp-2">
                  {src.title}
                </p>

                <p className="text-[10px] font-mono-data text-[var(--ink-600)] truncate flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[var(--ink-300)]" />
                  <span>{src.domain}</span>
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


