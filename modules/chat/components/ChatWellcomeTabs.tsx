"use client";

import { Button } from "@/components/ui/button";
import {
    Briefcase,
    Code,
    GraduationCap,
    Megaphone,
    Newspaper,
    Palette,
    Sparkles,
    User,
} from "lucide-react";
import { useState } from "react";

interface ChatWelcomeTabsProps {
    userName: string;
    onMessageSelect: (message: string) => void;
}

const CHAT_TAB_MESSAGE = [
    {
        tabName: "Create",
        icon: <Sparkles className="h-4 w-4 shrink-0" />,
        messages: [
            "Write a short story about a robot discovering emotions",
            "Help me outline a sci-fi novel",
            "Create a villain with sympathetic motives",
        ],
    },
    {
        tabName: "Explore",
        icon: <Newspaper className="h-4 w-4 shrink-0" />,
        messages: [
            "Hidden travel destinations in Europe",
            "Fascinating facts about the deep ocean",
            "Why do languages disappear?",
        ],
    },
    {
        tabName: "Code",
        icon: <Code className="h-4 w-4 shrink-0" />,
        messages: [
            "Invert a binary search tree in Python",
            "Promise.all vs Promise.allSettled",
            "Explain React useEffect cleanup",
        ],
    },
    {
        tabName: "Learn",
        icon: <GraduationCap className="h-4 w-4 shrink-0" />,
        messages: [
            "Beginner's guide to TypeScript",
            "Explain the CAP theorem",
            "What is quantum computing?",
        ],
    },
    {
        tabName: "Business",
        icon: <Briefcase className="h-4 w-4 shrink-0" />,
        messages: [
            "How to validate a startup idea",
            "Create a business plan outline",
            "How to price a SaaS product",
        ],
    },
    {
        tabName: "Design",
        icon: <Palette className="h-4 w-4 shrink-0" />,
        messages: [
            "Improve UX for a mobile app",
            "Color theory basics for UI design",
            "Create a design system checklist",
        ],
    },
    {
        tabName: "Marketing",
        icon: <Megaphone className="h-4 w-4 shrink-0" />,
        messages: [
            "Write a product launch email",
            "SEO basics for beginners",
            "Social media growth strategies",
        ],
    },
    {
        tabName: "Career",
        icon: <User className="h-4 w-4 shrink-0" />,
        messages: [
            "Prepare for a frontend interview",
            "How to negotiate salary",
            "Build a strong developer portfolio",
        ],
    },
];

function ChatWelcomeTabs({
    userName,
    onMessageSelect,
}: ChatWelcomeTabsProps) {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="w-full space-y-8">
            <h1 className="text-4xl font-semibold">
                How can I help you, {userName}?
            </h1>

            <div className="flex flex-wrap gap-2">
                {CHAT_TAB_MESSAGE.map((tab, index) => (
                    <Button
                        key={tab.tabName}
                        variant={activeTab === index ? "default" : "secondary"}
                        onClick={() => setActiveTab(index)}
                        className="h-10 w-28 flex items-center gap-2 justify-start"
                    >
                        {tab.icon}
                        <span className="truncate">{tab.tabName}</span>
                    </Button>
                ))}
            </div>

            <div className="h-52 space-y-2 overflow-y-auto">
                {CHAT_TAB_MESSAGE[activeTab].messages.map((message) => (
                    <Button
                        key={message}
                        variant="outline"
                        className="w-full justify-start text-left whitespace-normal"
                        onClick={() => onMessageSelect(message)}
                    >
                        {message}
                    </Button>
                ))}
            </div>
        </div>
    );
}

export default ChatWelcomeTabs;
