"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import UserButton, { User } from "@/modules/auth/components/UserButtton";
import {
    PlusIcon,
    SearchIcon,
    EllipsisIcon,
    Trash,
} from "lucide-react";
import Link from "next/link";
import { useChatStore } from "../store/chatStore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemo, useState } from "react";
import Modal from "@/components/ui/modal";
import { useDeleteChat } from "../hook/chatHook";

interface Chat {
    id: string;
    title: string;
    createdAt: string | Date;
    messages?: { content: string }[];
}

interface ChatSideBarProps {
    user: User | null;
    chats: Chat[];
}

function SectionSeparator() {
    return (
        <div className="my-4 px-2">
            <div className="h-px bg-border/60" />
        </div>
    );
}

export default function ChatSideBar({ user, chats }: ChatSideBarProps) {
    const { activeChatId, setActiveChatId } = useChatStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { mutate: deleteChat } = useDeleteChat()

    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) return chats;
        const q = searchQuery.toLowerCase();
        return chats.filter(
            (chat) =>
                chat.title.toLowerCase().includes(q) ||
                chat.messages?.some((m) =>
                    m.content.toLowerCase().includes(q)
                )
        );
    }, [chats, searchQuery]);

    const groupedChats = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);

        const groups: Record<string, Chat[]> = {
            today: [],
            yesterday: [],
            lastWeek: [],
            older: [],
        };

        filteredChats.forEach((chat) => {
            const date = new Date(chat.createdAt);

            if (date >= today) groups.today.push(chat);
            else if (date >= yesterday) groups.yesterday.push(chat);
            else if (date >= lastWeek) groups.lastWeek.push(chat);
            else groups.older.push(chat);
        });

        return groups;
    }, [filteredChats]);

    const renderChatList = (list: Chat[]) =>
        list.map((chat) => (
            <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                onClick={() => setActiveChatId(chat.id)}
                className={cn(
                    "group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    chat.id === activeChatId
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                )}
            >
                <span className="truncate flex-1">{chat.title}</span>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.preventDefault()}
                        >
                            <EllipsisIcon className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-500 gap-2"
                            onClick={(e) => {
                                e.preventDefault();
                                setSelectedChatId(chat.id);
                                setIsDeleteModalOpen(true);
                            }}
                        >
                            <Trash className="h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Link>
        ));

    return (
        <aside className="flex h-full w-80 flex-col bg-sidebar">
            <div className="px-4 py-3">
                <h2 className="text-lg font-semibold">ConvoAI</h2>
            </div>
            <div className="p-4">
                <Link href="/">
                    <Button
                        className="w-full"
                        onClick={() => setActiveChatId(null)}
                    >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Chat
                    </Button>
                </Link>
            </div>
            <div className="px-4 pb-4">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search chats..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                            X
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-4">
                {filteredChats.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                        No chats found
                    </p>
                ) : (
                    <>
                        {groupedChats.today.length > 0 && (
                            <>
                                <Section title="Today">
                                    {renderChatList(groupedChats.today)}
                                </Section>
                                <SectionSeparator />
                            </>
                        )}

                        {groupedChats.yesterday.length > 0 && (
                            <>
                                <Section title="Yesterday">
                                    {renderChatList(groupedChats.yesterday)}
                                </Section>
                                <SectionSeparator />
                            </>
                        )}

                        {groupedChats.lastWeek.length > 0 && (
                            <>
                                <Section title="Last 7 Days">
                                    {renderChatList(groupedChats.lastWeek)}
                                </Section>
                                <SectionSeparator />
                            </>
                        )}

                        {groupedChats.older.length > 0 && (
                            <Section title="Older">
                                {renderChatList(groupedChats.older)}
                            </Section>
                        )}
                    </>
                )}
            </div>

            <div className="p-4 flex items-center gap-3">
                {user && <UserButton user={user} />}
                <span className="truncate text-sm">{user?.email}</span>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedChatId(null);
                }}
                title="Delete chat"
                description="This action cannot be undone."
                submitText="Delete"
                submitVariant="destructive"
                showFooter
                onSubmit={() => {
                    if (!selectedChatId) return;

                    deleteChat(selectedChatId, {
                        onSuccess: () => {
                            setIsDeleteModalOpen(false);
                            setSelectedChatId(null);
                        },
                    });
                }}
            >
                <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete this chat?
                </p>
            </Modal>
        </aside>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <p className="px-2 mb-1 text-xs font-semibold text-muted-foreground">
                {title}
            </p>
            <div className="space-y-1">{children}</div>
        </div>
    );
}
