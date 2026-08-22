import { NextResponse } from "next/server";
import { generateCompletion, parseAIJson } from "@/lib/ai-provider";
import { sanitize } from "@/lib/validators";

export async function POST(request) {
  try {
    const { movie, character } = await request.json();
    const safeMovie = sanitize(movie || "", 200);
    const safeCharacter = sanitize(character || "", 200);

    if (!safeMovie) {
      return NextResponse.json(
        { success: false, error: "Movie name is required" },
        { status: 400 }
      );
    }

    const prompt = `Perform a comprehensive character analysis for ${
      safeCharacter ? `the character "${safeCharacter}"` : "the lead character"
    } in the movie "${safeMovie}".
    
Cover the following key aspects:
1. Character Archetype & Profile
2. Core Motivations & Psychological Drives
3. Character Arc & Transformation
4. Key Relationships & Dynamics
5. Iconic Quotes or Defining Moments
6. Symbolic Meaning in the Story

Return ONLY valid JSON:
{
  "characterName": "...",
  "archetype": "...",
  "summary": "...",
  "motivations": ["..."],
  "arcDescription": "...",
  "relationships": [{"person": "...", "dynamic": "..."}],
  "keyMoments": ["..."],
  "symbolism": "..."
}`;

    const { text, provider } = await generateCompletion(prompt, {
      temperature: 0.6,
      systemPrompt:
        "You are an expert film analyst and literary character study expert. Provide deep, structured insights into character psychology. Always return valid raw JSON only.",
    });

    const data = parseAIJson(text);
    return NextResponse.json({ success: true, data, provider });
  } catch (error) {
    console.error("[AI/character]", error.message);
    return NextResponse.json(
      { success: false, error: "AI character analysis is currently unavailable" },
      { status: 500 }
    );
  }
}
