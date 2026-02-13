import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const propertyId = process.env.GA_PROPERTY_ID;

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});

const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });

export async function GET() {
    if (!propertyId || !process.env.GA_CLIENT_EMAIL || !process.env.GA_PRIVATE_KEY) {
        return NextResponse.json({ error: "Missing GA credentials" }, { status: 500 });
    }

    try {
        const response = await analyticsdata.properties.runReport({
            property: `properties/${propertyId}`,
            requestBody: {
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'date' }, { name: 'sessionSource' }],
                metrics: [
                    { name: 'activeUsers' },
                    { name: 'conversions' },
                    { name: 'averageSessionDuration' },
                ],
            }
        });

        // Map GA4 response to our dashboard format
        const stats = response.data.rows?.map((row: any) => ({
            date: row.dimensionValues?.[0]?.value,
            visitors: parseInt(row.metricValues?.[0]?.value || '0'),
            conversions: parseInt(row.metricValues?.[1]?.value || '0'),
            source: row.dimensionValues?.[1]?.value,
        }));

        return NextResponse.json({ stats });
    } catch (error: any) {
        console.error("GA4 Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
