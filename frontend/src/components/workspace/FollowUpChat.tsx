"use client";

import React, { useState } from "react";
import { MessageSquare, Send, User, Bot, RefreshCw, ShieldCheck } from "lucide-react";
import { chatResearchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

interface FollowUpChatProps {
  sessionId?: string;
  reportContext?: string;
}

export function FollowUpChat({ sessionId = "default", reportContext = "" }: FollowUpChatProps) {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_1",
      sender: "assistant",
      text: "I have synthesized the verified technical report. What specific follow-up questions do you have about this research?",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userQuery = input.trim();
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await chatResearchApi(sessionId, userQuery, token, reportContext);
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: "assistant",
        text: res.answer || "No response generated.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: "assistant",
        text: `Notice: ${err.message || "Failed to generate follow-up answer."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };


  return (
    <div className="bg-[var(--paper-1)] rounded-xl border border-[var(--rule-line)] p-4 sm:p-5 flex flex-col justify-between text-left space-y-4 h-[420px] shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--rule-line)]">
        <h3 className="font-fraunces font-medium text-base text-[var(--ink-900)] flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[var(--verified)]" />
          Interactive Follow-up Chat
        </h3>
        <span className="text-[10px] font-mono-data text-[var(--verified)] bg-[var(--verified-tint)] px-2 py-0.5 rounded border border-[var(--verified)]/20 font-semibold flex items-center gap-1">
          <ShieldCheck size={12} />
          Context Grounded
        </span>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "assistant" && (
              <div className="w-6 h-6 rounded-md bg-[var(--verified-tint)] border border-[var(--verified)]/30 text-[var(--verified)] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-[var(--verified)] text-[var(--paper-0)] rounded-br-none font-sans shadow-2xs"
                  : "bg-[var(--paper-0)] border border-[var(--rule-line)] text-[var(--ink-900)] rounded-bl-none font-sans"
              }`}
            >
              <p>{msg.text}</p>
              <span className={`text-[9px] font-mono-data block text-right mt-1 opacity-80 ${msg.sender === "user" ? "text-[var(--paper-0)]" : "text-[var(--ink-600)]"}`}>
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === "user" && (
              <div className="w-6 h-6 rounded-md bg-[var(--paper-0)] border border-[var(--rule-line)] text-[var(--ink-900)] flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-[var(--ink-600)] font-mono-data">
            <RefreshCw className="w-3.5 h-3.5 text-[var(--verified)] animate-spin" />
            <span>Agent referencing report context...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="pt-2">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask follow-up questions about this report..."
            className="w-full bg-[var(--paper-0)] border border-[var(--rule-line)] rounded-lg pl-4 pr-10 py-2 text-xs text-[var(--ink-900)] placeholder-[var(--ink-300)] focus:outline-none focus:border-[var(--verified)]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-[var(--verified)] text-[var(--paper-0)] disabled:opacity-50 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
