import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/blog';
import { notifyGoogleIndexing } from '@/lib/google-indexing';

/**
 * Admin endpoint to trigger indexing for all blogs.
 * Expected POST request with ADMIN_SECRET in headers.
 */
export async function POST(request: Request) {
    const authHeader = request.headers.get('Authorization');
    const adminSecret = process.env.ADMIN_SECRET;

    // Basic security check
    if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const posts = getAllPosts();
        // Construct full URLs. Replace with your actual production domain.
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navai.app';

        const results = [];

        // Google Indexing API allows up to 100 requests per batch / day (default quota)
        // We do them sequentially for simplicity or use Promise.all
        for (const post of posts) {
            const url = `${baseUrl}/blog/${post.slug}`;
            const result = await notifyGoogleIndexing(url, 'URL_UPDATED');
            results.push({ url, ...result });
        }

        return NextResponse.json({
            message: `Indexing triggered for ${posts.length} posts.`,
            results
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
