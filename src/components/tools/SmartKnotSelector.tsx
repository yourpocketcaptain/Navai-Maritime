"use client";

import React, { useState, useMemo } from 'react';
import {
    Anchor, Ship, Circle, Square, Disc, Menu, Link, LifeBuoy, Package, Wind, Zap, Droplets, Clock, AlertTriangle, CheckCircle, Info, ArrowRight, ChevronLeft, ChevronRight, PlayCircle, RefreshCw, HelpCircle, GraduationCap
} from 'lucide-react';

// --- Types ---

type TargetObjectType = 'fender' | 'dinghy' | 'mooring' | 'spring' | 'canvas' | 'cargo' | 'anchor' | 'tow' | 'mob';
type HardwareType = 'cleat' | 'rail' | 'ring' | 'post' | 'bollard' | 'line' | 'shackle';
type ConditionType = 'tension' | 'quick_release' | 'wet' | 'variable' | 'permanent';

interface KnotScenario {
    object: TargetObjectType | null;
    hardware: HardwareType | null;
    conditions: ConditionType[];
}

interface KnotResult {
    id: string;
    name: string;
    description: string;
    why: string;
    warning?: string;
    proTip?: string;
    videoUrl?: string; // Placeholder for future link
    lessonId?: string; // ID of the Academy lesson to link directly
    lessonTitle?: string; // Title of the Academy lesson to link to (for fuzzy matching)
}

// --- Constants ---

const TARGET_OBJECTS: { id: TargetObjectType; label: string; icon: any }[] = [
    { id: 'fender', label: 'Fenders', icon: Circle }, // Placeholder icon
    { id: 'dinghy', label: 'Dinghy / Tender', icon: Ship },
    { id: 'mooring', label: 'Primary Mooring', icon: Anchor },
    { id: 'spring', label: 'Spring Line', icon: ArrowRight }, // Diagonal arrow?
    { id: 'canvas', label: 'Sail / Canvas', icon: Wind },
    { id: 'cargo', label: 'Deck Cargo', icon: Package },
    { id: 'anchor', label: 'Anchor (No Shackle)', icon: Anchor },
    { id: 'tow', label: 'Tow Line', icon: Link },
    { id: 'mob', label: 'Man Overboard', icon: LifeBuoy },
];

const HARDWARE_OPTIONS: { id: HardwareType; label: string; icon: any; compatibleWith?: TargetObjectType[] }[] = [
    { id: 'cleat', label: 'Cleat', icon: Menu, compatibleWith: ['mooring', 'spring', 'dinghy', 'tow'] },
    { id: 'rail', label: 'Rail / Stanchion', icon: Square, compatibleWith: ['fender', 'dinghy', 'cargo', 'mob'] },
    { id: 'ring', label: 'Ring / Eye', icon: Disc, compatibleWith: ['mooring', 'dinghy', 'anchor', 'spring', 'tow', 'mob'] },
    { id: 'post', label: 'Piling / Post', icon: Square, compatibleWith: ['mooring', 'spring', 'dinghy'] },
    { id: 'bollard', label: 'Bollard', icon: Disc, compatibleWith: ['mooring', 'spring', 'tow'] },
    { id: 'line', label: 'Another Line', icon: Link, compatibleWith: ['fender', 'tow', 'mob'] }, // Special case for joining
    { id: 'shackle', label: 'Anchor Shackle', icon: Link, compatibleWith: ['anchor'] },
    // "Canvas" might attach to rail or ring
    // "Cargo" might attach to rail or ring
];

const CONDITIONS: { id: ConditionType; label: string; icon: any; description: string }[] = [
    { id: 'tension', label: 'High Tension', icon: Zap, description: 'Heavy load, must not jam.' },
    { id: 'quick_release', label: 'Quick Release', icon: Wind, description: 'Must untie instantly.' },
    { id: 'wet', label: 'Wet / Synthetic', icon: Droplets, description: 'Slippery rope.' },
    { id: 'variable', label: 'Variable Load', icon: RefreshCw, description: 'Slackens and tenses.' },
    { id: 'permanent', label: 'Permanent', icon: Clock, description: 'Long-term security.' },
];

// --- Engine ---

const getKnotRecommendation = (scenario: KnotScenario): KnotResult | null => {
    const { object, hardware, conditions } = scenario;
    if (!object || !hardware) return null;

    // --- RULES ENGINE ---

    // 1. Fender
    if (object === 'fender') {
        if (hardware === 'rail') {
            if (conditions.includes('quick_release')) return {
                id: 'slipped_clove_hitch',
                name: 'Slipped Clove Hitch',
                description: 'A temporary hitch that holds well on rails but releases instantly.',
                why: 'Perfect for temporary fender placement. The "slipped" loop allows for instant adjustment or removal.',
                warning: 'Can slide on smooth rails if not under tension. Add a half hitch for security if staying overnight.',
                proTip: 'Always pass the working end over the standing part first.',
                // lessonTitle: 'Clove Hitch' // Removed as per user request for exact match
            };
            return {
                id: 'clove_hitch',
                name: 'Clove Hitch',
                description: 'The standard knot for attaching to a rail or post.',
                why: 'Simple to tie and adjust. Grips the rail efficiently.',
                proTip: 'For synthetic ropes on smooth rails, use a Round Turn & Two Half Hitches instead to prevent sliding.',
                lessonTitle: 'Clove Hitch'
            };
        }
        if (hardware === 'line') return {
            id: 'cow_hitch',
            name: 'Cow Hitch',
            description: 'Simple loop knot.',
            why: 'Quick way to attach a fender to a lifeline.',
            // No direct lesson match in provided list
        };
    }

    // 2. Mooring & Spring
    if (object === 'mooring' || object === 'spring') {
        if (hardware === 'cleat') return {
            id: 'cleat_hitch',
            name: 'Cleat Hitch',
            description: 'The definitive knot for securing a boat to a cleat.',
            why: 'Distributes the load across the cleat horns. Does not jam under extreme tension.',
            proTip: 'Finish with a single locking hitch. Never double lock it!',
            lessonTitle: 'Cleat Hitch'
        };
        if (hardware === 'post' || hardware === 'bollard') return {
            id: 'bowline',
            name: 'Bowline',
            description: 'The "King of Knots". Creates a fixed loop.',
            why: 'Secure loop that fits over the bollard. Easy to untie after loading.',
            proTip: 'If the pile is very high, use a Round Turn & Two Half Hitches to prevent it sliding down.',
            lessonTitle: 'Bowline Knot'
        };
        if (hardware === 'ring') return {
            id: 'round_turn_two_half_hitches',
            name: 'Round Turn & Two Half Hitches',
            description: 'Secure knot for rings and bars.',
            why: 'The round turn takes the chafe and tension, making it easy to tie even under load.',
            lessonTitle: 'Round Turn and Two Half Hitches'
        };
    }

    // 3. Anchor
    if (object === 'anchor') {
        if (hardware === 'shackle' || hardware === 'ring') {
            return {
                id: 'anchor_bend',
                name: 'Anchor Bend',
                description: 'A hitch specifically for seizing an anchor to a line.',
                why: 'Extremely secure and resistant to chafe. It essentially is a Round Turn & Two Half Hitches with the first hitch through the turn.',
                proTip: 'Seize the free end to the standing part for permanence.',
                // lessonTitle: 'Round Turn and Two Half Hitches' // Removed for exact match
            };
        }
    }

    // 4. Cargo / Deck
    if (object === 'cargo') {
        if (conditions.includes('tension')) return {
            id: 'truckers_hitch',
            name: 'Trucker\'s Hitch',
            description: 'Compound knot with mechanical advantage.',
            why: 'Allows you to crank down on the load to secure it tightly against the deck.',
            proTip: 'Use a slipped half hitch to finish so you can release the tension easily.'
            // No direct lesson match
        };
        return {
            id: 'bowline',
            name: 'Bowline',
            description: 'Fixed loop.',
            why: 'Good for lashing down if tensioning isn\'t the priority.',
            lessonTitle: 'Bowline Knot'
        }
    }

    // 5. Joining Lines (Two Lines) - Implicit if 'tow' or just general line work
    // But if Object is Tow and Hardware is Line -> Towing logic
    if ((object === 'tow' || object === 'mob') && hardware === 'line') {
        if (conditions.includes('variable')) return {
            id: 'sheet_bend',
            name: 'Sheet Bend',
            description: 'Join two ropes of different diameters.',
            why: 'Works where a square knot fails. Holds well on different thicknesses.',
            lessonTitle: 'Sheet Bend'
        };
        return {
            id: 'double_sheet_bend',
            name: 'Double Sheet Bend',
            description: 'More secure version of the Sheet Bend.',
            why: 'Use this for synthetic lines or widely different diameters to prevent slipping.',
            // lessonTitle: 'Sheet Bend' // Removed for exact match
        };
    }

    // 6. Dinghy
    if (object === 'dinghy') {
        // Often creates a bridle or simple painter tie up
        if (hardware === 'cleat') return {
            id: 'cleat_hitch',
            name: 'Cleat Hitch',
            description: 'Secure painter to cleat.',
            why: 'Standard procedure.',
            lessonTitle: 'Cleat Hitch'
        };
        if (hardware === 'rail') return {
            id: 'round_turn_two_half_hitches',
            name: 'Round Turn & Two Half Hitches',
            description: 'Secure painter to rail.',
            why: 'Better than clove hitch for painters as it won\'t roll out.',
            lessonTitle: 'Round Turn and Two Half Hitches'
        };
    }

    // Default Fallback
    return {
        id: 'bowline',
        name: 'Bowline',
        description: 'The essential loop knot.',
        why: 'When in doubt, a Bowline is rarely a wrong choice for a loop. It holds strong and unties easily.',
        proTip: 'Remember the rabbit comes out of the hole, round the tree, and back down the hole.',
        lessonTitle: 'Bowline Knot'
    };
};

export default function SmartKnotSelector() {
    const [step, setStep] = useState(1);
    const [scenario, setScenario] = useState<KnotScenario>({
        object: null,
        hardware: null,
        conditions: []
    });

    const result = useMemo(() => getKnotRecommendation(scenario), [scenario]);

    const nextStep = () => setStep(s => Math.min(5, s + 1));
    const prevStep = () => setStep(s => Math.max(1, s - 1));
    const restart = () => {
        setScenario({ object: null, hardware: null, conditions: [] });
        setStep(1);
    };

    const toggleCondition = (id: ConditionType) => {
        setScenario(prev => {
            const has = prev.conditions.includes(id);
            return {
                ...prev,
                conditions: has ? prev.conditions.filter(c => c !== id) : [...prev.conditions, id]
            };
        });
    };

    // --- Renderers ---

    const renderStep1 = () => (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center">
                <h3 className="text-2xl font-light text-maritime-brass">The Target Object</h3>
                <p className="text-sm text-white/50">What object are you trying to secure?</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {TARGET_OBJECTS.map(obj => (
                    <button
                        key={obj.id}
                        onClick={() => {
                            setScenario(s => ({ ...s, object: obj.id }));
                            nextStep();
                        }}
                        className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-4 text-center group ${scenario.object === obj.id
                            ? 'bg-maritime-ocean/20 border-maritime-ocean text-white'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20 hover:text-white'
                            }`}
                    >
                        <obj.icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <span className="text-xs uppercase font-bold tracking-widest">{obj.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center">
                <h3 className="text-2xl font-light text-maritime-brass">The Hardware</h3>
                <p className="text-sm text-white/50">What are you tying it to?</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {HARDWARE_OPTIONS
                    .filter(hw => !hw.compatibleWith || (scenario.object && hw.compatibleWith.includes(scenario.object)) || (!hw.compatibleWith && true))
                    .map(hw => (
                        <button
                            key={hw.id}
                            onClick={() => {
                                setScenario(s => ({ ...s, hardware: hw.id }));
                                nextStep();
                            }}
                            className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-4 text-center group ${scenario.hardware === hw.id
                                ? 'bg-maritime-brass/20 border-maritime-brass text-white'
                                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20 hover:text-white'
                                }`}
                        >
                            <hw.icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <span className="text-xs uppercase font-bold tracking-widest">{hw.label}</span>
                        </button>
                    ))}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center">
                <h3 className="text-2xl font-light text-maritime-brass">The Conditions</h3>
                <p className="text-sm text-white/50">Select any special conditions that apply.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONDITIONS.map(cond => {
                    const active = scenario.conditions.includes(cond.id);
                    return (
                        <button
                            key={cond.id}
                            onClick={() => toggleCondition(cond.id)}
                            className={`p-4 rounded-xl border transition-all flex items-center gap-4 text-left group ${active
                                ? 'bg-maritime-teal/20 border-maritime-teal text-white'
                                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                }`}
                        >
                            <div className={`p-2 rounded-full ${active ? 'bg-maritime-teal text-maritime-midnight' : 'bg-white/10'}`}>
                                <cond.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-sm font-bold uppercase tracking-wider">{cond.label}</span>
                                <span className="text-[10px] opacity-60">{cond.description}</span>
                            </div>
                            {active && <CheckCircle className="w-5 h-5 text-maritime-teal ml-auto" />}
                        </button>
                    )
                })}
            </div>
            <div className="flex justify-center pt-8">
                <button
                    onClick={nextStep}
                    className="bg-maritime-ocean hover:bg-maritime-teal text-maritime-midnight px-12 py-4 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:shadow-maritime-ocean/20 transition-all"
                >
                    Find My Knot <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const renderStep5 = () => {
        if (!result) return (
            <div className="text-center py-20 animate-in fade-in">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">No perfect match found.</h3>
                <p className="text-white/50 mb-8">Try adjusting your conditions.</p>
                <button onClick={prevStep} className="px-6 py-2 bg-white/10 rounded-lg">Go Back</button>
            </div>
        );

        return (
            <div className="space-y-8 animate-in zoom-in-95 fade-in duration-500">
                <div className="border border-maritime-ocean/30 bg-maritime-ocean/5 rounded-[2.5rem] p-1 overflow-hidden">
                    <div className="bg-maritime-midnight/80 backdrop-blur-xl rounded-[2.4rem] p-8 md:p-12 relative">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-maritime-ocean/30 bg-maritime-ocean/10 text-maritime-ocean text-[10px] uppercase tracking-widest font-bold mb-2">
                                    <CheckCircle className="w-3 h-3" /> Recommended Knot
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white">{result.name}</h2>
                            </div>
                            <div className="flex gap-2">

                                <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                                    <Info className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Image Placeholder */}
                        <div className="w-full rounded-3xl bg-black/40 border border-white/5 mb-8 flex items-center justify-center relative overflow-hidden group p-6">

                            <img
                                key={result.id} // Force re-render on change
                                src={`/images/knots/${result.id}.jpg`}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    // Show fallback div (by un-hiding it or using state)
                                    const fallback = document.getElementById(`fallback-${result.id}`);
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                                className="max-h-[300px] w-auto object-contain rounded-xl transition-opacity duration-700"
                                alt={result.name}
                            />

                            {/* Fallback Visualization (Hidden by default, shown on error) */}
                            <div id={`fallback-${result.id}`} className="absolute inset-0 hidden flex-col items-center justify-center text-center p-8">
                                <div className="p-6 rounded-full bg-white/5 mb-4 animate-pulse">
                                    <RefreshCw className="w-12 h-12 text-white/20" />
                                </div>
                                <p className="text-white/40 font-mono text-sm uppercase tracking-widest">Visualisation Generating...</p>
                                <p className="text-white/20 text-xs mt-2 max-w-xs">High Definition render for {result.name} is being processed.</p>
                            </div>


                        </div>

                        {/* Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-maritime-brass font-bold uppercase tracking-widest text-sm">Why this knot?</h4>
                                <p className="text-white/80 leading-relaxed font-light text-lg">
                                    {result.why}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-maritime-teal font-bold uppercase tracking-widest text-sm">Pro Tip</h4>
                                <div className="p-4 bg-maritime-teal/10 border border-maritime-teal/20 rounded-xl">
                                    <p className="text-maritime-teal text-sm leading-relaxed">
                                        {result.proTip}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {result.warning && (
                            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                                <p className="text-red-300 text-sm">{result.warning}</p>
                            </div>
                        )}

                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <button onClick={restart} className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors">
                        Start Over
                    </button>
                    {(result.lessonId || result.lessonTitle) && (
                        <a
                            href={result.lessonId
                                ? `/client/academy?lessonId=${result.lessonId}`
                                : `/client/academy?lessonTitle=${encodeURIComponent(result.lessonTitle || '')}`}
                            className="bg-maritime-ocean hover:bg-maritime-teal text-maritime-midnight px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 shadow-lg shadow-maritime-ocean/20"
                        >
                            <GraduationCap className="w-4 h-4" /> View Lesson
                        </a>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto relative">
            {/* Progress Bar */}
            <div className="mb-12">
                <div className="flex justify-between items-end mb-2 px-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Wizard Progress</span>
                    <span className="text-xs font-mono text-maritime-ocean">{step < 4 ? `Step ${step}/3` : 'Result'}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-maritime-ocean transition-all duration-500 ease-out"
                        style={{ width: `${step >= 4 ? 100 : ((step) / 4) * 100}%` }}
                    />
                </div>
            </div>

            {/* Back Button */}
            {step > 1 && step < 4 && (
                <button onClick={prevStep} className="group flex items-center gap-2 text-white/40 hover:text-white mb-6 uppercase tracking-widest text-[10px] font-bold transition-colors">
                    <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back
                </button>
            )}

            {/* Steps Container */}
            <div className="min-h-[400px]">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {(step === 4 || step === 5) && renderStep5()}
            </div>
        </div>
    );
}
