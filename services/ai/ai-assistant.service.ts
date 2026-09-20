import { SessionUser } from "@/lib/auth/session";
import { getLLMProvider, ChatMessage, LLMResponse } from "./llm-provider";
import { NavigationAction } from "./ai-tools.service";
import { Role } from "@prisma/client";

export interface AssistantProcessResult {
  success: boolean;
  message: string;
  navigationAction?: NavigationAction | null;
  suggestions: string[];
  provider: string;
  timestamp: string;
}

export class AIAssistantService {
  /**
   * Main entrypoint for processing user messages
   */
  static async processMessage(
    user: SessionUser,
    message: string,
    history: ChatMessage[] = []
  ): Promise<AssistantProcessResult> {
    if (!message || !message.trim()) {
      return {
        success: false,
        message: "Please enter a question or command.",
        suggestions: this.getSuggestedPrompts(user.role),
        provider: "deterministic",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const provider = getLLMProvider();
      const response: LLMResponse = await provider.process({
        user,
        message: message.trim(),
        history,
      });

      return {
        success: true,
        message: response.content,
        navigationAction: response.navigationAction || null,
        suggestions: this.getFollowupSuggestions(user.role, message),
        provider: response.provider,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error("[AIAssistantService] Error processing message:", err);
      return {
        success: false,
        message:
          "I'm having trouble retrieving that CampusConnect information right now. Please try again in a moment.",
        suggestions: this.getSuggestedPrompts(user.role),
        provider: "fallback",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Suggested Prompts based on User Role
   */
  static getSuggestedPrompts(role: Role): string[] {
    if (role === Role.STUDENT) {
      return [
        "What is my current attendance?",
        "How many lectures do I need to reach 75% in DBMS?",
        "Which subject has my lowest attendance?",
        "Show my pending assignments",
        "What campus events are coming up?",
        "Take me to my courses",
      ];
    }

    if (role === Role.FACULTY) {
      return [
        "How many students are below 75% attendance?",
        "Show attendance overview for my classes",
        "Which assignments are pending grading?",
        "Take me to mark attendance",
        "Show upcoming campus events",
      ];
    }

    if (role === Role.ADMIN) {
      return [
        "Show institutional enrollment statistics",
        "Timetable CSP engine status",
        "Show latest campus notices",
        "Take me to academic setup",
      ];
    }

    return ["What is my profile?", "Show campus notices"];
  }

  /**
   * Contextual follow-up suggestions
   */
  static getFollowupSuggestions(role: Role, query: string): string[] {
    const q = query.toLowerCase();

    if (q.includes("attendance") || q.includes("75%")) {
      if (role === Role.STUDENT) {
        return [
          "How many lectures can I miss in DBMS?",
          "Compare my attendance across all subjects",
          "Can I reach 75% attendance by next Friday?",
          "Take me to attendance page",
        ];
      }
      return [
        "Which students are below 75%?",
        "Open faculty attendance register",
      ];
    }

    if (q.includes("assignment")) {
      return [
        "Show assignments due this week",
        "Which assignments have I submitted?",
        "Go to assignments page",
      ];
    }

    if (q.includes("event") || q.includes("club")) {
      return [
        "Are there technical clubs?",
        "Show upcoming workshops",
        "Take me to events hub",
      ];
    }

    return this.getSuggestedPrompts(role).slice(0, 3);
  }
}
