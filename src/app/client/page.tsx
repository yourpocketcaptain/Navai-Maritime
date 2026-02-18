"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { Anchor, BookOpen, Calculator, LogOut, Compass, MapIcon } from "lucide-react";

const OfflineNauticalMap = dynamic(() => import("@/components/OfflineNauticalMap"), {
    ssr: false,
    loading: () => (
        <div className="h-[600px] w-full bg-maritime-midnight rounded-[3rem] border border-white/5 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Anchor className="w-12 h-12 text-maritime-ocean animate-spin" />
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Booting Navigation Systems...</span>
            </div>
        </div>
    )
});

export default function ClientDashboard() {
    const { user, isClient, logout, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isClient) {
            router.push("/login?role=client");
        }
    }, [isClient, loading, router]);

    if (loading || !isClient) {
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
            title: "Maritime Academy",
            description: "Access structured maritime lessons and curricula.",
            icon: BookOpen,
            href: "/client/academy",
            color: "text-maritime-teal",
        },
        {
            title: "Simulators",
            description: "Interactive operational scenarios and training simulations.",
            icon: Anchor,
            href: "/client/simulators",
            color: "text-maritime-ocean",
        },
        {
            title: "Global Marine Weather",
            description: "Real-time global weather data, meteograms and nautical charts.",
            icon: MapIcon,
            href: "/client/navigation",
            color: "text-maritime-orange",
        },
        {
            title: "Fleet Tools",
            description: "Functional maritime utilities for navigation and operations.",
            icon: Calculator,
            href: "/client/tools",
            color: "text-maritime-brass",
        },
    ];

    return (
        <main className="min-h-screen bg-maritime-midnight text-white pt-24 px-6 md:px-12 pb-32">
            <div className="max-w-6xl mx-auto space-y-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-maritime-ocean/30 bg-maritime-ocean/5 text-maritime-teal text-[10px] uppercase tracking-widest">
                            <Anchor className="w-3 h-3" />
                            <span>Client Portal</span>
                        </div>
                        <h1 className="text-4xl font-light text-maritime-brass">
                            Welcome, <span className="font-extrabold text-maritime-teal italic">Officer</span>
                        </h1>
                        <p className="text-maritime-teal/60 text-sm font-mono tracking-tighter">
                            Awaiting operational requirements.
                        </p>
                    </div>

                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-xs uppercase tracking-widest"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cards.map((card, i) => (
                        <button
                            key={i}
                            onClick={() => router.push(card.href)}
                            className="group text-left p-12 glass border border-white/10 rounded-[2.5rem] space-y-6 hover:border-maritime-ocean/50 transition-all hover:scale-[1.02] flex flex-col h-full overflow-hidden"
                        >
                            <div className={`p-6 rounded-2xl bg-white/5 inline-block ${card.color}`}>
                                <card.icon className="w-12 h-12" />
                            </div>
                            <div className="space-y-2 flex-1">
                                <h2 className="text-3xl font-bold">{card.title}</h2>
                                <p className="text-base text-white/40 leading-relaxed font-light">
                                    {card.description}
                                </p>
                            </div>

                            {/* Special Preview for Weather Card */}
                            {card.title === "Global Marine Weather" && (
                                <div className="rounded-2xl overflow-hidden border border-white/5 opacity-40 group-hover:opacity-100 transition-all duration-700 h-32 mb-4 bg-maritime-midnight/50">
                                    <img
                                        src="/nav_weather_preview.png"
                                        alt="Global Weather Intel"
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                                    />
                                </div>
                            )}

                            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-maritime-ocean gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                Enter Module <Compass className="w-4 h-4" />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Tactical Navigation Console (The Map Module) */}
                <OfflineNauticalMap />
            </div>
        </main>
    );
}
