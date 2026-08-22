import { NextResponse } from "next/server";
import { generateCompletion, parseAIJson } from "@/lib/ai-provider";
import { sanitize } from "@/lib/validators";

export async function POST(request) {
  try {
    const { movie, movies } = await request.json();
    const movieName = sanitize(movie || (movies && movies[0]) || "", 200);

    if (!movieName) {
      return NextResponse.json(
        { success: false, error: "Movie name is required" },
        { status: 400 }
      );
    }

    const prompt = `Find 8 movies similar to "${movieName}". For each movie, provide title, year, and a brief reason why it's similar.

Return ONLY valid JSON:
{"similar": [{"title": "...", "year": 2020, "reason": "...", "matchScore": 85}]}

matchScore should be 0-100 indicating similarity.`;

    const { text } = await generateCompletion(prompt, {
      temperature: 0.7,
      systemPrompt: "You are a movie recommendation expert. Provide accurate movie suggestions. Always respond with valid JSON only, no markdown.",
    });

    const data = parseAIJson(text);
    return NextResponse.json({ success: true, data: data.similar || data });
  } catch (error) {
    console.error("[AI/similar]", error.message);
    return NextResponse.json(
      { success: false, error: "AI similar movies service is temporarily unavailable" },
      { status: 500 }
    );
  }
}
