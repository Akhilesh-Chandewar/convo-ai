"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetChatById } from "@/modules/chat/hook/chatHook";
import { useAiModels } from "@/modules/ai-elements/hook/useAiModels";
import { useChatStore } from "@/modules/chat/store/chatStore";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { ModelSelector } from "@/modules/chat/components/ModelSelector";
import { Spinner } from "@/components/ui/spinner";
import {
  RotateCcwIcon,
  StopCircleIcon,
} from "lucide-react";

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
const ResponseText = ({ children }: { children?: string }) => {
  return <span>{children}</span>;
};

/* ------------------------------------------------------------------ */
export default function MessageViewWithForm({ chatId }: Props) {
  const { data: models, isPending: isModelLoading } = useAiModels();
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
  const { stop, messages, status, sendMessage, regenerate } = useChat();

  /* ------------------------------------------------------------------ */
  /* Model sync                                                         */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (data?.data?.model && !selectedModel) {
      setSelectedModel(data.data.model);
    }
  }, [data, selectedModel]);

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
      { text: "" }, // FIX #1: Changed from null to ""
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
  /* Handlers                                                           */
  /* ------------------------------------------------------------------ */
  const handleSubmit = () => {
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

  const messagesToRender: NormalizedMessage[] = [
    ...initialMessages,
    ...(messages as NormalizedMessage[]),
  ];

  /* ------------------------------------------------------------------ */
  return (
    <div className="max-w-4xl mx-auto p-6 relative h-[calc(100vh-4rem)]">
      <Conversation className="h-full">
        <ConversationContent>
          {messagesToRender.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Start a conversation...
            </div>
          ) : (
            messagesToRender.map((message) => (
              <Fragment key={message.id}>
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    return (
                      <Message from={message.role} key={`${message.id}-${i}`}>
                        <MessageContent>
                          <ResponseText>{part.text}</ResponseText> {/* FIX #2 */}
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
                          <MessageContent>
                            <ResponseText>{part.text ?? ""}</ResponseText>
                          </MessageContent>
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
            ))
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

      <PromptInput onSubmit={handleSubmit} className="mt-4">
        <PromptInputBody>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={status === "streaming"}
          />
        </PromptInputBody>

        {/* FIX #4: Using div instead of PromptInputToolbar */}
        <div className="flex items-center justify-between mt-2">
          <PromptInputTools className="flex items-center gap-2">
            {isModelLoading ? (
              <Spinner />
            ) : (
              <ModelSelector
                models={models?.models}
                selectedModelId={selectedModel ?? null}
                onModelSelect={setSelectedModel}
              />
            )}
            {status === "streaming" ? (
              <PromptInputButton onClick={handleStop}>
                <StopCircleIcon size={16} />
                <span>Stop</span>
              </PromptInputButton>
            ) : (
              messagesToRender.length > 0 && (
                <PromptInputButton onClick={handleRetry}>
                  <RotateCcwIcon size={16} />
                  <span>Retry</span>
                </PromptInputButton>
              )
            )}
          </PromptInputTools>
          <PromptInputSubmit status={status} />
        </div>
      </PromptInput>
    </div>
  );
}