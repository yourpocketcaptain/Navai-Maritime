import { getAllPosts, getPostBySlug, parseMarkdown } from "@/lib/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Anchor, ArrowLeft, Download, Bookmark } from "lucide-react";
import type { Metadata } from 'next';

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) return { title: 'Post Not Found' };

    return {
        title: `${post.title} | NavAI Blog`,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            images: [post.image],
            type: 'article',
        }
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) notFound();

    const htmlContent = await parseMarkdown(post.content);

    return (
        <main className="min-h-screen bg-maritime-midnight text-white font-sans selection:bg-maritime-orange/30">
            {/* Navigation */}
            <nav className="p-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-maritime-midnight/80">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Link href="/blog" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Back to Insights</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2">
                        <Anchor className="w-5 h-5 text-maritime-orange" />
                        <span className="font-bold tracking-tight hidden sm:block">NAVAI</span>
                    </Link>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto px-6 pt-16 pb-32">
                {/* Header */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="px-3 py-1 rounded-full bg-maritime-orange/20 border border-maritime-orange/30 text-maritime-orange text-[10px] font-bold uppercase tracking-widest">
                            {post.category}
                        </span>
                        <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] mb-8">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-4 py-8 border-y border-white/5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maritime-ocean to-maritime-teal flex items-center justify-center text-maritime-midnight font-black">
                            {post.author.charAt(0)}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white uppercase tracking-widest">{post.author}</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-tighter">NavAI Editorial Team</div>
                        </div>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="mb-16 rounded-[2.5rem] overflow-hidden border border-white/10 aspect-video">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>

                {/* Content */}
                <div
                    className="prose prose-invert prose-maritime max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />

                {/* Post-Content CTA */}
                <div className="mt-24 p-12 bg-white/5 rounded-[3rem] border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-maritime-orange/10 blur-[80px] -z-10 group-hover:bg-maritime-orange/20 transition-all" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <h3 className="text-2xl md:text-3xl font-bold">Ready to try the Web Bridge Assistant?</h3>
                            <p className="text-white/60 font-light">Access our professional maritime tools directly from your browser. Use the Bridge Console web app or get the mobile version for iOS.</p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <Link
                                    href="/login"
                                    className="flex items-center gap-3 px-8 py-4 bg-maritime-orange text-maritime-midnight rounded-2xl font-bold hover:scale-105 transition-all shadow-xl"
                                >
                                    <Anchor className="w-5 h-5" />
                                    <span>Open Web Bridge for Free</span>
                                </Link>
                                <a
                                    href="https://apps.apple.com/gb/app/navai-ai-maritime-assistant/id6757674541"
                                    className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                                >
                                    <Download className="w-5 h-5 text-maritime-teal" />
                                    <span>Get iOS App for Free</span>
                                </a>
                            </div>
                        </div>
                        <div className="w-48 h-48 bg-maritime-midnight rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center relative rotate-3 group-hover:rotate-0 transition-transform">
                            <div className="absolute inset-2 bg-gradient-to-br from-maritime-ocean/20 to-transparent rounded-2xl" />
                            <Bookmark className="w-12 h-12 text-maritime-teal opacity-50" />
                        </div>
                    </div>
                </div>
            </article>

            {/* Sticky Bottom CTA for Mobile */}
            <div className="md:hidden fixed bottom-6 left-6 right-6 z-40">
                <a
                    href="https://apps.apple.com/gb/app/navai-ai-maritime-assistant/id6757674541"
                    className="flex items-center justify-between w-full p-4 bg-maritime-orange text-maritime-midnight rounded-2xl font-bold shadow-2xl active:scale-95 transition-all"
                >
                    <span>Download App Store</span>
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                </a>
            </div>
        </main>
    );
}
