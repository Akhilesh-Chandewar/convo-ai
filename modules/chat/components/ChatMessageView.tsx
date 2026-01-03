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
        <div className="flex flex-col h-screen w-full">
            <div className="items-center justify-center w-full mx-auto space-y-8">
                <ChatWelcomeTabs
                    userName={user?.name || ""}
                    onMessageSelect={setMessage}
                />

                <ChatMessageForm
                    message={message}
                    onMessageChange={setMessage}
                />
            </div>
        </div>
    );
}

export default ChatMessageView;
