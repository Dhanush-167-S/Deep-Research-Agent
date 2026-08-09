"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, History, FileText, Settings, LogOut, PanelLeftClose, PanelLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export type DashboardTab = "new" | "history" | "reports" | "settings";

interface SidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const menuItems = [
    { id: "new" as DashboardTab, label: "New Research", icon: <PlusCircle className="w-4 h-4 text-[var(--verified)]" /> },
    { id: "history" as DashboardTab, label: "Research History", icon: <History className="w-4 h-4 text-[var(--ink-600)]" /> },
    { id: "reports" as DashboardTab, label: "Saved Reports", icon: <FileText className="w-4 h-4 text-[var(--ink-600)]" /> },
    { id: "settings" as DashboardTab, label: "Settings & Profile", icon: <Settings className="w-4 h-4 text-[var(--ink-600)]" /> },
  ];

  return (
    <aside
      className={`h-screen bg-[var(--paper-1)] border-r border-[var(--rule-line)] flex flex-col justify-between transition-all duration-300 z-30 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Header & Logo */}
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-1 group">
              <span className="font-fraunces text-lg font-medium tracking-tight text-[var(--ink-900)]">
                TopResearch
              </span>
              <sup className="text-[var(--verified)] font-mono-data text-[10px] font-bold -top-2">
                ¹
              </sup>
            </Link>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-[var(--ink-600)] hover:text-[var(--ink-900)] hover:bg-[var(--paper-0)] transition-colors mx-auto"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <PanelLeft className="w-5 h-5 text-[var(--verified)]" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-xs transition-all ${
                  isActive
                    ? "bg-[var(--verified-tint)] text-[var(--verified)] border border-[var(--verified)]/30 font-semibold shadow-2xs"
                    : "text-[var(--ink-600)] hover:text-[var(--ink-900)] hover:bg-[var(--paper-0)]"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <div className="shrink-0">{item.icon}</div>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-[var(--rule-line)] space-y-3">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={user?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                alt="User Avatar"
                className="w-8 h-8 rounded-full border border-[var(--rule-line)] shrink-0 bg-[var(--paper-0)]"
              />
              <div className="truncate text-left">
                <p className="text-xs font-semibold text-[var(--ink-900)] truncate">{user?.name || "Dr. Eleanor Vance"}</p>
                <p className="text-[10px] text-[var(--ink-600)] truncate font-mono-data">{user?.email || "eleanor@example.com"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-[var(--ink-600)] hover:text-[var(--verified)] hover:bg-[var(--verified-tint)] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2 rounded-md text-[var(--ink-600)] hover:text-[var(--verified)] hover:bg-[var(--verified-tint)] transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
}
