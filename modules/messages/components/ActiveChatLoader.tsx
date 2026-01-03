"use client";
import { useGetChatById } from "@/modules/chat/hook/chatHook";
import { useChatStore } from "@/modules/chat/store/chatStore";
import { useEffect } from "react";

interface ActiveChatLoaderProps {
  chatId: string;
}

function ActiveChatLoader({ chatId }: ActiveChatLoaderProps) {
  const { setActiveChatId, setMessages, addChat, chats } = useChatStore();
  const { data } = useGetChatById(chatId);

  useEffect(() => {
    if (!chatId) return;
    setActiveChatId(chatId);
  }, [chatId, setActiveChatId]);

  useEffect(() => {
    if (!data?.success || !data.data) return;

    const chatData = data.data;
    setMessages(chatData.messages || []);

    if (!chats.some((chat) => chat.id === chatData.id)) {
      addChat(chatData);
    }
  }, [data, chats, setMessages, addChat]
  );
  return null;
}

export default ActiveChatLoader;
