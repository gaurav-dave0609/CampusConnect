"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Send,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  Bot,
  User as UserIcon,
  HelpCircle,
  TrendingUp,
  BookOpen,
  Calendar,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { SessionUser } from "@/lib/auth/session";

export interface NavigationAction {
  type: "navigate";
  url: string;
  label: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  navigationAction?: NavigationAction | null;
  timestamp: string;
}

interface AIChatInterfaceProps {
  user: SessionUser;
  initialSuggestions?: string[];
  isExpandedView?: boolean;
}

export function AIChatInterface({
  user,
  initialSuggestions = [],
  isExpandedView = false,
}: AIChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load default greeting if empty
  useEffect(() => {
    if (messages.length === 0) {
      const defaultGreeting: ChatMessage = {
        id: "initial-greeting",
        role: "assistant",
        content: `Hello **${user.firstName}**! I am your **CampusConnect AI Assistant**.\n\nI can retrieve real-time authorized academic records, compute deterministic attendance math, project your schedule, track assignments, and navigate across CampusConnect.\n\nChoose a prompt below or type any question to begin!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([defaultGreeting]);

      if (suggestions.length === 0) {
        if (user.role === "STUDENT") {
          setSuggestions([
            "What is my current attendance?",
            "How many lectures do I need to reach 75% in DBMS?",
            "Show my pending assignments",
            "What events are coming up?",
            "Take me to my courses",
          ]);
        } else if (user.role === "FACULTY") {
          setSuggestions([
            "How many students are below 75% attendance?",
            "Show attendance overview for my classes",
            "Which assignments are pending grading?",
            "Take me to mark attendance",
          ]);
        } else {
          setSuggestions([
            "Show institutional enrollment statistics",
            "Timetable CSP engine status",
            "Show latest campus notices",
            "Take me to academic setup",
          ]);
        }
      }
    }
  }, [user]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Build history for context resolution
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message,
          navigationAction: data.navigationAction,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: data.message || "I encountered an issue processing your request. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch {
      const networkError: ChatMessage = {
        id: `network-err-${Date.now()}`,
        role: "assistant",
        content: "Network connection error. Please verify your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, networkError]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleActionClick = (action: NavigationAction) => {
    if (action.url) {
      router.push(action.url);
    }
  };

  // Helper to format assistant markdown output cleanly
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");

    return lines.map((line, idx) => {
      // Table row detection
      if (line.startsWith("|")) {
        return (
          <div key={idx} className="font-mono text-xs overflow-x-auto my-0.5 text-slate-700">
            {line}
          </div>
        );
      }

      // Headers
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-slate-900 mt-2.5 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }

      // Bullet points
      if (line.startsWith("- ") || line.startsWith("• ")) {
        const clean = line.replace(/^[-•]\s*/, "");
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-slate-700 my-0.5 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: parseBold(clean) }} />
          </li>
        );
      }

      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-800 leading-relaxed my-0.5">
          <span dangerouslySetInnerHTML={{ __html: parseBold(line) }} />
        </p>
      );
    });
  };

  function parseBold(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>');
  }

  return (
    <div className={`flex flex-col h-full bg-slate-50/50 rounded-2xl overflow-hidden border border-emerald-100/80 shadow-xs ${isExpandedView ? "min-h-[580px]" : ""}`}>
      {/* Top Action Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-emerald-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#059669] flex items-center justify-center text-white shadow-xs p-1">
            <Image
              src="/brand-icon.png"
              alt="CampusConnect Assistant"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900">CampusConnect AI</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#ECFDF5] text-emerald-800 border border-emerald-200">
                {user.role}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Zero-Trust Institutional Intelligence
            </div>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="Reset conversation"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition text-xs flex items-center gap-1"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="text-[11px] hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-start gap-2 max-w-[88%] sm:max-w-[80%]">
              {msg.role === "assistant" && (
                <div className="h-6 w-6 rounded-lg bg-[#ECFDF5] border border-emerald-200/80 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-3 text-sm shadow-xs ${
                  msg.role === "user"
                    ? "bg-[#ECFDF5] text-slate-900 border border-emerald-200/80 rounded-tr-xs"
                    : "bg-white text-slate-800 border border-emerald-100/90 shadow-[0_2px_12px_-2px_rgba(16,185,129,0.06)] rounded-tl-xs"
                }`}
              >
                {msg.role === "assistant" ? (
                  renderFormattedContent(msg.content)
                ) : (
                  <p className="text-xs sm:text-sm font-medium whitespace-pre-wrap">{msg.content}</p>
                )}

                {/* Actionable Navigation Button */}
                {msg.navigationAction && (
                  <div className="mt-3 pt-2.5 border-t border-emerald-100/80">
                    <button
                      onClick={() => handleActionClick(msg.navigationAction!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#10B981] text-white hover:bg-emerald-600 transition shadow-xs cursor-pointer"
                    >
                      <span>{msg.navigationAction.label}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="h-6 w-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-2 max-w-[80%]">
            <div className="h-6 w-6 rounded-lg bg-[#ECFDF5] border border-emerald-200/80 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 border border-emerald-100 shadow-xs flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 ml-1 font-medium">Analyzing records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {suggestions.length > 0 && !isLoading && (
        <div className="px-4 py-2 border-t border-emerald-100/60 bg-white/70 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[#10B981]" />
            Suggested:
          </span>
          {suggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-2.5 py-1 rounded-full bg-[#F0FDF4] hover:bg-[#ECFDF5] text-emerald-800 border border-emerald-200/70 shrink-0 transition font-medium cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-emerald-100 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask about attendance, courses, assignments, timetable...`}
            disabled={isLoading}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-emerald-200/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#10B981] focus:bg-white text-slate-900 placeholder:text-slate-400 transition"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#10B981] text-white hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-[#10B981] transition shadow-xs shrink-0 cursor-pointer"
            title="Send question"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
