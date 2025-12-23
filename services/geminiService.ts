import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const enhanceBookDescription = async (title: string, author: string, roughNotes: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided for Gemini");
    return roughNotes;
  }

  try {
    const prompt = `
      You are a curator for a high-end antique bookstore. 
      Please write a compelling, elegant, and concise description (max 80 words) for a book titled "${title}" by "${author}".
      Incorporated these notes from the seller: "${roughNotes}".
      The tone should be sophisticated and inviting. Do not use markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || roughNotes;
  } catch (error) {
    console.error("Error enhancing description:", error);
    return roughNotes;
  }
};
