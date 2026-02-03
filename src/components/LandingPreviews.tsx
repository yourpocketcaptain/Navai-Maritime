import {
    Anchor,
    Wind,
    CloudSun,
    TrendingUp,
    Shield,
    Maximize,
    Globe,
    Calendar,
    Clock,
    MapPin,
    Crosshair,
    Navigation,
    Ship,
    GraduationCap,
    WifiOff
} from "lucide-react";

// --- GREAT CIRCLE ROUTE PREVIEW ---
export function PreviewGreatCircle() {
    return (
        <div className="w-full h-full bg-[#0c1930] rounded-2xl relative overflow-hidden flex flex-col group">
            {/* Map Background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <svg width="100%" height="100%">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    {/* Simplified World Map Data would go here - abstract shapes for now */}
                    <path d="M 50 100 Q 150 50, 250 80 T 400 50" stroke="none" fill="#1e293b" opacity="0.5" />
                </svg>
            </div>

            {/* Route Curve */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
                <svg className="w-full h-full p-12 overflow-visible">
                    {/* Rhumb Line (Dotted) */}
                    <path d="M 50 200 L 350 100" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.5" />

                    {/* Great Circle (Curve) */}
                    <path
                        d="M 50 200 Q 200 80, 350 100"
                        stroke="#14b8a6"
                        strokeWidth="3"
                        fill="none"
                        className="drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]"
                    />

                    {/* Endpoints */}
                    <circle cx="50" cy="200" r="4" fill="white" />
                    <circle cx="350" cy="100" r="4" fill="#14b8a6" />

                    {/* Savings Badge */}
                    <foreignObject x="180" y="100" width="120" height="40">
                        <div className="bg-maritime-teal/20 backdrop-blur-md border border-maritime-teal/30 px-3 py-1 rounded-full text-xs text-maritime-teal font-bold flex items-center gap-2 animate-bounce">
                            <TrendingUp className="w-3 h-3" />
                            <span>-240 NM Saved</span>
                        </div>
                    </foreignObject>
                </svg>
            </div>
        </div>
    );
}

// --- GLOBAL WEATHER PREVIEW ---
export function PreviewWeather() {
    return (
        <div className="w-full h-full bg-[#0c1930] relative overflow-hidden group">
            <div className="absolute inset-0 transition-transform duration-700 hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/weather_routing_preview.png"
                    alt="Global Weather Routing Interface showing map and meteogram"
                    className="w-full h-full object-cover object-top"
                />
            </div>

            {/* Overlay Gradient for consistency */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1930] via-transparent to-transparent opacity-20" />
        </div>
    );
}

// --- STABILITY & HYDROSTATICS PREVIEW ---
export function PreviewStability() {
    return (
        <div className="w-full h-full bg-[#0c1930] rounded-2xl relative overflow-hidden flex flex-col p-6">
            <div className="flex justify-between items-center mb-6 z-10">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-maritime-orange" />
                    <span className="text-maritime-orange font-bold text-xs tracking-widest uppercase">Intact Stability</span>
                </div>
                <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold rounded uppercase">
                    IMO Compliant
                </div>
            </div>

            {/* GZ Curve Graph */}
            <div className="flex-1 w-full bg-white/5 rounded-xl border border-white/5 relative p-4 group-hover:bg-white/10 transition-colors">
                {/* Grid Lines */}
                <div className="absolute inset-4 grid grid-cols-6 grid-rows-4 gap-4 opacity-20 pointer-events-none">
                    {[...Array(24)].map((_, i) => <div key={i} className="border-r border-b border-white/20" />)}
                </div>

                {/* GZ Curve */}
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <path
                        d="M 0 150 C 50 10, 150 10, 250 150"
                        stroke="#f97316"
                        strokeWidth="3"
                        fill="none"
                        className="group-hover:stroke-[4px] transition-all"
                    />
                    {/* Area under curve */}
                    <path
                        d="M 0 150 C 50 10, 150 10, 250 150 L 250 150 L 0 150 Z"
                        fill="url(#gz-gradient)"
                        opacity="0.2"
                    />
                    <defs>
                        <linearGradient id="gz-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Axis Labels */}
                <div className="absolute bottom-1 left-4 text-[8px] text-white/40">0°</div>
                <div className="absolute bottom-1 right-4 text-[8px] text-white/40">60°</div>
            </div>

            {/* Data Points */}
            <div className="grid grid-cols-3 gap-2 mt-4 z-10">
                {[
                    { label: "GM(fluid)", val: "2.45 m" },
                    { label: "Max GZ", val: "0.85 m" },
                    { label: "Draft", val: "12.2 m" }
                ].map((d, i) => (
                    <div key={i} className="bg-black/20 rounded-lg p-2 text-center">
                        <div className="text-[8px] text-white/40 uppercase mb-1">{d.label}</div>
                        <div className="text-white font-mono font-bold text-sm">{d.val}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- ACADEMY MODULE PREVIEW ---
export function PreviewAcademyModule() {
    return (
        <div className="w-full h-full bg-[#0c1930] rounded-2xl relative overflow-hidden flex flex-col">
            <div className="h-1/2 bg-maritime-ocean/10 relative">
                <div className="absolute inset-0 flex items-center justify-center text-maritime-teal opacity-20">
                    <GraduationCap className="w-24 h-24" />
                </div>
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
                    <div className="h-full w-[75%] bg-maritime-orange" />
                </div>
            </div>
            <div className="p-4 space-y-2">
                <div className="flex gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] rounded font-bold uppercase">ColRegs</span>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] rounded font-bold uppercase">Rule 14</span>
                </div>
                <h4 className="text-white font-bold leading-tight">Head-on Situation</h4>
                <p className="text-xs text-white/50 leading-relaxed">
                    When two power-driven vessels are meeting on reciprocal courses...
                </p>
                <button className="w-full py-2 mt-2 bg-maritime-teal rounded-lg text-black text-xs font-bold hover:bg-white transition-colors">
                    Continue Lesson
                </button>
            </div>
        </div>
    );
}

// --- DRAFT SURVEY PREVIEW ---
export function PreviewGeneric({ title, icon: Icon }: { title: string, icon: any }) {
    return (
        <div className="w-full h-full bg-[#0c1930] rounded-2xl relative overflow-hidden flex flex-col items-center justify-center group">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-maritime-teal group-hover:text-black transition-all">
                <Icon className="w-8 h-8 text-maritime-teal group-hover:text-black transition-colors" />
            </div>
            <h3 className="text-white font-bold text-lg">{title}</h3>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-maritime-teal/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
    );
}

// --- PLACEHOLDERS FOR OTHER TOOLS ---

// --- ANCHOR CALCULATOR PREVIEW ---
export function PreviewAnchor() {
    return (
        <div className="w-full h-full bg-[#0c1930] flex flex-col relative overflow-hidden">
            {/* Gradient Background for Sea/Sky */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1b2b44] to-[#0f172a]" />

            {/* App Header */}
            <div className="flex justify-between items-center p-6 pb-2 z-10 w-full">
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-maritime-orange/10 rounded">
                        <Anchor className="w-3 h-3 text-maritime-orange" />
                    </div>
                    <span className="text-white font-bold text-[10px] tracking-wide uppercase opacity-90">Anchor Chain Calculator</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                </div>
            </div>

            {/* Main Graphic */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden w-full">
                {/* Horizon Line */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/5" />

                <svg className="w-full h-full px-4 overflow-visible">
                    <defs>
                        <linearGradient id="chainGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#94a3b8" />
                            <stop offset="100%" stopColor="#475569" />
                        </linearGradient>
                        <pattern id="seabed" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1" fill="#334155" />
                        </pattern>
                        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L6,3 z" fill="white" />
                        </marker>
                    </defs>

                    {/* Sea Bed */}
                    <path d="M -50 350 Q 150 345, 350 350" stroke="#334155" strokeWidth="2" fill="none" />
                    <path d="M -50 350 L 350 350 L 350 450 L -50 450 Z" fill="url(#seabed)" opacity="0.3" />

                    {/* Catenary Curve (Chain) */}
                    {/* M(bow_x, bow_y) Q(control_x, control_y) (anchor_x, anchor_y) */}
                    <path
                        d="M 100 120 Q 100 320, 240 350"
                        stroke="#f97316"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        className="drop-shadow-xl"
                    />

                    {/* Chain 'Links' Visualization (Dashed overlay) */}
                    <path
                        d="M 100 120 Q 100 320, 240 350"
                        stroke="black"
                        strokeWidth="1"
                        fill="none"
                        strokeDasharray="2 4"
                        opacity="0.3"
                    />

                    {/* Ship Hull (Bow) */}
                    <path d="M 60 80 L 100 120 L 140 80 L 140 60 L 60 60 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                    <text x="75" y="75" fill="white" fontSize="8" opacity="0.5">BOW</text>

                    {/* Anchor Icon at bottom */}
                    <circle cx="240" cy="350" r="4" fill="#f97316" />

                    {/* Labels */}
                    <text x="250" y="355" fill="#f97316" fontSize="10" fontWeight="bold">ANCHOR</text>
                    <text x="110" y="130" fill="white" fontSize="10" opacity="0.7">Hawse Pipe</text>

                    {/* Dimensions Lines */}
                    <line x1="100" y1="120" x2="300" y2="120" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
                    <line x1="240" y1="350" x2="300" y2="350" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />

                    {/* Depth Arrow */}
                    <line x1="290" y1="125" x2="290" y2="345" stroke="white" strokeWidth="0.5" opacity="0.5" />
                    <text x="300" y="240" fill="white" fontSize="9" opacity="0.6">Depth 25m</text>
                </svg>
            </div>

            {/* Data Grid */}
            <div className="bg-[#0f172a] p-5 z-20 border-t border-white/5 grid grid-cols-2 gap-4 w-full">
                <div className="space-y-1">
                    <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Scope Reqd</span>
                    <div className="text-xl font-mono text-white font-bold leading-none">4.5<span className="text-sm text-maritime-orange">x</span></div>
                </div>
                <div className="space-y-1">
                    <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Chain Length</span>
                    <div className="text-xl font-mono text-white font-bold leading-none">4.2 <span className="text-[10px] opacity-50">shackles</span></div>
                </div>

                <div className="col-span-2 mt-2 pt-3 border-t border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-400 text-[10px] font-bold uppercase">Holding Secure</span>
                    </div>
                    <span className="text-white/30 text-[8px] font-mono">CALC ID: #8291</span>
                </div>
            </div>
        </div>
    );
}

export function PreviewContract() { return <PreviewGeneric title="Legal & Contracts" icon={Clock} /> }
export function PreviewSeaService() { return <PreviewGeneric title="Sea Service" icon={Calendar} /> }
export function PreviewNavigation() { return <PreviewGeneric title="Navigation" icon={Navigation} /> }
