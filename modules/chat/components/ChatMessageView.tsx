"use client";

import { User } from "@/modules/auth/components/UserButtton";
import ChatWelcomeTabs from "./ChatWellcomeTabs";
import ChatMessageForm from "./ChatMessageForm";
import { useState } from "react";

interface ChatMessageViewProps {
    user: User | null;
}

function ChatMessageView({ user }: ChatMessageViewProps) {
    const [message, setMessage] = useState("");

    return (
        <div className="flex flex-col flex-1 w-full overflow-hidden">
            {/* Top tabs */}
            <div className="shrink-0 px-4 pt-10 pb-4 w-full max-w-4xl mx-auto">
                <ChatWelcomeTabs
                    userName={user?.name || ""}
                    onMessageSelect={setMessage}
                />
            </div>

            {/* Middle (messages area) */}
            <div className="flex-1 overflow-y-auto" />

            {/* Bottom input */}
            <div className="shrink-0 bg-background">
                <ChatMessageForm
                    message={message}
                    onMessageChange={setMessage}
                />
            </div>
        </div>
    );
}

export default ChatMessageView;