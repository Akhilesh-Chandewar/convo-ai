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

interface ChatStore {
    activeChatId: string | null;
    setActiveChatId: (id: string | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    activeChatId: null,
    setActiveChatId: (id) => set({ activeChatId: id }),
}));
