"use client";

import React, { useState } from 'react';
import {
    AlertTriangle, ShieldAlert, Navigation, Ship, Wind,
    RotateCcw, Info, Check, MapPin, LifeBuoy, Radio,
    ChevronRight, ChevronLeft, Power, VolumeX, Eye,
    Anchor, Compass, MousePointer2, Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---

type VesselType = 'motor' | 'sail';
type ManeuverType = 'anderson' | 'williamson' | 'scharnow' | 'quick-stop';

interface MOBStep {
    id: number;
    title: string;
    description: string;
    action: string;
    visualLabel: string;
    icon: any;
    color: string;
    tip?: string;
    image?: string;
}

// --- Common Phases (5 Phases for ALL) ---
const COMMON_PHASES: Record<number, Partial<MOBStep>> = {
    1: {
        title: "IMMEDIATE ACTION",
        description: "Shout 'MAN OVERBOARD'. Assign a spotter. Throw lifebuoy & mark GPS position.",
        action: "MARK POSITION & SPOTTER",
        visualLabel: "SPOTTER: POINT CONTINUOUSLY",
        icon: LifeBuoy,
        color: "red",
        tip: "Throw buoyant objects to 'litter' the water and help identify the area."
    },
    2: {
        title: "DISTRESS CALL",
        description: "DSC Alert + Mayday (CH 16). Inform the crew that this is NOT a drill.",
        action: "MAYDAY MAYDAY MAYDAY",
        visualLabel: "CH 16 - DISTRESS",
        icon: Radio,
        color: "orange",
        tip: "Triggering DSC for 5s sends your exact GPS position automatically."
    },
    3: {
        title: "MANEUVER PHASE",
        description: "",
        action: "",
        visualLabel: "",
        icon: RotateCcw,
        color: "cyan"
    },
    4: {
        title: "PRECISION APPROACH",
        description: "Reduce speed significantly. Study the drift and current for the final leg.",
        action: "SPEED < 2 KNOTS",
        visualLabel: "FINAL APPROACH",
        icon: Compass,
        color: "cyan",
        tip: "Approach from Leeward for boat control, or Windward to provide a 'lee' (shelter)."
    },
    5: {
        title: "FINAL RECOVERY",
        description: "Stop the vessel with person well forward of propellers. Establish contact with rescue line.",
        action: "NEUTRAL GEAR - PICK UP",
        visualLabel: "STOP ENGINES",
        icon: Anchor,
        color: "red",
        tip: "ALWAYS switch to neutral before the person is alongside. The propeller is the main danger."
    }
};

const MANEUVERS: Record<string, Partial<MOBStep>> = {
    'anderson': {
        title: "ANDERSON (Motor)",
        description: "Fastest return for clear visibility. Rudder hard over to MOB side. Deviate 240º.",
        action: "DEVIATE 240º - SINGLE TURN",
        visualLabel: "RETURN ON WAKE",
        image: "/images/maneuvers/anderson.png",
        tip: "Stop engines when target is 15º off the bow."
    },
    'williamson': {
        title: "WILLIAMSON (Motor)",
        description: "Puts the boat back on its own wake. Best for night/fog. Deviate 60º then shift helm.",
        action: "60º DEVIATION -> SHIFT RUDDER",
        visualLabel: "RETURN ON RECIPROCAL",
        image: "/images/maneuvers/williamson.png",
        tip: "Useful when the person overboard is out of immediate sight."
    },
    'scharnow': {
        title: "SCHARNOW (Motor)",
        description: "For delayed realization. Returns ship to its wake far astern. Deviate 240º then shift helm.",
        action: "240º -> SHIFT RUDDER HARD",
        visualLabel: "RETURN ON RECIPROCAL",
        image: "/images/maneuvers/scharnow.png",
        tip: "Most effective when person is beyond turning radius."
    },
    'quick-stop': {
        title: "QUICK-STOP (Sail)",
        description: "Professional 12-step sailing maneuver. Head-to-wind, back headsail, gybe, and return.",
        action: "TURN -> BACK JIB -> GYBE",
        visualLabel: "FIGURE-8 MANEUVER",
        image: "/images/maneuvers/quick-stop.png",
        tip: "Keep jib sheets tight during dousing to keep them inside lifelines."
    }
};

export default function VisualMobSimulator() {
    const [step, setStep] = useState(0);
    const [vesselType, setVesselType] = useState<VesselType>('motor');
    const [maneuver, setManeuver] = useState<ManeuverType>('anderson');

    const startVessel = (type: VesselType) => {
        setVesselType(type);
        setManeuver(type === 'motor' ? 'anderson' : 'quick-stop');
        setStep(1);
    };

    const nextStep = () => {
        if (step === 5) setStep(6);
        else setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => Math.max(0, prev - 1));

    const getCurrentStep = (): MOBStep => {
        const phase = COMMON_PHASES[step] || COMMON_PHASES[1];
        if (step === 3) {
            return { ...phase, ...MANEUVERS[maneuver], id: 3 } as MOBStep;
        }
        return { ...phase, id: step } as MOBStep;
    };

    const currentData = getCurrentStep();

    // --- Renderers ---

    const renderSelection = () => (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500 py-6">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
                    <ShieldAlert className="w-10 h-10" />
                </div>
                <div>
                    <h2 className="text-4xl font-light text-maritime-brass italic">NavAI <span className="font-black text-white not-italic text-2xl md:text-3xl lg:text-4xl block md:inline">MOB (Man Overboard) Simulator</span></h2>
                    <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-black mt-2">Professional Recovery Protocols</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
                <button
                    onClick={() => startVessel('motor')}
                    className="p-10 rounded-[2.5rem] border-2 bg-white/5 border-white/5 hover:bg-white/10 hover:border-maritime-ocean hover:scale-[1.02] transition-all flex flex-col items-center gap-4 group"
                >
                    <div className="p-4 rounded-2xl bg-maritime-ocean text-maritime-midnight">
                        <Power className="w-8 h-8" />
                    </div>
                    <span className="font-black tracking-widest text-sm uppercase">Motor / Merchant</span>
                    <span className="text-[10px] text-white/30 uppercase font-bold">Standard Turn Methods</span>
                </button>

                <button
                    onClick={() => startVessel('sail')}
                    className="p-10 rounded-[2.5rem] border-2 bg-white/5 border-white/5 hover:bg-white/10 hover:border-maritime-brass hover:scale-[1.02] transition-all flex flex-col items-center gap-4 group"
                >
                    <div className="p-4 rounded-2xl bg-maritime-brass text-maritime-midnight">
                        <Wind className="w-8 h-8" />
                    </div>
                    <span className="font-black tracking-widest text-sm uppercase">Sailing Yacht</span>
                    <span className="text-[10px] text-white/30 uppercase font-bold">Quick-Stop Procedure</span>
                </button>
            </div>
        </div>
    );

    const renderWizard = () => (
        <div className="relative bg-black rounded-[3rem] p-6 md:p-12 overflow-hidden min-h-[700px] flex flex-col border-4 border-red-500/20 shadow-2xl">
            {/* Header / Progress */}
            <div className="flex justify-between items-center mb-8 z-10">
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-12 bg-red-500' : s < step ? 'w-4 bg-red-500/40' : 'w-4 bg-white/10'}`}
                        />
                    ))}
                </div>
                <div className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    PHASE {step} / 5
                </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step + (step === 3 && vesselType === 'motor' ? maneuver : '')}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col"
                >
                    <div className="space-y-2 mb-6">
                        <h3 className={`text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-tight ${currentData.color === 'red' ? 'text-red-500' : currentData.color === 'yellow' ? 'text-yellow-400' : currentData.color === 'orange' ? 'text-orange-500' : 'text-cyan-400'}`}>
                            {currentData.title}
                        </h3>
                        {step === 3 && vesselType === 'motor' && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {[
                                    { id: 'anderson', label: 'Anderson (Clear)' },
                                    { id: 'williamson', label: 'Williamson (Night/Fog)' },
                                    { id: 'scharnow', label: 'Scharnow (Delayed)' }
                                ].map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setManeuver(m.id as ManeuverType)}
                                        className={`px-4 py-2 rounded-xl text-[8px] md:text-[9px] font-extrabold uppercase tracking-widest border transition-all ${maneuver === m.id ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-white/20 text-white/40 hover:bg-white/5'}`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        <p className="text-white/60 text-base md:text-lg font-light leading-relaxed max-w-xl pt-4">
                            {currentData.description}
                        </p>
                    </div>

                    {/* Central Visual HUD */}
                    <div className="flex-1 bg-white/5 rounded-[2.5rem] border border-white/10 relative overflow-hidden flex flex-col items-center justify-center p-6 group">
                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                        {currentData.image ? (
                            <motion.img
                                key={currentData.image}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={currentData.image}
                                alt={currentData.title}
                                className="w-full h-full max-h-[350px] object-contain rounded-2xl z-10"
                            />
                        ) : (
                            <>
                                <currentData.icon className={`w-24 h-24 md:w-32 md:h-32 mb-6 ${currentData.color === 'red' ? 'text-red-500' : currentData.color === 'yellow' ? 'text-yellow-400' : currentData.color === 'orange' ? 'text-orange-500' : 'text-cyan-400'} animate-pulse`} />
                                <div className="text-center space-y-2 z-10">
                                    <span className="block text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">PROCEDURAL TARGET</span>
                                    <span className="block text-xl md:text-2xl font-black text-white uppercase tracking-wider">{currentData.action}</span>
                                    <div className={`mt-4 px-6 py-2 rounded-full border-2 font-black text-xs uppercase tracking-widest ${currentData.color === 'red' ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-white/20 text-white/60'}`}>
                                        {currentData.visualLabel}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* HUD Footer Tip */}
                    <div className="mt-8 p-6 bg-white/5 border border-white/5 rounded-3xl flex items-start gap-4">
                        <Info className="w-5 h-5 text-white/40 shrink-0" />
                        <p className="text-[10px] md:text-[11px] text-white/40 font-bold uppercase tracking-wide leading-relaxed">
                            <span className="text-white/60 mr-2">NAVAI TIP:</span>
                            {currentData.tip}
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between gap-4 z-10">
                <button
                    onClick={prevStep}
                    className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4" /> BACK
                </button>
                <button
                    onClick={nextStep}
                    className={`flex-[2] py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] ${currentData.color === 'red' ? 'bg-red-600 text-white shadow-red-600/20' : 'bg-white text-maritime-midnight'}`}
                >
                    {step === 5 ? "RECOVERY DONE" : "NEXT PHASE"} <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const renderSuccess = () => (
        <div className="text-center space-y-10 animate-in zoom-in-95 duration-500 py-12">
            <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 border-4 border-green-500/20 shadow-2xl shadow-green-500/20">
                <Check className="w-16 h-16 stroke-[3]" />
            </div>

            <div className="space-y-4">
                <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-tight">Maneuver Completed</h2>
                <p className="text-maritime-brass font-bold uppercase tracking-widest text-sm">Professional Emergency Training Recorded</p>
            </div>

            <button
                onClick={() => setStep(0)}
                className="px-16 py-6 rounded-[2.5rem] bg-white text-maritime-midnight font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl"
            >
                Return to Menu
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto relative px-4 py-8">
            <AnimatePresence mode="wait">
                {step === 0 && renderSelection()}
                {step >= 1 && step <= 5 && renderWizard()}
                {step > 5 && renderSuccess()}
            </AnimatePresence>
        </div>
    );
}
