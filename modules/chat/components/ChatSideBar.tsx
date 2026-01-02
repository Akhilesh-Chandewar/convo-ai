"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserButton, { User } from "@/modules/auth/components/UserButtton";
import { PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ChatSideBarProps {
    user: User | null;
}

function ChatSideBar({ user }: ChatSideBarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchQueryChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => setSearchQuery(e.target.value);

    return (
        <div className="flex h-full w-80 flex-col border-r border-border bg-sidebar">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
                <h2 className="text-lg font-semibold">ConvoAI</h2>
            </div>

            {/* New Chat */}
            <div className="p-4">
                <Link href="/">
                    <Button variant="ghost" className="w-full justify-start">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Chat
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="px-4 pb-4">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 bg-sidebar-accent border-sidebar-border pr-8"
                        value={searchQuery}
                        onChange={handleSearchQueryChange}
                    />
                </div>
            </div>
            <div className="mt-auto p-4 border-t border-sidebar-border flex items-center gap-3">
                {user && <UserButton user={user} />}
                <span className="min-w-0 flex-1 text-sm text-sidebar-foreground truncate">
                    {user?.name}
                </span>
            </div>
        </div>
    );
}

export default ChatSideBar;
