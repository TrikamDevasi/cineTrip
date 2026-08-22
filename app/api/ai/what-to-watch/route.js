import { NextResponse } from "next/server";
import { generateCompletion, parseAIJson } from "@/lib/ai-provider";
import { sanitize } from "@/lib/validators";

export async function POST(request) {
  try {
    const { context } = await request.json();
    const safeContext = sanitize(context || "", 500);

    const contextPrompt = safeContext
      ? `Based on this context: "${safeContext}"\n\n`
      : "";

    const prompt = `${contextPrompt}Suggest 5 movies I should watch right now. Mix of genres and eras. Include at least one classic and one recent release.

For each movie provide:
- title
- year
- genre
- overview (1-2 sentences about why this is a must-watch)
- watchMood (what's the ideal viewing mood: date night, solo, family, friends, etc.)
- availableOn (common streaming platforms if known)

Return ONLY valid JSON:
{"suggestions": [{"title": "...", "year": 2020, "genre": "...", "overview": "...", "watchMood": "...", "availableOn": ["Netflix", "Prime"]}]}`;

    const { text } = await generateCompletion(prompt, {
      temperature: 0.8,
      systemPrompt: "You are a movie buff who always knows the perfect film to recommend. Be enthusiastic and specific. Always respond with valid JSON only, no markdown.",
    });

    const data = parseAIJson(text);
    return NextResponse.json({
      success: true,
      suggestions: data.suggestions || data,
    });
  } catch (error) {
    console.error("[AI/what-to-watch]", error.message);
    return NextResponse.json(
      { success: false, error: "AI recommendation service is temporarily unavailable" },
      { status: 500 }
    );
  }
}
