import { NextResponse } from "next/server";
import { generateCompletion, parseAIJson } from "@/lib/ai-provider";
import { sanitize } from "@/lib/validators";

export async function POST(request) {
  try {
    const { genre, preferences } = await request.json();
    const safeGenre = sanitize(genre || "", 100);
    const safePrefs = sanitize(preferences || "", 300);

    const context = safePrefs ? `Preferences: ${safePrefs}` : "";
    const genreContext = safeGenre ? `Genre focus: ${safeGenre}. ` : "";

    const prompt = `${genreContext}${context}Recommend 8 movies that are perfect for a casual movie night. Mix of popular and hidden gems.

For each movie provide:
- title
- year  
- overview (1 sentence)
- genre
- mood (what vibe it gives: exciting, relaxing, thrilling, heartwarming, etc.)
- hiddenGem (boolean - is this less well-known?)

Return ONLY valid JSON:
{"movies": [{"title": "...", "year": 2020, "overview": "...", "genre": "...", "mood": "...", "hiddenGem": false}]}`;

    const { text } = await generateCompletion(prompt, {
      temperature: 0.8,
      systemPrompt: "You are a movie expert who recommends films based on mood and preferences. Mix mainstream hits with lesser-known gems. Always respond with valid JSON only, no markdown.",
    });

    const data = parseAIJson(text);
    return NextResponse.json({
      success: true,
      movies: data.movies || data,
    });
  } catch (error) {
    console.error("[AI/mood]", error.message);
    return NextResponse.json(
      { success: false, error: "AI mood recommendation service is temporarily unavailable" },
      { status: 500 }
    );
  }
}
