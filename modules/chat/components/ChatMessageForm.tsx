"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { useCreateChat } from "../hook/chatHook";
import { useChatModelStore } from "@/modules/chat/store/chatStore";
import { cn } from "@/lib/utils";

interface ChatMessageFormProps {
    message: string;
    onMessageChange: (value: string) => void;
}

function ChatMessageForm({
    message,
    onMessageChange,
}: ChatMessageFormProps) {
    const { mutateAsync, isPending } = useCreateChat();

    // Model still comes from store (no selector UI)
    const selectedModelId = useChatModelStore(
        (state) => state.selectedModelId
    );

    const handleSubmit = async (
        e?: React.FormEvent | React.KeyboardEvent
    ) => {
        e?.preventDefault();

        if (!selectedModelId) {
            toast.error("Please select a model");
            return;
        }

        if (!message.trim()) return;

        try {
            await mutateAsync({
                content: message,
                model: selectedModelId,
            });

            onMessageChange("");
        } catch {
            toast.error("Failed to send message");
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 pb-4">
            <form onSubmit={handleSubmit} className="relative">
                {/* Input Container */}
                <div className="rounded-2xl border bg-background shadow-sm">
                    {/* Textarea */}
                    <Textarea
                        value={message}
                        onChange={(e) => onMessageChange(e.target.value)}
                        placeholder="Type your message…"
                        className={cn(
                            "min-h-[60px] max-h-[200px]",
                            "resize-none border-0 bg-transparent",
                            "px-4 py-3 text-base",
                            "focus-visible:ring-0 focus-visible:ring-offset-0"
                        )}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                handleSubmit(e);
                            }
                        }}
                    />

                    {/* Toolbar */}
                    <div className="flex items-center justify-end px-3 py-2 border-t">
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!message.trim() || isPending}
                            className="rounded-full"
                            aria-label="Send message"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ChatMessageForm;
