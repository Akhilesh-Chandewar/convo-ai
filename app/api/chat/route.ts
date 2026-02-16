import { convertToModelMessages, streamText, type ModelMessage } from "ai";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompt";
import { prisma } from "@/lib/databaseConnection";
import { MessageRole, MessageType } from "@/lib/generated/prisma/enums";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { NextRequest } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type UiTextPart = {
    type: "text";
    text: string;
};

type UiMessage = {
    id: string;
    role: "user" | "assistant";
    parts: UiTextPart[];
    createdAt?: Date;
};

type StoredMessage = {
    id: string;
    content: string;
    messageRole: MessageRole;
    createdAt: Date;
};

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */

const provider = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
});

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function convertStoreMessageToUi(message: StoredMessage): UiMessage | null {
    try {
        const parts = JSON.parse(message.content) as UiTextPart[];
        const validParts = parts.filter(
            (part: UiTextPart) => part.type === "text"
        );

        if (validParts.length === 0) return null;

        return {
            id: message.id,
            role: message.messageRole === MessageRole.USER ? "user" : "assistant",
            parts: validParts,
            createdAt: message.createdAt,
        };
    } catch {
        return {
            id: message.id,
            role: message.messageRole === MessageRole.USER ? "user" : "assistant",
            parts: [{ type: "text", text: message.content }],
            createdAt: message.createdAt,
        };
    }
}

function extractPartsAsJSON(message: UiMessage): string {
    if (Array.isArray(message.parts)) {
        return JSON.stringify(message.parts);
    }

    return JSON.stringify([{ type: "text", text: "" }]);
}

/* ------------------------------------------------------------------ */
/* Route                                                              */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const chatId: string = body.chatId;
        const model: string = body.model;
        const newMessages: UiMessage[] = Array.isArray(body.messages)
            ? body.messages
            : [body.messages];

        /* -------------------------------------------------------------- */
        /* Validate required fields                                       */
        /* -------------------------------------------------------------- */
        if (!model) {
            return new Response(
                JSON.stringify({
                    error: "No model provided. Please select a model and try again.",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        /* -------------------------------------------------------------- */
        /* Load previous messages                                         */
        /* -------------------------------------------------------------- */

        const previousMessages = chatId
            ? await prisma.message.findMany({
                where: { chatId },
                orderBy: { createdAt: "asc" },
            })
            : [];

        const uiMessages: UiMessage[] = previousMessages
            .map(convertStoreMessageToUi)
            .filter((m): m is UiMessage => m !== null);

        const allUiMessages: UiMessage[] = [...uiMessages, ...newMessages];

        /* -------------------------------------------------------------- */
        /* Convert to model messages                                      */
        /* -------------------------------------------------------------- */

        let modelMessages: ModelMessage[];

        try {
            modelMessages = await convertToModelMessages(allUiMessages);
        } catch {
            modelMessages = allUiMessages
                .map((msg) => ({
                    role: msg.role,
                    content: msg.parts
                        .filter((p) => p.type === "text")
                        .map((p) => p.text)
                        .join("\n"),
                }))
                .filter((m) => m.content.length > 0);
        }

        /* -------------------------------------------------------------- */
        /* Stream                                                         */
        /* -------------------------------------------------------------- */

        const result = streamText({
            model: provider.chat(model),
            system: CHAT_SYSTEM_PROMPT,
            messages: modelMessages,
        });

        return result.toUIMessageStreamResponse({
            sendReasoning: true,
            originalMessages: allUiMessages,

            onFinish: async ({ responseMessage }) => {
                try {
                    const messagesToSave: Prisma.MessageCreateManyInput[] = [];

                    const lastUserMessage =
                        newMessages[newMessages.length - 1];

                    if (lastUserMessage?.role === "user") {
                        messagesToSave.push({
                            chatId,
                            content: extractPartsAsJSON(lastUserMessage),
                            messageRole: MessageRole.USER,
                            messageType: MessageType.NORMAL,
                            model,
                        });
                    }

                    if (responseMessage?.parts?.length) {
                        messagesToSave.push({
                            chatId,
                            content: extractPartsAsJSON(
                                responseMessage as UiMessage
                            ),
                            messageRole: MessageRole.ASSISTANT,
                            messageType: MessageType.NORMAL,
                            model,
                        });
                    }

                    if (messagesToSave.length) {
                        await prisma.message.createMany({
                            data: messagesToSave,
                        });
                    }
                } catch (err) {
                    console.error("❌ Error saving messages:", err);
                }
            },
        });
    } catch (err) {
        const error = err as Error;

        console.error("❌ API Route Error:", error);

        return new Response(
            JSON.stringify({
                error: error.message ?? "Internal server error",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
