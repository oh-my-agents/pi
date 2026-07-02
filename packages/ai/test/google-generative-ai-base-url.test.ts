import { describe, expect, it, vi } from "vitest";

const googleGenAiMock = vi.hoisted(() => ({
	constructorCalls: [] as Array<Record<string, unknown>>,
}));

vi.mock("@google/genai", () => {
	class GoogleGenAI {
		models = {
			generateContentStream: async function* () {
				yield {
					responseId: "google-response-id",
					candidates: [
						{
							content: { parts: [{ text: "ok" }] },
							finishReason: "STOP",
						},
					],
					usageMetadata: {
						promptTokenCount: 1,
						candidatesTokenCount: 1,
						totalTokenCount: 2,
					},
				};
			},
		};

		constructor(config: Record<string, unknown>) {
			googleGenAiMock.constructorCalls.push(config);
		}
	}

	return { GoogleGenAI };
});

import { stream as streamGoogleGenerativeAi } from "../src/api/google-generative-ai.ts";
import { googleProvider } from "../src/providers/google.ts";
import type { Context, Model } from "../src/types.ts";

const context: Context = {
	messages: [{ role: "user", content: "hello", timestamp: Date.now() }],
};

describe("google-generative-ai custom base URL", () => {
	it("forwards custom provider baseUrl and headers through the Google client", async () => {
		const provider = googleProvider({
			baseUrl: "https://gemini-proxy.example.com/v1beta",
			headers: { "x-proxy-key": "proxy-key", "x-drop": null },
		});
		const model = provider.getModels()[0] as Model<"google-generative-ai">;

		expect(model.baseUrl).toBe("https://gemini-proxy.example.com/v1beta");
		expect(model.headers).toEqual({ "x-proxy-key": "proxy-key" });

		const stream = streamGoogleGenerativeAi(model, context, { apiKey: "gemini-key" });
		await stream.result();

		expect(googleGenAiMock.constructorCalls).toHaveLength(1);
		expect(googleGenAiMock.constructorCalls[0]).toMatchObject({
			apiKey: "gemini-key",
			httpOptions: {
				baseUrl: "https://gemini-proxy.example.com/v1beta",
				apiVersion: "",
				headers: { "x-proxy-key": "proxy-key" },
			},
		});
	});
});
