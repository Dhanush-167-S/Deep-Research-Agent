"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
  };

  const borders = {
    success: "border-emerald-500/30 bg-[#0f1917]/90",
    error: "border-rose-500/30 bg-[#1c0f14]/90",
    info: "border-indigo-500/30 bg-[#0f1224]/90",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`glass-panel p-4 rounded-2xl border ${borders[toast.type]} shadow-2xl flex items-start gap-3 max-w-sm w-full text-left`}>
        {icons[toast.type]}
        <div className="flex-1 space-y-0.5">
          <h4 className="font-semibold text-xs text-white">{toast.title}</h4>
          {toast.message && <p className="text-[11px] text-gray-300 leading-relaxed">{toast.message}</p>}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
