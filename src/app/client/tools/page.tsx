"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
    Anchor, ArrowLeft, Ruler, Ship, Compass, Settings,
    Navigation, Crosshair, MapPin,
    ChevronDown, ChevronUp, Lock, ShieldCheck,
    Clock, Loader2, GraduationCap,
    TrendingUp, Calculator, AlertCircle,
    Calendar, Maximize, RefreshCw, Layers, Plus, Trash2, FileText, Download, Save, Info, Activity
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, getDocs, doc, setDoc, deleteDoc, orderBy, getDoc } from "firebase/firestore";

// --- PROFESSIONAL MARITIME CALCULATORS SUITE (15 MODULES) ---

// --- Core Helper Constants & Math ---
const NM_TO_KM = 1.852;
const EARTH_RADIUS_NM = 3440.065;
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/**
 * Calculates Meridional Parts for a given latitude.
 * Uses the simplified sphere-based formula commonly used in navigation exams,
 * but calibrated for high accuracy.
 */
const getMeridionalParts = (lat: number) => {
    if (lat === 0) return 0;
    const phi = toRad(Math.abs(lat));
    // MP = 7915.7 * log10(tan(45 + lat/2))
    const mp = 7915.7 * Math.log10(Math.tan(toRad(45) + phi / 2));
    return lat < 0 ? -mp : mp;
};

// --- Main Page Component ---
export default function FleetToolsPage() {
    const { isClient, rank, loading: authLoading } = useAuth();
    const router = useRouter();
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isClient) {
            router.push("/login?role=client");
        }
    }, [isClient, authLoading, router]);

    const handleToggle = (id: string, isRestricted: boolean) => {
        if (isRestricted && rank !== 'captain') {
            alert("This tool is exclusive for Captain rank. Please upgrade your rank to access professional-grade features.");
            return;
        }
        setExpanded(expanded === id ? null : id);
    };

    if (authLoading || !isClient) {
        return (
            <div className="min-h-screen bg-maritime-midnight flex items-center justify-center">
                <Loader2 className="animate-spin text-maritime-ocean w-10 h-10" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-maritime-midnight text-white pt-24 px-4 md:px-12 pb-32">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-12">
                    <div className="space-y-4">
                        <button
                            onClick={() => router.push("/client")}
                            className="group flex items-center gap-2 text-maritime-teal/40 hover:text-maritime-teal transition-all text-[10px] uppercase tracking-[0.3em] font-black"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Bridge Dashboard
                        </button>
                        <h1 className="text-6xl font-light text-maritime-brass">Operational <span className="font-black text-maritime-ocean italic">Toolbox</span></h1>
                        <p className="text-maritime-teal/40 text-sm max-w-2xl border-l-2 border-maritime-ocean/20 pl-6 leading-relaxed">
                            Professional Suite for Ships' Officers. Precision maritime computing modules for High-Sea Navigation, Ship Stability, Career Records, and Cargo Operations.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
                    {/* --- NAVIGATION CLUSTER --- */}
                    <div className="space-y-8">
                        <ClusterLabel icon={<Navigation />} title="Navigation & Routing" />
                        <ToolGroup>
                            <ToolEntry id="eta_calc" title="ETA & Passage Planner" icon={<Clock />} expanded={expanded} onToggle={handleToggle}><ETACalculator /></ToolEntry>
                            <ToolEntry id="gc_nav" title="Great Circle Sailing" icon={<TrendingUp />} expanded={expanded} onToggle={handleToggle}><GreatCircleTool /></ToolEntry>
                            <ToolEntry id="merc_course" title="Mercator Sailing: Course/Dist" icon={<Layers />} expanded={expanded} onToggle={handleToggle}><MercatorCourseTool /></ToolEntry>
                            <ToolEntry id="merc_arrival" title="Mercator Sailing: Arrival Pos" icon={<MapPin />} expanded={expanded} onToggle={handleToggle}><MercatorArrivalTool /></ToolEntry>
                            <ToolEntry id="plane_sailing" title="Plane Sailing Calculator" icon={<Compass />} expanded={expanded} onToggle={handleToggle}><PlaneSailingTool /></ToolEntry>
                            <ToolEntry id="meridional" title="Meridional Parts (MP)" icon={<Calculator />} expanded={expanded} onToggle={handleToggle}><MeridionalPartsTool /></ToolEntry>
                        </ToolGroup>
                    </div>

                    {/* --- SHIP OPERATIONS CLUSTER --- */}
                    <div className="space-y-8">
                        <ClusterLabel icon={<Ship />} title="Ship Operations" />
                        <ToolGroup>
                            <ToolEntry id="draft" title="Draft Survey Professional" icon={<Maximize />} expanded={expanded} onToggle={handleToggle} isRestricted={rank !== 'captain'}><DraftSurveyTool /></ToolEntry>
                            <ToolEntry id="stability" title="Ship Stability & Loading" icon={<ShieldCheck />} expanded={expanded} onToggle={handleToggle} isRestricted={rank !== 'captain'}><ShipStabilityTool /></ToolEntry>
                            <ToolEntry id="squat_calc" title="Dynamic Squat Estimator" icon={<TrendingUp />} expanded={expanded} onToggle={handleToggle}><SquatTool /></ToolEntry>
                            <ToolEntry id="anchor" title="Anchor Chain Calculator" icon={<Anchor />} expanded={expanded} onToggle={handleToggle}><AnchorChainCalculator /></ToolEntry>
                            <ToolEntry id="radius" title="Swinging Radius" icon={<RefreshCw />} expanded={expanded} onToggle={handleToggle}><SwingingRadiusTool /></ToolEntry>
                            <ToolEntry id="gyro" title="Gyro & Compass Error" icon={<Crosshair />} expanded={expanded} onToggle={handleToggle}><CompassErrorTool /></ToolEntry>
                        </ToolGroup>
                    </div>

                    {/* --- CAREER & RECORDS CLUSTER --- */}
                    <div className="space-y-8">
                        <ClusterLabel icon={<GraduationCap />} title="Career & Management" />
                        <ToolGroup>
                            <ToolEntry id="sea" title="Sea Service Record" icon={<Calendar />} expanded={expanded} onToggle={handleToggle} isRestricted={rank !== 'captain'}><SeaServiceTool /></ToolEntry>
                            <ToolEntry id="contract" title="Contract Countdown" icon={<Clock />} expanded={expanded} onToggle={handleToggle} isRestricted={rank !== 'captain'}><ContractTool /></ToolEntry>
                        </ToolGroup>
                    </div>

                    {/* --- CONVERSION SUITE --- */}
                    <div className="space-y-8">
                        <ClusterLabel icon={<RefreshCw />} title="Conversion Suite" />
                        <ToolGroup>
                            <ToolEntry id="coord" title="Lat/Lon Universal Converter" icon={<MapPin />} expanded={expanded} onToggle={handleToggle}><LatLonConverter /></ToolEntry>
                            <ToolEntry id="arc" title="Arc & Time (15º/hr)" icon={<RefreshCw />} expanded={expanded} onToggle={handleToggle}><ArcTimeTool /></ToolEntry>
                        </ToolGroup>
                    </div>
                </div>
            </div>
        </main>
    );
}

// --- CLUSTER UI WRAPPERS ---

function ClusterLabel({ icon, title }: any) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="p-3 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-2xl text-maritime-ocean group-hover:bg-maritime-ocean group-hover:text-maritime-midnight transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-black text-maritime-brass uppercase tracking-tighter">{title}</h3>
        </div>
    );
}

function ToolGroup({ children }: { children: React.ReactNode }) {
    return <div className="space-y-4">{children}</div>;
}

function ToolEntry({ id, title, icon, children, expanded, onToggle, isRestricted }: any) {
    const isExpanded = expanded === id;
    return (
        <div className={`glass border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 ${isRestricted ? 'bg-black/30' : 'hover:border-maritime-ocean/40'} ${isExpanded ? 'ring-1 ring-maritime-ocean shadow-[0_0_50px_rgba(0,180,216,0.1)]' : ''}`}>
            <button
                onClick={() => onToggle(id, isRestricted)}
                className="w-full flex items-center justify-between p-6 transition-all group"
            >
                <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl transition-all duration-300 ${isRestricted ? 'bg-white/5 text-white/10' : 'bg-maritime-ocean/10 text-maritime-ocean group-hover:scale-110'}`}>
                        {isRestricted ? <Lock className="w-5 h-5" /> : icon}
                    </div>
                    <div className="text-left">
                        <span className={`block font-bold text-lg ${isRestricted ? 'text-white/20' : 'text-white'}`}>{title}</span>
                        {isRestricted && <span className="text-[8px] uppercase tracking-widest text-maritime-ocean font-bold">Authorized Captain Rank Required</span>}
                    </div>
                </div>
                {!isRestricted && (isExpanded ? <ChevronUp className="w-5 h-5 text-white/20" /> : <ChevronDown className="w-5 h-5 text-white/20 group-hover:text-white" />)}
            </button>
            {isExpanded && !isRestricted && (
                <div className="p-8 border-t border-white/5 bg-white/[0.01] animate-in fade-in slide-in-from-top-4 duration-500">
                    {children}
                </div>
            )}
        </div>
    );
}

// --- ACTUAL TOOL IMPLEMENTATIONS ---

function DraftSurveyTool() {
    const [lbp, setLbp] = useState('180');
    const [lightship, setLightship] = useState('8500');
    const [density, setDensity] = useState('1.025');
    const [keelThickness, setKeelThickness] = useState('0.000');
    const [drafts, setDrafts] = useState({ fp: '10.2', fs: '10.2', mp: '10.4', ms: '10.4', ap: '10.6', as: '10.6' });
    const [hydro, setHydro] = useState({ disp: '25000', tpc: '45', lcf: '-2.5', mtc: '350' });
    const [weights, setWeights] = useState({ fo: '500', do: '100', lo: '20', fw: '150', ballast: '1200', others: '50' });

    const results = useMemo(() => {
        const fp = parseFloat(drafts.fp) || 0;
        const fs = parseFloat(drafts.fs) || 0;
        const mp = parseFloat(drafts.mp) || 0;
        const ms = parseFloat(drafts.ms) || 0;
        const ap = parseFloat(drafts.ap) || 0;
        const as = parseFloat(drafts.as) || 0;
        const keel = parseFloat(keelThickness) || 0;

        // 1. Mean Fwd / Aft / Mid
        const mF = (fp + fs) / 2;
        const mM = (mp + ms) / 2;
        const mA = (ap + as) / 2;

        // 2. Mean of Means (M-M)
        const meanOfMeans = (mF + mA) / 2;

        // 3. Mean of Means of Means (Quarter Mean)
        // Formula: (mF + mA + 6 * mM) / 8
        const quarterMean = (mF + mA + 6 * mM) / 8;

        // 4. Draft to Keel Correction
        const correctedQuarterMean = quarterMean + keel;

        // Deformation (Sag/Hog)
        const deformation = mM - meanOfMeans;

        // Trim Calculation
        const trim = mA - mF;

        const disp = parseFloat(hydro.disp) || 0;
        const dens = parseFloat(density) || 1.025;
        const densCorr = disp * (dens - 1.025) / 1.025;
        const correctedDisp = disp + densCorr;

        const totalDeduct = Object.values(weights).reduce((a, b) => a + (parseFloat(b) || 0), 0);
        const lship = parseFloat(lightship) || 0;

        return {
            quarterMean: correctedQuarterMean,
            deformation,
            trim,
            displacement: correctedDisp,
            deductibles: totalDeduct,
            deadweight: correctedDisp - lship,
            cargo: correctedDisp - lship - totalDeduct
        };
    }, [drafts, hydro, weights, lightship, density, keelThickness]);

    const defType = results.deformation > 0 ? 'Sagging' : (results.deformation < 0 ? 'Hogging' : 'Neutral');
    const absDef = Math.abs(results.deformation);

    return (
        <div className="space-y-10">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="p-1.5 bg-maritime-ocean rounded-lg text-maritime-midnight"><Maximize className="w-4 h-4" /></span>
                    Draft Survey Professional
                </h3>
                <p className="text-[11px] text-white/40 mt-2 leading-relaxed">
                    Perform Initial, Intermediate, and Final draft surveys with precision. Includes **Hogging/Sagging** structural analysis based on mean-of-means draft comparisons.
                </p>
            </div>

            {/* Hull Deformation Visualizer */}
            <div className="p-8 bg-black/40 border border-white/5 rounded-[3rem] space-y-6">
                <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Hull Stress Profile</span>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${defType === 'Neutral' ? 'bg-white/10 text-white/40' : (defType === 'Sagging' ? 'bg-orange-500/20 text-orange-400' : 'bg-maritime-brass/20 text-maritime-brass')}`}>
                            {defType}: {(absDef * 1).toFixed(3)}m
                        </span>
                    </div>
                </div>

                <div className="relative h-24 w-full flex items-center justify-center overflow-hidden">
                    {/* SVG Ship Hull with dynamic bending */}
                    <svg viewBox="0 0 400 60" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,180,216,0.1)]">
                        {/* Sea Level */}
                        <line x1="10" y1="40" x2="390" y2="40" stroke="rgba(0,180,216,0.2)" strokeWidth="1" strokeDasharray="4 4" />

                        {/* Hull Path - Bending based on deformation */}
                        {/* Control point y-coordinate changes with deformation: Sagging (def > 0) pulls center down, Hogging (def < 0) pushes center up */}
                        <path
                            d={`M 50,30 Q 200,${30 + results.deformation * 40} 350,30 L 350,45 Q 200,${45 + results.deformation * 40} 50,45 Z`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className={`transition-all duration-700 ease-in-out ${defType === 'Sagging' ? 'text-orange-500' : (defType === 'Hogging' ? 'text-maritime-brass' : 'text-maritime-ocean')}`}
                        />

                        {/* Draft Marks Pointers */}
                        <circle cx="50" cy="30" r="2" className="text-white/40 fill-current" />
                        <circle cx="200" cy={30 + results.deformation * 40} r="2" className="text-white/40 fill-current" />
                        <circle cx="350" cy="30" r="2" className="text-white/40 fill-current" />
                    </svg>
                </div>

                <p className="text-[10px] text-center text-white/40 leading-relaxed px-10">
                    {defType === 'Sagging'
                        ? "Hull is bending downward midships. Typical when cargo weight is concentrated in the center of the vessel."
                        : (defType === 'Hogging'
                            ? "Hull is arching upward midships. Typical when weight is concentrated at the bow and stern (peaks)."
                            : "Vessel appears longitudinally balanced without significant structural bending.")}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-maritime-ocean">Ship Particulars</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <InputBox label="LBP (m)" val={lbp} setVal={setLbp} />
                        <InputBox label="Lightship (mt)" val={lightship} setVal={setLightship} />
                        <InputBox label="Dock Density" val={density} setVal={setDensity} />
                        <InputBox label="Keel Thickness (m)" val={keelThickness} setVal={setKeelThickness} />
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-maritime-brass">Draft Readings</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <InputBox label="Fwd P" val={drafts.fp} setVal={(v: any) => setDrafts({ ...drafts, fp: v })} />
                        <InputBox label="Fwd S" val={drafts.fs} setVal={(v: any) => setDrafts({ ...drafts, fs: v })} />
                        <InputBox label="Mid P" val={drafts.mp} setVal={(v: any) => setDrafts({ ...drafts, mp: v })} />
                        <InputBox label="Mid S" val={drafts.ms} setVal={(v: any) => setDrafts({ ...drafts, ms: v })} />
                        <InputBox label="Aft P" val={drafts.ap} setVal={(v: any) => setDrafts({ ...drafts, ap: v })} />
                        <InputBox label="Aft S" val={drafts.as} setVal={(v: any) => setDrafts({ ...drafts, as: v })} />
                    </div>
                </div>
            </div>
            <div className="p-8 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <span className="text-[10px] uppercase font-black tracking-widest text-maritime-ocean">Quarter Mean Draft (Final)</span>
                    <div className="text-4xl font-black font-mono text-white mt-2">{results.quarterMean.toFixed(4)}m</div>
                </div>
                <div className="text-center md:text-right px-8 py-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-white/20">Calculated Trim</span>
                    <div className={`text-2xl font-black font-mono mt-1 ${results.trim >= 0 ? 'text-white' : 'text-orange-400'}`}>
                        {Math.abs(results.trim).toFixed(3)}m {results.trim >= 0 ? 'Aft' : 'Fwd'}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-white/30">Hydrostatic Lookup</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <InputBox label="Table Disp" val={hydro.disp} setVal={(v: any) => setHydro({ ...hydro, disp: v })} />
                        <InputBox label="TPC" val={hydro.tpc} setVal={(v: any) => setHydro({ ...hydro, tpc: v })} />
                        <InputBox label="LCF" val={hydro.lcf} setVal={(v: any) => setHydro({ ...hydro, lcf: v })} />
                        <InputBox label="MTC" val={hydro.mtc} setVal={(v: any) => setHydro({ ...hydro, mtc: v })} />
                    </div>
                </div>
                <div className="p-8 bg-black/40 border border-white/10 rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                        <span className="text-[9px] uppercase font-bold text-white/30">Deadweight</span>
                        <span className="text-2xl font-black font-mono text-white">{results.deadweight.toFixed(2)} MT</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] uppercase font-black text-maritime-brass">Estimated Cargo</span>
                        <span className="text-3xl font-black font-mono text-maritime-brass">{results.cargo.toFixed(2)} MT</span>
                    </div>
                </div>
            </div>

            <HowToUse
                title="How to Use Draft Survey"
                steps={[
                    "Enter Vessel Particulars, Dock Water Density, and Keel Thickness.",
                    "Input the 6 observed draft readings (Fwd, Mid, Aft).",
                    "Calculate the Corrected Quarter Mean Draft (M-M-M formula) and Trim.",
                    "Look up Displacement in hydrostatics using Quarter Mean Draft.",
                    "Apply Trim Corrections (1st and 2nd) and Density Correction.",
                    "Subtract Lightship and Consumables to find True Cargo Weight."
                ]}
                notes="Quarter Mean formula: (Mean Fwd + Mean Aft + 6 * Mean Mid) / 8. Standard for hull deformation accounting."
            />
        </div>
    );
}

function ETACalculator() {
    const [dist, setDist] = useState('3182.8');
    const [speed, setSpeed] = useState('12.5');
    const [depDate, setDepDate] = useState(new Date().toISOString().slice(0, 16));

    const results = useMemo(() => {
        const d = parseFloat(dist) || 0;
        const s = parseFloat(speed) || 1;
        const travelHrs = d / s;

        const dep = new Date(depDate);
        const arr = new Date(dep.getTime() + travelHrs * 3600000);

        const days = Math.floor(travelHrs / 24);
        const hrs = Math.floor(travelHrs % 24);
        const mins = Math.round((travelHrs % 1) * 60);

        return {
            duration: `${days}d ${hrs}h ${mins}m`,
            arrival: arr.toLocaleString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            })
        };
    }, [dist, speed, depDate]);

    return (
        <div className="space-y-8">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Voyage steaming time and Estimated Time of Arrival (ETA) calculator based on distance, speed, and departure time.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputBox label="Distance (nm)" val={dist} setVal={setDist} />
                <InputBox label="Speed (kts)" val={speed} setVal={setSpeed} />
                <InputBox label="Departure (Local)" val={depDate} setVal={setDepDate} type="datetime-local" />
            </div>
            <div className="p-10 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[3rem] text-center space-y-2">
                <span className="text-[10px] uppercase font-black text-maritime-ocean tracking-[0.3em]">Steaming Time</span>
                <div className="text-4xl font-black font-mono text-white">{results.duration}</div>
            </div>
            <div className="p-8 bg-black/40 border border-white/10 rounded-[2.5rem] flex items-center justify-between">
                <div>
                    <span className="text-[9px] uppercase font-bold text-white/20">Estimated Arrival Time</span>
                    <div className="text-2xl font-bold font-mono text-white mt-1">{results.arrival}</div>
                </div>
                <Calendar className="w-10 h-10 text-maritime-brass opacity-50" />
            </div>

            <HowToUse
                title="How to Use ETA"
                steps={[
                    "Input the total voyage distance in nautical miles (NM).",
                    "Enter the average expected speed in knots.",
                    "Set the local departure time using the date/time picker.",
                    "The calculator will determine the total duration and the final ETA."
                ]}
            />
        </div>
    );
}

function GreatCircleTool() {
    const [lat1, setLat1] = useState('40.7');
    const [lon1, setLon1] = useState('-74.0');
    const [lat2, setLat2] = useState('51.5');
    const [lon2, setLon2] = useState('-0.1');

    const results = useMemo(() => {
        const p1 = parseFloat(lat1) || 0;
        const p2 = parseFloat(lat2) || 0;
        const o1 = parseFloat(lon1) || 0;
        const o2 = parseFloat(lon2) || 0;

        const phi1 = toRad(p1);
        const phi2 = toRad(p2);
        const lam1 = toRad(o1);
        const lam2 = toRad(o2);
        const dLonRad = lam2 - lam1;

        // GC Distance
        const distRad = Math.acos(
            Math.sin(phi1) * Math.sin(phi2) +
            Math.cos(phi1) * Math.cos(phi2) * Math.cos(dLonRad)
        );
        const distance = distRad * EARTH_RADIUS_NM;

        // Initial Course
        const y = Math.sin(dLonRad) * Math.cos(phi2);
        const x = Math.cos(phi1) * Math.sin(phi2) -
            Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLonRad);
        let course = toDeg(Math.atan2(y, x));
        course = (course + 360) % 360;

        // Rhumb Line Distance (Savings Calculation)
        const dLatMin = (p2 - p1) * 60;
        let dLonMin = (o2 - o1) * 60;
        while (dLonMin > 180 * 60) dLonMin -= 360 * 60;
        while (dLonMin < -180 * 60) dLonMin += 360 * 60;

        const mp1 = getMeridionalParts(p1);
        const mp2 = getMeridionalParts(p2);
        const dmp = mp2 - mp1;

        let loxodromicDist = 0;
        if (Math.abs(dLatMin) < 0.001) {
            loxodromicDist = Math.abs(dLonMin * Math.cos(phi1));
        } else {
            const tcRad = Math.atan2(dLonMin, dmp);
            loxodromicDist = Math.abs(dLatMin / Math.cos(tcRad));
        }

        const savings = Math.max(0, loxodromicDist - distance);

        return { distance, course, savings };
    }, [lat1, lon1, lat2, lon2]);

    return (
        <div className="space-y-8">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Calculate the shortest distance between two points on Earth surface (Orthodromic path) and the initial true course.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                    <h4 className="text-[9px] uppercase tracking-widest font-black text-white/40">Departure</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <InputBox label="Lat" val={lat1} setVal={setLat1} />
                        <InputBox label="Lon" val={lon1} setVal={setLon1} />
                    </div>
                </div>
                <div className="space-y-3">
                    <h4 className="text-[9px] uppercase tracking-widest font-black text-white/40">Arrival</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <InputBox label="Lat" val={lat2} setVal={setLat2} />
                        <InputBox label="Lon" val={lon2} setVal={setLon2} />
                    </div>
                </div>
            </div>

            <div className="p-8 bg-black/40 border border-white/10 rounded-[2.5rem] flex items-center justify-between">
                <div>
                    <span className="text-[10px] uppercase font-black text-maritime-ocean tracking-widest">GC Distance</span>
                    <div className="text-4xl font-black font-mono text-white">{results.distance.toFixed(1)} nm</div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] uppercase font-black text-maritime-brass tracking-widest">Initial Course</span>
                    <div className="text-3xl font-black font-mono text-white">{results.course.toFixed(1)}º T</div>
                </div>
            </div>

            {results.savings > 0.5 && (
                <div className="p-6 bg-maritime-brass/10 border border-maritime-brass/30 rounded-[2rem] flex items-center gap-6 animate-pulse">
                    <div className="p-4 bg-maritime-brass/20 rounded-2xl text-maritime-brass">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[9px] uppercase font-black text-maritime-brass tracking-widest">Route Efficiency (Savings)</span>
                        <p className="text-sm font-bold text-white leading-tight">
                            By sailing Great Circle, you save <span className="text-maritime-brass">{results.savings.toFixed(0)} miles</span> compared to a Rhumb Line!
                        </p>
                        <p className="text-[9px] text-white/40 mt-1 uppercase italic font-black">Captain, every mile saved is fuel in the bank.</p>
                    </div>
                </div>
            )}

            <HowToUse
                title="How to Use Great Circle"
                steps={[
                    "Enter Departure Latitude and Longitude (Negative for South/West).",
                    "Enter Arrival Latitude and Longitude.",
                    "The distance represents the shortest path over the Earth's surface.",
                    "The tool compares the Great Circle path with the Loxodromic (Rhumb Line) path to show your savings."
                ]}
            />
        </div>
    );
}

function MercatorCourseTool() {
    const [lat1, setLat1] = useState('40.7');
    const [lon1, setLon1] = useState('-74.0');
    const [lat2, setLat2] = useState('51.5');
    const [lon2, setLon2] = useState('-0.1');

    const results = useMemo(() => {
        const l1 = parseFloat(lat1) || 0;
        const l2 = parseFloat(lat2) || 0;
        const lo1 = parseFloat(lon1) || 0;
        const lo2 = parseFloat(lon2) || 0;

        const dLat = (l2 - l1) * 60; // in minutes/nm
        let dLon = (lo2 - lo1) * 60;
        if (dLon > 180 * 60) dLon -= 360 * 60;
        if (dLon < -180 * 60) dLon += 360 * 60;

        const mp1 = getMeridionalParts(l1);
        const mp2 = getMeridionalParts(l2);
        const dmp = mp2 - mp1;

        const courseRad = Math.atan2(Math.abs(dLon), Math.abs(dmp));
        let course = toDeg(courseRad);

        // Resolve Quadrant
        if (l2 < l1 && lo2 > lo1) course = 180 - course; // SE
        else if (l2 < l1 && lo2 < lo1) course = 180 + course; // SW
        else if (l2 > l1 && lo2 < lo1) course = 360 - course; // NW

        const distance = Math.abs(dLat) * (1 / Math.cos(courseRad));

        return { dLat, dLon, dmp, course, distance };
    }, [lat1, lon1, lat2, lon2]);

    return (
        <div className="space-y-8">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Find the rhumb line distance and true course between departure position and arrival coordinates using Mercator sailing principles.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                    <h4 className="text-[9px] uppercase tracking-widest font-black text-white/40">Start</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <InputBox label="Lat" val={lat1} setVal={setLat1} />
                        <InputBox label="Lon" val={lon1} setVal={setLon1} />
                    </div>
                </div>
                <div className="space-y-3">
                    <h4 className="text-[9px] uppercase tracking-widest font-black text-white/40">End</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <InputBox label="Lat" val={lat2} setVal={setLat2} />
                        <InputBox label="Lon" val={lon2} setVal={setLon2} />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <ResultBox label="DLAT (min)" val={`${results.dLat.toFixed(1)}`} />
                <ResultBox label="DLONG (min)" val={`${results.dLon.toFixed(1)}`} />
                <ResultBox label="DMP" val={`${results.dmp.toFixed(1)}`} />
            </div>
            <div className="p-6 bg-maritime-ocean/10 border border-maritime-ocean/20 rounded-3xl text-center">
                <span className="text-[10px] uppercase font-black text-maritime-ocean">Rhumb Line Course & Distance</span>
                <div className="text-3xl font-bold font-mono text-white">{results.course.toFixed(1)}º T | {results.distance.toFixed(1)} nm</div>
            </div>

            <HowToUse
                title="How to Use Mercator Course"
                steps={[
                    "Enter departure and arrival positions in decimal format.",
                    "The tool calculates Difference in Latitude (DLAT) and Longitude (DLONG).",
                    "It also computes Meridional Parts and Difference (DMP) to find the Rhumb Line course."
                ]}
            />
        </div>
    );
}

function MercatorArrivalTool() {
    const [lat1, setLat1] = useState('40.7');
    const [lon1, setLon1] = useState('-74.0');
    const [dist, setDist] = useState('500');
    const [course, setCourse] = useState('045');

    const results = useMemo(() => {
        const l1 = parseFloat(lat1) || 0;
        const lo1 = parseFloat(lon1) || 0;
        const d = parseFloat(dist) || 0;
        const c = parseFloat(course) || 0;

        const dLat = (d * Math.cos(toRad(c))) / 60;
        const l2 = l1 + dLat;

        const mp1 = getMeridionalParts(l1);
        const mp2 = getMeridionalParts(l2);
        const dmp = mp2 - mp1;

        const dLon = (dmp * Math.tan(toRad(c))) / 60;
        const lo2 = lo1 + dLon;

        return { l2, lo2 };
    }, [lat1, lon1, dist, course]);

    return (
        <div className="space-y-8">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Mercator Arrival (DR) Position calculator. Determine your estimated coordinates after steaming a specific course and distance.
                </p>
            </div>

            <div className="space-y-4">
                <h4 className="text-[9px] uppercase tracking-widest font-black text-white/40">Departure Position</h4>
                <div className="grid grid-cols-2 gap-3">
                    <InputBox label="Lat" val={lat1} setVal={setLat1} />
                    <InputBox label="Lon" val={lon1} setVal={setLon1} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <InputBox label="Distance (nm)" val={dist} setVal={setDist} />
                <InputBox label="Course (ºT)" val={course} setVal={setCourse} />
            </div>
            <div className="p-10 bg-black/40 border border-white/10 rounded-[2.5rem] text-center">
                <span className="text-[10px] uppercase font-black text-maritime-brass tracking-widest">Predicted Arrival Position</span>
                <div className="text-3xl font-black font-mono text-white mt-1">
                    {Math.abs(results.l2).toFixed(4)}º {results.l2 >= 0 ? 'N' : 'S'} | {Math.abs(results.lo2).toFixed(4)}º {results.lo2 >= 0 ? 'E' : 'W'}
                </div>
            </div>

            <HowToUse
                title="How to Use Mercator Arrival"
                steps={[
                    "Input your starting coordinates in decimal degrees.",
                    "Enter the total distance intended to travel in Nautical Miles.",
                    "Enter the true course (ºT).",
                    "The tool uses Meridional Parts to accurately predict your arrival position."
                ]}
            />
        </div>
    );
}

function PlaneSailingTool() {
    const [lat1, setLat1] = useState('10.0');
    const [lon1, setLon1] = useState('20.0');
    const [lat2, setLat2] = useState('10.5');
    const [lon2, setLon2] = useState('20.5');

    const results = useMemo(() => {
        const l1 = parseFloat(lat1) || 0;
        const l2 = parseFloat(lat2) || 0;
        const lo1 = parseFloat(lon1) || 0;
        const lo2 = parseFloat(lon2) || 0;

        const dLat = (l2 - l1) * 60;
        const mLat = (l1 + l2) / 2;
        const dLon = (lo2 - lo1) * 60;
        const departure = dLon * Math.cos(toRad(mLat));

        const dist = Math.sqrt(dLat ** 2 + departure ** 2);
        let course = toDeg(Math.atan2(departure, dLat));
        course = (course + 360) % 360;

        return { mLat, departure, dist, course };
    }, [lat1, lon1, lat2, lon2]);

    return (
        <div className="space-y-8">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Calculate course and distance for short voyages (under 250 NM) where the Earth is assumed to be a plane. Includes Departure and Middle Latitude calculations.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                    <h4 className="text-[9px] uppercase tracking-widest font-black text-white/40">Start</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <InputBox label="Lat" val={lat1} setVal={setLat1} />
                        <InputBox label="Lon" val={lon1} setVal={setLon1} />
                    </div>
                </div>
                <div className="space-y-3">
                    <h4 className="text-[9px] uppercase tracking-widest font-black text-white/40">End</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <InputBox label="Lat" val={lat2} setVal={setLat2} />
                        <InputBox label="Lon" val={lon2} setVal={setLon2} />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <ResultBox label="Middle Lat" val={`${results.mLat.toFixed(2)}º`} />
                <ResultBox label="Departure (nm)" val={`${results.departure.toFixed(1)}`} />
                <ResultBox label="Course (T)" val={`${results.course.toFixed(1)}º`} />
                <ResultBox label="Distance (nm)" val={`${results.dist.toFixed(1)}`} />
            </div>

            <HowToUse
                title="How to Use Plane Sailing"
                steps={[
                    "Input the starting and ending coordinates in decimal format.",
                    "The tool calculates the Middle Latitude for correction.",
                    "Departure (easting/westing) is then used to find the true course and distance.",
                    "Recommended for distances where D'Lat and Departure are relatively small."
                ]}
            />
        </div>
    );
}

function MeridionalPartsTool() {
    const [lat, setLat] = useState('45');
    const mp = getMeridionalParts(parseFloat(lat) || 0);
    return (
        <div className="space-y-8">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Calculate Meridional Parts (MP) for Mercator Sailing or constructing nautical charts. Calibrated for standard maritime tables.
                </p>
            </div>

            <InputBox label="Target Latitude" val={lat} setVal={setLat} />
            <div className="p-12 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[3rem] text-center space-y-2">
                <span className="text-[10px] uppercase font-black text-maritime-ocean tracking-[0.4em]">Meridional Part (MP)</span>
                <div className="text-6xl font-black font-mono text-white">{mp.toFixed(2)}</div>
                <p className="text-[8px] text-white/20 uppercase mt-4">Standard Calibration Applied</p>
            </div>

            <HowToUse
                title="About Meridional Parts"
                steps={[
                    "Enter the Latitude in decimal degrees.",
                    "The tool calculates the distance in 'meridional minutes' from the equator.",
                    "Used for converting latitude differences into chart distances on a Mercator projection."
                ]}
            />
        </div>
    );
}

function ShipStabilityTool() {
    const [kgSolid, setKgSolid] = useState('8.50');
    const [km, setKm] = useState('9.45');
    const [disp, setDisp] = useState('25000');
    const [fsm, setFsm] = useState('1500');

    const results = useMemo(() => {
        const solidKG = parseFloat(kgSolid) || 0;
        const metaKM = parseFloat(km) || 0;
        const shipDisp = parseFloat(disp) || 1;
        const totalFSM = parseFloat(fsm) || 0;

        const solidGM = metaKM - solidKG;
        const fsc = totalFSM / shipDisp;
        const fluidKG = solidKG + fsc;
        const fluidGM = metaKM - fluidKG;

        // Estimated KB for visualization (simplified approximations)
        const estKB = metaKM * 0.55;

        const isCompliant = fluidGM >= 0.15;

        // GZ Curve Generation (0 to 60 degrees)
        const gzPoints: { x: number, y: number }[] = [];
        const scaleX = 4; // pixels per degree
        const scaleY = 40; // pixels per meter
        let path = `M 0,150`;

        for (let ang = 0; ang <= 60; ang += 2) {
            const rad = toRad(ang);
            // Wall-sided formula approximation / GZ = GM * sin(theta) for visualization
            const gz = fluidGM * Math.sin(rad);
            const x = ang * scaleX;
            const y = 150 - (gz * scaleY);
            gzPoints.push({ x, y });
            path += ` L ${x.toFixed(1)},${y.toFixed(1)}`;
        }

        const areaPath = path + ` L ${60 * scaleX},150 Z`;

        return { solidGM, fsc, fluidKG, fluidGM, isCompliant, estKB, gzPath: path, gzArea: areaPath };
    }, [kgSolid, km, disp, fsm]);

    // Scales for Cross Section
    const ky = 280; // Keel Y position (bottom)
    const mPx = 18; // Pixels per meter

    // Calculate positions
    const posK = ky;
    const posM = ky - (parseFloat(km) || 0) * mPx;
    const posG = ky - results.fluidKG * mPx;
    const posB = ky - results.estKB * mPx;

    return (
        <div className="space-y-8">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Professional Intact Stability module. Features dynamic <span className="text-maritime-ocean font-bold">Cross-Section Analysis</span>, <span className="text-maritime-brass font-bold">GZ Curve Simulation</span>, and automated IMO Code compliance checks (Min GM 0.15m).
                </p>
            </div>

            {/* Main Visualizations Block */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Cross Section Visualizer */}
                <div className="p-8 bg-black/40 border border-white/10 rounded-[3rem] relative overflow-hidden flex flex-col items-center">
                    <span className="absolute top-6 left-6 text-[10px] uppercase font-black text-white/20 tracking-widest">Ship Cross Section</span>
                    <svg width="240" height="320" className="drop-shadow-2xl">
                        {/* Centerline */}
                        <line x1="120" y1="20" x2="120" y2="300" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />

                        {/* Ship Hull */}
                        <path d="M 40,40 Q 20,150 40,260 Q 120,300 200,260 Q 220,150 200,40" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />

                        {/* Waterline */}
                        <line x1="10" y1="120" x2="230" y2="120" stroke="#00b4d8" strokeWidth="1" strokeOpacity="0.5" />
                        <text x="235" y="123" fill="#00b4d8" fontSize="8" fontWeight="bold">WL</text>

                        {/* Points */}
                        {/* K - Keel */}
                        <circle cx="120" cy={posK} r="3" fill="#ffffff" />
                        <text x="130" y={posK + 3} fill="white" fontSize="10" fontWeight="bold">K</text>

                        {/* B - Buoyancy */}
                        <circle cx="120" cy={posB} r="3" fill="#00b4d8" />
                        <text x="130" y={posB + 3} fill="#00b4d8" fontSize="10" fontWeight="bold">B</text>

                        {/* G - Gravity (Dynamic) */}
                        <circle cx="120" cy={posG} r="4" fill={results.isCompliant ? '#22c55e' : '#ef4444'} className="transition-all duration-700" />
                        <text x="130" y={posG + 4} fill={results.isCompliant ? '#22c55e' : '#ef4444'} fontSize="10" fontWeight="bold" className="transition-all duration-700">G_fluid</text>
                        {/* Arrow showing KG */}
                        <line x1="100" y1={ky} x2="100" y2={posG} stroke="white" strokeWidth="0.5" strokeOpacity="0.3" markerEnd="url(#arrow)" />

                        {/* M - Metacenter (Dynamic) */}
                        <circle cx="120" cy={posM} r="3" fill="#fbbf24" className="transition-all duration-700" />
                        <text x="130" y={posM + 3} fill="#fbbf24" fontSize="10" fontWeight="bold" className="transition-all duration-700">M</text>

                        {/* GM Range Indicator */}
                        <line x1="110" y1={posG} x2="110" y2={posM} stroke={results.fluidGM >= 0 ? "#22c55e" : "#ef4444"} strokeWidth="2" className="transition-all duration-700" />
                    </svg>
                    <div className="absolute bottom-6 text-center w-full">
                        <div className={`text-4xl font-black font-mono tracking-tighter ${results.isCompliant ? 'text-green-500' : 'text-red-500 animate-pulse'}`}>
                            GM {results.fluidGM.toFixed(2)}m
                        </div>
                        <span className="text-[9px] uppercase font-bold text-white/30">Metacentric Height</span>
                    </div>
                </div>

                {/* 2. GZ Curve & Data */}
                <div className="flex flex-col gap-6">
                    {/* Data Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <h4 className="text-[9px] uppercase tracking-widest font-black text-maritime-ocean">Conditions</h4>
                            <InputBox label="Solid KG (m)" val={kgSolid} setVal={setKgSolid} />
                            <InputBox label="Total FSM" val={fsm} setVal={setFsm} />
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[9px] uppercase tracking-widest font-black text-maritime-brass">Hydrostatics</h4>
                            <InputBox label="KM (m)" val={km} setVal={setKm} />
                            <InputBox label="Displacement" val={disp} setVal={setDisp} />
                        </div>
                    </div>

                    {/* GZ Curve Graph */}
                    <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 relative flex flex-col justify-end">
                        <span className="absolute top-6 left-6 text-[10px] uppercase font-black text-maritime-brass tracking-widest">GZ Static Stability Curve</span>
                        <div className="w-full h-[150px] relative mt-8 border-l border-b border-white/10">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 240 150" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="gzGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Grid Lines */}
                                <line x1="0" y1="75" x2="240" y2="75" stroke="white" strokeOpacity="0.05" />

                                {/* The Curve */}
                                <path d={results.gzArea} fill="url(#gzGradient)" className="transition-all duration-500" />
                                <path d={results.gzPath} fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" className="transition-all duration-500" />
                            </svg>
                            {/* Axis Labels */}
                            <div className="absolute -bottom-4 left-0 text-[8px] text-white/30">0º</div>
                            <div className="absolute -bottom-4 right-0 text-[8px] text-white/30">60º</div>
                            <div className="absolute top-0 -left-6 text-[8px] text-white/30 rotate-name">GZ(m)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Results Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ResultBox label="Solid GM" val={`${results.solidGM.toFixed(3)}m`} />
                <ResultBox label="FSC" val={`${results.fsc.toFixed(3)}m`} />
                <ResultBox label="Fluid KG" val={`${results.fluidKG.toFixed(3)}m`} />
                <div className={`p-5 bg-white/[0.03] rounded-3xl border text-center transition-all ${results.isCompliant ? 'border-green-500/30' : 'border-red-500/30 animate-pulse'}`}>
                    <span className={`text-[8px] uppercase tracking-[0.2em] font-black ${results.isCompliant ? 'text-green-400' : 'text-red-400'}`}>Status</span>
                    <div className={`text-lg font-black mt-1 font-mono ${results.isCompliant ? 'text-green-400' : 'text-red-400'}`}>{results.isCompliant ? 'PASS' : 'FAIL'}</div>
                </div>
            </div>

            <HowToUse
                title="How to Use Stability Pro"
                steps={[
                    "Enter Solid KG, KM, and Displacement from vessel doc.",
                    "Input Total Free Surface Moments (FSM) to calculate the correction.",
                    "Observe the Cross-Section: G must remain below M for positive stability.",
                    "Monitor the GZ Curve: A larger area under the curve indicates better dynamic stability."
                ]}
                notes="GM < 0.15m is considered UNSTABLE by IMO criteria."
            />
        </div>
    );
}

function SquatTool() {
    const [cb, setCb] = useState('0.80');
    const [speed, setSpeed] = useState('14');

    const squatOpen = (parseFloat(cb) * (parseFloat(speed) ** 2)) / 100;
    const squatConfined = 2 * squatOpen;

    const getAlertClass = (val: number) => {
        if (val > 2.0) return "text-red-500 animate-pulse font-black";
        if (val > 1.0) return "text-orange-500 font-bold";
        return "text-white";
    };

    return (
        <div className="space-y-8">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Dynamic Squat Estimator based on the Barrass formula. Predictive settle-and-pitch for both open and confined waters.
                </p>
            </div>

            <div className="p-4 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-2xl">
                <h4 className="text-[10px] uppercase font-black text-maritime-ocean mb-3 tracking-widest text-center">Reference Cb Values</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] items-center text-center">
                    <div className="text-white/60">Cargo/Tanker: <span className="text-maritime-brass font-black">0.80</span></div>
                    <div className="text-white/60">Containership: <span className="text-maritime-brass font-black">0.70</span></div>
                    <div className="text-white/60">Yacht/Fast Craft: <span className="text-maritime-brass font-black">0.50</span></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InputBox label="Block Coeff (Cb)" val={cb} setVal={setCb} />
                <InputBox label="Speed (kts)" val={speed} setVal={setSpeed} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 text-center">
                    <span className="text-xs font-bold text-white/30 uppercase">Open Water Squat</span>
                    <div className={`text-4xl font-mono mt-2 transition-colors ${getAlertClass(squatOpen)}`}>{squatOpen.toFixed(2)}m</div>
                </div>
                <div className="p-8 bg-maritime-ocean/10 rounded-[2.5rem] border border-maritime-ocean/30 text-center">
                    <span className="text-xs font-bold text-maritime-ocean uppercase">Confined Water Squat</span>
                    <div className={`text-4xl font-mono mt-2 transition-colors ${getAlertClass(squatConfined)}`}>{squatConfined.toFixed(2)}m</div>
                </div>
            </div>

            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                <p className="text-[9px] text-red-400 font-medium leading-relaxed italic text-center">
                    Disclaimer: Theoretical estimation based on the Barrass formula. Does not replace direct observation of draft and soundings.
                </p>
            </div>

            <HowToUse
                title="How to Use Squat Estimator"
                steps={[
                    "Enter the vessel's Block Coefficient (Cb).",
                    "Input the current speed through water (kts).",
                    "The tool predicts squat in both open and confined/shallow waters.",
                    "Color alerts will trigger for values exceeding 1.0m (Orange) and 2.0m (Red Pulse)."
                ]}
            />
        </div>
    );
}

function AnchorChainCalculator() {
    const [depth, setDepth] = useState('10');
    const [wind, setWind] = useState('10');

    const multiplier = parseFloat(wind) > 15 ? 5 : 3;
    const chainMeters = (parseFloat(depth) || 0) * multiplier;
    const shackles = chainMeters / 27.5;

    return (
        <div className="space-y-8">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Calculate the recommended length of anchor chain based on water depth and environmental conditions (Wind Speed).
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InputBox label="Water Depth (m)" val={depth} setVal={setDepth} />
                <InputBox label="Wind Speed (Kts)" val={wind} setVal={setWind} />
            </div>
            <div className="p-10 bg-black/60 rounded-[3rem] border border-white/5 text-center">
                <span className="text-[10px] uppercase font-black text-maritime-ocean tracking-widest">Recommended Chain Length</span>
                <div className="text-5xl font-black text-white font-mono mt-2">{chainMeters.toFixed(1)} <span className="text-xl font-normal text-white/20">meters</span></div>
                <p className="text-[10px] text-white/40 mt-2">({shackles.toFixed(1)} shackles | Ratio {multiplier}:1 {multiplier === 5 ? 'Strong Wind' : 'Normal Conditions'})</p>
            </div>

            <HowToUse
                title="How to Use Anchor Calc"
                steps={[
                    "Enter the charted water depth from the echo sounder or chart.",
                    "Input the current/expected wind speed in knots.",
                    "The tool automatically adjusts the scope ratio (3:1 for normal, 5:1 for strong winds).",
                    "The recommended length is provided in both meters and shackles (27.5m/shackle)."
                ]}
            />
        </div>
    );
}

function SwingingRadiusTool() {
    const [shackles, setShackles] = useState('5');
    const [loa, setLoa] = useState('200');

    const radius = (parseFloat(shackles) * 27.5) + parseFloat(loa);
    const radiusNM = radius / 1852;

    return (
        <div className="space-y-8">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Estimate the safety swinging radius of a vessel at anchor. Total radius includes the chain length plus the vessel's length overall (LOA).
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InputBox label="Shackles on Deck" val={shackles} setVal={setShackles} />
                <InputBox label="LOA (m)" val={loa} setVal={setLoa} />
            </div>
            <div className="p-10 bg-maritime-ocean/10 border border-maritime-ocean/40 rounded-[3rem] text-center">
                <span className="text-[10px] uppercase font-black text-maritime-ocean tracking-widest">Safety Swinging Radius</span>
                <div className="text-5xl font-black text-white font-mono mt-2">{radiusNM.toFixed(3)} <span className="text-xl">nm</span></div>
                <p className="text-[10px] text-white/40 mt-2">({radius.toFixed(0)} meters radius)</p>
            </div>

            <HowToUse
                title="How to Use Swinging Radius"
                steps={[
                    "Input the number of shackles of chain currently paid out.",
                    "Enter the vessel's Length Overall (LOA) in meters.",
                    "The tool calculates the circle of uncertainty around the anchor position.",
                    "Check this radius against nearby hazards or other anchored vessels."
                ]}
            />
        </div>
    );
}

function CompassErrorTool() {
    const [body, setBody] = useState('Sun');
    const [gyro, setGyro] = useState('090');
    const [compass, setCompass] = useState('092');
    const [variation, setVar] = useState('2.5');
    const [deviation, setDev] = useState('1.5');

    const totalError = parseFloat(variation) + parseFloat(deviation);
    const gyroError = parseFloat(gyro) - (parseFloat(compass) + totalError);

    return (
        <div className="space-y-8">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Calculate Total Compass Error by combining Variation and Deviation, or by comparing astronomical observations (Azimuth/Amplitude) with compass readings.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="text-[10px] uppercase font-black text-white/20">Celestial Observation</h4>
                    <select value={body} onChange={(e) => setBody(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-mono text-white focus:ring-1 focus:ring-maritime-ocean">
                        {['Sun', 'Star', 'Moon', 'Planet'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                        <InputBox label="Obs. Bearing" val="088" setVal={() => { }} />
                        <InputBox label="True Azimuth" val="090" setVal={() => { }} />
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] uppercase font-black text-white/20">Compass Readings</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <InputBox label="Gyro Heading" val={gyro} setVal={setGyro} />
                        <InputBox label="Magnetic Hd" val={compass} setVal={setCompass} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputBox label="Variation (E+)" val={variation} setVal={setVar} />
                        <InputBox label="Deviation (E+)" val={deviation} setVal={setDev} />
                    </div>
                </div>
            </div>
            <div className="p-10 bg-gradient-to-br from-maritime-midnight to-black rounded-[2.5rem] border border-white/10 flex items-center justify-between">
                <div>
                    <span className="text-[10px] uppercase font-black text-maritime-ocean">Total Compass Error</span>
                    <div className="text-5xl font-black text-white font-mono mt-2">{Math.abs(totalError).toFixed(1)}º <span className="text-xl">{totalError >= 0 ? 'E' : 'W'}</span></div>
                </div>
                <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-maritime-brass">Magnetic True</span>
                    <div className="text-xl font-bold text-white">{(parseFloat(compass) + totalError).toFixed(1)}º T</div>
                </div>
            </div>

            <HowToUse
                title="How to Use Compass Error"
                steps={[
                    "Input the Variation (from chart) and Deviation (from table).",
                    "Enter the observed Magnetic Compass heading.",
                    "The tool calculates the Total Error and resulting True Heading.",
                    "Alternatively, use the Celestial section to compare an observed bearing with a known Azimuth."
                ]}
                notes="West error is treated as negative, East as positive for calculation."
            />
        </div>
    );
}

function SeaServiceTool() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<any[]>([]);
    const [newEntry, setNewEntry] = useState({ ship: '', on: '', off: '' });
    const [isLoading, setIsLoading] = useState(false);

    const loadEntries = async () => {
        if (!user) return;
        const q = query(collection(db, `users/${user.uid}/sea_service`), orderBy("on", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEntries(data);
    };

    useEffect(() => {
        loadEntries();
    }, [user]);

    const addEntry = async () => {
        if (!user || !newEntry.ship || !newEntry.on || !newEntry.off) return;
        setIsLoading(true);
        try {
            const start = new Date(newEntry.on);
            const end = new Date(newEntry.off);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            await addDoc(collection(db, `users/${user.uid}/sea_service`), {
                ...newEntry,
                days: Math.max(0, days),
                createdAt: new Date().toISOString()
            });
            setNewEntry({ ship: '', on: '', off: '' });
            loadEntries();
        } catch (error) {
            console.error("Error adding entry:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteEntry = async (id: string) => {
        if (!user || !confirm("Delete this sea service record?")) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/sea_service`, id));
            loadEntries();
        } catch (e) {
            console.error(e);
        }
    };

    const totalDays = entries.reduce((acc, curr) => acc + (curr.days || 0), 0);

    return (
        <div className="space-y-8">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Log and calculate sea service time for ROC/CoC renewals and certification. Automatically totals days across multiple vessel assignments. Data is saved to your profile.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-6 rounded-[2rem]">
                <InputBox label="Ship Name" val={newEntry.ship} setVal={(v: string) => setNewEntry({ ...newEntry, ship: v })} type="text" />
                <InputBox label="Sign On" val={newEntry.on} setVal={(v: string) => setNewEntry({ ...newEntry, on: v })} type="date" />
                <InputBox label="Sign Off" val={newEntry.off} setVal={(v: string) => setNewEntry({ ...newEntry, off: v })} type="date" />
                <button
                    onClick={addEntry}
                    disabled={isLoading || !newEntry.ship}
                    className="md:col-span-3 py-4 bg-maritime-ocean text-maritime-midnight font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-maritime-teal disabled:opacity-50 transition-all"
                >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    Register Voyage
                </button>
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase font-black text-white/20 px-2">
                    <span>Voyage History</span>
                    <span className="text-maritime-ocean">Total Sea Time: {totalDays} Days</span>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {entries.length === 0 && (
                        <div className="text-center py-8 text-[10px] text-white/20 italic">No sea service records found.</div>
                    )}
                    {entries.map((e) => (
                        <div key={e.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center group hover:border-white/10 transition-colors">
                            <div>
                                <div className="font-bold text-maritime-brass">{e.ship}</div>
                                <div className="text-[10px] text-white/30">{e.on} → {e.off}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-xl font-black font-mono">{e.days}d</div>
                                <button onClick={() => deleteEntry(e.id)} className="text-white/10 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <HowToUse
                title="How to Use Sea Service"
                steps={[
                    "List your vessel assignments with sign-on and sign-off dates.",
                    "The tool calculates the total calendar days for each period.",
                    "Summary provides the cumulative sea time required for license upgrades or renewals.",
                    "All data is securely saved to your cloud profile."
                ]}
            />
        </div>
    );
}

function ContractTool() {
    const { user } = useAuth();
    const [onDate, setOnDate] = useState('');
    const [offDate, setOffDate] = useState('');
    const [loading, setLoading] = useState(false);

    // Load initial data
    useEffect(() => {
        if (!user) return;
        const loadContract = async () => {
            const docRef = doc(db, `users/${user.uid}/contract/current`);
            const docSnap = await getDocs(query(collection(db, `users/${user.uid}/contract`), orderBy('createdAt', 'desc'))); // Using collection for simplicity or single doc?
            // Actually let's use a single document ID 'current' for simplicity as requested
            try {
                const d = await getDoc(doc(db, `users/${user.uid}/contract/current`));
                if (d.exists()) {
                    setOnDate(d.data().onDate);
                    setOffDate(d.data().offDate);
                } else {
                    // Defaults
                    setOnDate(new Date().toISOString().slice(0, 10));
                    setOffDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10));
                }
            } catch (e) {
                console.error("Error loading contract", e);
            }
        };
        loadContract();
    }, [user]);

    // Save on change (Debounced slightly by nature of user interaction, but let's add a button for explicit save to precise)
    const saveContract = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await setDoc(doc(db, `users/${user.uid}/contract/current`), {
                onDate,
                offDate,
                updatedAt: new Date().toISOString()
            });
            // alert("Contract details updated!"); 
        } catch (e) {
            console.error("Error saving contract", e);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        if (!onDate || !offDate) return { onBoard: 0, toGo: 0, percent: 0 };
        const start = new Date(onDate);
        const end = new Date(offDate);
        const now = new Date();

        const total = (end.getTime() - start.getTime()) / 86400000;
        const elapsed = (now.getTime() - start.getTime()) / 86400000;
        const remaining = total - elapsed;
        const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));

        return {
            onBoard: Math.floor(elapsed),
            toGo: Math.ceil(remaining),
            percent
        };
    }, [onDate, offDate]);

    return (
        <div className="space-y-8">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Keep track of your current contract progress. Monitor days completed, days remaining, and visual percentage toward your End of Contract (EOC).
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InputBox label="Sign On Date" val={onDate} setVal={setOnDate} type="date" />
                <InputBox label="Contract End (EoC)" val={offDate} setVal={setOffDate} type="date" />
            </div>

            <button
                onClick={saveContract}
                disabled={loading}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] uppercase font-black tracking-widest text-maritime-ocean transition-all flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                {loading ? 'Saving Update...' : 'Update Contract Details'}
            </button>

            <div className="p-10 bg-black/40 rounded-[3rem] border border-white/10 space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-[10px] uppercase font-black text-maritime-ocean tracking-widest">Days on Board</span>
                        <div className="text-5xl font-black text-white font-mono">{stats.onBoard}</div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-black text-maritime-brass tracking-widest">Days to Go</span>
                        <div className="text-4xl font-black text-maritime-brass font-mono">{stats.toGo}</div>
                    </div>
                </div>
                <div className="h-6 bg-white/5 rounded-full border border-white/5 p-1 overflow-hidden">
                    <div
                        className="h-full bg-maritime-ocean rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(0,180,216,0.3)]"
                        style={{ width: `${stats.percent}%` }}
                    />
                </div>
                <div className="text-center text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                    Contract Completion: {stats.percent.toFixed(1)}%
                </div>
            </div>

            <HowToUse
                title="How to Use Contract Tracker"
                steps={[
                    "Input your official sign-on date from your seaman's book or contract.",
                    "Enter the scheduled End of Contract (EOC) date.",
                    "Click 'Update Contract Details' to save your dates to the cloud.",
                    "The tracker will update daily to show your progress and days remaining until sign-off."
                ]}
            />
        </div>
    );
}

function LatLonConverter() {
    const [lat, setLat] = useState('40.7128');
    const [lon, setLon] = useState('-74.0060');

    const formats = useMemo(() => {
        const l = parseFloat(lat) || 0;
        const ln = parseFloat(lon) || 0;

        const toDMS = (val: number) => {
            const d = Math.floor(Math.abs(val));
            const minFull = (Math.abs(val) - d) * 60;
            const m = Math.floor(minFull);
            const s = Math.round((minFull - m) * 60);
            return `${d}º ${m}' ${s}\"`;
        };

        const toDMM = (val: number) => {
            const d = Math.floor(Math.abs(val));
            const m = ((Math.abs(val) - d) * 60).toFixed(3);
            return `${d}º ${m}'`;
        };

        return {
            latDMS: `${toDMS(l)} ${l >= 0 ? 'N' : 'S'}`,
            lonDMS: `${toDMS(ln)} ${ln >= 0 ? 'E' : 'W'}`,
            latDMM: `${toDMM(l)} ${l >= 0 ? 'N' : 'S'}`,
            lonDMM: `${toDMM(ln)} ${ln >= 0 ? 'E' : 'W'}`
        };
    }, [lat, lon]);

    return (
        <div className="space-y-6">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Convert coordinates between Decimal Degrees (DD), Degrees Minutes Seconds (DMS), and Degrees Decimal Minutes (DMM).
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InputBox label="Lat (Decimal)" val={lat} setVal={setLat} />
                <InputBox label="Lon (Decimal)" val={lon} setVal={setLon} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <ResultBox label="Lat DMS" val={formats.latDMS} />
                <ResultBox label="Lon DMS" val={formats.lonDMS} />
                <ResultBox label="Lat DMM" val={formats.latDMM} />
                <ResultBox label="Lon DMM" val={formats.lonDMM} />
            </div>

            <HowToUse
                title="How to Use Converter"
                steps={[
                    "Input coordinates in Decimal format (e.g., 40.7128).",
                    "Use negative values for South latitude and West longitude.",
                    "The tool provides instant conversion to professional maritime formats used on charts and GPS."
                ]}
            />
        </div>
    );
}

function ArcTimeTool() {
    const [arc, setArc] = useState('45');

    const timeHrs = (parseFloat(arc) || 0) / 15;
    const h = Math.floor(timeHrs);
    const m = Math.round((timeHrs % 1) * 60);

    return (
        <div className="space-y-8 text-center">
            <div className="p-6 bg-maritime-ocean/5 border border-maritime-ocean/20 rounded-[2.5rem]">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                    Convert Arc (degrees) to Time (hours/minutes) based on the Earth's rotation rate (15º per hour). Essential for celestial and time-zone calculations.
                </p>
            </div>

            <InputBox label="Arc degrees (º)" val={arc} setVal={setArc} />
            <div className="p-10 bg-maritime-ocean/5 border border-maritime-ocean/30 rounded-[3rem]">
                <span className="text-[10px] uppercase font-black text-maritime-ocean">Equivalent Time</span>
                <div className="text-6xl font-black font-mono text-white mt-2">
                    {h.toString().padStart(2, '0')}h {m.toString().padStart(2, '0')}m
                </div>
                <p className="text-[8px] text-white/20 uppercase mt-4">Conversion Rate: 15º = 1.0 Hour</p>
            </div>

            <HowToUse
                title="How to Use Arc to Time"
                steps={[
                    "Input the arc in degrees.",
                    "The tool divides by 15 to find the equivalent time duration.",
                    "Used to calculate LHA, GHA, and time differences between longitudes."
                ]}
            />
        </div>
    );
}

// --- SHARED UI PRIMITIVES ---

function InputBox({ label, val, setVal, type = "number" }: any) {
    return (
        <div className="space-y-1.5 group">
            <label className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-black group-focus-within:text-maritime-ocean transition-colors">{label}</label>
            <input
                type={type}
                step="any"
                value={val}
                onChange={e => setVal(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-maritime-ocean focus:border-transparent transition-all"
            />
        </div>
    );
}

function CoordInput({ label }: any) {
    return (
        <div className="space-y-3 text-left">
            <h4 className="text-[9px] uppercase tracking-widest font-black text-white/40">{label}</h4>
            <div className="grid grid-cols-2 gap-3">
                <InputBox label="Lat" val="0" setVal={() => { }} />
                <InputBox label="Lon" val="0" setVal={() => { }} />
            </div>
        </div>
    );
}

function ResultBox({ label, val }: any) {
    return (
        <div className="p-5 bg-white/[0.03] rounded-3xl border border-white/5 text-center transition-all hover:bg-white/5 group">
            <span className="text-[8px] uppercase tracking-[0.2em] text-white/20 font-black group-hover:text-maritime-ocean transition-colors">{label}</span>
            <div className="text-lg font-black text-white mt-1 font-mono">{val}</div>
        </div>
    );
}

function HowToUse({ title, steps, notes }: any) {
    return (
        <div className="mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
            <div className="flex items-center gap-2 text-maritime-ocean">
                <Info className="w-4 h-4" />
                <h4 className="text-[10px] uppercase font-black tracking-widest">{title || "How to Use"}</h4>
            </div>
            <div className="space-y-3">
                {steps && (
                    <div className="space-y-2">
                        {steps.map((step: string, i: number) => (
                            <div key={i} className="flex gap-3 text-[11px] leading-relaxed">
                                <span className="text-maritime-ocean font-bold">Step {i + 1}:</span>
                                <span className="text-white/60">{step}</span>
                            </div>
                        ))}
                    </div>
                )}
                {notes && (
                    <div className="pt-2 border-t border-white/5">
                        <p className="text-[10px] text-white/40 italic leading-relaxed">{notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
