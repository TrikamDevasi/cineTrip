import { NextResponse } from "next/server";
import { generateCompletion, parseAIJson } from "@/lib/ai-provider";
import { sanitize } from "@/lib/validators";

export async function POST(request) {
  try {
    const { movie, type = "analysis" } = await request.json();

    if (!movie || typeof movie !== "string") {
      return NextResponse.json(
        { success: false, error: "Movie name is required" },
        { status: 400 }
      );
    }

    const safeMovie = sanitize(movie, 200);

    const prompts = {
      analysis: `Analyze the movie "${safeMovie}". Provide:
1. A brief plot summary (2-3 sentences)
2. Themes and symbolism (2-3 points)
3. Cinematic techniques (2-3 points)
4. Cultural impact
5. A rating out of 10 with justification

Return ONLY valid JSON with this structure:
{"plotSummary": "...", "themes": ["..."], "cinematicTechniques": ["..."], "culturalImpact": "...", "rating": 8.5, "ratingJustification": "...", "funFacts": ["..."]}`,

      explainEnding: `Explain the ending of the movie "${safeMovie}" in detail. Include:
1. What happens in the final act
2. The significance of the ending
3. Any twists or reveals
4. Fan theories if applicable

Return ONLY valid JSON:
{"ending": "...", "significance": "...", "twists": ["..."], "fanTheories": ["..."]}`,

      characterAnalysis: `Analyze the main characters of the movie "${safeMovie}". For each major character, provide name, role, and arc.

Return ONLY valid JSON:
{"characters": [{"name": "...", "role": "...", "arc": "...", "significance": "..."}]}`,
    };

    const prompt = prompts[type] || prompts.analysis;
    const { text } = await generateCompletion(prompt, {
      temperature: 0.7,
      systemPrompt: "You are a professional film critic and analyst. Provide insightful, detailed analysis. Always respond with valid JSON only, no markdown.",
    });

    const data = parseAIJson(text);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[AI/analyze]", error.message);
    return NextResponse.json(
      { success: false, error: "AI analysis service is temporarily unavailable" },
      { status: 500 }
    );
  }
}
