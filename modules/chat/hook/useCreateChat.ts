"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createChatWithMessage } from "../actions";
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
