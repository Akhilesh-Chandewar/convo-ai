"use server";

import { prisma } from "@/lib/databaseConnection";
import { getCurrentUser } from "@/modules/auth/actions";
import { MessageRole, MessageType } from "@/lib/generated/prisma/enums";
import { revalidatePath } from "next/cache";

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

        revalidatePath("/");

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

export async function getAllChats() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { success: false, message: "Unauthorized user" } as const;
        }

        const chats = await prisma.chat.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        return {
            success: true,
            message: "Chat fetched successfully",
            data: chats,
        } as const;
    } catch (error) {
        console.error("Get all chats error:", error);
        return {
            success: false,
            message: "Internal server error",
        } as const;
    }
}

export async function deleteChat(chatId: string) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { success: false, message: "Unauthorized user" } as const;
        }

        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
        });

        if (!chat) {
            return { success: false, message: "Chat not found" } as const;
        }

        if (chat.userId !== user.id) {
            return { success: false, message: "Unauthorized user" } as const;
        }

        await prisma.chat.delete({
            where: { id: chatId },
        });

        revalidatePath("/");

        return {
            success: true,
            message: "Chat deleted successfully",
        } as const;
    } catch (error) {
        console.error("Delete chat error:", error);
        return {
            success: false,
            message: "Internal server error",
        } as const;
    }
}
