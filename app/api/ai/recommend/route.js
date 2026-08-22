import { NextResponse } from "next/server";
import { generateCompletion, parseAIJson } from "@/lib/ai-provider";
import { sanitize } from "@/lib/validators";

export async function POST(request) {
  try {
    const { mood } = await request.json();

    if (!mood || typeof mood !== "string" || mood.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please describe your mood (at least 2 characters)" },
        { status: 400 }
      );
    }

    const safeMood = sanitize(mood, 300);

    const prompt = `Recommend 5 movies perfect for someone feeling "${safeMood}". 

For each movie, provide:
- title: the movie title
- year: release year
- overview: a 1-2 sentence description of why it fits this mood
- genre: primary genre
- moodMatch: a brief explanation of the mood connection (1 sentence)

Return ONLY valid JSON:
{"recommendations": [{"title": "...", "year": 2020, "overview": "...", "genre": "...", "moodMatch": "..."}]}`;

    const { text } = await generateCompletion(prompt, {
      temperature: 0.8,
      systemPrompt: "You are a movie recommendation expert who understands mood-based viewing. Provide diverse, accurate recommendations. Always respond with valid JSON only, no markdown.",
    });

    const data = parseAIJson(text);
    return NextResponse.json({
      recommendations: data.recommendations || data,
    });
  } catch (error) {
    console.error("[AI/recommend]", error.message);
    return NextResponse.json(
      { recommendations: [], error: "AI service temporarily unavailable" },
      { status: 500 }
    );
  }
}
