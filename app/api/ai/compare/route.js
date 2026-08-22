import { NextResponse } from "next/server";
import { generateCompletion, parseAIJson } from "@/lib/ai-provider";
import { sanitize } from "@/lib/validators";

export async function POST(request) {
  try {
    const { movie1, movie2 } = await request.json();

    const name1 = sanitize(movie1 || "", 200);
    const name2 = sanitize(movie2 || "", 200);

    if (!name1 || !name2) {
      return NextResponse.json(
        { success: false, error: "Two movie names are required" },
        { status: 400 }
      );
    }

    const prompt = `Compare the movies "${name1}" and "${name2}" in detail.

Provide:
1. Similarities between the two films
2. Key differences (style, tone, themes)
3. Which is better and why (with rating for each)
4. Recommendations: fans of one would enjoy the other because...

Return ONLY valid JSON:
{"comparison": {"similarities": ["..."], "differences": ["..."], "winner": "...", "winnerReason": "...", "ratings": {"movie1": 8.5, "movie2": 7.8}, "crossRecommendation": "..."}}`;

    const { text } = await generateCompletion(prompt, {
      temperature: 0.6,
      systemPrompt: "You are a film critic who provides balanced, insightful comparisons. Always respond with valid JSON only, no markdown.",
    });

    const data = parseAIJson(text);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[AI/compare]", error.message);
    return NextResponse.json(
      { success: false, error: "AI comparison service is temporarily unavailable" },
      { status: 500 }
    );
  }
}
