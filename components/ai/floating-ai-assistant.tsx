"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, X, Maximize2, MessageSquare } from "lucide-react";
import { AIChatInterface } from "./ai-chat-interface";
import { SessionUser } from "@/lib/auth/session";

export function FloatingAIAssistant({ user }: { user: SessionUser }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Trigger Button (when closed) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 print:hidden">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white text-slate-900 border-2 border-emerald-300 shadow-[0_8px_30px_rgba(16,185,129,0.25)] hover:shadow-[0_10px_35px_rgba(16,185,129,0.35)] hover:border-[#10B981] transition-all transform hover:-translate-y-0.5 cursor-pointer"
            aria-label="Open CampusConnect AI Assistant"
          >
            <div className="h-7 w-7 rounded-lg bg-[#ECFDF5] border border-emerald-200/90 flex items-center justify-center p-0.5 shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/brand-icon.png"
                alt="CampusConnect AI"
                width={22}
                height={22}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold text-slate-900 tracking-tight leading-none">
                CampusConnect AI
              </span>
              <span className="text-[10px] font-semibold text-[#10B981] leading-none mt-0.5">
                Ask Academic Assistant
              </span>
            </div>
            <span className="flex h-2 w-2 relative ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
            </span>
          </button>
        </div>
      )}

      {/* Floating Modal Panel (when opened) */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[410px] h-[580px] max-h-[88vh] z-50 flex flex-col bg-white rounded-2xl shadow-[0_16px_50px_-5px_rgba(16,185,129,0.25)] border border-emerald-200/90 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 print:hidden">
          {/* Header Controls */}
          <div className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-white/20 p-0.5 flex items-center justify-center">
                <Image
                  src="/brand-icon.png"
                  alt="CampusConnect"
                  width={20}
                  height={20}
                  className="object-contain invert brightness-200"
                />
              </div>
              <span className="text-xs font-bold tracking-tight">CampusConnect AI Station</span>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/dashboard/assistant"
                onClick={() => setIsOpen(false)}
                title="Expand to Full Page"
                className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize assistant"
                className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 min-h-0">
            <AIChatInterface user={user} />
          </div>
        </div>
      )}
    </>
  );
}
