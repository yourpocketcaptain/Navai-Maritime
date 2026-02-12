import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
    const posts = getAllPosts();
    const blogPosts = posts.map(post => ({
        url: `https://navaitech.com/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [
        {
            url: 'https://navaitech.com',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: 'https://navaitech.com/blog',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: 'https://navaitech.com/login',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        ...blogPosts
    ]
}
