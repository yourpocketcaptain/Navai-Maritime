import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import BlogPostContent from "../../BlogPostContent";

export async function generateStaticParams() {
    const posts = getAllPosts('es');
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug, 'es');

    if (!post) return { title: 'Post Not Found' };

    return {
        title: `${post.title} | NavAI Blog`,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            images: [post.image],
            type: 'article',
        },
        alternates: {
            canonical: `/blog/es/${slug}/`,
        }
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = getPostBySlug(slug, 'es');

    if (!post) notFound();

    return <BlogPostContent post={post} language="es" />;
}
