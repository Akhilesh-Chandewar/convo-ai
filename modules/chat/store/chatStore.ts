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

interface Chat {
    id: string;
    title: string;
    model: string;
    userId: string;
    messages?: Message[];
    createdAt: Date;
    updatedAt: Date;
}

interface Message {
    id: string;
    content: string;
    model?: string | null;
    chatId: string;
    chat?: Chat;
    createdAt: Date;
    updatedAt: Date;
}

interface ChatStore {
    chats: Chat[];
    activeChatId: string | null;
    messages: Message[];

    setChats: (chats: Chat[]) => void;
    setMessages: (messages: Message[]) => void;
    setActiveChatId: (id: string | null) => void;

    addChat: (chat: Chat) => void;
    addMessage: (message: Message) => void;
    clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    chats: [],
    activeChatId: null,
    messages: [],

    setChats: (chats) => set({ chats }),
    setActiveChatId: (id) => set({ activeChatId: id }),
    setMessages: (messages) => set({ messages }),

    addChat: (chat) => set({ chats: [...get().chats, chat] }),
    addMessage: (message) => set({ messages: [...get().messages, message] }),
    clearMessages: () => set({ messages: [] }),
}));