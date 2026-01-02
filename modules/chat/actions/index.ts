"use server";

import { prisma } from "@/lib/databaseConnection";
import { getCurrentUser } from "@/modules/auth/actions";
import { MessageRole, MessageType } from "@/lib/generated/prisma/enums";

export async function createChatWithMessage(values: {
    content: string;
    model: string;
}) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { success: false, message: "Unauthorized user" } as const;
        }

        if (!values.content?.trim()) {
            return { success: false, message: "Message content is required" } as const;
        }

        const title =
            values.content.slice(0, 50) +
            (values.content.length > 50 ? "..." : "");

        const chat = await prisma.chat.create({
            data: {
                title,
                model: values.model,
                userId: user.id,
                messages: {
                    create: {
                        content: values.content,
                        messageRole: MessageRole.USER,
                        messageType: MessageType.NORMAL,
                    },
                },
            },
            include: {
                messages: true,
            },
        });

        return {
            success: true,
            data: chat,
        } as const;
    } catch (error) {
        console.error("Create chat error:", error);
        return {
            success: false,
            message: "Internal server error",
        } as const;
    }
}
