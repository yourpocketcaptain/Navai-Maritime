"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Anchor, ArrowLeft, Loader2, BookOpen } from "lucide-react";
import { marked } from "marked";

interface LessonContent {
    title: string;
    category: string;
    content: string;
}

interface LessonViewProps {
    lessonId: string;
}

export default function LessonView({ lessonId }: LessonViewProps) {
    const { isClient, loading: authLoading } = useAuth();
    const router = useRouter();

    const [lesson, setLesson] = useState<LessonContent | null>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!authLoading && !isClient) {
            router.push("/login?role=client");
        } else if (isClient && lessonId) {
            fetchLessonContent();
        }
    }, [isClient, authLoading, lessonId, router]);

    const fetchLessonContent = async () => {
        setFetching(true);
        try {
            // Fetch root metadata
            const lessonRef = doc(db, "lessons", lessonId);
            const lessonSnap = await getDoc(lessonRef);

            if (!lessonSnap.exists()) {
                setLesson(null);
                return;
            }

            const lessonData = lessonSnap.data();

            // Fetch content from 'teoria' subcollection
            const teoriaRef = collection(db, "lessons", lessonId, "teoria");
            const teoriaSnap = await getDocs(teoriaRef);

            let content = "No content available for this lesson.";
            if (!teoriaSnap.empty) {
                const teoriaData = teoriaSnap.docs[0].data();
                content = teoriaData.content || teoriaData.text || teoriaData.teoria || "";
            }

            setLesson({
                title: lessonData.title || "Untitled Lesson",
                category: lessonData.category || "General",
                content: content
            });
        } catch (error) {
            console.error("Error fetching lesson detail:", error);
        } finally {
            setFetching(false);
        }
    };

    if (authLoading || !isClient) {
        return (
            <div className="min-h-screen bg-maritime-midnight flex items-center justify-center">
                <div className="animate-spin text-maritime-ocean">
                    <Anchor className="w-8 h-8" />
                </div>
            </div>
        );
    }

    if (!fetching && !lesson) {
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
                    <article className="glass border border-white/10 rounded-[3rem] p-8 md:p-16 space-y-12 backdrop-blur-xl bg-white/[0.02]">
                        {/* Header */}
                        <div className="space-y-6 border-b border-white/10 pb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-maritime-orange/30 bg-maritime-orange/5 text-maritime-orange text-[10px] uppercase tracking-widest font-bold">
                                <BookOpen className="w-3 h-3" />
                                <span>{lesson?.category}</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-light text-maritime-brass leading-tight uppercase tracking-tight">
                                {lesson?.title}
                            </h1>
                        </div>

                        {/* Content */}
                        <div
                            className="prose prose-invert prose-maritime max-w-none text-maritime-clean leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: marked(lesson?.content || "") }}
                        />
                    </article>
                )}
            </div>

            {/* Injected CSS for Markdown Styles */}
            <style jsx global>{`
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
