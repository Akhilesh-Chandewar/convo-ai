"use client";

import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ModelSelector } from "./ModelSelector";
import { useAiModels } from "@/modules/ai-elements/hook/aiHook";
import { Spinner } from "@/components/ui/spinner";
import type { OpenRouterModel } from "./ModelSelector";

function Header() {
  const { data, isPending } = useAiModels();

  // ✅ Extract models array safely
  const models: OpenRouterModel[] = data?.models ?? [];

  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedModelId && models.length > 0) {
      setSelectedModelId(models[0].id);
    }
  }, [models, selectedModelId]);

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
