"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useCreateChat } from "../hook/useCreateChat";
import { useChatModelStore } from "@/modules/chat/store/modelStore";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface ChatMessageFormProps {
    message: string;
    onMessageChange: (value: string) => void;
}

function ChatMessageForm({
    message,
    onMessageChange,
}: ChatMessageFormProps) {
    const { mutateAsync, isPending: isChatPending } = useCreateChat();

    const selectedModelId = useChatModelStore(
        (state) => state.selectedModelId
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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

            toast.success("Message sent successfully");
            onMessageChange("");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send message");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    };

    return (
        <div className="w-full mx-auto">
            <form onSubmit={handleSubmit}>
                <div className="relative rounded-2xl border border-border shadow-sm bg-background">
                    <Textarea
                        value={message}
                        onChange={(e) => onMessageChange(e.target.value)}
                        placeholder="Type your message here..."
                        onKeyDown={handleKeyDown}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        variant={message.trim() ? "default" : "ghost"}
                        className="absolute right-3 bottom-3 h-8 w-8"
                        disabled={!message.trim() || isChatPending}
                    >
                        {isChatPending ? (
                            <Spinner className="h-4 w-4" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default ChatMessageForm;
