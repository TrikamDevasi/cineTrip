import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Centralized AI provider abstraction.
 * Supports Groq, Gemini, and OpenAI with automatic fallback.
 * Controlled by LLM_PROVIDER env var. Falls back chain: groq -> gemini -> openai.
 */

const PROVIDERS = {
  groq: {
    init: () =>
      new OpenAI({
        apiKey: process.env.GROQ_API_KEY?.trim(),
        baseURL: "https://api.groq.com/openai/v1",
      }),
    model: () => process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    available: () => !!process.env.GROQ_API_KEY?.trim(),
  },
  gemini: {
    init: () =>
      new GoogleGenerativeAI(process.env.GEMINI_API_KEY?.trim()),
    model: () => process.env.GEMINI_MODEL || "gemini-1.5-flash",
    available: () => !!process.env.GEMINI_API_KEY?.trim(),
  },
  openai: {
    init: () =>
      new OpenAI({ apiKey: process.env.OPENAI_API_KEY?.trim() }),
    model: () => process.env.OPENAI_MODEL || "gpt-4o",
    available: () => !!process.env.OPENAI_API_KEY?.trim(),
  },
};

const PROVIDER_ORDER = ["groq", "gemini", "openai"];

/**
 * Generate a completion using the configured AI provider with fallback.
 * @param {string} prompt - The prompt to send
 * @param {object} options - Optional: { temperature, maxTokens, systemPrompt }
 * @returns {Promise<{text: string, provider: string}>}
 */
export async function generateCompletion(prompt, options = {}) {
  const { temperature = 0.7, maxTokens = 2048, systemPrompt } = options;
  const preferred = process.env.LLM_PROVIDER || "groq";
  const ordered = [preferred, ...PROVIDER_ORDER.filter((p) => p !== preferred)];

  for (const providerName of ordered) {
    const provider = PROVIDERS[providerName];
    if (!provider || !provider.available()) continue;

    try {
      console.log(`[AI] Attempting ${providerName}...`);

      if (providerName === "gemini") {
        const genAI = provider.init();
        const model = genAI.getGenerativeModel({
          model: provider.model(),
          ...(systemPrompt && { systemInstruction: systemPrompt }),
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return { text, provider: providerName };
      }

      // OpenAI-compatible (Groq, OpenAI)
      const client = provider.init();
      const messages = [];
      if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
      messages.push({ role: "user", content: prompt });

      const completion = await client.chat.completions.create({
        model: provider.model(),
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      const text = completion.choices[0].message.content.trim();
      return { text, provider: providerName };
    } catch (err) {
      console.warn(`[AI] ${providerName} failed: ${err.message}`);
      continue;
    }
  }

  throw new Error("All AI providers are unavailable");
}

/**
 * Parse JSON from an AI response, handling markdown code blocks.
 */
export function parseAIJson(text) {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();
  return JSON.parse(cleaned);
}
