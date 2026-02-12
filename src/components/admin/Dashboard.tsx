"use client";

import React from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import {
    TrendingUp, TrendingDown, Users, Target, Clock, MessageSquare,
    Search, Filter, ExternalLink, Activity, Smartphone, Monitor
} from "lucide-react";
import { mockDailyStats, mockPostStats, mockSources, mockDevices } from "@/lib/analytics";

const KPI_CARDS = [
    {
        label: "Total Reach",
        value: "1.1k",
        trend: "+12.5%",
        isPositive: true,
        icon: Users,
        description: "Unique visitors (7d)"
    },
    {
        label: "Conversion Power",
        value: "5.8%",
        trend: "+2.1%",
        isPositive: true,
        icon: Target,
        description: "CTR to App Store"
    },
    {
        label: "Learning Stickiness",
        value: "4m 12s",
        trend: "-15s",
        isPositive: false,
        icon: Clock,
        description: "Avg. read time"
    },
    {
        label: "Fleet Growth",
        value: "+18",
        trend: "+5",
        isPositive: true,
        icon: MessageSquare,
        description: "New leads (24h)"
    },
];

export default function Dashboard() {
    return (
        <div className="space-y-8 pb-12">
            {/* KPI Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {KPI_CARDS.map((kpi, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-maritime-ocean/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-white/5 text-maritime-teal">
                                <kpi.icon className="w-5 h-5" />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${kpi.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                }`}>
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

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visitor Trend */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 font-mono">Visitor Telemetry (7 Days)</h3>
                        <div className="flex items-center gap-4 text-[10px] font-bold">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-maritime-ocean" /> Visitors</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Conversions</div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockDailyStats}>
                                <defs>
                                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#ffffff20', fontSize: 10 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#ffffff20', fontSize: 10 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="visitors"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVisitors)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="conversions"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    fillOpacity={0}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 flex flex-col justify-between">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 font-mono mb-6">Source Breakdown</h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mockSources}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {mockSources.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-6">
                        {mockSources.map((source, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-white/60">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }} />
                                    {source.name}
                                </div>
                                <div className="text-[10px] font-mono text-white/40">{source.value}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 3: Table and Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Post Analysis Table */}
                <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 font-mono">Content Engine Analysis</h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                <input
                                    type="text"
                                    placeholder="Filter posts..."
                                    className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-1.5 text-[10px] focus:outline-none focus:border-maritime-ocean/50 w-48"
                                />
                            </div>
                            <button className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10">
                                <Filter className="w-3 h-3 text-white/40" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/20">
                                    <th className="pb-4 font-bold">Title</th>
                                    <th className="pb-4 font-bold">Views</th>
                                    <th className="pb-4 font-bold">Avg. Scroll</th>
                                    <th className="pb-4 font-bold">CTR</th>
                                    <th className="pb-4 font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {mockPostStats.map((post, i) => (
                                    <tr key={i} className="group hover:bg-white/[0.02]">
                                        <td className="py-4 pr-4">
                                            <div className="text-[11px] font-bold text-white/80 line-clamp-1">{post.title}</div>
                                            <div className="text-[9px] text-white/20 uppercase font-mono">{post.category}</div>
                                        </td>
                                        <td className="py-4 text-[10px] font-mono text-maritime-teal">{post.views.toLocaleString()}</td>
                                        <td className="py-4">
                                            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-maritime-ocean" style={{ width: `${post.avgScroll}%` }} />
                                            </div>
                                        </td>
                                        <td className="py-4 text-[10px] font-bold text-emerald-500">{post.ctr}%</td>
                                        <td className="py-4">
                                            <button className="p-2 bg-white/5 border border-white/10 rounded-xl group-hover:bg-maritime-ocean group-hover:text-white transition-all">
                                                <ExternalLink className="w-3 h-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Device & Health */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 font-mono mb-6">Users by Device</h3>
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <Smartphone className="w-4 h-4 text-emerald-400 mb-2" />
                                <div className="text-lg font-black">{mockDevices[0].value}%</div>
                                <div className="text-[8px] uppercase tracking-widest text-white/20">Mobile</div>
                            </div>
                            <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <Monitor className="w-4 h-4 text-blue-400 mb-2" />
                                <div className="text-lg font-black">{mockDevices[1].value}%</div>
                                <div className="text-[8px] uppercase tracking-widest text-white/20">Desktop</div>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500" style={{ width: `${mockDevices[0].value}%` }} />
                            <div className="h-full bg-blue-500" style={{ width: `${mockDevices[1].value}%` }} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-maritime-ocean/20 to-transparent border border-maritime-ocean/20 rounded-[2.5rem] p-8 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-maritime-ocean/20 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-maritime-teal animate-pulse" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white">System Signal</div>
                            <div className="text-[10px] text-maritime-teal/60">Global Latency: 42ms</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
