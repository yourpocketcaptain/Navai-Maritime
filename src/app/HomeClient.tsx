"use client";

import { useState } from "react";
import DemoChat from "@/components/DemoChat";
import Link from "next/link";

import {
    PreviewAcademyModule,
    PreviewAnchor,
    PreviewContract,
    PreviewGeneric,
    PreviewGreatCircle,
    PreviewSeaService,
    PreviewStability,
    PreviewWeather,
    PreviewNavigation
} from "@/components/LandingPreviews";
import {
    Anchor,
    Calendar,
    Compass,
    Clock,
    Crosshair,
    Globe,
    GraduationCap,
    Layers,
    MapPin,
    Maximize,
    RefreshCw,
    Shield,
    TrendingUp,
    Wind,
    Monitor,
    Smartphone,
    Wifi,
    WifiOff,
    Laptop,
    Instagram,
    CheckCircle2,
    Lock
} from "lucide-react";

export default function HomeClient() {


    return (
        <main className="min-h-screen relative overflow-hidden bg-maritime-midnight text-white font-sans selection:bg-maritime-orange/30">


            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] animate-pulse rotate-3 bg-gradient-to-b from-maritime-ocean to-transparent blur-[120px]" />
            </div>

            {/* Top Navigation */}
            <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-50 max-w-7xl mx-auto left-0 right-0">
                <div className="flex items-center gap-2">
                    {/* Logo placeholder or simple text */}
                    <Anchor className="w-6 h-6 text-maritime-orange" />
                    <span className="font-bold text-lg tracking-tight text-white hidden sm:block">NAVAI</span>
                    <Link
                        href="/blog"
                        className="ml-6 text-[10px] font-bold uppercase tracking-widest text-maritime-teal/60 hover:text-maritime-orange transition-colors hidden md:block"
                    >
                        Maritime Blog
                    </Link>
                </div>
                <Link
                    href="/login?role=client"
                    className="px-5 py-2 rounded-full border border-white/10 bg-white/5 text-maritime-teal hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest backdrop-blur-sm hover:scale-105"
                >
                    Client Login
                </Link>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center z-10 max-w-5xl mx-auto">
                <h1 className="text-5xl sm:text-6xl md:text-8xl font-light tracking-tight text-maritime-brass leading-[1.1] mb-8">
                    NavAI: Your Digital <span className="font-extrabold text-maritime-ocean italic">First Mate</span> for <span className="block sm:inline">Maritime Navigation</span>
                </h1>

                <p className="text-lg md:text-2xl text-maritime-teal/80 max-w-3xl mx-auto font-light leading-relaxed mb-12">
                    Master maritime navigation with powerful tools on the <span className="font-bold text-white">Web</span> and <span className="font-bold text-maritime-orange">Offline</span> on iOS.
                    <br />
                    <br />
                    <span className="block mt-6 text-base md:text-lg text-maritime-teal/80 font-light">
                    </span>
                </p>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <Link
                        href="/login?role=client"
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-maritime-ocean/10 border border-maritime-ocean/30 text-maritime-teal rounded-2xl font-bold transition-all hover:scale-105 hover:bg-maritime-ocean/20 w-full md:w-auto justify-center min-w-[240px]"
                    >
                        <div className="absolute top-3 right-3 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </div>
                        <Globe className="w-6 h-6" />
                        <div className="flex flex-col items-start leading-none text-left">
                            <span className="text-[10px] uppercase tracking-tighter opacity-80 text-green-400 font-bold">Free Access</span>
                            <span className="text-xl">Sign Up Web Platform</span>
                        </div>
                    </Link>

                    <div className="flex flex-col items-center gap-2 w-full md:w-auto">
                        <a
                            href="https://apps.apple.com/gb/app/navai-ai-maritime-assistant/id6757674541"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-maritime-orange border border-maritime-orange text-maritime-midnight rounded-2xl font-bold transition-all hover:scale-105 hover:bg-maritime-orange/90 w-full justify-center shadow-[0_0_20px_rgba(255,165,0,0.3)] hover:shadow-[0_0_30px_rgba(255,165,0,0.5)] min-w-[240px]"
                        >
                            <div className="absolute -top-3 -right-3 z-20 bg-white text-maritime-midnight text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg rotate-12">
                                Available Now
                            </div>
                            <AppleIcon className="w-6 h-6" />
                            <div className="flex flex-col items-start leading-none text-left">
                                <span className="text-[10px] uppercase tracking-tighter opacity-80">Download on the</span>
                                <span className="text-xl">App Store</span>
                            </div>
                        </a>

                    </div>
                </div>
            </section>

            {/* --- FEATURE DEEP DIVE 1: WEB PLATFORM (Text Left, Visual Right) --- */}
            <section className="hidden md:block py-24 px-6 relative border-t border-white/5 bg-gradient-to-b from-maritime-midnight to-[#0B1221]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    {/* Text Content */}
                    <div className="space-y-8 order-2 md:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maritime-ocean/10 border border-maritime-ocean/20 text-maritime-teal text-xs uppercase tracking-widest">
                            <Monitor className="w-3 h-3" />
                            <span>Commandant's Console</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-light text-white leading-tight">
                            Advanced <span className="font-bold text-maritime-ocean">Maritime Planning</span> <br />
                            on the Big Screen.
                        </h2>
                        <p className="text-lg text-maritime-teal/70 leading-relaxed font-light">
                            The ultimate planning station. Analyze weather patterns, visualize routes on expansive charts, and optimize fleet movements from the comfort of your desk.
                        </p>

                        <ul className="space-y-4 mt-4">
                            {[
                                "Global Weather Routing",
                                "Live NOAA GFS Overlays",
                                "Meteogram Analysis"
                            ].map(item => (
                                <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                                    <CheckCircle2 className="w-5 h-5 text-maritime-ocean" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Link href="/login?role=client" className="inline-flex items-center gap-2 text-sm font-bold text-white uppercase tracking-widest hover:text-maritime-ocean transition-colors pt-4">
                            <span>Launch Console</span>
                            <div className="w-8 h-[1px] bg-current" />
                        </Link>
                    </div>

                    {/* Visual */}
                    <div className="order-1 md:order-2 relative h-[500px] w-full bg-maritime-midnight rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden group">
                        {/* Simulated Console UI */}
                        <div className="absolute inset-2 rounded-[2rem] overflow-hidden bg-[#0c1930] opacity-80 group-hover:opacity-100 transition-opacity duration-700">
                            <PreviewWeather />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURE DEEP DIVE 2: iOS APP (Visual Left, Text Right) --- */}
            <section className="hidden md:block py-24 px-6 relative border-t border-white/5 bg-gradient-to-b from-[#0B1221] to-maritime-midnight">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    {/* Visual */}
                    <div className="order-1 relative h-[600px] w-full bg-maritime-midnight rounded-[2.5rem] border border-maritime-orange/20 shadow-2xl overflow-hidden group">
                        {/* Mobile Frame Content */}
                        <div className="absolute inset-2 rounded-[2rem] overflow-hidden bg-[#0c1930] opacity-90 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="relative w-[300px] h-[580px] bg-[#0c1930] rounded-[3rem] border-8 border-[#1e293b] shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10 mx-auto transform translate-y-4">
                                    {/* Dynamic Island */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-[#1e293b] rounded-b-2xl z-20"></div>

                                    {/* Screen Content */}
                                    <div className="flex-1 overflow-hidden pt-8">
                                        <PreviewAnchor />
                                    </div>

                                    {/* Home Indicator */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white/20 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        {/* Overlay badge */}
                        <div className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-maritime-orange rounded-lg text-black">
                                    <WifiOff className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">Offline Mode Active</div>
                                    <div className="text-white/50 text-xs">No signal required for calculations.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-8 order-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maritime-orange/10 border border-maritime-orange/20 text-maritime-orange text-xs uppercase tracking-widest">
                            <Smartphone className="w-3 h-3" />
                            <span>Pocket First Mate</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-light text-white leading-tight">
                            Autonomous <span className="font-bold text-maritime-orange">Offline Navigation</span> <br />
                            At Sea.
                        </h2>
                        <p className="text-lg text-white/60 leading-relaxed font-light">
                            Total independence when the signal drops. All calculation engines, regulation libraries, and safety tools come with you on the bridge, or in your pocket.
                        </p>

                        <ul className="space-y-4 mt-4">
                            {[
                                "100% Offline Functionality",
                                "Bridge-Ready Night Mode",
                                "Instant Calculations"
                            ].map(item => (
                                <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                                    <CheckCircle2 className="w-5 h-5 text-maritime-orange" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <a
                            href="https://apps.apple.com/gb/app/navai-ai-maritime-assistant/id6757674541"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold text-white uppercase tracking-widest hover:text-maritime-orange transition-colors pt-4"
                        >
                            <span>Download on the App Store</span>
                            <div className="w-8 h-[1px] bg-current" />
                        </a>
                    </div>
                </div>
            </section>

            {/* --- FEATURE GRID (Privacy.com Style) --- */}
            <section className="py-32 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-light text-white">
                            Professional <span className="font-bold text-maritime-teal">Toolbox</span>
                        </h2>
                        <p className="text-maritime-teal/60 text-lg md:text-xl font-light">
                            A suite of utilities designed for the modern officer.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {/* Tool Card 1 */}
                        <div className="space-y-4 group">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-maritime-teal group-hover:scale-110 group-hover:bg-maritime-teal group-hover:text-black transition-all duration-300">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Great Circle</h3>
                            <p className="text-white/50 leading-relaxed text-sm">
                                Calculate shortest routes and distance savings with precision geodesic algorithms.
                            </p>
                        </div>

                        {/* Tool Card 2 */}
                        <div className="space-y-4 group">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-maritime-teal group-hover:scale-110 group-hover:bg-maritime-teal group-hover:text-black transition-all duration-300">
                                <Wind className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Global Weather</h3>
                            <p className="text-white/50 leading-relaxed text-sm">
                                Live satellite overlays and safety advisories directly from NOAA GFS models.
                            </p>
                        </div>

                        {/* Tool Card 3 */}
                        <div className="space-y-4 group">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-maritime-teal group-hover:scale-110 group-hover:bg-maritime-teal group-hover:text-black transition-all duration-300">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Stability</h3>
                            <p className="text-white/50 leading-relaxed text-sm">
                                Pro-grade GZ curve analysis and automated IMO compliance checks.
                            </p>
                        </div>

                        {/* Tool Card 4 */}
                        <div className="space-y-4 group">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-maritime-teal group-hover:scale-110 group-hover:bg-maritime-teal group-hover:text-black transition-all duration-300">
                                <Anchor className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Anchor Logic</h3>
                            <p className="text-white/50 leading-relaxed text-sm">
                                Instant scope calculations based on depth, holding ground, and wind force.
                            </p>
                        </div>

                        {/* Tool Card 5 */}
                        <div className="space-y-4 group">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-maritime-teal group-hover:scale-110 group-hover:bg-maritime-teal group-hover:text-black transition-all duration-300">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">ETA Planner</h3>
                            <p className="text-white/50 leading-relaxed text-sm">
                                Precise voyage planning with automatic timezone adjustments.
                            </p>
                        </div>

                        {/* Tool Card 6 */}
                        <div className="space-y-4 group">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-maritime-teal group-hover:scale-110 group-hover:bg-maritime-teal group-hover:text-black transition-all duration-300">
                                <Maximize className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Draft Survey</h3>
                            <p className="text-white/50 leading-relaxed text-sm">
                                Hydrostatic calculations for loading optimization and safety.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- ACADEMY SECTION --- */}
            <section className="py-24 px-6 bg-[#0B1221] border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <GraduationCap className="w-5 h-5 text-maritime-orange" />
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-maritime-orange">Knowledge Base</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-light text-white">Maritime <span className="font-bold text-white">Academy</span></h2>
                        </div>
                        <div className="text-white/50 text-sm max-w-sm text-right md:text-right">
                            Prepare for exams or refresh your memory. A comprehensive library of maritime knowledge.
                        </div>
                    </div>

                    {/* Categories Grid (instead of scroll) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { title: "Regulations", code: "INTL-REG", icon: Shield },
                            { title: "Navigation", code: "NAV-CORE", icon: Compass },
                            { title: "Operations", code: "OPS-GEN", icon: Anchor },
                            { title: "Meteorology", code: "MET-ATM", icon: Wind },
                            { title: "Cargo Work", code: "CGO-LOG", icon: Maximize },
                            { title: "English", code: "COM-ENG", icon: Globe },
                            { title: "Safety", code: "SAF-SEC", icon: Crosshair },
                            { title: "Architecture", code: "NAV-ARCH", icon: Layers },
                        ].map((mod, i) => (
                            <div key={i} className="group p-6 bg-maritime-midnight rounded-2xl border border-white/5 hover:border-maritime-orange/50 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <mod.icon className="w-6 h-6 text-white/40 group-hover:text-maritime-orange transition-colors" />
                                    <span className="text-[9px] font-mono text-white/20">{mod.code}</span>
                                </div>
                                <h3 className="text-sm font-bold text-white group-hover:text-maritime-orange transition-colors">{mod.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- DEMO SECTION --- */}
            <section className="py-32 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl font-bold text-maritime-brass uppercase tracking-widest mb-4 font-mono">Live Maritime AI Demo</h2>
                    <p className="text-sm text-maritime-teal/50 mb-12">Experience the Captain Mariner engine live – Your AI Nautical Assistant.</p>
                    <DemoChat />
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="w-full border-t border-maritime-ocean/10 py-12 bg-maritime-midnight">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] text-maritime-teal/30 uppercase tracking-[0.2em] z-10">
                    <div className="flex items-center gap-2">
                        <Ship className="w-4 h-4" />
                        <span>© 2026 NavAI Navigation Systems</span>
                    </div>
                    <div className="flex gap-8 items-center flex-wrap justify-center">
                        <a href="https://www.instagram.com/navaitech" target="_blank" rel="noopener noreferrer" className="hover:text-maritime-orange transition-colors">
                            <Instagram className="w-4 h-4" />
                        </a>
                        <Link href="/blog" className="hover:text-maritime-orange transition-colors">Blog</Link>
                        <Link href="#" className="hover:text-maritime-orange transition-colors">Privacy</Link>
                        <a href="#" className="hover:text-maritime-orange transition-colors">Terms</a>
                        <a href="mailto:hello@navaitech.com" className="hover:text-maritime-orange transition-colors">Contact</a>
                        <Link href="/login" className="hover:text-maritime-orange transition-colors opacity-50 hover:opacity-100">Dev Access</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
        >
            <path d="M17.05 20.28c-.96.95-2.18 1.78-3.37 1.72-1.12-.05-1.55-.71-2.92-.71-1.37 0-1.85.7-2.92.74-1.14.04-2.28-.73-3.23-1.66-2-1.93-2.98-5.34-1.37-8.11.8-1.37 2.21-2.24 3.75-2.27 1.15-.02 2.24.78 2.95.78.7 0 2.02-.97 3.39-.83.58.02 2.21.23 3.26 1.76-.08.05-1.93 1.12-1.9 3.36.03 2.69 2.33 3.6 2.36 3.61-.02.05-.36 1.25-1.25 2.53M12.03 7.25c-.02-1.55.85-3.03 2.02-3.89 1.17-.86 2.76-1.14 4.14-.99.02 1.63-.82 3.16-1.99 4.02-1.15.84-2.88 1.18-4.17.86z" />
        </svg>
    );
}

function Ship(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 21c.6.5 1.2 1 2.5 1 1.4 0 2.1-.5 2.5-1 .4-.5 1.1-1 2.5-1 1.4 0 2.1.5 2.5 1 .4.5 1.1-1 2.5-1 1.4 0 2.1.5 2.5 1 .4.5 1.1-1 2.5-1 1.4 0 2.1.5 2.5 1 .4.5 1.1-1 2.5-1 1.4 0 2.1.5 2.5 1" />
            <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.2.6 4.3 1.62 6" />
            <path d="M12 10V2" />
            <path d="M12 2v3l3 2" />
        </svg>
    );
}
