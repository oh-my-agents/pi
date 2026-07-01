import { googleGenerativeAIApi } from "../api/google-generative-ai.lazy.ts";
import { envApiKeyAuth } from "../auth/helpers.ts";
import { createProvider, type Provider } from "../models.ts";
import type { Model, ProviderHeaders } from "../types.ts";
import { GOOGLE_MODELS } from "./google.models.ts";

const GOOGLE_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export interface GoogleProviderOptions {
	baseUrl?: string;
	headers?: ProviderHeaders;
}

function modelHeaders(headers: ProviderHeaders | undefined): Record<string, string> | undefined {
	if (!headers) return undefined;
	const result = Object.fromEntries(
		Object.entries(headers).filter((entry): entry is [string, string] => entry[1] !== null),
	);
	return Object.keys(result).length > 0 ? result : undefined;
}

export function googleProvider(options: GoogleProviderOptions = {}): Provider<"google-generative-ai"> {
	const baseUrl = options.baseUrl ?? GOOGLE_BASE_URL;
	const headers = modelHeaders(options.headers);
	return createProvider({
		id: "google",
		name: "Google",
		baseUrl,
		auth: { apiKey: envApiKeyAuth("Gemini API key", ["GEMINI_API_KEY"]) },
		models: Object.values(GOOGLE_MODELS).map((model) => ({
			...model,
			baseUrl,
			headers,
		})) satisfies Model<"google-generative-ai">[],
		api: googleGenerativeAIApi(),
	});
}
