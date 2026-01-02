import { NextRequest, NextResponse } from 'next/server';

interface OpenRouterPricing {
    prompt?: string;
    completion?: string;
}

interface OpenRouterModel {
    id: string;
    name: string;
    description?: string;
    context_length?: number;
    architecture?: unknown;
    pricing?: OpenRouterPricing;
    top_provider?: unknown;
}

interface OpenRouterModelsResponse {
    data: OpenRouterModel[];
}

export async function GET(req: NextRequest) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data: OpenRouterModelsResponse = await response.json();

        const freeModels = data.data.filter((model) => {
            const promptPrice = parseFloat(model.pricing?.prompt ?? '0');
            const completionPrice = parseFloat(model.pricing?.completion ?? '0');
            return promptPrice === 0 && completionPrice === 0;
        });

        const formattedModels = freeModels.map((model) => ({
            id: model.id,
            name: model.name,
            description: model.description,
            context_length: model.context_length,
            architecture: model.architecture,
            pricing: model.pricing,
            top_provider: model.top_provider,
        }));

        return NextResponse.json({ models: formattedModels });
    } catch (error: unknown) {
        console.error('Error fetching free models:', error);

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch free models',
            },
            { status: 500 }
        );
    }
}
