"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-white/5 border border-white/5", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="w-3/4 h-6 rounded-lg" />
      <Skeleton className="w-full h-12 rounded-lg" />
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
      <Skeleton className="w-1/3 h-8 rounded-xl" />
      <Skeleton className="w-full h-24 rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="w-full h-4 rounded" />
        <Skeleton className="w-5/6 h-4 rounded" />
        <Skeleton className="w-4/5 h-4 rounded" />
      </div>
    </div>
  );
}
