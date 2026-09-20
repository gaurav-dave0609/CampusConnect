import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { AIAssistantService } from "@/services/ai/ai-assistant.service";
import { z } from "zod";

const chatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000, "Message exceeds maximum length"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(4000),
      })
    )
    .optional()
    .default([]),
});

/**
 * GET /api/assistant/chat
 * Returns initial status, user context, and initial suggestions.
 */
export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", message: "Authentication required." },
        { status: 401 }
      );
    }

    const suggestions = AIAssistantService.getSuggestedPrompts(user.role);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        departmentName: user.departmentName,
      },
      suggestions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "InternalError", message: err.message || "Failed to initialize assistant." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assistant/chat
 * Processes a chat message within the authenticated user's role context.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Authentication required to interact with CampusConnect AI Assistant.",
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "BadRequest", message: "Invalid JSON body provided." },
        { status: 400 }
      );
    }

    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "ValidationError",
          message: parsed.error.issues[0]?.message || "Invalid chat request format.",
        },
        { status: 400 }
      );
    }

    const { message, history } = parsed.data;
    const result = await AIAssistantService.processMessage(user, message, history);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[API /api/assistant/chat] Unexpected error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "InternalError",
        message: "An unexpected error occurred while communicating with the AI Assistant.",
      },
      { status: 500 }
    );
  }
}
