import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY não foi definida.");
}

const ai = new GoogleGenAI({
  apiKey,
});

export async function generateText(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
  });

  return response.text ?? "";
}
export async function generateStructuredText(
  prompt: string,
  responseSchema: Record<string, unknown>,
): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  return response.text ?? "";
}