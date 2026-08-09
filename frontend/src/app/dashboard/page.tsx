"use client";

import React, { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar, DashboardTab } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { NewResearchTab } from "@/components/dashboard/NewResearchTab";
import { HistoryTab, ResearchHistoryItem } from "@/components/dashboard/HistoryTab";
import { ReportsTab } from "@/components/dashboard/ReportsTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { useRouter } from "next/navigation";
import { startResearchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";


import { NewResearchModal } from "@/components/workspace/NewResearchModal";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("new");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleStartResearch = async (query: string) => {
    setError(null);
    if (!token) {
      setError("Authentication token missing. Please sign in again.");
      return;
    }
    try {
      const res = await startResearchApi(query, token);
      const sessionId = res.session_id;
      const params = new URLSearchParams({ q: query });
      router.push(`/workspace/${sessionId}?${params.toString()}`);
    } catch (err: any) {
      console.error("Start research error:", err);
      setError(err?.message || "Failed to initiate research session.");
    }
  };


  const handleSelectHistoryItem = (item: ResearchHistoryItem) => {
    router.push(`/workspace/${item.id}`);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "new":
        return "New Research Workspace";
      case "history":
        return "Research History & Sessions";
      case "reports":
        return "Saved Reports & Exports";
      case "settings":
        return "Settings & Profile";
      default:
        return "Dashboard";
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[var(--paper-0)] text-[var(--ink-900)] overflow-hidden paper-grain">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === "new") {
              setIsModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            title={getPageTitle()}
            onNewResearchClick={() => setIsModalOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {activeTab === "new" && <NewResearchTab onStartResearch={handleStartResearch} />}
            {activeTab === "history" && <HistoryTab onSelectResearch={handleSelectHistoryItem} />}
            {activeTab === "reports" && <ReportsTab />}
            {activeTab === "settings" && <SettingsTab />}
          </main>
        </div>

        {/* New Research Modal */}
        <NewResearchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}

