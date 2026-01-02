"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useState } from "react";
import { useCreateChat } from "../hook/useCreateChat";
import { useChatModelStore } from "@/modules/chat/store/modelStore";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

function ChatMessageForm() {

    const [message, setMessage] = useState("");
    const { mutateAsync, isPending: isChatPending } = useCreateChat();

    const selectedModelId = useChatModelStore(
        (state) => state.selectedModelId
    );

    if (!selectedModelId) {
        toast.error("Please select a model");
        return;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            if (!message.trim()) return;
            await mutateAsync({
                content: message,
                model: selectedModelId
            })
            toast.success("Message sent successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send message");
        } finally {
            setMessage("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    };

    return (
        <div className="w-full mx-auto ">
            <form onSubmit={handleSubmit} className="">
                <div className="relative rounded-2xl border border-border shadow-sm bg-background">
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        onKeyDown={handleKeyDown}
                    />
                    {
                        isChatPending ? (
                            <>
                                <Spinner />
                            </>
                        ) : (
                            <Button
                                type="submit"
                                size="icon"
                                variant={message.trim() ? "default" : "ghost"}
                                className="absolute right-3 bottom-3 h-8 w-8"
                                disabled={!message.trim() || isChatPending}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        )
                    }
                </div>
            </form>
        </div>
    );
}

export default ChatMessageForm;