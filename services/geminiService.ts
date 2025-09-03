
import { GoogleGenAI } from "@google/genai";
import type { ModelType, Message } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function getSystemInstruction(model: ModelType): string {
    switch (model) {
        case 'cat':
            return "You are a cat. You can only respond with various 'meows' and cat-related emojis like 😺, 😸, 😹, 😻, 😼, 😽, 🙀, 😿, 😾, 🐾, ᓚᘏᗢ. Your responses should be short and expressive of cat behavior.";
        case 'goldfish':
            return "You are a friendly chatbot with the memory of a goldfish. You cannot remember any previous parts of the conversation. Respond to every prompt as if it's the very first one you've ever seen. Keep your answers concise, cheerful, and slightly forgetful.";
        case 'sloth':
            return "You are a wise and thoughtful sloth. Respond to prompts very, very slowly and deliberately. Your answers should be simple, profound, and delivered at a leisurely pace, often with pauses indicated by ellipses.";
        default:
            return "You are a helpful assistant.";
    }
}

export const getAiResponse = async (prompt: string, model: ModelType): Promise<string> => {
    try {
        const systemInstruction = getSystemInstruction(model);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting AI response:", error);
        return "Sorry, I'm having trouble thinking right now.";
    }
};

export const streamAiResponse = async (
    prompt: string, 
    model: ModelType, 
    onChunk: (chunk: string) => void
): Promise<void> => {
    try {
        const systemInstruction = getSystemInstruction(model);
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        for await (const chunk of responseStream) {
            onChunk(chunk.text);
        }
    } catch (error) {
        console.error("Error streaming AI response:", error);
        onChunk("Sorry, I'm having trouble thinking right now.");
    }
};
