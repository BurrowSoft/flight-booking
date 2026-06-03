import OpenAI from "openai";
import { unstable_cache } from "next/cache";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getFlightEditorial(from: string, to: string): Promise<string> {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Write a 200-word editorial section for a flight search page for ${from} to ${to}. Include: typical flight duration, best time to travel, a brief note on airlines that fly this route, and a tip about layovers or airports. Plain prose, no markdown, no headers. Factual and useful.`,
      }],
      max_tokens: 350,
    });
    return completion.choices[0]?.message?.content ?? "";
  } catch {
    return "";
  }
}

export const getCachedFlightEditorial = unstable_cache(
  getFlightEditorial,
  ["flight-editorial"],
  { revalidate: 60 * 60 * 24 * 7 } // 7 days
);
