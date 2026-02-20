export async function onRequest(context) {
    const { request, env } = context;

    // Set CORS headers
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    try {
        const { imageUrl } = await request.json();

        if (!imageUrl) {
            return new Response(JSON.stringify({ error: "Image URL is required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const apiKey = env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({
                error: "Captain, the AI communications module is offline. Please ensure GEMINI_API_KEY is configured in Cloudflare Dashboard."
            }), {
                status: 503,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Fetch image
        const imageResp = await fetch(imageUrl);
        if (!imageResp.ok) throw new Error("Failed to fetch weather chart from source");
        const arrayBuffer = await imageResp.arrayBuffer();

        // Convert to base64 safely
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64Image = btoa(binary);

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

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const geminiResp = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: "image/png",
                                data: base64Image
                            }
                        }
                    ]
                }]
            })
        });

        const result = await geminiResp.json();

        if (result.error) {
            throw new Error(result.error.message || "Gemini API error");
        }

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis generated.";

        return new Response(JSON.stringify({ analysis: text }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: `Analysis failed: ${error.message}`
        }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
}
