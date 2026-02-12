"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Anchor, BookOpen, GraduationCap, LogOut, Plus, Settings } from "lucide-react";
import Dashboard from "@/components/admin/Dashboard";

export default function AdminDashboard() {
    const { user, isAdmin, logout, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push("/login");
        }
    }, [user, isAdmin, loading, router]);

    if (loading || !user || !isAdmin) {
        return (
            <div className="min-h-screen bg-maritime-midnight flex items-center justify-center">
                <div className="animate-spin text-maritime-ocean">
                    <Anchor className="w-8 h-8" />
                </div>
            </div>
        );
    }

    const cards = [
        {
            title: "Lessons",
            description: "Manage structured maritime lessons and curricula.",
            icon: GraduationCap,
            href: "/admin/lessons",
            color: "text-maritime-teal",
        },
        {
            title: "Study Categories",
            description: "Organize lessons into categories like Navigation, Safety, or COLREGs.",
            icon: BookOpen,
            href: "/admin/categories",
            color: "text-maritime-brass",
        },
        {
            title: "System Logs",
            description: "View system activity and intelligence updates.",
            icon: Settings,
            href: "#",
            color: "text-maritime-orange",
        },
    ];

    return (
        <main className="min-h-screen bg-maritime-midnight text-white pt-24 px-6 md:px-12">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-maritime-ocean/30 bg-maritime-ocean/5 text-maritime-teal text-[10px] uppercase tracking-widest">
                            <Anchor className="w-3 h-3" />
                            <span>Bridge Command</span>
                        </div>
                        <h1 className="text-4xl font-light text-maritime-brass">
                            Welcome, <span className="font-extrabold text-maritime-teal italic">Captain</span>
                        </h1>
                        <p className="text-maritime-teal/60 text-sm font-mono tracking-tighter">
                            Awaiting commands for project: <span className="text-white">navai-151f5</span>
                        </p>
                    </div>

                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-xs uppercase tracking-widest"
                    >
                        <LogOut className="w-4 h-4" />
                        Abandon Bridge
                    </button>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cards.map((card, i) => (
                        <button
                            key={i}
                            onClick={() => router.push(card.href)}
                            className="group text-left p-8 glass border border-white/10 rounded-[2.5rem] space-y-6 hover:border-maritime-ocean/50 transition-all hover:scale-[1.02]"
                        >
                            <div className={`p-4 rounded-2xl bg-white/5 inline-block ${card.color}`}>
                                <card.icon className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">{card.title}</h2>
                                <p className="text-sm text-white/40 leading-relaxed font-light">
                                    {card.description}
                                </p>
                            </div>
                            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-maritime-ocean gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                Access Module <Plus className="w-4 h-4" />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Dashboard Visualization Area */}
                <Dashboard />
            </div>
        </main>
    );
}
