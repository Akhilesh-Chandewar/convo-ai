"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetChatById } from "@/modules/chat/hook/chatHook";
import { saveErrorToDb } from "@/modules/chat/actions";
import { useChatStore } from "@/modules/chat/store/chatStore";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Spinner } from "@/components/ui/spinner";
import {
  RotateCcwIcon,
  StopCircleIcon,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type Props = {
  chatId: string;
};
type UiTextPart = {
  type: "text" | "reasoning" | "step-start";
  text?: string;
};
type NormalizedMessage = {
  id: string;
  role: "user" | "assistant";
  parts: UiTextPart[];
  createdAt?: Date;
};

/* ------------------------------------------------------------------ */
/* Custom Response Component                                          */
/* ------------------------------------------------------------------ */


/* ------------------------------------------------------------------ */
export default function MessageWithForm({ chatId }: Props) {
  const { data, isPending } = useGetChatById(chatId);
  const { hasChatBeenTriggered, markChatAsTriggered } = useChatStore();
  const [selectedModel, setSelectedModel] = useState<string | undefined>(
    data?.data?.model
  );
  const [input, setInput] = useState("");
  const hasAutoTriggered = useRef(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const shouldAutoTrigger = searchParams.get("autoTrigger") === "true";

  /* ------------------------------------------------------------------ */
  /* Normalize DB messages                                              */
  /* ------------------------------------------------------------------ */
  const initialMessages: NormalizedMessage[] = useMemo(() => {
    if (!data?.data?.messages) return [];
    return data.data.messages
      .filter((msg) => msg.id && msg.content?.trim())
      .map((msg) => {
        let parts: UiTextPart[];
        try {
          const parsed = JSON.parse(msg.content);
          parts = Array.isArray(parsed)
            ? parsed
            : [{ type: "text", text: msg.content }];
        } catch {
          parts = [{ type: "text", text: msg.content }];
        }
        return {
          id: msg.id,
          role: msg.messageRole === "USER" ? "user" : "assistant",
          parts,
          createdAt: msg.createdAt,
        };
      });
  }, [data]);

  /* ------------------------------------------------------------------ */
  /* useChat                                                            */
  /* ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ */
  /* useChat                                                            */
  /* ------------------------------------------------------------------ */
  const { stop, messages, status, sendMessage, regenerate, setMessages, error } = useChat({
    id: chatId,
    onError: (error) => {
      saveErrorToDb(chatId, error.message);
    }
  });

  /* ------------------------------------------------------------------ */
  /* Model sync                                                         */
  /* ------------------------------------------------------------------ */
  const hasInitializedModel = useRef(false);

  useEffect(() => {
    if (!hasInitializedModel.current && data?.data?.model) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedModel(data.data.model);
      hasInitializedModel.current = true;
    }
  }, [data]);

  /* ------------------------------------------------------------------ */
  /* Auto trigger                                                       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (hasAutoTriggered.current) return;
    if (!shouldAutoTrigger) return;
    if (hasChatBeenTriggered(chatId)) return;
    if (!selectedModel) return;
    if (initialMessages.length === 0) return;

    const last = initialMessages[initialMessages.length - 1];
    if (last.role !== "user") return;

    hasAutoTriggered.current = true;
    markChatAsTriggered(chatId);
    sendMessage(
      { text: "" },
      {
        body: {
          model: selectedModel,
          chatId,
          skipUserMessage: true,
        },
      }
    );
    router.replace(`/chat/${chatId}`, { scroll: false });
  }, [
    shouldAutoTrigger,
    chatId,
    selectedModel,
    initialMessages,
    hasChatBeenTriggered,
    markChatAsTriggered,
    sendMessage,
    router,
  ]);

  /* ------------------------------------------------------------------ */
  /* Sync messages to useChat                                           */
  /* ------------------------------------------------------------------ */
  const hasSyncedMessages = useRef(false);

  useEffect(() => {
    if (
      !hasSyncedMessages.current &&
      initialMessages.length > 0 &&
      messages.length === 0
    ) {
      const simplifiedMessages = initialMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.parts.map((p) => p.text).join(""),
        parts: msg.parts, // Pass parts directly as they are compatible or required
        createdAt: msg.createdAt,
      }));
      // TypeScript/SDK might expect specific Part types, but passing our parts satisfies the requirement that 'parts' exists.
      // @ts-expect-error - Parts types might not perfectly overlap but are sufficient for UI
      setMessages(simplifiedMessages);
      hasSyncedMessages.current = true;
    }
  }, [initialMessages, messages.length, setMessages]);

  /* ------------------------------------------------------------------ */
  /* Auto-scroll to bottom on new messages                              */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    // Small delay to ensure DOM has updated
    const timer = setTimeout(() => {
      const conversationElement = document.querySelector('[role="log"]');
      if (conversationElement) {
        conversationElement.scrollTop = conversationElement.scrollHeight;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages.length, status]);

  /* ------------------------------------------------------------------ */
  /* Handlers                                                           */
  /* ------------------------------------------------------------------ */
  const handleSubmit = (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    if (!input.trim() || !selectedModel) return;
    sendMessage(
      { text: input },
      {
        body: {
          model: selectedModel,
          chatId,
        },
      }
    );
    setInput("");
  };
  const handleRetry = () => regenerate();
  const handleStop = () => stop();


  /* ------------------------------------------------------------------ */
  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  // Use synced messages if available to avoid duplication and ensure state consistency
  const messagesToRender: NormalizedMessage[] =
    (messages.length > 0
      ? (messages as unknown as NormalizedMessage[])
      : initialMessages
    ).filter((msg) => !(msg.role === "user" && !(msg as any).content && (!msg.parts || msg.parts.length === 0 || msg.parts.every(p => !p.text))));

  /* ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ */
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full">
      <Conversation className="flex-1 overflow-y-hidden [scrollbar-gutter:stable]">
        <ConversationContent className="max-w-4xl mx-auto w-full">
          {messagesToRender.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Start a conversation...
            </div>
          ) : (
            messagesToRender.map((message) => {
              // Fallback for new messages that might not have parts yet (if SDK adds them without parts)
              const parts = message.parts || [{ type: "text", text: (message as any).content }];

              return (
                <Fragment key={message.id}>
                  {parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <Message from={message.role} key={`${message.id}-${i}`}>
                          <MessageContent>
                            <MessageResponse>{part.text}</MessageResponse>
                          </MessageContent>
                        </Message>
                      );
                    }
                    if (part.type === "reasoning") {
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="max-w-2xl px-4 py-4 border border-muted rounded-md bg-muted/50"
                        >
                          <ReasoningTrigger />
                          <ReasoningContent className="mt-2 italic font-light text-muted-foreground">
                            {part.text ?? ""}
                          </ReasoningContent>
                        </Reasoning>
                      );
                    }
                    if (part.type === "step-start" && i > 0) {
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className="my-4 text-gray-500"
                        >
                          <hr />
                        </div>
                      );
                    }
                    return null;
                  })}
                </Fragment>
              );
            })
          )}
          {status === "streaming" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Spinner />
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="w-full shrink-0 overflow-y-hidden [scrollbar-gutter:stable]">
        <div className="w-full max-w-4xl mx-auto px-4 pb-4">
          {error && (
            <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
              <StopCircleIcon className="h-4 w-4" />
              <span>{error.message || "An error occurred. Please try again."}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="relative">
            <div className="rounded-2xl border bg-background shadow-sm">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className={cn(
                  "min-h-[60px] max-h-[200px]",
                  "resize-none border-0 bg-transparent",
                  "px-4 py-3 text-base",
                  "focus-visible:ring-0 focus-visible:ring-offset-0"
                )}
                disabled={status === "streaming"}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleSubmit(e);
                  }
                }}
              />
              <div className="flex items-center justify-between px-3 py-2 border-t">
                <div className="flex items-center gap-2">
                  {status === "streaming" ? (
                    <Button type="button" variant="ghost" size="sm" onClick={handleStop} className="h-8 px-2">
                      <StopCircleIcon className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                  ) : (
                    messagesToRender.length > 0 && (
                      <Button type="button" variant="ghost" size="sm" onClick={handleRetry} className="h-8 px-2">
                        <RotateCcwIcon className="mr-2 h-4 w-4" />
                        Retry
                      </Button>
                    )
                  )}
                </div>

                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || status === "streaming"}
                  className="rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}