import { BetaAnalyticsDataClient } from '@google-analytics-data/data';
import { NextResponse } from 'next/server';

const propertyId = process.env.GA_PROPERTY_ID;

// Use credentials from environment variables
const client = new BetaAnalyticsDataClient({
    credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

export async function GET() {
    if (!propertyId || !process.env.GA_CLIENT_EMAIL || !process.env.GA_PRIVATE_KEY) {
        return NextResponse.json({ error: "Missing GA credentials" }, { status: 500 });
    }

    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'date' }, { name: 'sessionSource' }],
            metrics: [
                { name: 'activeUsers' },
                { name: 'conversions' },
                { name: 'averageSessionDuration' },
            ],
        });

        // Map GA4 response to our dashboard format
        const stats = response.rows?.map(row => ({
            date: row.dimensionValues?.[0]?.value,
            visitors: parseInt(row.metricValues?.[0]?.value || '0'),
            conversions: parseInt(row.metricValues?.[1]?.value || '0'),
            source: row.dimensionValues?.[1]?.value,
        }));

        return NextResponse.json({ stats });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
