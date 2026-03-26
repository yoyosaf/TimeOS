import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateDailyPlan = async (tasks: string[], habits: string[], timezone: string) => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a daily productivity schedule for a user in ${timezone}. 
    Tasks: ${tasks.join(', ')}. 
    Habits: ${habits.join(', ')}. 
    Return a JSON array of objects with 'time' (string), 'activity' (string), and 'isTask' (boolean).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            time: { type: Type.STRING },
            activity: { type: Type.STRING },
            isTask: { type: Type.BOOLEAN }
          },
          required: ["time", "activity", "isTask"]
        }
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text);
};

export const getFocusSuggestion = async (workDuration: number, task: string) => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user has been working on "${task}" for ${workDuration} minutes. 
    Provide a short, motivating suggestion (max 15 words) for their next break or focus period.`,
  });

  const response = await model;
  return response.text;
};

export const getProductivityScore = async (sessions: any[]) => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze these focus sessions: ${JSON.stringify(sessions)}. 
    Provide a productivity score (0-100) and a 1-sentence feedback. 
    Return JSON with 'score' (number) and 'feedback' (string).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING }
        },
        required: ["score", "feedback"]
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text);
};
