import { NextResponse } from "next/server";
import { generateCompletion, parseAIJson } from "@/lib/ai-provider";
import { sanitize } from "@/lib/validators";

export async function POST(request) {
  try {
    const { movie } = await request.json();
    const safeMovie = sanitize(movie || "", 200);

    if (!safeMovie) {
      return NextResponse.json(
        { success: false, error: "Movie name is required" },
        { status: 400 }
      );
    }

    const prompt = `Explain the ending of the movie "${safeMovie}" in detail. Cover:
1. What happens in the final act/scene
2. The deeper meaning and themes behind the ending
3. Any plot twists or reveals
4. Common audience interpretations
5. Director's likely intent
6. If applicable, how it sets up a sequel

Return ONLY valid JSON:
{"ending": "...", "deeperMeaning": "...", "twists": ["..."], "interpretations": ["..."], "directorIntent": "...", "sequelSetup": "..."}`;

    const { text } = await generateCompletion(prompt, {
      temperature: 0.6,
      systemPrompt: "You are a film analyst who excels at interpreting movie endings. Provide clear, insightful analysis. Always respond with valid JSON only, no markdown.",
    });

    const data = parseAIJson(text);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[AI/explain]", error.message);
    return NextResponse.json(
      { success: false, error: "AI explanation service is temporarily unavailable" },
      { status: 500 }
    );
  }
}
