"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Anchor, ArrowLeft, BookOpen, Save, Loader2, Plus, Edit2, Trash2, Search, Check, Layers } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

interface Category {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export default function ManageCategoriesPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    // UI States
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<"list" | "form">("list");

    // Data States
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("");

    useEffect(() => {
        if (!authLoading && (!user || !isAdmin)) {
            router.push("/login");
        } else if (user && isAdmin) {
            fetchCategories();
        }
    }, [user, isAdmin, authLoading, router]);

    const fetchCategories = async () => {
        setFetching(true);
        try {
            const q = query(collection(db, "studycategories"), orderBy("name", "asc"));
            const querySnapshot = await getDocs(q);
            const categoriesData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || "",
                    description: data.description || data.content || "",
                    icon: data.icon || ""
                };
            }) as Category[];
            setCategories(categoriesData);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setFetching(false);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingId(category.id);
        setName(category.name);
        setDescription(category.description || "");
        setIcon(category.icon || "");
        setActiveTab("form");
    };

    const handleAddNew = () => {
        setEditingId(null);
        setName("");
        setDescription("");
        setIcon("");
        setActiveTab("form");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category? Lessons assigned to this category may lose their reference.")) return;

        try {
            await deleteDoc(doc(db, "studycategories", id));
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const categoryData: any = {
                name,
                description,
                icon,
                updatedAt: serverTimestamp(),
            };

            // Maintain legacy field names if they were present
            categoryData.content = description;

            if (editingId) {
                await updateDoc(doc(db, "studycategories", editingId), categoryData);
            } else {
                await addDoc(collection(db, "studycategories"), {
                    ...categoryData,
                    createdAt: serverTimestamp(),
                    author: user?.email,
                });
            }

            setSuccess(true);
            await fetchCategories();

            setTimeout(() => {
                setSuccess(false);
                setActiveTab("list");
            }, 1500);
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Error saving category. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                        Bridge Overview
                    </button>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab("list")}
                            className={`px-6 py-2 rounded-xl text-xs uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-maritime-brass text-maritime-midnight font-bold' : 'bg-white/5 hover:bg-white/10 text-maritime-brass/60'}`}
                        >
                            List Categories
                        </button>
                        <button
                            onClick={handleAddNew}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs uppercase tracking-widest transition-all ${activeTab === 'form' && !editingId ? 'bg-maritime-brass text-maritime-midnight font-bold' : 'bg-white/5 hover:bg-white/10 text-maritime-brass/60'}`}
                        >
                            <Plus className="w-3 h-3" />
                            New Category
                        </button>
                    </div>
                </div>

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-light text-maritime-brass">
                        Study <span className="font-extrabold text-maritime-teal italic">{activeTab === 'list' ? 'Inventory' : 'Deployment'}</span>
                    </h1>
                    <p className="text-maritime-teal/60 text-sm">
                        {activeTab === 'list' ? 'Managing high-level maritime study modules.' : 'Establishing new academic sectors.'}
                    </p>
                </div>

                {activeTab === "list" ? (
                    <div className="space-y-6">
                        {/* Search Bar */}
                        <div className="relative group max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-maritime-brass/40 group-focus-within:text-maritime-brass transition-colors" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-maritime-brass transition-all placeholder:text-white/10"
                            />
                        </div>

                        {/* List Grid */}
                        {fetching ? (
                            <div className="flex justify-center py-24">
                                <Loader2 className="w-8 h-8 animate-spin text-maritime-brass/50" />
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="glass border border-white/5 rounded-[2.5rem] p-24 text-center space-y-4">
                                <div className="text-maritime-brass/20 flex justify-center">
                                    <Layers className="w-12 h-12" />
                                </div>
                                <p className="text-maritime-brass/40 font-mono text-xs uppercase tracking-widest">No categories mapped in this quadrant</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredCategories.map((category) => (
                                    <div key={category.id} className="glass border border-white/10 rounded-3xl p-6 flex justify-between items-center group hover:border-maritime-brass/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/5 rounded-2xl text-maritime-brass">
                                                <Layers className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-maritime-brass group-hover:text-maritime-teal transition-colors">{category.name}</h3>
                                                <p className="text-[10px] uppercase tracking-widest text-white/30">{category.icon || "Default Icon"}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="p-3 bg-white/5 hover:bg-maritime-brass hover:text-maritime-midnight rounded-xl transition-all"
                                                title="Edit Category"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all"
                                                title="Delete Category"
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
                                <label className="text-[10px] uppercase tracking-widest text-maritime-brass font-bold">Category Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Navigation"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-maritime-brass transition-colors"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-widest text-maritime-brass font-bold">Icon Identifier</label>
                                <input
                                    type="text"
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    placeholder="e.g. ship, compass, anchor"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-maritime-brass transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-widest text-maritime-brass font-bold">Category Description (Visual Editor)</label>
                            <RichTextEditor
                                value={description}
                                onChange={setDescription}
                                placeholder="What does this category cover?"
                            />
                        </div>

                        <div className="flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveTab("list")}
                                className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold transition-all hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center justify-center gap-3 px-10 py-4 bg-maritime-brass text-maritime-midnight rounded-2xl font-bold transition-all hover:scale-105 hover:bg-maritime-teal disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-maritime-brass/20"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {loading ? "Synchronizing..." : editingId ? "Save Changes" : "Deploy Category"}
                            </button>
                        </div>

                        {success && (
                            <div className="p-4 bg-maritime-teal/10 border border-maritime-teal/30 rounded-xl text-maritime-teal text-center text-sm flex items-center justify-center gap-2 animate-bounce">
                                <Check className="w-4 h-4" />
                                Category successfully established in the maritime curriculum.
                            </div>
                        )}
                    </form>
                )}
            </div>
        </main>
    );
}
