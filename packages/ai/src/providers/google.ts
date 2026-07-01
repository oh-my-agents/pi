import { googleGenerativeAIApi } from "../api/google-generative-ai.lazy.ts";
import { envApiKeyAuth } from "../auth/helpers.ts";
import { createProvider, type Provider } from "../models.ts";
import type { Model } from "../types.ts";
import { GOOGLE_MODELS } from "./google.models.ts";

export function addCustomGeminiModel(
	modelId: string,
	modelName?: string,
	options?: {
		reasoning?: boolean;
		thinkingLevelMap?: Record<string, string | null>;
		input?: ("text" | "image")[];
		cost?: { input: number; output: number; cacheRead: number; cacheWrite: number };
		contextWindow?: number;
		maxTokens?: number;
	}
) {
	if (!modelId.startsWith("gemini-") && !modelId.startsWith("gemma-")) {
		throw new Error("Custom model ID must start with 'gemini-' or 'gemma-'");
	}

	const newModel: Model<"google-generative-ai"> = {
		id: modelId,
		name: modelName ?? modelId,
		api: "google-generative-ai",
		provider: "google",
		baseUrl: "https://generativelanguage.googleapis.com/v1beta",
		reasoning: options?.reasoning ?? false,
		thinkingLevelMap: options?.thinkingLevelMap,
		input: options?.input ?? ["text", "image"],
		cost: options?.cost ?? {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
		},
		contextWindow: options?.contextWindow ?? 1048576,
		maxTokens: options?.maxTokens ?? 8192,
	};
	
	GOOGLE_MODELS[modelId] = newModel;
}
export function googleProvider(): Provider<"google-generative-ai"> {
	return createProvider({
		id: "google",
		name: "Google",
		baseUrl: "https://generativelanguage.googleapis.com/v1beta",
		auth: { apiKey: envApiKeyAuth("Gemini API key", ["GEMINI_API_KEY"]) },
		models: Object.values(GOOGLE_MODELS),
		api: googleGenerativeAIApi(),
		dynamicModelHandler: (modelId: string) => {
			if (modelId.startsWith("gemini-") || modelId.startsWith("gemma-")) {
				return {
					id: modelId,
					name: modelId,
					api: "google-generative-ai",
					provider: "google",
					baseUrl: "https://generativelanguage.googleapis.com/v1beta",
					reasoning: false,
					input: ["text", "image"],
					cost: {
						input: 0,
						output: 0,
						cacheRead: 0,
						cacheWrite: 0,
					},
					contextWindow: 1048576,
					maxTokens: 8192,
				};
			}
			return undefined;
		},
	});
}
