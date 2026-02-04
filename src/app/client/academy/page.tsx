"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, DocumentReference } from "firebase/firestore";
import { Anchor, ArrowLeft, Loader2, Search, GraduationCap, ChevronRight, BookOpen, Layers, HelpCircle, Lock, FileText, ExternalLink } from "lucide-react";
import { marked } from "marked";

interface Category {
    id: string;
    name: string;
    description: string;
    icon: string;
    order: number;
    freeforcadet?: boolean;
    isVirtual?: boolean;
}

interface Lesson {
    id: string;
    title: string;
    category: string;
    categoryref?: DocumentReference | string;
    order: number;
}

interface LessonDetail extends Lesson {
    content: string;
    pdfUrl?: string;
}

export default function ClientAcademyPage() {
    const { isClient, rank, loading: authLoading } = useAuth();
    const router = useRouter();

    // View State
    const [view, setView] = useState<"categories" | "lessons" | "detail">("categories");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

    // Data State
    const [categories, setCategories] = useState<Category[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);
    const [fetching, setFetching] = useState(true);
    const [fetchingDetail, setFetchingDetail] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Lesson Search State
    const [lessonSearchTerm, setLessonSearchTerm] = useState("");
    const [matchCount, setMatchCount] = useState(0);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

    // Highlight Logic
    const getHighlightedLessonContent = () => {
        if (!lessonDetail?.content) return "";
        const html = marked(lessonDetail.content);
        if (!lessonSearchTerm || lessonSearchTerm.length < 2) return html;

        try {
            const term = lessonSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${term})(?![^<]*>)`, 'gi');
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
        if (!lessonSearchTerm || lessonSearchTerm.length < 2) {
            setMatchCount(0);
            setCurrentMatchIndex(0);
            return;
        }

        setTimeout(() => {
            const matches = document.getElementsByClassName('highlight-match');
            setMatchCount(matches.length);
            if (matches.length > 0) {
                setCurrentMatchIndex(1);
                matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }, [lessonSearchTerm, lessonDetail]);

    const scrollToMatch = (index: number) => {
        if (index < 1 || index > matchCount) return;
        setCurrentMatchIndex(index);
        const element = document.getElementById(`match-${index}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    useEffect(() => {
        if (!authLoading && !isClient) {
            router.push("/login?role=client");
        } else if (isClient) {
            fetchAllData();
        }
    }, [isClient, authLoading, router]);

    const fetchAllData = async () => {
        // ... (keep existing fetchAllData)
        setFetching(true);
        try {
            // 1. Fetch official Categories (Ordered by 'order' as in the app)
            const catQ = query(collection(db, "studycategories"), orderBy("order", "asc"));
            const catSnap = await getDocs(catQ);
            const officialCategories = catSnap.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || "",
                description: doc.data().description || doc.data().content || "",
                icon: doc.data().icon || "",
                order: doc.data().order || 0,
                freeforcadet: doc.data().freeforcadet ?? false
            })) as Category[];

            // 2. Fetch all Lessons metadata
            const lessonQ = query(collection(db, "lessons"), orderBy("order", "asc"));
            const lessonSnap = await getDocs(lessonQ);

            const lessonsData = lessonSnap.docs.map(docSnap => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    title: data.title || "",
                    category: data.category || "",
                    categoryref: data.categoryref,
                    order: data.order || 0
                };
            }) as Lesson[];
            setLessons(lessonsData);

            // 3. Resolve "Virtual" categories
            const officialIds = new Set(officialCategories.map(c => c.id));
            const officialNames = new Set(officialCategories.map(c => c.name.toLowerCase()));

            const extraCategories: Category[] = [];

            lessonsData.forEach(lesson => {
                let found = false;
                if (lesson.categoryref && typeof lesson.categoryref !== 'string') {
                    if (officialIds.has(lesson.categoryref.id)) found = true;
                }
                if (!found && lesson.category) {
                    if (officialNames.has(lesson.category.toLowerCase())) found = true;
                }

                if (!found && lesson.category) {
                    const virtualId = `virtual-${lesson.category.toLowerCase().replace(/\s+/g, '-')}`;
                    if (!extraCategories.find(c => c.id === virtualId)) {
                        extraCategories.push({
                            id: virtualId,
                            name: lesson.category,
                            description: `Maritime modules under ${lesson.category} classification.`,
                            icon: "HelpCircle",
                            order: 999, // Append at the end
                            freeforcadet: true,
                            isVirtual: true
                        });
                    }
                }
            });

            // Combine
            const allCategories = [...officialCategories, ...extraCategories];
            // Sort by order
            allCategories.sort((a, b) => (a.order || 0) - (b.order || 0));

            setCategories(allCategories);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setFetching(false);
        }
    };

    const handleSelectCategory = (category: Category) => {
        const isLocked = rank === "cadet" && !category.freeforcadet;
        if (isLocked) {
            alert("This category is exclusive for Captain rank. Please level up to access.");
            return;
        }
        setSelectedCategoryId(category.id);
        setSelectedCategoryName(category.name);
        setView("lessons");
        setSearchTerm("");
        setLessonSearchTerm(""); // Reset lesson search
    };

    const handleOpenLesson = async (lesson: Lesson) => {
        setFetchingDetail(true);
        setView("detail");
        setLessonSearchTerm(""); // Reset lesson search
        try {
            const teoriaRef = collection(db, "lessons", lesson.id, "teoria");
            const teoriaSnap = await getDocs(teoriaRef);
            let content = "No content available.";
            let pdfUrl: string | undefined;

            if (!teoriaSnap.empty) {
                const data = teoriaSnap.docs[0].data();
                content = data.content || data.text || data.teoria || "";
                pdfUrl = data.pdfUrl || data.pdf || data.file || data.url || data.attachment;
            }
            setLessonDetail({ ...lesson, content, pdfUrl });
        } catch (error) {
            console.error("Error fetching detail:", error);
        } finally {
            setFetchingDetail(false);
        }
    };

    const handleBack = () => {
        if (view === "detail") { setView("lessons"); setLessonDetail(null); setLessonSearchTerm(""); }
        else if (view === "lessons") { setView("categories"); setSelectedCategoryId(null); setSelectedCategoryName(null); }
        else { router.push("/client"); }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLessons = lessons.filter(l => {
        if (l.categoryref && typeof l.categoryref !== 'string' && l.categoryref.id === selectedCategoryId) return true;
        const virtualId = `virtual-${l.category.toLowerCase().replace(/\s+/g, '-')}`;
        if (virtualId === selectedCategoryId) return true;
        if (l.category.toLowerCase() === selectedCategoryName?.toLowerCase()) return true;
        return false;
    }).filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (authLoading || !isClient) {
        return (
            <div className="min-h-screen bg-maritime-midnight flex items-center justify-center">
                <div className="animate-spin text-maritime-ocean"><Anchor className="w-8 h-8" /></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-maritime-midnight text-white pt-24 px-6 md:px-12 pb-24">
            <div className="max-w-6xl mx-auto space-y-8">
                <button onClick={handleBack} className="group flex items-center gap-2 text-maritime-teal/60 hover:text-maritime-teal transition-colors text-xs uppercase tracking-[0.2em]">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    {view === "categories" ? "Exit Academy" : view === "lessons" ? "Back to Categories" : "Back to Module List"}
                </button>

                {view === "categories" ? (
                    <>
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-maritime-ocean/30 bg-maritime-ocean/5 text-maritime-teal text-[10px] uppercase tracking-widest font-bold">
                                <GraduationCap className="w-3 h-3" />
                                <span>{rank === 'captain' ? 'CAPTAIN PRIVILEGES' : 'CADET CURRICULUM'}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-light text-maritime-brass">
                                Study <span className="font-extrabold text-maritime-ocean italic">Modules</span>
                            </h1>
                        </div>

                        <div className="relative group max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-maritime-teal/40 group-focus-within:text-maritime-ocean transition-colors" />
                            <input
                                type="text"
                                placeholder="Search modules..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-maritime-ocean transition-all backdrop-blur-md"
                            />
                        </div>

                        {fetching ? (
                            <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-maritime-ocean/50" /></div>
                        ) : (
                            <div className="space-y-16">
                                {/* Level 1: Cadet */}
                                {filteredCategories.filter(c => c.freeforcadet).length > 0 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-light text-maritime-teal border-b border-white/10 pb-4 flex items-center gap-3">
                                            <span className="text-3xl">🌊</span> Level 1: The Global Sailor (Cadet)
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredCategories.filter(c => c.freeforcadet).map((cat) => {
                                                const isLocked = rank === "cadet" && !cat.freeforcadet;
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => handleSelectCategory(cat)}
                                                        className={`glass border border-white/10 rounded-[2.5rem] p-8 text-left group transition-all relative overflow-hidden ${isLocked ? 'opacity-60 grayscale-[0.5] cursor-not-allowed' : 'hover:border-maritime-ocean/50 hover:scale-[1.02]'}`}
                                                    >
                                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                                            {isLocked ? <Lock className="w-24 h-24" /> : <Layers className="w-24 h-24" />}
                                                        </div>
                                                        <div className="space-y-4 relative z-10">
                                                            <div className={`p-4 rounded-2xl inline-block transition-colors ${isLocked ? 'bg-white/5 text-white/20' : 'bg-maritime-ocean/10 text-maritime-ocean group-hover:bg-maritime-ocean group-hover:text-maritime-midnight'}`}>
                                                                {isLocked ? <Lock className="w-8 h-8" /> : <Layers className="w-8 h-8" />}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h3 className={`text-2xl font-bold transition-colors ${isLocked ? 'text-white/40' : 'text-maritime-brass group-hover:text-maritime-teal'}`}>
                                                                    {cat.name}
                                                                </h3>
                                                                <p className="text-xs text-white/40 line-clamp-2 font-light leading-relaxed">
                                                                    {isLocked ? "This specialized briefing is reserved for Captain rank." : cat.description}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-maritime-teal/40 group-hover:text-maritime-teal transition-all">
                                                                {isLocked ? "Promotion Required" : "Open Curriculum"} <ChevronRight className="w-4 h-4 ml-1" />
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Level 2: Captain */}
                                {filteredCategories.filter(c => !c.freeforcadet).length > 0 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-light text-maritime-brass border-b border-white/10 pb-4 flex items-center gap-3">
                                            <span className="text-3xl">⚓</span> Level 2: The Captain (Captain)
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredCategories.filter(c => !c.freeforcadet).map((cat) => {
                                                const isLocked = rank === "cadet" && !cat.freeforcadet;
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => handleSelectCategory(cat)}
                                                        className={`glass border border-white/10 rounded-[2.5rem] p-8 text-left group transition-all relative overflow-hidden ${isLocked ? 'opacity-60 grayscale-[0.5] cursor-not-allowed' : 'hover:border-maritime-ocean/50 hover:scale-[1.02]'}`}
                                                    >
                                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                                            {isLocked ? <Lock className="w-24 h-24" /> : <Layers className="w-24 h-24" />}
                                                        </div>
                                                        <div className="space-y-4 relative z-10">
                                                            <div className={`p-4 rounded-2xl inline-block transition-colors ${isLocked ? 'bg-white/5 text-white/20' : 'bg-maritime-ocean/10 text-maritime-ocean group-hover:bg-maritime-ocean group-hover:text-maritime-midnight'}`}>
                                                                {isLocked ? <Lock className="w-8 h-8" /> : <Layers className="w-8 h-8" />}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h3 className={`text-2xl font-bold transition-colors ${isLocked ? 'text-white/40' : 'text-maritime-brass group-hover:text-maritime-teal'}`}>
                                                                    {cat.name}
                                                                </h3>
                                                                <p className="text-xs text-white/40 line-clamp-2 font-light leading-relaxed">
                                                                    {isLocked ? "This specialized briefing is reserved for Captain rank." : cat.description}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-maritime-teal/40 group-hover:text-maritime-teal transition-all">
                                                                {isLocked ? "Promotion Required" : "Open Curriculum"} <ChevronRight className="w-4 h-4 ml-1" />
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : view === "lessons" ? (
                    <>
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-maritime-orange/30 bg-maritime-orange/5 text-maritime-orange text-[10px] uppercase tracking-widest font-bold">
                                <Layers className="w-3 h-3" />
                                <span>{selectedCategoryName}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-light text-maritime-brass">Section <span className="font-extrabold text-maritime-ocean italic">Knowledge</span></h1>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredLessons.map((lesson) => (
                                <button key={lesson.id} onClick={() => handleOpenLesson(lesson)} className="glass border border-white/10 rounded-2xl p-6 text-left group hover:border-maritime-ocean/50 transition-all flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-mono text-maritime-ocean uppercase tracking-tighter">Module 0{lesson.order}</div>
                                        <h3 className="font-bold text-maritime-brass text-lg group-hover:text-maritime-teal transition-colors">{lesson.title}</h3>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-maritime-ocean group-hover:text-maritime-midnight transition-all"><ChevronRight className="w-5 h-5" /></div>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {fetchingDetail ? (
                            <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-maritime-ocean/50" /></div>
                        ) : (
                            <article className="glass border border-white/10 rounded-[3rem] p-8 md:p-16 space-y-12 backdrop-blur-xl bg-white/[0.02] relative">
                                <div className="space-y-6 border-b border-white/10 pb-12">
                                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-maritime-orange/30 bg-maritime-orange/5 text-maritime-orange text-[10px] uppercase tracking-widest font-bold">
                                        <BookOpen className="w-3 h-3" /> <span>{lessonDetail?.category}</span>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-light text-maritime-brass leading-tight uppercase tracking-tight">{lessonDetail?.title}</h1>
                                </div>

                                {/* Sticky Search Bar In-Lesson */}
                                <div className="sticky top-24 z-50 -mx-4 md:-mx-8 px-4 md:px-8 py-4 pointer-events-none">
                                    <div className="max-w-md mx-auto relative group pointer-events-auto">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-maritime-teal/40 group-focus-within:text-maritime-teal transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Search in lesson..."
                                            value={lessonSearchTerm}
                                            onChange={(e) => setLessonSearchTerm(e.target.value)}
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

                                {lessonDetail?.pdfUrl && (
                                    <div className="mb-8">
                                        <a
                                            href={lessonDetail.pdfUrl}
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
                                <div className="prose prose-invert prose-maritime max-w-none text-white/80 leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: getHighlightedLessonContent() }} />
                            </article>
                        )}
                    </div>
                )}
            </div>
            <style jsx global>{`
                mark.highlight-match {
                    background-color: rgba(255, 165, 0, 0.3);
                    color: #fb923c;
                    border-radius: 4px;
                    padding: 0 2px;
                    font-weight: bold;
                    transition: all 0.3s;
                }
                .prose-maritime h1, .prose-maritime h2, .prose-maritime h3 { color: #D4AF37; margin-top: 2.5em; margin-bottom: 0.8em; font-weight: 800; letter-spacing: -0.02em; text-transform: uppercase; }
                .prose-maritime h2 { font-size: 1.5rem; border-left: 3px solid #00B4D8; padding-left: 1rem; }
                .prose-maritime p { margin-bottom: 1.8em; font-size: 1.05rem; }
                .prose-maritime ul, .prose-maritime ol { margin-bottom: 2em; padding-left: 1.5em; }
                .prose-maritime li { margin-bottom: 0.8em; }
                .prose-maritime blockquote { border-left: 4px solid #00B4D8; background: rgba(0, 180, 216, 0.05); padding: 1.5rem 2.5rem; border-radius: 1rem; font-style: italic; margin: 2.5rem 0; color: #00B4D8; }
                .prose-maritime strong { color: #00B4D8; font-weight: 700; }
                .prose-maritime hr { border-color: rgba(255,255,255,0.05); margin: 3rem 0; }
            `}</style>
        </main>
    );
}

