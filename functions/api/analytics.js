export async function onRequest(context) {
    const { env } = context;
    const privateKey = env.GA_PRIVATE_KEY;
    const clientEmail = env.GA_CLIENT_EMAIL;
    // Fallback to Measurement ID if Property ID is missing (though API usually needs numeric)
    // Converting 'G-XXXX' to property might not work, but we'll try to use the provided numeric ID if user sets it.
    const propertyId = env.GA_PROPERTY_ID;

    console.log("Analytics Function Invoked");
    console.log("Email present:", !!clientEmail);
    console.log("Key present:", !!privateKey);
    console.log("Property ID:", propertyId);

    if (!privateKey || !clientEmail || !propertyId) {
        return new Response(JSON.stringify({ error: 'Missing Credentials' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        console.log("Attempting to get access token...");
        const token = await getAccessToken(clientEmail, privateKey);
        console.log("Access token received. Fetching report...");
        const analyticsData = await fetchGA4Report(propertyId, token);
        console.log("Report fetched successfully.");
        return new Response(JSON.stringify({ stats: analyticsData }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error("Analytics Function Error:", err.message);
        console.error(err.stack);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function getAccessToken(clientEmail, privateKey) {
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const claim = {
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/analytics.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedClaim = btoa(JSON.stringify(claim));

    const signInput = `${encodedHeader}.${encodedClaim}`;

    // Import key
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";

    // Clean up the key: remove headers, footers, newlines (real or literal \n), and spaces
    let pemContents = privateKey;
    if (pemContents.includes(pemHeader)) {
        pemContents = pemContents.replace(pemHeader, '').replace(pemFooter, '');
    }

    // Handle literal "\n" strings (common in env vars) AND real newlines
    pemContents = pemContents.replace(/\\n/g, '').replace(/\s+/g, '');

    const binaryDerString = atob(pemContents);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    const key = await crypto.subtle.importKey(
        'pkcs8',
        binaryDer.buffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        key,
        new TextEncoder().encode(signInput)
    );

    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const jwt = `${signInput}.${encodedSignature}`;

    // Exchange JWT for Access Token
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    });

    const tokenData = await tokenResp.json();
    if (!tokenData.access_token) throw new Error('Failed to get access token: ' + JSON.stringify(tokenData));
    return tokenData.access_token;
}

// Simple Base64Url encoder (not the partial one used above for signature)
function btoa(str) {
    return globalThis.btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function fetchGA4Report(propertyId, accessToken) {
    const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'date' }, { name: 'sessionSource' }],
            metrics: [
                { name: 'activeUsers' },
                { name: 'conversions' },
                { name: 'averageSessionDuration' },
            ]
        })
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    return data.rows?.map(row => ({
        date: row.dimensionValues?.[0]?.value,
        visitors: parseInt(row.metricValues?.[0]?.value || '0'),
        conversions: parseInt(row.metricValues?.[1]?.value || '0'),
        source: row.dimensionValues?.[1]?.value,
    })) || [];
}
