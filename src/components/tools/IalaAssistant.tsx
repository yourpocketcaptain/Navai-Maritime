"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Eye, Moon, Sun, Search, Info, RotateCw, Lightbulb, Globe,
    ArrowRight, ChevronLeft, Check, Compass, AlertTriangle,
    Navigation, MapPin, CheckCircle2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IALA_MARKS, IalaMark, IalaRegion, BuoyShape, TopmarkType, ColorPattern, LightColor } from '@/lib/iala-data';

// --- Constants & Assets ---

const REGIONS: { id: IalaRegion; name: string; desc: string }[] = [
    { id: 'A', name: 'Region A', desc: 'Europe, Africa, Australia, parts of Asia' },
    { id: 'B', name: 'Region B', desc: 'Americas, Japan, Korea, Philippines' }
];

const COLOR_MAP: Record<string, string> = {
    'Red': 'Red',
    'Green': 'Green',
    'Yellow': 'Yellow',
    'Black': 'Black',
    'White': 'White'
};

const COLOR_HEX: Record<string, string> = {
    'Red': '#ef4444',
    'Green': '#22c55e',
    'Yellow': '#eab308',
    'Black': '#18181b',
    'White': '#fafafa'
};

const SHAPE_LABELS: Record<string, string> = {
    'Can': 'Can',
    'Nun': 'Nun',
    'Pillar': 'Pillar',
    'Spar': 'Spar',
    'Spherical': 'Spherical'
};

const ShapeIcon = ({ type, color = 'currentColor' }: { type: BuoyShape; color?: string }) => {
    switch (type) {
        case 'Can': return <svg viewBox="0 0 24 24" className="w-full h-full" fill={color}><rect x="6" y="6" width="12" height="14" rx="1" /></svg>;
        case 'Nun': return <svg viewBox="0 0 24 24" className="w-full h-full" fill={color}><path d="M12 4L5 20H19L12 4Z" /></svg>;
        case 'Pillar': return <svg viewBox="0 0 24 24" className="w-full h-full" fill={color}><rect x="9" y="4" width="6" height="18" rx="1" /><rect x="6" y="20" width="12" height="2" rx="0.5" /></svg>;
        case 'Spar': return <svg viewBox="0 0 24 24" className="w-full h-full" fill={color}><rect x="11" y="2" width="2" height="20" rx="1" /></svg>;
        case 'Spherical': return <svg viewBox="0 0 24 24" className="w-full h-full" fill={color}><circle cx="12" cy="14" r="8" /><rect x="8" y="21" width="8" height="1" rx="0.5" /></svg>;
        default: return null;
    }
};

// Simple SVG Icons for Topmarks
const TopmarkIcon = ({ type, color = 'currentColor' }: { type: TopmarkType | 'None'; color?: string }) => {
    switch (type) {
        case '2 Cones Up': return (
            <svg viewBox="0 0 24 24" className="w-full h-full" fill={color}>
                <path d="M12 2L8 8H16L12 2Z" />
                <path d="M12 10L8 16H16L12 10Z" />
            </svg>
        );
        case '2 Cones Down': return (
            <svg viewBox="0 0 24 24" className="w-full h-full" fill={color}>
                <path d="M12 14L8 8H16L12 14Z" />
                <path d="M12 22L8 16H16L12 22Z" />
            </svg>
        );
        case '2 Cones Base-to-Base': return (
            <svg viewBox="0 0 24 24" className="w-full h-full" fill={color}>
                <path d="M12 4L8 10H16L12 4Z" />
                <path d="M12 20L8 14H16L12 20Z" />
            </svg>
        );
        case '2 Cones Point-to-Point': return (
            <svg viewBox="0 0 24 24" className="w-full h-full" fill={color}>
                <path d="M12 10L8 4H16L12 10Z" />
                <path d="M12 14L8 20H16L12 14Z" />
            </svg>
        );
        case '2 Spheres': return (
            <svg viewBox="0 0 24 24" className="w-full h-full" fill={color}>
                <circle cx="12" cy="7" r="3" />
                <circle cx="12" cy="17" r="3" />
            </svg>
        );
        case '1 Sphere': return (
            <svg viewBox="0 0 24 24" className="w-full h-full" fill={color}>
                <circle cx="12" cy="12" r="4" />
            </svg>
        );
        case 'X': return (
            <svg viewBox="0 0 24 24" className="w-full h-full" stroke={color} strokeWidth="3">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
        );
        case 'Cross': return (
            <svg viewBox="0 0 24 24" className="w-full h-full" fill={color}>
                <rect x="11" y="4" width="2" height="16" />
                <rect x="4" y="11" width="16" height="2" />
            </svg>
        );
        default: return <X className="w-4 h-4 opacity-20" />;
    }
};

export default function IalaAssistant() {
    // --- State ---
    const [view, setView] = useState<'wizard' | 'library'>('wizard');
    const [step, setStep] = useState(0);
    const [region, setRegion] = useState<IalaRegion>('A');
    const [mode, setMode] = useState<'day' | 'night'>('day');

    // Identification State (Day)
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedShape, setSelectedShape] = useState<BuoyShape | null>(null);

    // Light Tapper State (Night)
    const [taps, setTaps] = useState<number[]>([]);
    const [lastTap, setLastTap] = useState<number>(0);
    const [detectedRhythm, setDetectedRhythm] = useState<string | null>(null);
    const [selectedLightColor, setSelectedLightColor] = useState<LightColor | null>(null);

    // Results
    const [potentialMatches, setPotentialMatches] = useState<IalaMark[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showRegionMap, setShowRegionMap] = useState(false);
    const [selectedMark, setSelectedMark] = useState<IalaMark | null>(null);

    // --- Logic ---

    const handleTap = () => {
        const now = performance.now();
        if (lastTap > 0) {
            const interval = (now - lastTap) / 1000;
            setTaps(prev => [...prev, interval].slice(-10));
        }
        setLastTap(now);
    };

    const calculateRhythm = () => {
        if (taps.length < 2) return;
        const avg = taps.reduce((a, b) => a + b) / taps.length;
        if (avg < 1) setDetectedRhythm("Quick Flashing (Q)");
        else setDetectedRhythm("Flashing (Fl)");
        runIdentification();
    };

    const resetWizard = () => {
        setStep(1);
        setSelectedColors([]);
        setSelectedShape(null);
        setTaps([]);
        setLastTap(0);
        setDetectedRhythm(null);
        setSelectedLightColor(null);
        setPotentialMatches([]);
        setSelectedIndex(0);
    };

    const handleColorToggle = (color: string) => {
        setSelectedColors(prev =>
            prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
        );
    };

    const runIdentification = () => {
        const matches = IALA_MARKS.filter(m => {
            // Filter by Region (Lateral/Preferred context)
            if (m.region !== 'Both' && m.region !== region && (m.category === 'Lateral' || m.category === 'Preferred Channel')) {
                return false;
            }

            if (mode === 'day') {
                // Flexible color matching: All selected colors must be present in the mark
                if (selectedColors.length > 0) {
                    const englishSelectedColors = selectedColors.map(c => COLOR_MAP[c] || c);
                    const hasAllSelectedColors = englishSelectedColors.every(c => m.day.colors.includes(c));
                    if (!hasAllSelectedColors) return false;
                } else {
                    // If no colors selected and we are identifying, we need some criteria
                    return false;
                }

                if (selectedShape && m.day.shape !== selectedShape) return false;
                return true;
            } else {
                if (selectedLightColor && m.night.lightColor !== selectedLightColor) return false;
                if (detectedRhythm) {
                    if (detectedRhythm.includes("VQ") && !m.night.rhythm.includes("VQ")) return false;
                    if (detectedRhythm.includes("Q") && !detectedRhythm.includes("VQ") && !m.night.rhythm.includes("Q")) return false;
                }
                return true;
            }
        });

        setPotentialMatches(matches);
        setSelectedIndex(0);
        setStep(5);
    };

    // --- Sub-Renders ---

    const renderHeader = () => (
        <div className="flex justify-between items-center mb-10 px-2">
            <div className="flex gap-2">
                <button
                    onClick={() => { setView('wizard'); resetWizard(); setStep(0); }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'wizard' ? 'bg-maritime-ocean text-white' : 'text-white/30 hover:bg-white/5'}`}
                >
                    Wizard
                </button>
                <button
                    onClick={() => setView('library')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'library' ? 'bg-maritime-ocean text-white' : 'text-white/30 hover:bg-white/5'}`}
                >
                    Library
                </button>
            </div>
            {step > 0 && view === 'wizard' && (
                <button onClick={resetWizard} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <RotateCw className="w-4 h-4 text-white/40" />
                </button>
            )}
        </div>
    );

    const renderStart = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 space-y-8">
            <div className="w-24 h-24 bg-maritime-ocean/10 rounded-full flex items-center justify-center mx-auto border-4 border-maritime-ocean/20 shadow-2xl">
                <Eye className="w-10 h-10 text-maritime-ocean" />
            </div>
            <div>
                <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-tight">NavAI <span className="text-maritime-ocean not-italic">BUOY FINDER</span></h2>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Smart IALA Identification System</p>
            </div>
            <button
                onClick={() => setStep(1)}
                className="group relative px-12 py-6 bg-white text-maritime-midnight font-black uppercase tracking-[0.3em] overflow-hidden rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
            >
                <span className="relative z-10">START ASSISTANT</span>
            </button>
        </motion.div>
    );

    const renderRegionSelection = () => (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <span className="text-[10px] font-black text-maritime-ocean uppercase tracking-[0.4em]">PHASE 01</span>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">SELECT YOUR REGION</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REGIONS.map(r => (
                    <button
                        key={r.id}
                        onClick={() => { setRegion(r.id); setStep(2); }}
                        className="p-8 rounded-3xl border-2 border-white/5 bg-white/5 hover:border-maritime-ocean hover:bg-white/10 transition-all text-left flex items-start gap-4 group"
                    >
                        <MapPin className="w-6 h-6 text-maritime-ocean mt-1 group-hover:scale-110 transition-transform" />
                        <div>
                            <span className="block font-black text-xl text-white tracking-widest uppercase mb-1">{r.name}</span>
                            <span className="block text-[10px] text-white/30 font-bold uppercase leading-relaxed">{r.desc}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Region Map Helper */}
            <div className="pt-4 flex flex-col items-center gap-6">
                <button
                    onClick={() => setShowRegionMap(!showRegionMap)}
                    className="flex items-center gap-3 px-8 py-4 bg-maritime-ocean/10 border-2 border-maritime-ocean/20 rounded-2xl text-maritime-ocean font-black uppercase tracking-widest text-[11px] hover:bg-maritime-ocean hover:text-white transition-all shadow-lg"
                >
                    <Globe className="w-4 h-4" />
                    {showRegionMap ? 'HIDE MAP' : 'IDENTIFY YOUR REGION'}
                </button>

                {showRegionMap && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="w-full bg-white rounded-[2.5rem] p-6 md:p-10 border-4 border-maritime-ocean/30 shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-maritime-ocean flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h4 className="text-maritime-midnight font-black uppercase tracking-wider text-sm">IALA World Distribution</h4>
                                <p className="text-[10px] text-maritime-midnight/50 font-bold uppercase">Lateral Systems A & B</p>
                            </div>
                        </div>
                        <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                            <img
                                src="/images/iala/iala-map.png"
                                alt="IALA Regions Map"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                        <div className="mt-6 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 flex gap-4 items-start">
                            <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                <Info className="w-4 h-4 text-maritime-blue" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
                                <span className="text-maritime-blue block mb-1">Important Note:</span>
                                Ensure you select the correct region to receive accurate Port/Starboard instructions for your sailing area.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );

    const renderDayNightSelection = () => (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <span className="text-[10px] font-black text-maritime-ocean uppercase tracking-[0.4em]">PHASE 02</span>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">WHAT ARE YOU SEEING?</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => { setMode('day'); setStep(3); }}
                    className="p-12 rounded-[2.5rem] bg-white text-maritime-midnight hover:scale-105 transition-all shadow-2xl flex flex-col items-center gap-6"
                >
                    <Sun className="w-12 h-12 stroke-[3]" />
                    <span className="font-black tracking-[0.3em] uppercase text-sm">A Physical Object</span>
                </button>
                <button
                    onClick={() => { setMode('night'); setStep(3); }}
                    className="p-12 rounded-[2.5rem] bg-black border-4 border-white text-white hover:scale-105 transition-all shadow-2xl flex flex-col items-center gap-6"
                >
                    <Moon className="w-12 h-12" />
                    <span className="font-black tracking-[0.3em] uppercase text-sm">A Flashing Light</span>
                </button>
            </div>
        </div>
    );

    const renderDayAttributes = () => (
        <div className="space-y-10">
            <div className="text-center space-y-2">
                <span className="text-[10px] font-black text-maritime-ocean uppercase tracking-[0.4em]">PHASE 03</span>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">DESCRIBE THE MARK</h3>
            </div>

            <div className="space-y-4">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">1. COLORS (SELECT ALL)</span>
                <div className="flex flex-wrap gap-3">
                    {Object.keys(COLOR_MAP).map(c => {
                        const actualColor = COLOR_HEX[c];
                        const isSelected = selectedColors.includes(c);
                        return (
                            <button
                                key={c}
                                onClick={() => handleColorToggle(c)}
                                className={`px-4 py-3 rounded-2xl border-2 flex items-center gap-2 transition-all ${isSelected ? 'border-white bg-white/10 scale-105' : 'border-white/5 bg-white/5'}`}
                            >
                                <div className="w-4 h-4 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: actualColor }} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-white/40'}`}>{c}</span>
                            </button>
                        );
                    })}
                </div>
            </div>


            <div className="space-y-4">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">2. BUOY SHAPE</span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {(['Can', 'Nun', 'Pillar', 'Spar', 'Spherical'] as BuoyShape[]).map(s => (
                        <button
                            key={s}
                            onClick={() => setSelectedShape(s)}
                            className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${selectedShape === s ? 'border-maritime-ocean bg-maritime-ocean/10 scale-105' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                        >
                            <div className="w-12 h-12 opacity-80">
                                <ShapeIcon type={s} color={selectedShape === s ? '#38bdf8' : '#64748b'} />
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-tight text-center ${selectedShape === s ? 'text-maritime-ocean' : 'text-white/40'}`}>
                                {SHAPE_LABELS[s]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>


            <div className="pt-6">
                <button
                    disabled={!selectedColors.length && !selectedShape}
                    onClick={runIdentification}
                    className="w-full py-6 bg-maritime-ocean disabled:bg-white/5 disabled:text-white/10 text-maritime-midnight font-black uppercase tracking-[0.3em] rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-3"
                >
                    IDENTIFY MARK <Search className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const renderNightAttributes = () => (
        <div className="space-y-10">
            <div className="text-center space-y-2">
                <span className="text-[10px] font-black text-maritime-ocean uppercase tracking-[0.4em]">PHASE 03 (NIGHT)</span>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">IDENTIFY THE LIGHT</h3>
            </div>

            <div className="space-y-4">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">1. LIGHT COLOR</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['White', 'Red', 'Green', 'Yellow'] as LightColor[]).map(c => {
                        const actualColor = c === 'Red' ? '#ef4444' : c === 'Green' ? '#22c55e' : c === 'Yellow' ? '#eab308' : '#fafafa';
                        const isSelected = selectedLightColor === c;
                        return (
                            <button
                                key={c}
                                onClick={() => setSelectedLightColor(c)}
                                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${isSelected ? 'border-white bg-white/10' : 'border-white/5 bg-white/5'}`}
                            >
                                <div className={`w-8 h-8 rounded-full border-2 ${isSelected ? 'bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'bg-transparent border-white/20'}`} style={isSelected ? { backgroundColor: actualColor } : {}} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-white/40'}`}>{c}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end px-2">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">2. RHYTHM CALCULATOR</span>
                    {taps.length > 0 && <button onClick={() => setTaps([])} className="text-[8px] font-bold text-red-500 uppercase tracking-widest">Reset Taps</button>}
                </div>
                <button
                    onMouseDown={handleTap}
                    className="w-full h-64 bg-black border-4 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 active:scale-[0.98] active:border-white transition-all group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-maritime-ocean/5 opacity-0 group-active:opacity-100 transition-opacity" />
                    <Lightbulb className={`w-12 h-12 ${taps.length % 2 === 0 ? 'text-white/20' : 'text-yellow-400 group-active:scale-125'} transition-all`} />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">TAP EVERY TIME IT FLASHES</span>
                    <div className="flex gap-1 mt-2">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i < taps.length ? 'w-4 bg-maritime-ocean' : 'w-2 bg-white/5'}`} />
                        ))}
                    </div>
                </button>
            </div>

            <div className="pt-6">
                <button
                    disabled={!selectedLightColor}
                    onClick={calculateRhythm}
                    className="w-full py-6 bg-maritime-ocean disabled:bg-white/5 disabled:text-white/10 text-maritime-midnight font-black uppercase tracking-[0.3em] rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-3"
                >
                    IDENTIFY LIGHT <Search className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const renderResult = () => {
        if (potentialMatches.length === 0) {
            return (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">No Match Found</h2>
                    <p className="text-gray-500 max-w-xs mb-8">We couldn't identify the mark with the provided criteria. Try selecting different attributes.</p>
                    <button
                        onClick={resetWizard}
                        className="px-8 py-4 bg-maritime-ocean text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-maritime-ocean/90 transition-colors shadow-lg shadow-maritime-ocean/20"
                    >
                        Try Again
                    </button>
                </motion.div>
            );
        }

        const match = potentialMatches[selectedIndex];

        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">

                <div className="relative p-8 md:p-12 pt-24 md:pt-32 bg-white rounded-[3rem] text-maritime-midnight overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.1)] group">
                    {/* Multi-result Navigation (Top Left) */}
                    {potentialMatches.length > 1 && (
                        <div className="absolute top-0 left-0 p-8 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-maritime-ocean flex items-center justify-center shadow-lg shadow-maritime-ocean/20">
                                    <Search className="w-4 h-4 text-white" />
                                </div>
                                <div className="hidden sm:block">
                                    <h3 className="text-[10px] font-black uppercase tracking-wider text-maritime-midnight/60 leading-tight">Multiple Possibilities</h3>
                                    <p className="text-[9px] text-maritime-midnight font-black uppercase tracking-widest">
                                        {selectedIndex + 1} of {potentialMatches.length}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => setSelectedIndex(prev => (prev > 0 ? prev - 1 : potentialMatches.length - 1))}
                                    className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors text-maritime-midnight/40 hover:text-maritime-midnight shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setSelectedIndex(prev => (prev < potentialMatches.length - 1 ? prev + 1 : 0))}
                                    className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors text-maritime-midnight/40 hover:text-maritime-midnight shadow-sm"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2">
                        <div className="bg-maritime-midnight text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {match.category}
                        </div>
                        {match.region && match.region !== 'Both' && (
                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${match.region === region
                                ? 'bg-green-500/10 border-green-500/20 text-green-600'
                                : 'bg-orange-500/10 border-orange-500/20 text-orange-600'
                                }`}>
                                Region {match.region}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12">

                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <div>
                                <h3 className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] mb-2">IDENTIFIED MARK</h3>
                                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">{match.name}</h2>
                            </div>

                            {match.officialImage && (
                                <div className="p-4 bg-gray-50 rounded-3xl border-2 border-gray-100 overflow-hidden shadow-inner group">
                                    <div className="flex items-center gap-2 mb-3 px-2">
                                        <div className="w-6 h-6 rounded bg-maritime-ocean/10 flex items-center justify-center">
                                            <Info className="w-3 h-3 text-maritime-ocean" />
                                        </div>
                                        <span className="text-[9px] font-black text-maritime-ocean uppercase tracking-widest">Official Reference Diagram</span>
                                    </div>
                                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#f8fafc] border border-gray-200 p-4">
                                        <img
                                            src={match.officialImage}
                                            alt="Official reference"
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                </div>
                            )}


                            <div className="space-y-4">
                                <div className="p-6 bg-red-500/5 border-2 border-red-500 rounded-2xl">
                                    <h4 className="flex items-center gap-2 text-red-600 font-extrabold text-[10px] uppercase tracking-widest mb-1">
                                        <AlertTriangle className="w-4 h-4" /> PILOT INSTRUCTION
                                    </h4>
                                    <p className="text-xl md:text-2xl font-black uppercase tracking-tight text-red-700 leading-none">{match.instruction}</p>
                                </div>

                                {match.region && match.region !== 'Both' && match.region !== region && (
                                    <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl flex gap-3 items-center">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <h5 className="text-[10px] font-black text-orange-700 uppercase tracking-widest">Attention: Different Region</h5>
                                            <p className="text-[10px] font-bold text-orange-600 uppercase">This mark belongs to **Region {match.region}**. You are searching in **Region {region}**.</p>
                                        </div>
                                    </div>
                                )}


                                {detectedRhythm && (
                                    <div className="p-4 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-xl">
                                        <span className="text-[8px] font-black text-maritime-ocean uppercase tracking-widest">DETECTED RHYTHM</span>
                                        <p className="font-extrabold text-maritime-ocean tracking-wide">{detectedRhythm}</p>
                                    </div>
                                )}
                                <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-100">
                                    <h4 className="flex items-center gap-2 text-gray-400 font-extrabold text-[10px] uppercase tracking-widest mb-1">
                                        <Compass className="w-4 h-4" /> MEANING
                                    </h4>
                                    <p className="text-sm font-bold uppercase text-gray-800 leading-snug">{match.meaning}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={resetWizard}
                        className="w-full mt-10 py-6 bg-maritime-midnight text-white font-black uppercase tracking-[0.3em] rounded-[2rem] hover:scale-[1.02] transition-all"
                    >
                        START NEW SEARCH
                    </button>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-[800px]">
            {renderHeader()}
            <AnimatePresence mode="wait">
                {view === 'wizard' && (
                    <div key="wizard">
                        {step === 0 && renderStart()}
                        {step === 1 && renderRegionSelection()}
                        {step === 2 && renderDayNightSelection()}
                        {step === 3 && mode === 'day' && renderDayAttributes()}
                        {step === 3 && mode === 'night' && renderNightAttributes()}
                        {step === 5 && renderResult()}
                    </div>
                )}
                {view === 'library' && (
                    <div key="library" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {IALA_MARKS.filter(m => m.region === 'Both' || m.region === region).map(m => (
                            <div
                                key={m.id}
                                onClick={() => setSelectedMark(m)}
                                className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:bg-white/10 transition-all cursor-pointer group"
                            >
                                <div className="h-40 bg-white/5 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110 p-2">
                                        {m.officialImage ? (
                                            <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-xl p-2 flex items-center justify-center shadow-inner">
                                                <img
                                                    src={m.officialImage}
                                                    alt={m.name}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 opacity-40 group-hover:opacity-60 transition-opacity">
                                                <ShapeIcon type={m.day.shape} color={m.day.colors[0]} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-maritime-ocean/0 group-hover:bg-maritime-ocean/5 transition-colors" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-maritime-ocean uppercase mb-1">{m.category}</h4>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">{m.name}</h3>
                                        <div className="p-1.5 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Search className="w-3 h-3 text-white/40" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Expanded Image Modal */}
            <AnimatePresence>
                {selectedMark && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
                    >
                        <div
                            className="absolute inset-0 bg-maritime-midnight/90 backdrop-blur-xl"
                            onClick={() => setSelectedMark(null)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
                        >
                            <button
                                onClick={() => setSelectedMark(null)}
                                className="absolute top-6 right-6 z-10 p-3 bg-black/5 hover:bg-black/10 rounded-full transition-colors text-maritime-midnight"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Image Section */}
                            <div className="flex-[1.2] bg-[#f8fafc] flex items-center justify-center p-8 md:p-16 border-b md:border-b-0 md:border-r border-gray-100 shadow-inner">
                                {selectedMark.officialImage ? (
                                    <img
                                        src={selectedMark.officialImage}
                                        alt={selectedMark.name}
                                        className="w-full h-auto max-h-[60vh] object-contain drop-shadow-xl"
                                    />
                                ) : (
                                    <div className="w-48 h-48 opacity-20">
                                        <ShapeIcon type={selectedMark.day.shape} color="#000" />
                                    </div>
                                )}
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center gap-8">
                                <div>
                                    <h4 className="text-[10px] font-black text-maritime-ocean uppercase tracking-[0.4em] mb-3">{selectedMark.category}</h4>
                                    <h2 className="text-4xl md:text-6xl font-black italic text-maritime-midnight uppercase tracking-tighter leading-none">{selectedMark.name}</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-red-500/5 border-2 border-red-500 rounded-2xl">
                                        <h4 className="flex items-center gap-2 text-red-600 font-extrabold text-[10px] uppercase tracking-widest mb-1">
                                            <AlertTriangle className="w-4 h-4" /> PILOT INSTRUCTION
                                        </h4>
                                        <p className="text-xl md:text-2xl font-black uppercase tracking-tight text-red-700 leading-none">{selectedMark.instruction}</p>
                                    </div>

                                    <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-100">
                                        <h4 className="flex items-center gap-2 text-gray-400 font-extrabold text-[10px] uppercase tracking-widest mb-1">
                                            <Compass className="w-4 h-4" /> MEANING
                                        </h4>
                                        <p className="text-sm font-bold uppercase text-gray-800 leading-snug">{selectedMark.meaning}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedMark(null)}
                                    className="mt-4 py-6 bg-maritime-midnight text-white font-black uppercase tracking-[0.3em] rounded-[2rem] hover:scale-[1.02] transition-all shadow-xl shadow-black/20"
                                >
                                    CLOSE DETAILS
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
