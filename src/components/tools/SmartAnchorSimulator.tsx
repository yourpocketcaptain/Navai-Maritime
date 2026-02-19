
"use client";

import React, { useState, useMemo } from 'react';
import {
    Anchor, Wind, Ship, Ruler, ChevronRight, ChevronLeft,
    AlertTriangle, CheckCircle, Info, Waves, CloudRain,
    ArrowDown, Navigation, Anchor as AnchorIcon, X, HelpCircle
} from 'lucide-react';

// --- Types ---

type ShipType = 'sailboat' | 'motorboat' | 'catamaran';
type AnchorType = 'delta' | 'rocna' | 'cqr' | 'danforth' | 'bruce' | 'grapnel';
type LineType = 'chain' | 'mixed' | 'rope';
type BottomType = 'sand' | 'mud' | 'weed' | 'rock';

interface SimulationState {
    step: number;
    vessel: {
        type: ShipType;
        length: number; // meters
    };
    gear: {
        anchor: AnchorType;
        line: LineType;
    };
    environment: {
        depth: number; // meters
        wind: number; // knots
        bottom: BottomType;
    };
}

// --- Constants & Assets ---

const SHIP_TYPES: { id: ShipType; label: string; icon: any }[] = [
    { id: 'sailboat', label: 'Sailboat', icon: Ship }, // Generic fallback for now
    { id: 'motorboat', label: 'Motorboat', icon: Ship },
    { id: 'catamaran', label: 'Catamaran', icon: Ship },
];

const ANCHOR_TYPES: { id: AnchorType; label: string; holding: number }[] = [
    { id: 'delta', label: 'Delta / Wing', holding: 0.8 },
    { id: 'rocna', label: 'Rocna / Spade', holding: 1.0 }, // High holding
    { id: 'cqr', label: 'CQR / Plow', holding: 0.7 },
    { id: 'bruce', label: 'Bruce / Claw', holding: 0.6 },
    { id: 'danforth', label: 'Danforth', holding: 0.7 },
    { id: 'grapnel', label: 'Grapnel', holding: 0.3 },
];

const LINE_TYPES: { id: LineType; label: string; weight: number }[] = [
    { id: 'chain', label: 'All Chain', weight: 1.5 }, // Heavy catenary
    { id: 'mixed', label: 'Chain + Rope', weight: 0.8 },
    { id: 'rope', label: 'All Rope', weight: 0.1 }, // Straight line
];

const BOTTOM_TYPES: { id: BottomType; label: string; risk: number; color: string }[] = [
    { id: 'sand', label: 'Sand', risk: 1, color: '#eab308' },     // Good holding
    { id: 'mud', label: 'Mud', risk: 1, color: '#78716c' },       // Good holding
    { id: 'weed', label: 'Weed', risk: 3, color: '#bef264' },     // Poor holding
    { id: 'rock', label: 'Rock', risk: 4, color: '#57534e' },     // Dangerous
];

const BEST_ANCHORS: Record<BottomType, AnchorType[]> = {
    sand: ['delta', 'rocna', 'danforth'],
    mud: ['danforth', 'rocna', 'bruce'],
    weed: ['grapnel'], // Fisherman is ideal but not in list, Grapnel punches through
    rock: ['grapnel'],
};

export default function SmartAnchorSimulator() {
    const [state, setState] = useState<SimulationState>({
        step: 1,
        vessel: { type: 'sailboat', length: 12 },
        gear: { anchor: 'delta', line: 'chain' },
        environment: { depth: 5, wind: 10, bottom: 'sand' }
    });
    const [showAnchorGuide, setShowAnchorGuide] = useState(false);

    // --- Logic ---

    const nextStep = () => setState(prev => ({ ...prev, step: Math.min(4, prev.step + 1) }));
    const prevStep = () => setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));

    const simulation = useMemo(() => {
        const { depth, wind, bottom } = state.environment;
        const { line, anchor } = state.gear;

        // 1. Calculate Required Scope based on Wind & Line
        let requiredScope = 3; // Baseline
        if (line === 'chain') {
            requiredScope = wind > 20 ? 5 : 3;
            if (wind > 40) requiredScope = 7;
        } else {
            // Rope/Mixed needs more scope
            requiredScope = wind > 15 ? 7 : 5;
        }

        const requiredChainLength = depth * requiredScope;

        // 2. Catenary & Pull Angle
        // Simplified physics: Heavy chain creates a curve. Rope is straight.
        // We calculate 'pullAngle' at the anchor. 0 is horizontal (Optimal), 90 is vertical (Breakout).

        let pullAngle = 0;

        // If scope is too short, angle increases
        const actualScope = requiredScope; // Assuming user pays out recommended amount

        if (line === 'rope' || line === 'mixed') {
            // Rope has little catenary, simple trig
            // sin(angle) = depth / length => angle = asin(1/scope)
            pullAngle = (Math.asin(1 / actualScope) * 180) / Math.PI;
        } else {
            // Chain has catenary.
            // If wind is high, catenary straightens.
            // Simplified factor:
            const windFactor = Math.min(1, wind / 40); // 1.0 at 40kts
            // At max wind, chain acts more like rope visually
            pullAngle = ((Math.asin(1 / actualScope) * 180) / Math.PI) * windFactor;
        }

        // 3. Risk Assessment & Explanations
        let riskLevel: 'safe' | 'caution' | 'danger' = 'safe';
        const bottomRisk = BOTTOM_TYPES.find(b => b.id === bottom)?.risk || 1;

        if (bottomRisk >= 3 || wind > 30) riskLevel = 'caution';
        if (bottomRisk === 4 && wind > 15) riskLevel = 'danger'; // Rock + Wind
        if (wind > 50) riskLevel = 'danger';

        // Anchor Holding modifications
        const anchorHolding = ANCHOR_TYPES.find(a => a.id === anchor)?.holding || 1.0;
        if (anchorHolding < 0.5 && wind > 15) riskLevel = 'danger';

        // --- Explanations ---
        let windMsg = "Light winds (<15kts) allow for standard scope. The catenary curve is effective at absorbing shock loads.";
        if (wind > 30) {
            windMsg = "Strong winds (>30kts) significantly increase the horizontal load. The chain straightens, losing its shock-absorbing catenary. Scope should be increased (+2) to compensate.";
        } else if (wind > 15) {
            windMsg = "Moderate winds (>15kts) increase tension. Scope is increased (+1) to ensure the angle of pull at the anchor remains low.";
        }

        let seabedMsg = "Good holding ground (Sand/Mud) allows the anchor to bury deep, providing maximum holding power with standard scope.";
        if (bottom === 'sand' || bottom === 'mud') {
            // Keep default
        } else if (bottom === 'weed') {
            seabedMsg = "Weed is poor holding ground. Anchors struggle to set and may slide on top. Increased scope (+1) helps the anchor penetrate through vegetation.";
        } else if (bottom === 'rock') {
            seabedMsg = "Rock provides very poor and unpredictable holding. The anchor relies on hooking creates rather than burying. Maximum scope (+2) is required to keep the pull horizontal and avoid dislodging.";
        }

        const depthMsg = depth > 20
            ? "In deeper water (>20m), the weight of the chain provides excellent catenary effect, absorbing wind gusts before they reach the anchor."
            : "In shallow water, the chain length is short, leaving little room for shock absorption. A longer scope is critical to prevent the anchor from being jerked out.";


        return {
            scope: requiredScope,
            chainLength: requiredChainLength,
            pullAngle,
            riskLevel,
            maxWind: anchorHolding * 40 * (line === 'chain' ? 1.2 : 0.8), // Simulated max holding wind
            explanations: { windMsg, seabedMsg, depthMsg }
        };
    }, [state]);

    // --- Renderers ---

    const renderStep1 = () => (
        <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-maritime-ocean/10 rounded-full flex items-center justify-center mx-auto text-maritime-ocean">
                    <Ship className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-light text-maritime-brass">The Vessel</h3>
                <p className="text-sm text-white/50">Select your vessel type and length to estimate windage and load.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SHIP_TYPES.map(type => (
                    <button
                        key={type.id}
                        onClick={() => setState(s => ({ ...s, vessel: { ...s.vessel, type: type.id } }))}
                        className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-4 ${state.vessel.type === type.id
                            ? 'bg-maritime-ocean/20 border-maritime-ocean text-white'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                            }`}
                    >
                        <type.icon className="w-10 h-10" />
                        <span className="uppercase tracking-widest text-xs font-bold">{type.label}</span>
                    </button>
                ))}
            </div>

            <div className="space-y-4 max-w-md mx-auto">
                <label className="block text-xs uppercase font-bold text-white/40 tracking-widest text-center">Length Overall (LOA)</label>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                    <Ruler className="w-5 h-5 text-maritime-teal" />
                    <input
                        type="range"
                        min="5" max="50" step="1"
                        value={state.vessel.length}
                        onChange={(e) => setState(s => ({ ...s, vessel: { ...s.vessel, length: parseInt(e.target.value) } }))}
                        className="flex-1 accent-maritime-ocean h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-mono text-xl font-bold min-w-[3ch] text-right">{state.vessel.length}m</span>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-maritime-ocean/10 rounded-full flex items-center justify-center mx-auto text-maritime-ocean">
                    <Anchor className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-light text-maritime-brass">Ground Tackle</h3>
                <p className="text-sm text-white/50">The type of anchor and rode determines holding power and catenary effect.</p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="block text-xs uppercase font-bold text-white/40 tracking-widest">Anchor Type</label>
                    <button
                        onClick={() => setShowAnchorGuide(true)}
                        className="flex items-center gap-1 text-[10px] uppercase font-bold text-maritime-teal hover:text-white transition-colors"
                    >
                        <HelpCircle className="w-3 h-3" /> Identify Anchor
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ANCHOR_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setState(s => ({ ...s, gear: { ...s.gear, anchor: type.id } }))}
                            className={`p-4 rounded-xl border transition-all text-sm font-medium ${state.gear.anchor === type.id
                                ? 'bg-maritime-ocean/20 border-maritime-ocean text-white'
                                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-xs uppercase font-bold text-white/40 tracking-widest">Rode (Line) Type</label>
                <div className="flex gap-4">
                    {LINE_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setState(s => ({ ...s, gear: { ...s.gear, line: type.id } }))}
                            className={`flex-1 p-4 rounded-xl border transition-all text-sm font-medium ${state.gear.line === type.id
                                ? 'bg-maritime-brass/20 border-maritime-brass text-maritime-brass'
                                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-maritime-ocean/10 rounded-full flex items-center justify-center mx-auto text-maritime-ocean">
                    <Waves className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-light text-maritime-brass">Environment</h3>
                <p className="text-sm text-white/50">Real-time conditions. Depth and wind force are critical for calculating scope.</p>
            </div>

            <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <label className="flex items-center gap-2 text-xs uppercase font-bold text-white/60 tracking-widest"><ArrowDown className="w-4 h-4" /> Water Depth</label>
                        <span className="font-mono font-bold text-maritime-teal">{state.environment.depth}m</span>
                    </div>
                    <input
                        type="range" min="2" max="50" step="0.5"
                        value={state.environment.depth}
                        onChange={(e) => setState(s => ({ ...s, environment: { ...s.environment, depth: parseFloat(e.target.value) } }))}
                        className="w-full accent-maritime-teal h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <label className="flex items-center gap-2 text-xs uppercase font-bold text-white/60 tracking-widest"><Wind className="w-4 h-4" /> Wind Speed</label>
                        <span className={`font-mono font-bold ${state.environment.wind > 25 ? 'text-red-400' : 'text-white'}`}>{state.environment.wind} kts</span>
                    </div>
                    <input
                        type="range" min="0" max="60" step="1"
                        value={state.environment.wind}
                        onChange={(e) => setState(s => ({ ...s, environment: { ...s.environment, wind: parseInt(e.target.value) } }))}
                        className="w-full accent-maritime-ocean h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <label className="block text-xs uppercase font-bold text-white/40 tracking-widest">Seabed Type</label>
                <div className="grid grid-cols-4 gap-2">
                    {BOTTOM_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setState(s => ({ ...s, environment: { ...s.environment, bottom: type.id } }))}
                            className={`p-3 rounded-xl border transition-all text-[10px] uppercase font-bold tracking-wider ${state.environment.bottom === type.id
                                ? 'bg-white/10 border-white text-white'
                                : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                                }`}
                            style={state.environment.bottom === type.id ? { borderColor: type.color, color: type.color } : {}}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => {
        const { riskLevel, scope, chainLength, pullAngle } = simulation;

        // --- Visualization Math ---
        // Canvas is 300x200
        const H_SCALE = 4; // Pixels per meter vertical
        const W_SCALE = 3; // Pixels per meter horizontal

        const waterY = 40;
        const bottomY = waterY + (state.environment.depth * H_SCALE);
        const anchorX = 260; // Right side
        // Boat X depends on scope length
        // X distance = sqrt(Length^2 - Depth^2)
        const dist = Math.sqrt(Math.pow(chainLength, 2) - Math.pow(state.environment.depth, 2));
        const boatX = Math.max(20, anchorX - (dist * W_SCALE));

        // Bezier Control Point for Catenary
        // If chain, curve hangs low. If rope/wind, straightens.
        const midX = (boatX + anchorX) / 2;
        // Sag depends on line type and wind
        let sag = 0;
        if (state.gear.line === 'chain') {
            // More wind = less sag
            const sagFactor = Math.max(0, 1 - (state.environment.wind / 40));
            sag = state.environment.depth * H_SCALE * 0.8 * sagFactor;
        }

        const controlY = bottomY + sag; // Pull curve down

        return (
            <div className="space-y-8 animate-in zoom-in-95 fade-in duration-500 relative">



                {/* 1. The Result Card */}
                <div className={`p-1 rounded-[2.5rem] bg-gradient-to-br ${riskLevel === 'safe' ? 'from-green-500/20 to-emerald-900/20' : riskLevel === 'caution' ? 'from-yellow-500/20 to-orange-900/20' : 'from-red-500/20 to-rose-900/20'}`}>
                    <div className="bg-maritime-midnight/90 backdrop-blur-xl rounded-[2.4rem] p-6 border border-white/5 overflow-hidden relative">

                        {/* SVG Visualization */}
                        <div className="aspect-video w-full rounded-2xl bg-[#0f172a] relative overflow-hidden mb-6 border border-white/10 shadow-inner">
                            <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="none">
                                {/* Sky/Water Gradient */}
                                <defs>
                                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
                                    </linearGradient>
                                    <pattern id="seabed" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                        <circle cx="2" cy="2" r="1" fill={BOTTOM_TYPES.find(b => b.id === state.environment.bottom)?.color || '#333'} opacity="0.5" />
                                    </pattern>
                                </defs>

                                {/* Water */}
                                <rect x="0" y={waterY} width="300" height={200} fill="url(#waterGrad)" />
                                {/* Bottom */}
                                <rect x="0" y={bottomY} width="300" height="200" fill="url(#seabed)" />
                                <line x1="0" y1={bottomY} x2="300" y2={bottomY} stroke={BOTTOM_TYPES.find(b => b.id === state.environment.bottom)?.color} strokeWidth="2" />

                                {/* Rode (Chain/Rope) */}
                                <path
                                    d={`M ${boatX + 10},${waterY} Q ${midX},${midX < anchorX ? (bottomY + (state.gear.line === 'chain' ? 20 : 0)) : bottomY} ${anchorX},${bottomY}`}
                                    fill="none"
                                    stroke={state.gear.line === 'chain' ? '#fbbf24' : '#fff'}
                                    strokeWidth={state.gear.line === 'chain' ? 2 : 1}
                                    strokeDasharray={state.gear.line === 'chain' ? "3 1" : "0"}
                                />

                                {/* Anchor */}
                                <path
                                    d={`M ${anchorX},${bottomY} l -5,-5 l -2,2 l 4,8 l 5,-2 z`}
                                    fill="white"
                                />

                                {/* Boat */}
                                <g transform={`translate(${boatX}, ${waterY - 15})`}>
                                    <path d="M 0,15 Q 10,15 20,10 L 40,10 Q 45,15 40,15 Z" fill="white" />
                                    <line x1="20" y1="10" x2="20" y2="-10" stroke="white" />
                                    <path d="M 20,-10 L 35,5 L 20,5 Z" fill="white" opacity="0.5" />
                                </g>

                                {/* Annotations */}
                                <text x="10" y={waterY + 15} fill="white" fontSize="8" opacity="0.5">Depth: {state.environment.depth}m</text>
                                <text x="10" y={waterY + 25} fill="white" fontSize="8" opacity="0.5">Scope: {scope}:1</text>
                            </svg>
                        </div>

                        {/* Indicators */}
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Recommended Scope</div>
                                <div className="text-3xl font-black font-mono text-white mt-1">{scope}:1</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Chain to Pay</div>
                                <div className="text-3xl font-black font-mono text-maritime-ocean mt-1">{chainLength.toFixed(1)}m</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Actionable Advice */}
                <div className="space-y-4">
                    <div className={`p-4 rounded-xl border flex items-start gap-4 ${riskLevel === 'safe' ? 'bg-green-500/10 border-green-500/20' :
                        riskLevel === 'caution' ? 'bg-yellow-500/10 border-yellow-500/20' :
                            'bg-red-500/10 border-red-500/20'
                        }`}>
                        {riskLevel === 'safe' ? <CheckCircle className="w-6 h-6 text-green-400 shrink-0" /> : <AlertTriangle className={`w-6 h-6 shrink-0 ${riskLevel === 'danger' ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`} />}
                        <div>
                            <h4 className={`font-bold uppercase tracking-wider text-sm ${riskLevel === 'safe' ? 'text-green-400' : riskLevel === 'caution' ? 'text-yellow-400' : 'text-red-400'}`}>
                                {riskLevel === 'safe' ? 'Safe to Anchor' : riskLevel === 'caution' ? 'Caution Advised' : 'High Risk of Dragging'}
                            </h4>
                            <p className="text-xs text-white/60 mt-1 leading-relaxed">
                                {riskLevel === 'safe'
                                    ? "Conditions are optimal. Chain weight provides good horizontal pull. Back down gently to set."
                                    : riskLevel === 'caution'
                                        ? "Holding ground is poor or wind is freshening. Consider paying out more scope or setting an anchor watch."
                                        : "DANGER. Poor holding ground combined with high wind load. Anchor is likely to drag. Seek shelter or re-anchor in better bottom."}
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-4 items-center">
                        <Info className="w-5 h-5 text-maritime-teal shrink-0" />
                        <p className="text-xs text-white/50">
                            <strong>Note:</strong> Calculated pull angle is {pullAngle.toFixed(1)}º.
                            {pullAngle > 10 ? ' Angle is too steep! Anchor may break out.' : ' Angle is near flat (optimal).'}
                        </p>
                    </div>

                    {/* Recommendation Engine */}
                    {!BEST_ANCHORS[state.environment.bottom].includes(state.gear.anchor) && (
                        <div className="p-4 bg-maritime-ocean/10 rounded-xl border border-maritime-ocean/20 flex gap-4 items-center animate-in slide-in-from-bottom-2 fade-in duration-500">
                            <div className="bg-maritime-ocean p-2 rounded-full text-maritime-midnight shrink-0">
                                <ArrowDown className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-maritime-ocean uppercase text-xs tracking-widest">Optimization Tip</h4>
                                <p className="text-xs text-white/60 mt-1">
                                    For <strong>{BOTTOM_TYPES.find(b => b.id === state.environment.bottom)?.label}</strong> bottoms,
                                    a <strong>{ANCHOR_TYPES.find(a => a.id === BEST_ANCHORS[state.environment.bottom][0])?.label}</strong> is often more effective than your selected {ANCHOR_TYPES.find(a => a.id === state.gear.anchor)?.label}.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Logic Breakdown */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                        <label className="block text-xs uppercase font-bold text-white/40 tracking-widest">Calculation Logic</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <h5 className="text-[10px] text-maritime-ocean font-bold uppercase mb-1">Seabed Factor</h5>
                                <p className="text-[10px] text-white/50 leading-relaxed">{simulation.explanations.seabedMsg}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <h5 className="text-[10px] text-maritime-ocean font-bold uppercase mb-1">Wind Load</h5>
                                <p className="text-[10px] text-white/50 leading-relaxed">{simulation.explanations.windMsg}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <h5 className="text-[10px] text-maritime-ocean font-bold uppercase mb-1">Depth Effect</h5>
                                <p className="text-[10px] text-white/50 leading-relaxed">{simulation.explanations.depthMsg}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }

    // --- Main Layout ---

    return (
        <div className="max-w-2xl mx-auto">
            {/* Anchor Guide Global Modal (For access in Step 2) */}
            {showAnchorGuide && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowAnchorGuide(false)}>
                    <div className="bg-maritime-midnight border border-white/10 rounded-3xl p-1 max-w-lg w-full relative shadow-2xl scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowAnchorGuide(false)}
                            className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-all flex items-center gap-2"
                        >
                            CLOSE <X className="w-6 h-6" />
                        </button>
                        <img
                            src="/images/anchor-types-chart.jpg"
                            alt="Anchor Types Reference"
                            className="w-full h-auto rounded-2xl border border-white/5"
                        />
                    </div>
                </div>
            )}

            {/* Steps Progress */}
            <div className="flex justify-between items-center mb-8 px-4">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${state.step >= s ? 'bg-maritime-ocean text-maritime-midnight ring-4 ring-maritime-ocean/20' : 'bg-white/10 text-white/30'
                            }`}>
                            {s}
                        </div>
                        {s < 4 && <div className={`w-12 h-0.5 mx-2 ${state.step > s ? 'bg-maritime-ocean' : 'bg-white/10'}`} />}
                    </div>
                ))}
            </div>

            {/* Content Card */}
            <div className="glass border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden min-h-[500px] flex flex-col justify-between">
                <div>
                    {state.step === 1 && renderStep1()}
                    {state.step === 2 && renderStep2()}
                    {state.step === 3 && renderStep3()}
                    {state.step === 4 && renderStep4()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
                    <button
                        onClick={prevStep}
                        disabled={state.step === 1}
                        className={`flex items-center gap-2 text-xs uppercase font-bold tracking-widest transition-all ${state.step === 1 ? 'opacity-0 pointer-events-none' : 'text-white/40 hover:text-white'}`}
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>

                    {state.step < 4 ? (
                        <button
                            onClick={nextStep}
                            className="bg-maritime-ocean hover:bg-maritime-teal text-maritime-midnight px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-maritime-ocean/20"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => setState(s => ({ ...s, step: 1 }))}
                            className="bg-maritime-brass hover:bg-yellow-400 text-maritime-midnight px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-maritime-brass/20"
                        >
                            New Sim <AnchorIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
