import { GoogleGenAI } from "@google/genai";
import { PlayerStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_FLASH = 'gemini-2.5-flash';

export const generateMissionBrief = async (locationName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `You are a futuristic tactical commander AI. 
      The user is about to start a territory control run in ${locationName}.
      Generate a short, punchy, 1-sentence mission directive. 
      Style: Cyberpunk, Urgent, Strategy.
      Example: "Secure the southern grid before the Neon Syndicate expands."`,
    });
    return response.text || "Secure the sector. Move out.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection unstable. Objective: Expand territory.";
  }
};

export const generateDebrief = async (
  stats: PlayerStats, 
  cellsCaptured: number, 
  rivalsEncountered: string[]
): Promise<string> => {
  try {
    const rivalText = rivalsEncountered.length > 0 ? `Rivals neutralized: ${rivalsEncountered.join(', ')}.` : "No hostile contact.";
    const prompt = `
      You are a tactical AI. The user finished a run.
      Stats:
      - Area: ${stats.areaCapturedKm2.toFixed(3)} km²
      - Cells Captured: ${cellsCaptured}
      - ${rivalText}
      
      Write a 2-3 sentence debrief. Be encouraging but demand more effort. 
      Mention the rivals if any.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
    });
    return response.text || "Mission complete. Territory secured. Rest up for the next offensive.";
  } catch (error) {
    return "Data upload complete. Good work out there, runner.";
  }
};

export const generateDefenseAlert = async (rivalName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Generate a 5-word urgent alert that player ${rivalName} is stealing territory.`,
    });
    return response.text || `Alert: ${rivalName} is taking your zone!`;
  } catch (error) {
    return `Alert: ${rivalName} is hostile!`;
  }
};
