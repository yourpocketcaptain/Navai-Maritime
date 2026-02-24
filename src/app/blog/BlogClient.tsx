"use client";

import Link from "next/link";
import { Anchor, Clock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { BlogPost } from "@/lib/blog";

interface BlogClientProps {
    enPosts: BlogPost[];
    esPosts: BlogPost[];
}

export default function BlogClient({ enPosts, esPosts }: BlogClientProps) {
    const { language, t } = useLanguage();
    const posts = language === "en" ? enPosts : esPosts;

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
                        {t.nav.login}
                    </Link>
                </div>
            </nav>

            <section className="pt-20 pb-32 px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-6xl font-light text-maritime-brass mb-6">
                        {t.blog.title} <span className="font-extrabold text-white">{t.blog.subtitle}</span>
                    </h1>
                    <p className="text-maritime-teal/60 text-lg font-light leading-relaxed">
                        {language === 'en'
                            ? "Nautical intelligence, technology updates, and professional guides for the 21st-century officer."
                            : "Inteligencia náutica, actualizaciones tecnológicas y guías profesionales para el oficial del siglo XXI."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <Link
                                key={post.slug}
                                href={language === 'en' ? `/blog/${post.slug}` : `/blog/es/${post.slug}`}
                                className="group flex flex-col bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden hover:border-maritime-orange/30 transition-all hover:-translate-y-2"
                            >
                                <div className="h-48 relative overflow-hidden bg-maritime-midnight">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
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
                                            <span>{new Date(post.date).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <h2 className="text-xl font-bold text-white mb-3 group-hover:text-maritime-orange transition-colors">
                                            {post.title}
                                        </h2>
                                        <p className="text-white/50 text-sm font-light leading-relaxed line-clamp-3 mb-6">
                                            {post.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-[10px] font-mono text-white/20">BY {post.author?.toUpperCase() || 'NAVAI'}</span>
                                        <div className="flex items-center gap-2 text-maritime-teal group-hover:translate-x-1 transition-transform">
                                            <span className="text-[10px] font-bold uppercase tracking-tighter">{t.blog.cta}</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-white/40 font-light">
                            {language === 'en' ? 'No posts found for this language.' : 'No se encontraron publicaciones para este idioma.'}
                        </div>
                    )}
                </div>
            </section>

            {/* Footer CTA */}
            <section className="bg-maritime-ocean/5 border-y border-white/5 py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-3xl font-light text-white">
                        {language === 'en' ? "Don't navigate " : "No navegues "}
                        <span className="text-maritime-orange font-bold italic">{language === 'en' ? "alone" : "solo"}</span>.
                    </h2>
                    <p className="text-white/60 font-light">
                        {language === 'en'
                            ? "Join thousands of captains using the most advanced AI bridge assistant on the web or in your pocket."
                            : "Únete a miles de capitanes que utilizan el asistente de puente con IA más avanzado en la web o en su bolsillo."}
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-maritime-orange text-maritime-midnight rounded-2xl font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,165,0,0.3)]"
                        >
                            {language === 'en' ? "Open Web Bridge for Free" : "Abrir Puente Web Gratis"}
                        </Link>
                        <a
                            href="https://apps.apple.com/gb/app/navai-ai-maritime-assistant/id6757674541"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                        >
                            {language === 'en' ? "Get iOS App for Free" : "Obtener App iOS Gratis"}
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
