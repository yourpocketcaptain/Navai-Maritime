import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/indexing'];

/**
 * Notifies Google about a URL change (Update or Delete)
 * Requires GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.
 */
export async function notifyGoogleIndexing(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
        console.warn('Google Indexing API: Missing credentials. Skipping indexing.');
        return { success: false, error: 'Missing credentials' };
    }

    try {
        const auth = new google.auth.JWT(
            clientEmail,
            undefined,
            privateKey,
            SCOPES
        );

        const indexing = google.indexing({ version: 'v3', auth });

        const response = await indexing.urlNotifications.publish({
            requestBody: {
                url,
                type,
            },
        });

        console.log(`Google Indexing API: Success for ${url} (${type})`);
        return { success: true, data: response.data };
    } catch (error: any) {
        console.error(`Google Indexing API: Error indexing ${url}:`, error.message);
        return { success: false, error: error.message };
    }
}
