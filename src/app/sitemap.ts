import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'
export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const enPosts = await getAllPosts('en');
    const esPosts = await getAllPosts('es');

    const enBlogEntries = enPosts.map(post => ({
        url: `https://navaitech.com/blog/${post.slug}/`,
        lastModified: new Date(post.date),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const esBlogEntries = esPosts.map(post => ({
        url: `https://navaitech.com/blog/es/${post.slug}/`,
        lastModified: new Date(post.date),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [
        {
            url: 'https://navaitech.com/',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: 'https://navaitech.com/blog/',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        ...enBlogEntries,
        ...esBlogEntries
    ]
}
