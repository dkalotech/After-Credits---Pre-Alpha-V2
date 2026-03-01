
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getMovieMetadata = async (title: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide metadata for the movie "${title}". 
      IMPORTANT: Verify the release year carefully. If it's a future release or very recent, ensure the year is accurate (e.g., "Send Help" is a 2026 release).
      Return JSON with: title, year (number), genre (array of strings), description (max 150 chars), and predictedGlobalScore (number 1-100 based on critical consensus).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            year: { type: Type.NUMBER },
            genre: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING },
            predictedGlobalScore: { type: Type.NUMBER }
          },
          required: ['title', 'year', 'genre', 'description', 'predictedGlobalScore']
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Metadata Error:", error);
    // Fallback metadata so the user doesn't get a hard error
    return {
      title: title,
      year: new Date().getFullYear(),
      genre: ['Drama'],
      description: 'Metadata generation failed. Please edit manually.',
      predictedGlobalScore: 70
    };
  }
};

export const generateTriviaQuestions = async (movieTitles: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 5 difficult movie trivia questions based on these movies: ${movieTitles.join(', ')}. Include 4 options per question.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              category: { type: Type.STRING, description: "One of: Plot, Actor, Director, Date" },
              movieTitle: { type: Type.STRING }
            },
            required: ['question', 'options', 'correctAnswer', 'category', 'movieTitle']
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};
