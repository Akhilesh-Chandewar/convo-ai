"use client";

import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ModelSelector } from "./ModelSelector";
import { useAiModels } from "@/modules/ai-elements/hook/useAiModels";
import { Spinner } from "@/components/ui/spinner";
import type { OpenRouterModel } from "./ModelSelector";
import { useChatModelStore } from "@/modules/chat/store/chatStore";

function Header() {
  const { data, isPending } = useAiModels();
  const models: OpenRouterModel[] = data?.models ?? [];

  const { selectedModelId, setSelectedModelId } = useChatModelStore();

  useEffect(() => {
    if (!selectedModelId && models.length > 0) {
      setSelectedModelId(models[0].id);
    }
  }, [models, selectedModelId, setSelectedModelId]);

  return (
    <div className="flex w-full items-center justify-end gap-2 border-border bg-sidebar px-4 py-3">
      {isPending ? (
        <Spinner />
      ) : (
        <ModelSelector
          models={models}
          selectedModelId={selectedModelId}
          onModelSelect={setSelectedModelId}
        />
      )}

      <ModeToggle />
    </div>
  );
}

export default Header;
