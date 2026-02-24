export async function onRequestGet(context) {
    // Cloudflare provides the country code in the cf object
    const country = context.request.cf?.country || "unknown";

    return new Response(JSON.stringify({ country }), {
        headers: {
            "content-type": "application/json;charset=UTF-8",
            "cache-control": "public, max-age=3600" // Cache for 1 hour
        }
    });
}
