"use client";

import { create } from "zustand";

interface ChatModelStore {
    selectedModelId: string | null;
    setSelectedModelId: (id: string) => void;
}

export const useChatModelStore = create<ChatModelStore>((set) => ({
    selectedModelId: null,
    setSelectedModelId: (id) => set({ selectedModelId: id }),
}));
