"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Anchor, ArrowLeft, Loader2, BookOpen, FileText, ExternalLink, Search } from "lucide-react";
import { marked } from "marked";

interface LessonContent {
    title: string;
    category: string;
    content: string;
    pdfUrl?: string;
}

interface LessonViewProps {
    lessonId: string;
}

export default function LessonView({ lessonId }: LessonViewProps) {
    const { isClient, loading: authLoading } = useAuth();
    const router = useRouter();

    const [lesson, setLesson] = useState<LessonContent | null>(null);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [matchCount, setMatchCount] = useState(0);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

    // Highlight Logic
    const getHighlightedContent = () => {
        if (!lesson?.content) return "";
        const html = marked(lesson.content);
        if (!searchTerm || searchTerm.length < 2) return html;

        try {
            const term = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${term})(?![^<]*>)`, 'gi');
            // Add id to each match for navigation
            let count = 0;
            // @ts-ignore
            return (html as string).replace(regex, (match) => {
                count++;
                return `<mark id="match-${count}" class="highlight-match">${match}</mark>`;
            });
        } catch (e) {
            console.warn("Highlight regex error:", e);
            // @ts-ignore
            return html as string;
        }
    };

    // Scroll to match logic
    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) {
            setMatchCount(0);
            setCurrentMatchIndex(0);
            return;
        }

        // Wait for render
        setTimeout(() => {
            const matches = document.getElementsByClassName('highlight-match');
            setMatchCount(matches.length);
            if (matches.length > 0) {
                setCurrentMatchIndex(1);
                matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }, [searchTerm, lesson]);

    const scrollToMatch = (index: number) => {
        if (index < 1 || index > matchCount) return;
        setCurrentMatchIndex(index);
        const element = document.getElementById(`match-${index}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    if (authLoading || !isClient) {
        // ... (keep existing loading)
        return (
            <div className="min-h-screen bg-maritime-midnight flex items-center justify-center">
                <div className="animate-spin text-maritime-ocean">
                    <Anchor className="w-8 h-8" />
                </div>
            </div>
        );
    }

    if (!fetching && !lesson) {
        // ... (keep existing not found)
        return (
            <div className="min-h-screen bg-maritime-midnight text-white flex flex-col items-center justify-center p-6 space-y-6">
                <div className="text-maritime-orange">
                    <Anchor className="w-12 h-12" />
                </div>
                <h1 className="text-2xl font-bold text-maritime-brass">Signal Lost</h1>
                <p className="text-white/40">The requested intelligence node could not be found.</p>
                <button
                    onClick={() => router.push("/client/academy")}
                    className="px-6 py-2 bg-maritime-ocean text-maritime-midnight rounded-xl font-bold"
                >
                    Return to Academy
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-maritime-midnight text-white pt-24 px-6 md:px-12 pb-24">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Navigation */}
                <button
                    onClick={() => router.push("/client/academy")}
                    className="group flex items-center gap-2 text-maritime-teal/60 hover:text-maritime-teal transition-colors text-xs uppercase tracking-[0.2em]"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Catalog
                </button>

                {fetching ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="w-8 h-8 animate-spin text-maritime-ocean/50" />
                    </div>
                ) : (
                    <article className="glass border border-white/10 rounded-[3rem] p-8 md:p-16 space-y-12 backdrop-blur-xl bg-white/[0.02] relative">
                        {/* Header */}
                        <div className="space-y-6 border-b border-white/10 pb-12">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-maritime-orange/30 bg-maritime-orange/5 text-maritime-orange text-[10px] uppercase tracking-widest font-bold">
                                    <BookOpen className="w-3 h-3" />
                                    <span>{lesson?.category}</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-light text-maritime-brass leading-tight uppercase tracking-tight">
                                    {lesson?.title}
                                </h1>
                            </div>
                        </div>

                        {/* Sticky Search Bar */}
                        <div className="sticky top-24 z-50 -mx-4 md:-mx-8 px-4 md:px-8 py-4 pointer-events-none">
                            <div className="max-w-md mx-auto relative group pointer-events-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-maritime-teal/40 group-focus-within:text-maritime-teal transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search in lesson..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-maritime-midnight/80 backdrop-blur-xl border border-white/20 rounded-2xl pl-12 pr-32 py-3 text-sm focus:outline-none focus:border-maritime-teal/50 transition-all placeholder:text-white/40 text-maritime-teal shadow-xl"
                                />

                                {matchCount > 0 && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                        <span className="text-[10px] text-white/40 px-2">
                                            {currentMatchIndex}/{matchCount}
                                        </span>
                                        <button
                                            onClick={() => scrollToMatch(currentMatchIndex - 1 < 1 ? matchCount : currentMatchIndex - 1)}
                                            className="p-1 hover:bg-white/10 rounded text-maritime-teal"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => scrollToMatch(currentMatchIndex + 1 > matchCount ? 1 : currentMatchIndex + 1)}
                                            className="p-1 hover:bg-white/10 rounded text-maritime-teal"
                                        >
                                            ↓
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {lesson?.pdfUrl && (
                            <div className="mb-8">
                                <a
                                    href={lesson.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-4 bg-maritime-ocean/10 border border-maritime-ocean/30 rounded-xl hover:bg-maritime-ocean/20 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-maritime-ocean/20 rounded-lg text-maritime-ocean group-hover:scale-110 transition-transform">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-maritime-ocean">Associated Documentation</h4>
                                            <p className="text-xs text-white/50">Official PDF Reference Material</p>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-maritime-ocean/50 group-hover:text-maritime-ocean transition-colors" />
                                </a>
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="prose prose-invert prose-maritime max-w-none text-maritime-clean leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
                        />
                    </article>
                )}
            </div>

            {/* Injected CSS for Markdown Styles & Highlights */}
            <style jsx global>{`
                mark {
                    background-color: rgba(255, 165, 0, 0.3);
                    color: #fb923c;
                    border-radius: 4px;
                    padding: 0 2px;
                    font-weight: bold;
                    transition: all 0.3s;
                }
                mark.current-match {
                    background-color: rgba(0, 180, 216, 0.4);
                    color: #fff;
                    box-shadow: 0 0 10px rgba(0, 180, 216, 0.5);
                }
                .prose-maritime h1, .prose-maritime h2, .prose-maritime h3 {
                    color: #D4AF37; /* Brass */
                    margin-top: 2em;
                    margin-bottom: 0.5em;
                }
                .prose-maritime p {
                    margin-bottom: 1.5em;
                    color: rgba(255, 255, 255, 0.85);
                }
                .prose-maritime ul, .prose-maritime ol {
                    margin-bottom: 1.5em;
                    padding-left: 1.5em;
                }
                .prose-maritime li {
                    margin-bottom: 0.5em;
                    padding-left: 1.5em;
                }
                .prose-maritime blockquote {
                    border-left: 4px solid #00B4D8; /* Ocean */
                    background: rgba(0, 180, 216, 0.05);
                    padding: 1rem 2rem;
                    border-radius: 0.5rem;
                    font-style: italic;
                    margin: 2rem 0;
                }
                .prose-maritime strong {
                    color: #00B4D8;
                }
            `}</style>
        </main>
    );
}
