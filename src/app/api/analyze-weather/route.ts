
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { imageUrl } = await req.json();

        if (!imageUrl) {
            return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
        }

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing");
            return NextResponse.json({
                error: "Captain, the AI communications module is offline. Please check your satellite uplink (GEMINI_API_KEY missing)."
            }, { status: 503 });
        }

        // Fetch image and convert to base64
        const imageResp = await fetch(imageUrl);
        if (!imageResp.ok) throw new Error("Failed to fetch weather chart");
        const arrayBuffer = await imageResp.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString("base64");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        You are Captain Mariner, an expert ship captain and meteorologist.
        Analyze this maritime weather meteogram (weather forecast chart) in detail.
        
        Provide a structured report in the following format:
        1. **Overview**: Brief summary of the weather trend.
        2. **Wind Analysis**: Key wind speed and direction changes.
        3. **Sea State**: Potential wave height or rough sea warnings.
        4. **Captain's Order**: Go or No-Go recommendation for small vessels.
        
        Tone: Professional, nautical, concise.
        Language: English (as requested).
        Format: Use clear Markdown with bullet points.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/png",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ analysis: text });

    } catch (error: any) {
        console.error("AI Analysis Detailed Error:", error);
        const errorMessage = error.message || "Unknown error";
        return NextResponse.json({
            error: `Analysis failed: ${errorMessage}`
        }, { status: 500 });
    }
}
