"use client";

import React, { useEffect, useState } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";
import {
    TrendingUp, TrendingDown, Users, Target, Clock, MessageSquare,
    Search, Filter, ExternalLink, Activity, Smartphone, Monitor
} from "lucide-react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

const KPI_CARDS_INITIAL = [
    { label: "Total Reach", value: "...", trend: "0%", isPositive: true, icon: Users, description: "Unique visitors (7d)" },
    { label: "Conversion Power", value: "...", trend: "0%", isPositive: true, icon: Target, description: "CTR to App Store" },
    { label: "Learning Stickiness", value: "...", trend: "0%", isPositive: true, icon: Clock, description: "Avg. read time" },
    { label: "Fleet Growth", value: "...", trend: "+0", isPositive: true, icon: MessageSquare, description: "Total users" },
];

export default function Dashboard() {
    const [kpis, setKpis] = useState(KPI_CARDS_INITIAL);
    const [dailyData, setDailyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // 1. Fetch Fleet Growth from Firestore
                const usersSnap = await getDocs(collection(db, "users"));
                const totalUsers = usersSnap.size;

                const res = await fetch('/api/analytics');
                if (res.ok) {
                    const data = await res.json();
                    if (!data.error) {
                        // Update KPIs with real data
                        const updatedKpis = [...KPI_CARDS_INITIAL];
                        updatedKpis[3].value = totalUsers.toString();

                        // Here we would map GA4 metrics to the other KPI cards
                        // For now, we update Fleet Growth and keep others as placeholders if API fails
                        setKpis(updatedKpis);
                        setDailyData(data.stats || []);
                    } else {
                        console.error("Dashboard Analytics API Error:", data.error);
                    }
                } else {
                    console.error("Dashboard Analytics Fetch Failed:", res.status, res.statusText);
                    // If API is missing or error
                    const updatedKpis = [...KPI_CARDS_INITIAL];
                    updatedKpis[3].value = totalUsers.toString();
                    setKpis(updatedKpis);
                }
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 h-32" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* KPI Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-maritime-ocean/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-white/5 text-maritime-teal">
                                <kpi.icon className="w-5 h-5" />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${kpi.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {kpi.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {kpi.trend}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-black text-white">{kpi.value}</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{kpi.label}</div>
                            <div className="text-[10px] text-white/20 font-light">{kpi.description}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts would use dailyData state here... */}
            {/* Keeping the rest of the UI structure similar but adapted to state */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 font-mono mb-8">Visitor Telemetry (7 Days)</h3>
                    {dailyData.length > 0 ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyData}>
                                    <XAxis dataKey="date" hide />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a' }} />
                                    <Area type="monotone" dataKey="visitors" stroke="#3B82F6" fill="#3B82F633" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-white/10 text-xs italic">
                            Waiting for GA4 credentials to sync...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
