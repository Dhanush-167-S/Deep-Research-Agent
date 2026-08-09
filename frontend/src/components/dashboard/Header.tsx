"use client";

import React from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  title: string;
  onNewResearchClick?: () => void;
}

export function Header({ title, onNewResearchClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-[var(--paper-0)] border-b border-[var(--rule-line)] px-6 flex items-center justify-between z-20">
      {/* Page Title & Status */}
      <div className="flex items-center gap-3">
        <h1 className="font-fraunces text-xl font-medium text-[var(--ink-900)] tracking-tight">
          {title}
        </h1>
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono-data bg-[var(--verified-tint)] text-[var(--verified)] border border-[var(--verified)]/20 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--verified)] animate-pulse" />
          <span>Agents Operational</span>
        </div>
      </div>

      {/* Action Controls & Profile Summary */}
      <div className="flex items-center gap-4">
        <button
          onClick={onNewResearchClick}
          className="hidden sm:inline-flex btn-verified text-xs px-3.5 py-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Research</span>
        </button>

        <div className="h-4 w-[1px] bg-[var(--rule-line)] hidden sm:block" />

        <div className="flex items-center gap-2">
          <img
            src={user?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
            alt="Avatar"
            className="w-7 h-7 rounded-full border border-[var(--rule-line)] bg-[var(--paper-1)]"
          />
          <span className="text-xs font-medium text-[var(--ink-600)] hidden md:block">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}
