"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Anchor, ArrowLeft, Send, Save, Loader2, Plus, Edit2, Trash2, Search, FileText, Upload } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

interface Lesson {
    id: string;
    title: string;
    content?: string; // Content is now fetched lazily from subcollection
    category: string;
    order: number;
    teoriaDocId?: string; // ID of the doc inside 'teoria' subcollection
}

export default function ManageLessonsPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    // UI States
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<"list" | "form">("list");

    // Data States
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);

    // Form states
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [order, setOrder] = useState(0);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && (!user || !isAdmin)) {
            router.push("/login");
        } else if (user && isAdmin) {
            fetchLessons();
            fetchCategories();
        }
    }, [user, isAdmin, authLoading, router]);

    const fetchCategories = async () => {
        try {
            const q = query(collection(db, "studycategories"), orderBy("name", "asc"));
            const querySnapshot = await getDocs(q);
            const names = querySnapshot.docs.map(doc => doc.data().name);
            setAvailableCategories(names.filter(Boolean));
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchLessons = async () => {
        setFetching(true);
        try {
            const q = query(collection(db, "lessons"), orderBy("order", "asc"));
            const querySnapshot = await getDocs(q);
            const lessonsData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title || "",
                    category: data.category || "",
                    order: data.order || 0
                };
            }) as Lesson[];
            setLessons(lessonsData);
        } catch (error) {
            console.error("Error fetching lessons:", error);
        } finally {
            setFetching(false);
        }
    };

    const [teoriaDocId, setTeoriaDocId] = useState<string | null>(null);

    const handleEdit = async (lesson: Lesson) => {
        setLoading(true);
        setEditingId(lesson.id);
        setTitle(lesson.title);
        setCategory(lesson.category);
        setOrder(lesson.order);

        try {
            // Fetch content from 'teoria' subcollection
            const teoriaRef = collection(db, "lessons", lesson.id, "teoria");
            const teoriaSnap = await getDocs(teoriaRef);

            if (!teoriaSnap.empty) {
                const teoriaDoc = teoriaSnap.docs[0];
                const teoriaData = teoriaDoc.data();
                setTeoriaDocId(teoriaDoc.id);
                // Try different common field names for content
                setContent(teoriaData.content || teoriaData.text || teoriaData.teoria || teoriaData.description || "");
                setPdfUrl(teoriaData.pdfUrl || teoriaData.pdf || teoriaData.file || teoriaData.url || teoriaData.attachment || null);
            } else {
                setTeoriaDocId(null);
                setContent("");
                setPdfUrl(null);
            }

            setActiveTab("form");
        } catch (error) {
            console.error("Error fetching teoria subcollection:", error);
            alert("Could not load lesson content from 'teoria' subcollection.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setEditingId(null);
        setTeoriaDocId(null);
        setTitle("");
        setContent("");
        setCategory("");
        setCategory("");
        setOrder(lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) + 1 : 1);
        setPdfFile(null);
        setPdfUrl(null);
        setActiveTab("form");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this lesson? This action is irreversible.")) return;

        try {
            await deleteDoc(doc(db, "lessons", id));
            setLessons(prev => prev.filter(l => l.id !== id));
        } catch (error) {
            console.error("Error deleting lesson:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const lessonData = {
                title,
                category,
                order: Number(order),
                updatedAt: serverTimestamp(),
            };

            const teoriaData = {
                content,
                text: content, // Save as both for compatibility
                teoria: content,
                updatedAt: serverTimestamp(),
            };

            let currentLessonId = editingId;
            let uploadedPdfUrl = pdfUrl;

            // Handle PDF Upload if file selected
            if (pdfFile) {
                const storageRef = ref(storage, `pdfs/${Date.now()}_${pdfFile.name}`);
                const snapshot = await uploadBytes(storageRef, pdfFile);
                uploadedPdfUrl = await getDownloadURL(snapshot.ref);
            }

            if (editingId) {
                // Update root lesson
                await updateDoc(doc(db, "lessons", editingId), lessonData);

                const updatedTeoriaData = {
                    ...teoriaData,
                    pdfUrl: uploadedPdfUrl
                };

                // Update or create doc in 'teoria' subcollection
                if (teoriaDocId) {
                    await updateDoc(doc(db, "lessons", editingId, "teoria", teoriaDocId), updatedTeoriaData);
                } else {
                    await addDoc(collection(db, "lessons", editingId, "teoria"), {
                        ...updatedTeoriaData,
                        createdAt: serverTimestamp(),
                    });
                }
            } else {
                // Create new root lesson
                const newDoc = await addDoc(collection(db, "lessons"), {
                    ...lessonData,
                    createdAt: serverTimestamp(),
                    author: user?.email,
                });
                currentLessonId = newDoc.id;

                const newTeoriaData = {
                    ...teoriaData,
                    pdfUrl: uploadedPdfUrl
                };

                // Create doc in 'teoria' subcollection
                await addDoc(collection(db, "lessons", currentLessonId, "teoria"), {
                    ...newTeoriaData,
                    createdAt: serverTimestamp(),
                });
            }

            setSuccess(true);
            await fetchLessons();

            setTimeout(() => {
                setSuccess(false);
                setActiveTab("list");
            }, 1500);
        } catch (error) {
            console.error("Error saving lesson:", error);
            alert("Error saving lesson. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const filteredLessons = lessons.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || !user || !isAdmin) {
        return (
            <div className="min-h-screen bg-maritime-midnight flex items-center justify-center">
                <div className="animate-spin text-maritime-ocean">
                    <Anchor className="w-8 h-8" />
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-maritime-midnight text-white pt-24 px-6 md:px-12 pb-24">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Navigation & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <button
                        onClick={() => router.push("/admin")}
                        className="group flex items-center gap-2 text-maritime-teal/60 hover:text-maritime-teal transition-colors text-xs uppercase tracking-[0.2em]"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Return to Bridge
                    </button>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab("list")}
                            className={`px-6 py-2 rounded-xl text-xs uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-maritime-ocean text-maritime-midnight font-bold' : 'bg-white/5 hover:bg-white/10 text-maritime-teal/60'}`}
                        >
                            List Lessons
                        </button>
                        <button
                            onClick={handleAddNew}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs uppercase tracking-widest transition-all ${activeTab === 'form' && !editingId ? 'bg-maritime-ocean text-maritime-midnight font-bold' : 'bg-white/5 hover:bg-white/10 text-maritime-teal/60'}`}
                        >
                            <Plus className="w-3 h-3" />
                            New Lesson
                        </button>
                    </div>
                </div>

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-light text-maritime-brass">
                        {activeTab === 'list' ? 'Lesson' : editingId ? 'Edit' : 'New'} <span className="font-extrabold text-maritime-ocean italic">{activeTab === 'list' ? 'Inventory' : 'Lesson'}</span>
                    </h1>
                    <p className="text-maritime-teal/60 text-sm">
                        {activeTab === 'list' ? 'Managing structural maritime intelligence.' : 'Drafting intellectual payload for the network.'}
                    </p>
                </div>

                {activeTab === "list" ? (
                    <div className="space-y-6">
                        {/* Search Bar */}
                        <div className="relative group max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-maritime-teal/40 group-focus-within:text-maritime-ocean transition-colors" />
                            <input
                                type="text"
                                placeholder="Search lessons or categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-maritime-ocean transition-all placeholder:text-white/10"
                            />
                        </div>

                        {/* List Grid */}
                        {fetching ? (
                            <div className="flex justify-center py-24">
                                <Loader2 className="w-8 h-8 animate-spin text-maritime-ocean/50" />
                            </div>
                        ) : filteredLessons.length === 0 ? (
                            <div className="glass border border-white/5 rounded-[2.5rem] p-24 text-center space-y-4">
                                <div className="text-maritime-teal/20 flex justify-center">
                                    <Anchor className="w-12 h-12" />
                                </div>
                                <p className="text-maritime-teal/40 font-mono text-xs uppercase tracking-widest">No signals found in this sector</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredLessons.map((lesson) => (
                                    <div key={lesson.id} className="glass border border-white/10 rounded-3xl p-6 flex justify-between items-center group hover:border-maritime-ocean/30 transition-all">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-mono text-maritime-ocean bg-maritime-ocean/10 px-2 py-0.5 rounded">#{lesson.order}</span>
                                                <h3 className="font-bold text-maritime-brass group-hover:text-maritime-teal transition-colors">{lesson.title}</h3>
                                            </div>
                                            <p className="text-[10px] uppercase tracking-widest text-white/30">{lesson.category}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(lesson)}
                                                className="p-3 bg-white/5 hover:bg-maritime-teal hover:text-maritime-midnight rounded-xl transition-all"
                                                title="Edit Lesson"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(lesson.id)}
                                                className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all"
                                                title="Delete Lesson"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Form Unified Add/Edit */
                    <form onSubmit={handleSubmit} className="glass border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-widest text-maritime-orange font-bold">Lesson Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Navigation in Heavy Seas"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-maritime-ocean transition-colors"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-widest text-maritime-orange font-bold">Category</label>
                                <select
                                    required
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-maritime-ocean transition-colors appearance-none"
                                >
                                    <option value="" disabled className="bg-maritime-midnight">Select a category...</option>
                                    {availableCategories.length > 0 ? (
                                        availableCategories.map(cat => (
                                            <option key={cat} value={cat} className="bg-maritime-midnight">{cat}</option>
                                        ))
                                    ) : (
                                        <option value="General" className="bg-maritime-midnight">General (Default)</option>
                                    )}
                                    <option value="Other" className="bg-maritime-midnight">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-widest text-maritime-orange font-bold">Lesson Content (Visual Editor)</label>
                            <RichTextEditor
                                value={content}
                                onChange={setContent}
                                placeholder="Write your lesson content here... Bold, lists, and headers are supported."
                            />
                            <p className="text-[9px] text-white/20 italic">Content is automatically converted to Markdown for app compatibility.</p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-widest text-maritime-orange font-bold">PDF Material (Optional)</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                    <Upload className="w-4 h-4 text-maritime-teal" />
                                    <span className="text-sm text-white/60">{pdfFile ? pdfFile.name : "Upload PDF"}</span>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                </label>
                                {pdfUrl && !pdfFile && (
                                    <div className="flex items-center gap-2 px-4 py-3 bg-maritime-ocean/10 border border-maritime-ocean/30 rounded-xl">
                                        <FileText className="w-4 h-4 text-maritime-ocean" />
                                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-maritime-ocean hover:underline">
                                            Current PDF
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-widest text-maritime-orange font-bold">Curriculum Order</label>
                                <input
                                    type="number"
                                    required
                                    value={order}
                                    onChange={(e) => setOrder(Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-maritime-ocean transition-colors"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("list")}
                                    className="flex-1 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold transition-all hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] flex items-center justify-center gap-3 px-8 py-4 bg-maritime-ocean text-maritime-midnight rounded-2xl font-bold transition-all hover:scale-105 hover:bg-maritime-teal disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-maritime-ocean/20"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    {loading ? "Transmitting..." : editingId ? "Save Changes" : "Initialize Lesson"}
                                </button>
                            </div>
                        </div>

                        {success && (
                            <div className="p-4 bg-maritime-teal/10 border border-maritime-teal/30 rounded-xl text-maritime-teal text-center text-sm flex items-center justify-center gap-2 animate-bounce">
                                <Send className="w-4 h-4" />
                                Lesson successfully synchronized with maritime network.
                            </div>
                        )}
                    </form>
                )}
            </div>
        </main>
    );
}
