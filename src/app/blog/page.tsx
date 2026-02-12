import { getAllPosts } from "@/lib/blog";
import Link from "next/link";
import { Anchor, Clock, ArrowRight } from "lucide-react";

export const metadata = {
    title: "Maritime Blog | NavAI - Nautical Insights & Intelligence",
    description: "Stay ahead with the latest in maritime AI, navigation tutorials, and industry insights. NavAI blog for the modern mariner.",
};

export default function BlogPage() {
    const posts = getAllPosts();

    return (
        <main className="min-h-screen bg-maritime-midnight text-white font-sans selection:bg-maritime-orange/30 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] animate-pulse bg-gradient-to-bl from-maritime-ocean to-transparent blur-[120px]" />
            </div>

            <nav className="p-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Anchor className="w-5 h-5 text-maritime-orange group-hover:rotate-12 transition-transform" />
                        <span className="font-bold tracking-tight">NAVAI</span>
                    </Link>
                    <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-maritime-teal hover:text-white transition-colors">
                        Bridge Access
                    </Link>
                </div>
            </nav>

            <section className="pt-20 pb-32 px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-6xl font-light text-maritime-brass mb-6">
                        Bridge <span className="font-extrabold text-white">Insights</span>
                    </h1>
                    <p className="text-maritime-teal/60 text-lg font-light leading-relaxed">
                        Nautical intelligence, technology updates, and professional guides for the 21st-century officer.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="group flex flex-col bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden hover:border-maritime-orange/30 transition-all hover:-translate-y-2"
                        >
                            <div className="h-48 relative overflow-hidden bg-maritime-midnight">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 rounded-full bg-maritime-orange/20 border border-maritime-orange/30 text-maritime-orange text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest mb-4">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-maritime-orange transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-white/50 text-sm font-light leading-relaxed line-clamp-3 mb-6">
                                        {post.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-mono text-white/20">BY {post.author.toUpperCase()}</span>
                                    <div className="flex items-center gap-2 text-maritime-teal group-hover:translate-x-1 transition-transform">
                                        <span className="text-[10px] font-bold uppercase tracking-tighter">Read Full</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Footer CTA */}
            <section className="bg-maritime-ocean/5 border-y border-white/5 py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-3xl font-light text-white">Don't navigate <span className="text-maritime-orange font-bold italic">alone</span>.</h2>
                    <p className="text-white/60 font-light">Join thousands of captains using the most advanced AI bridge assistant on the web or in your pocket.</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-maritime-orange text-maritime-midnight rounded-2xl font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,165,0,0.3)]"
                        >
                            Open Web Bridge for Free
                        </Link>
                        <a
                            href="https://apps.apple.com/gb/app/navai-ai-maritime-assistant/id6757674541"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                        >
                            Get iOS App for Free
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
