"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useState } from "react";

function ChatMessageForm() {

    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) return;

        // TODO: send message to API
        console.log("Message:", message);

        setMessage("");
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
                    <Button
                        type="submit"
                        size="icon"
                        variant={message.trim() ? "default" : "ghost"}
                        className="absolute right-3 bottom-3 h-8 w-8"
                        disabled={!message.trim()}
                    >
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default ChatMessageForm;