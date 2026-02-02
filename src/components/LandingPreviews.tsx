"use client";

import { Anchor, CloudSun, Clock, Compass, Maximize, Navigation, Shield, Ship, Wind, MapPin } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

// --- TACTICAL NAVIGATION CONSOLE PREVIEW ---
export function PreviewNavigation() {
    return (
        <div className="w-full h-full relative overflow-hidden bg-[#0c1930] rounded-2xl flex flex-col">
            {/* Mock Map Background (Dark Water) */}
            <div className="absolute inset-0 opacity-30">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Simulated Land/Map Features (Abstract) */}
            <div className="absolute top-0 right-0 w-2/3 h-1/3 bg-[#1e293b]/30 blur-3xl rounded-full translate-x-12 -translate-y-4" />

            {/* ROUTE LAYER */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Route Line */}
                <path
                    d="M 60 280 L 240 100"
                    stroke="#D4AF37"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                    className="opacity-60"
                />

                {/* Waypoint 1 (Start) */}
                <g transform="translate(60, 280)">
                    <circle r="4" fill="#D4AF37" />
                    <circle r="12" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.3" />
                    <text x="10" y="4" fill="#D4AF37" fontSize="10" fontWeight="bold" fontFamily="monospace">WP_ALPHA</text>
                    <text x="10" y="14" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">12°42.5'N</text>
                </g>

                {/* Waypoint 2 (End) */}
                <g transform="translate(240, 100)">
                    <circle r="4" fill="#D4AF37" />
                    <circle r="8" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.5" />
                    <text x="10" y="4" fill="#D4AF37" fontSize="10" fontWeight="bold" fontFamily="monospace">WP_BRAVO</text>
                    <text x="10" y="14" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">15°10.2'N</text>
                    <text x="10" y="24" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">0.0 kts</text>
                </g>
            </svg>

            {/* Active Ship Symbol (Moving along the line) */}
            <div
                className="absolute w-4 h-6 z-10"
                style={{
                    top: '190px',
                    left: '150px',
                    transform: 'translate(-50%, -50%) rotate(45deg)'
                }}
            >
                {/* Ship Shape */}
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_10px_rgba(0,180,216,0.8)]">
                    <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="#00B4D8" />
                </svg>
                {/* Heading Line */}
                <div className="absolute bottom-full left-1/2 w-[1px] h-20 bg-gradient-to-t from-[#00B4D8] to-transparent -translate-x-1/2 opacity-50" />
            </div>

            {/* DATA OVERLAYS */}
            <div className="z-10 p-4 flex justify-between items-start">
                <div className="bg-black/50 backdrop-blur-md p-2 rounded-lg border border-white/10">
                    <div className="text-[8px] text-white/40 uppercase tracking-widest">SOG</div>
                    <div className="text-maritime-teal font-mono font-bold">14.2 kn</div>
                </div>
                <div className="bg-black/50 backdrop-blur-md p-2 rounded-lg border border-white/10 text-right">
                    <div className="text-[8px] text-white/40 uppercase tracking-widest">COG</div>
                    <div className="text-maritime-brass font-mono font-bold">045°</div>
                </div>
            </div>

            <div className="mt-auto p-4 z-10 flex gap-2">
                <div className="bg-maritime-ocean/20 border border-maritime-ocean/40 px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-md">
                    <Navigation className="w-3 h-3 text-maritime-ocean" />
                    <span className="text-[9px] uppercase font-bold text-maritime-ocean tracking-wide">Leg Active: 142 NM</span>
                </div>
            </div>
        </div>
    );
}

// --- GLOBAL WEATHER PREVIEW ---
export function PreviewWeather() {
    return (
        <div className="w-full h-full bg-[#0c1930] rounded-2xl relative overflow-hidden group">
            {/* Meteogram Image */}
            <div className="absolute inset-0 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/weather_preview.png"
                    alt="Meteogram"
                    className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-1000"
                />
            </div>

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1930] via-transparent to-transparent opacity-90" />

            {/* Overlays */}
            <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <CloudSun className="w-4 h-4 text-maritime-orange" />
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Live Feed</span>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 z-10 w-full pr-8">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Forecast Model</div>
                        <div className="text-xl font-bold text-white leading-none">NOAA GFS <span className="text-maritime-teal">10-Day</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- SHIP STABILITY PREVIEW ---
export function PreviewStability() {
    return (
        <div className="w-full h-full bg-[#1b2b3b] rounded-2xl p-4 flex flex-col relative">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">GZ Curve Analysis</span>
                <Shield className="w-4 h-4 text-maritime-teal" />
            </div>

            {/* SVG Curve */}
            <div className="flex-1 w-full bg-black/20 rounded-xl border border-white/5 relative overflow-hidden">
                <svg viewBox="0 0 100 60" className="w-full h-full p-2">
                    {/* Grid */}
                    <path d="M0 60 L100 60" stroke="#334155" strokeWidth="1" />
                    <path d="M0 0 L0 60" stroke="#334155" strokeWidth="1" />
                    {/* Curve */}
                    <path
                        d="M0 60 Q 30 10, 60 20 T 100 60"
                        fill="none"
                        stroke="#00B4D8"
                        strokeWidth="2"
                        className="animate-[dash_3s_ease-in-out_infinite]"
                        strokeDasharray="200"
                    />
                    {/* Area under curve */}
                    <path d="M0 60 Q 30 10, 60 20 T 100 60 V 60 H 0" fill="rgba(0, 180, 216, 0.2)" />
                </svg>
            </div>

            <div className="mt-3 flex justify-between text-xs">
                <div>
                    <div className="text-[8px] text-white/30 uppercase">GM(fluid)</div>
                    <div className="font-mono text-white">1.24 m</div>
                </div>
                <div className="text-right">
                    <div className="text-[8px] text-white/30 uppercase">Status</div>
                    <div className="font-bold text-green-400">IMO OK</div>
                </div>
            </div>
        </div>
    );
}

// --- ANCHOR CHAIN PREVIEW ---
export function PreviewAnchor() {
    return (
        <div className="w-full h-full bg-[#1e293b] rounded-2xl p-4 flex flex-col justify-between border-t-4 border-maritime-orange">
            <div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Recommended Scope</div>
                <div className="text-3xl font-black text-maritime-orange font-mono">5.5 <span className="text-sm">shackles</span></div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-white/60 bg-white/5 p-2 rounded-lg">
                    <span>Water Depth</span>
                    <span className="font-mono text-white">25.0 m</span>
                </div>
                <div className="flex justify-between items-center text-xs text-white/60 bg-white/5 p-2 rounded-lg">
                    <span>Holding Ground</span>
                    <span className="font-mono text-white">Mud/Clay</span>
                </div>
            </div>

            <div className="flex items-center gap-2 text-maritime-teal text-[10px] font-bold uppercase mt-2">
                <Anchor className="w-3 h-3" />
                <span>Swing Radius: 145m</span>
            </div>
        </div>
    );
}

// --- SEA SERVICE PREVIEW ---
export function PreviewSeaService() {
    const records = [
        { ship: "LNG Enterprise", role: "2/O", days: 124 },
        { ship: "Maersk Ohio", role: "3/O", days: 98 },
        { ship: "Ever Given", role: "Cadet", days: 180 },
    ];

    return (
        <div className="w-full h-full bg-[#111827] rounded-2xl p-4 flex flex-col">
            <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
                <div className="text-xs font-bold text-maritime-brass uppercase">Service Record</div>
                <div className="text-[10px] text-white/40">Total: 402 Days</div>
            </div>

            <div className="space-y-2">
                {records.map((r, i) => (
                    <div key={i} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2">
                            <Ship className="w-3 h-3 text-maritime-ocean/60" />
                            <span className="text-white/80">{r.ship}</span>
                        </div>
                        <span className="font-mono text-maritime-teal">{r.days}d</span>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-2 text-center text-[10px] text-white/30 uppercase tracking-widest">
                + 12 Archived Entries
            </div>
        </div>
    );
}

// --- CONTRACT COUNTDOWN PREVIEW ---
export function PreviewContract() {
    const [progress, setProgress] = useState(65);

    // Simulate live progress
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(p => p >= 100 ? 0 : p + 0.1);
        }, 100);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full h-full bg-[#0f172a] rounded-2xl p-5 flex flex-col justify-center items-center relative overflow-hidden">
            {/* Circular Progress */}
            <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="8" fill="none" />
                    <circle
                        cx="64" cy="64" r="56"
                        stroke="#D4AF37"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="351.85"
                        strokeDashoffset={351.85 * (1 - progress / 100)}
                        className="transition-all duration-100 ease-linear"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white font-mono">{Math.floor(86 - (progress / 100) * 86)}</span>
                    <span className="text-[8px] uppercase tracking-widest text-white/40">Days Left</span>
                </div>
            </div>

            <div className="mt-6 w-full flex justify-between text-[10px] uppercase tracking-wide text-white/50">
                <span>On: 12 OCT</span>
                <Clock className="w-3 h-3 text-maritime-brass" />
                <span>Off: 15 FEB</span>
            </div>
        </div>
    );
}
// --- GREAT CIRCLE PREVIEW ---
export function PreviewGreatCircle() {
    return (
        <div className="w-full h-full bg-[#0b1221] rounded-2xl flex flex-col relative overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%">
                    <pattern id="grid_gc" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="#334155" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid_gc)" />
                </svg>
            </div>

            <div className="absolute inset-0 p-6 flex flex-col justify-center">
                <svg viewBox="0 0 300 150" className="w-full h-full drop-shadow-lg">
                    {/* Rhumb Line (Straight) - Dotted */}
                    <path d="M 40 120 L 260 40" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                    <text x="150" y="90" fill="#94a3b8" fontSize="8" textAnchor="middle" transform="rotate(-20 150 80)">Rhumb Line: 3450 NM</text>

                    {/* Great Circle (Curved) - Solid */}
                    <path d="M 40 120 Q 150 10, 260 40" stroke="#00B4D8" strokeWidth="3" fill="none" className="drop-shadow-[0_0_8px_rgba(0,180,216,0.6)]" />

                    {/* Start/End Points */}
                    <circle cx="40" cy="120" r="4" fill="white" />
                    <circle cx="260" cy="40" r="4" fill="white" />
                    <text x="40" y="140" fill="white" fontSize="10" fontWeight="bold">Tokyo</text>
                    <text x="260" y="25" fill="white" fontSize="10" fontWeight="bold">SF</text>
                </svg>
            </div>

            {/* Savings Badge */}
            <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500/50 backdrop-blur-md px-4 py-2 rounded-xl flex flex-col items-center animate-pulse">
                <div className="text-[10px] text-green-400 uppercase tracking-widest font-bold">Distance Saved</div>
                <div className="text-2xl font-black text-white font-mono">-245 NM</div>
            </div>

            <div className="absolute bottom-4 left-4">
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Route Analysis</div>
                <div className="text-maritime-teal font-bold">Great Circle Optimization</div>
            </div>
        </div>
    );
}
// --- GENERIC PREVIEW ---
export function PreviewGeneric({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <div className="w-full h-full bg-[#111827] rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Background Icon (Large & Faded) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-700">
                <Icon className="w-64 h-64 text-white transform -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>

            {/* Central Content */}
            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-maritime-ocean/10 text-maritime-ocean flex items-center justify-center border border-maritime-ocean/20 group-hover:scale-110 group-hover:bg-maritime-ocean group-hover:text-maritime-midnight transition-all duration-500 shadow-[0_0_30px_rgba(0,180,216,0.1)]">
                    <Icon className="w-10 h-10" />
                </div>

                <div className="text-center">
                    <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/30 mb-2">Maritime Utility</div>
                    <div className="text-xl font-bold text-white max-w-[200px] leading-tight">{label}</div>
                </div>
            </div>

            {/* Status Indicator */}
            <div className="absolute bottom-6 flex items-center gap-2 text-[10px] uppercase font-black text-maritime-teal tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-maritime-teal animate-pulse" />
                <span>Ready to Launch</span>
            </div>
        </div>
    );
}
// --- ACADEMY MODULE PREVIEW ---
export function PreviewAcademyModule({ icon: Icon, code, title, difficulty = "Intermediate" }: { icon: any, code: string, title: string, difficulty?: string }) {
    return (
        <div className="w-full h-full bg-[#0F1623] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group border border-white/5 hover:border-maritime-orange/50 transition-colors">
            {/* Background Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-maritime-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-maritime-orange/10 transition-colors" />

            <div className="relative z-10 flex justify-between items-start">
                <div className="p-3 bg-white/5 rounded-xl text-maritime-orange border border-white/5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-mono text-white/30 bg-white/5 px-2 py-1 rounded border border-white/5">
                    {code}
                </div>
            </div>

            <div className="relative z-10 mt-4">
                <h3 className="text-lg font-bold text-white leading-tight group-hover:text-maritime-orange transition-colors duration-300">{title}</h3>
                <div className="mt-3 flex items-center gap-2">
                    <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-maritime-orange w-[85%]" />
                    </div>
                    <span className="text-[9px] text-white/40 uppercase tracking-wide">32 Lessons</span>
                </div>
            </div>

            <div className="relative z-10 mt-auto pt-4 flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold">
                <span className={difficulty === "Advanced" ? "text-red-400" : (difficulty === "Beginner" ? "text-green-400" : "text-maritime-teal")}>
                    {difficulty}
                </span>
                <span className="text-white/20 group-hover:text-white transition-colors">Start Module &rarr;</span>
            </div>
        </div>
    );
}
