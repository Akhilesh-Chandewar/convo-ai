"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createChatWithMessage, deleteChat, getChatById } from "../actions";
import { toast } from "sonner";

export function useCreateChat() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: createChatWithMessage,

        onSuccess: (response) => {
            if (!response.success || !response.data) {
                toast.error(response.message ?? "Failed to create chat");
                return;
            }

            queryClient.invalidateQueries({ queryKey: ["chats"] });
            router.push(`/chat/${response.data.id}?autoTrigger=true`);
        },

        onError: (error) => {
            console.error(error);
            toast.error("Failed to create chat");
        },
    });
}

export function useDeleteChat() {
    const queryClient = useQueryClient()
    const router = useRouter()

    return useMutation({
        mutationFn: (chatId: string) => deleteChat(chatId),

        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message ?? "Failed to delete chat")
                return
            }

            queryClient.invalidateQueries({ queryKey: ["chats"] })
            router.push("/")
        },

        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete chat")
        },
    })
}

export function useGetChatById(chatId: string) {
    return useQuery({
        queryKey: ["chat", chatId],
        queryFn: () => getChatById(chatId),
        enabled: !!chatId,
    });
}