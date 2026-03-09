import { getAllPosts } from "@/lib/blog";
import BlogClient from "./BlogClient";

export const metadata = {
    title: "Maritime Blog | NavAI - Nautical Insights & Intelligence",
    description: "Stay ahead with the latest in maritime AI, navigation tutorials, and industry insights. NavAI blog for the modern mariner.",
    alternates: {
        canonical: '/blog/',
    }
};

export default async function BlogPage() {
    const enPosts = await getAllPosts('en');
    const esPosts = await getAllPosts('es');

    return <BlogClient enPosts={enPosts} esPosts={esPosts} />;
}
