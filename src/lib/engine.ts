import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not defined in environment variables");
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  systemInstruction: "You are 'Captain Mariner'. You are an expert in maritime safety and navigation. Always respond in the user's language. Keep your responses concise, helpful, and professional, as if you were a digital first mate on a ship.",
});

export async function askCaptain(message: string) {
  try {
    const chat = model.startChat({
      history: [],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw new Error("The maritime signal is weak. Please try again later.");
  }
}
