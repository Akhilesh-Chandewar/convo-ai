"use client";

import { create } from "zustand";

/* -------------------------------------------------------------------------- */
/*                                MODEL STORE                                 */
/* -------------------------------------------------------------------------- */

interface ChatModelStore {
    selectedModelId: string | null;
    setSelectedModelId: (id: string) => void;
}

export const useChatModelStore = create<ChatModelStore>((set) => ({
    selectedModelId: null,
    setSelectedModelId: (id) => set({ selectedModelId: id }),
}));

/* -------------------------------------------------------------------------- */
/*                                 CHAT STORE                                 */
/* -------------------------------------------------------------------------- */

export interface Chat {
    id: string;
    title: string;
    model: string;
    userId: string;
    messages?: Message[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Message {
    id: string;
    content: string;
    model?: string | null;
    chatId: string;
    chat?: Chat;
    createdAt: Date;
    updatedAt: Date;
}

/* -------------------------------------------------------------------------- */

interface ChatStore {
    chats: Chat[];
    activeChatId: string | null;
    messages: Message[];

    /** Auto-trigger protection */
    triggeredChatIds: Record<string, boolean>;

    /* setters */
    setChats: (chats: Chat[]) => void;
    setMessages: (messages: Message[]) => void;
    setActiveChatId: (id: string | null) => void;

    /* mutations */
    addChat: (chat: Chat) => void;
    addMessage: (message: Message) => void;
    clearMessages: () => void;

    /* auto-trigger helpers */
    hasChatBeenTriggered: (chatId: string) => boolean;
    markChatAsTriggered: (chatId: string) => void;
}

/* -------------------------------------------------------------------------- */

export const useChatStore = create<ChatStore>((set, get) => ({
    chats: [],
    activeChatId: null,
    messages: [],

    triggeredChatIds: {},

    /* setters */
    setChats: (chats) => set({ chats }),
    setMessages: (messages) => set({ messages }),
    setActiveChatId: (id) => set({ activeChatId: id }),

    /* mutations */
    addChat: (chat) =>
        set((state) => ({ chats: [...state.chats, chat] })),

    addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

    clearMessages: () => set({ messages: [] }),

    hasChatBeenTriggered: (chatId) => {
        return Boolean(get().triggeredChatIds[chatId]);
    },

    markChatAsTriggered: (chatId) =>
        set((state) => ({
            triggeredChatIds: {
                ...state.triggeredChatIds,
                [chatId]: true,
            },
        })),
}));
