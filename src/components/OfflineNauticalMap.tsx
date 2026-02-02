"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    Navigation, ZoomIn, ZoomOut, Trash2,
    Activity, Keyboard, Send, Plus, Save, BookOpen, ChevronRight, X
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, getDocs, Timestamp, orderBy, where, deleteDoc, doc } from "firebase/firestore";

// --- PROFESSIONAL OFFLINE NAUTICAL CHARTS (ECDIS SYSTEM) ---
// DESIGNED FOR 100% OFFLINE BRIDGE OPERATIONS

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

interface OfflineNauticalMapProps {
    variant?: 'tactical' | 'weather';
    onPointSelect?: (lat: number, lon: number) => void;
    className?: string;
}

export default function OfflineNauticalMap({ variant = 'tactical', onPointSelect, className = "" }: OfflineNauticalMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const routeLayerRef = useRef<L.LayerGroup | null>(null);
    const seamarkLayerRef = useRef<L.LayerGroup | null>(null);

    const { user } = useAuth();
    const [selectedPoint, setSelectedPoint] = useState<{ lat: number, lon: number } | null>(null);
    const [waypoints, setWaypoints] = useState<{ lat: number, lon: number }[]>([]);
    const [maxWaypoints, setMaxWaypoints] = useState(2);
    const [routeType, setRouteType] = useState<'gc' | 'rhumb' | 'both'>('both');
    const [isLoading, setIsLoading] = useState(true);
    const [distances, setDistances] = useState<{ gc: number, rhumb: number }[]>([]);
    const [isManualMode, setIsManualMode] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
    const [routeName, setRouteName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [manualInputs, setManualInputs] = useState({
        lat: "", lon: ""
    });

    // Create Icons
    const createSeamarkIcon = (type: string, color: string) => {
        const svg = type === 'buoy'
            ? `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L16 12H8L12 4Z" fill="${color}" stroke="white" stroke-width="0.5"/>
                <path d="M11 12V18M13 12V18" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
                <circle cx="12" cy="19" r="1.5" fill="white" fill-opacity="0.2"/>
               </svg>`
            : `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="4" fill="${color}" filter="blur(0.5px)" />
                <circle cx="12" cy="12" r="8" stroke="${color}" stroke-opacity="0.2" stroke-width="1">
                  <animate attributeName="r" from="4" to="10" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
               </svg>`;
        return L.divIcon({
            html: svg,
            className: 'custom-seamark',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    };

    const getGreatCirclePoints = (start: [number, number], end: [number, number], segments = 100) => {
        const points: [number, number][] = [];
        const lat1 = toRad(start[0]);
        const lon1 = toRad(start[1]);
        const lat2 = toRad(end[0]);
        const lon2 = toRad(end[1]);
        const dLon = toRad(end[1] - start[1]);

        const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dLon / 2), 2)));

        if (d === 0) return [start, end];

        for (let i = 0; i <= segments; i++) {
            const f = i / segments;
            const A = Math.sin((1 - f) * d) / Math.sin(d);
            const B = Math.sin(f * d) / Math.sin(d);
            const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
            const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
            const z = A * Math.sin(lat1) + B * Math.sin(lat2);
            const lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
            const lon = Math.atan2(y, x);
            points.push([toDeg(lat), toDeg(lon)]);
        }
        return points;
    };

    const calculateDistances = (start: { lat: number, lon: number }, end: { lat: number, lon: number }) => {
        const R = 3440.065; // Nautical Miles
        const lat1 = toRad(start.lat);
        const lon1 = toRad(start.lon);
        const lat2 = toRad(end.lat);
        const lon2 = toRad(end.lon);

        // GC Distance
        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const gcDist = R * c;

        // Rhumb Line Distance
        const dPhi = Math.log(Math.tan(lat2 / 2 + Math.PI / 4) / Math.tan(lat1 / 2 + Math.PI / 4));
        const q = Math.abs(dPhi) > 1e-10 ? dLat / dPhi : Math.cos(lat1);
        let dL = lon2 - lon1;
        if (Math.abs(dL) > Math.PI) dL = dL > 0 ? -(2 * Math.PI - dL) : (2 * Math.PI + dL);
        const rhumbDist = Math.sqrt(dLat * dLat + q * q * dL * dL) * R;

        return { gc: gcDist, rhumb: rhumbDist };
    };

    // Initialize Map
    useEffect(() => {
        if (typeof window === "undefined" || !mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [20, 0],
            zoom: 2.5,
            zoomControl: false,
            preferCanvas: true,
            attributionControl: false,
            maxBounds: [[-90, -360], [90, 360]],
            minZoom: 2,
            maxZoom: 14,
            worldCopyJump: true
        });
        mapRef.current = map;

        map.whenReady(() => {
            routeLayerRef.current = L.layerGroup().addTo(map);
            seamarkLayerRef.current = L.layerGroup().addTo(map);

            fetch('/data/coastline.json')
                .then(res => res.json())
                .then(data => {
                    if (!mapRef.current) return;
                    L.geoJSON(data, {
                        style: {
                            fillColor: '#2c3e50',
                            fillOpacity: 1,
                            color: '#00e5ff',
                            weight: 0.5,
                            opacity: 0.3
                        }
                    }).addTo(map);
                    mapRef.current.invalidateSize();
                    setIsLoading(false);
                })
                .catch(() => {
                    mapRef.current?.invalidateSize();
                    setIsLoading(false);
                });

            fetch('/data/seamarks.json')
                .then(res => res.json())
                .then(data => {
                    if (!mapRef.current || !seamarkLayerRef.current) return;
                    data.forEach((mark: any) => {
                        const icon = createSeamarkIcon(mark.type, mark.color);
                        L.marker([mark.lat, mark.lon], { icon })
                            .bindPopup(`<div class="text-[10px] uppercase font-black text-maritime-ocean">${mark.name}</div>`)
                            .addTo(seamarkLayerRef.current!);
                    });
                });
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Load Saved Routes
    const loadSavedRoutes = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(db, `users/${user.uid}/routes`),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const routes = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSavedRoutes(routes);
        } catch (error) {
            console.error("Error loading routes:", error);
        }
    };

    const saveRoute = async () => {
        if (!user || waypoints.length < 2 || !routeName) return;
        setIsSaving(true);
        try {
            await addDoc(collection(db, `users/${user.uid}/routes`), {
                name: routeName,
                waypoints,
                createdAt: Timestamp.now(),
                totalDistance: distances.reduce((acc, d) => acc + (routeType === 'gc' ? d.gc : d.rhumb), 0)
            });
            setRouteName("");
            loadSavedRoutes();
            alert("Route saved successfully!");
        } catch (error) {
            console.error("Error saving route:", error);
            alert("Failed to save route.");
        } finally {
            setIsSaving(false);
        }
    };

    const deleteRoute = async (routeId: string) => {
        if (!confirm("Are you sure you want to delete this route?")) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/routes`, routeId));
            loadSavedRoutes();
        } catch (error) {
            console.error("Error deleting route:", error);
        }
    };

    useEffect(() => {
        if (isLibraryOpen) loadSavedRoutes();
    }, [isLibraryOpen]);

    // Reactive Map Click Handler (Prevents stale closures)
    useEffect(() => {
        if (!mapRef.current) return;

        const handleMapClick = (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            const point = { lat, lon: lng };

            if (variant === 'tactical') {
                setWaypoints(prev => {
                    if (prev.length >= maxWaypoints) return [point];
                    return [...prev, point];
                });
            } else {
                // Weather Mode: Single point selection
                setWaypoints([point]);
                if (onPointSelect) onPointSelect(lat, lng);
            }
            setSelectedPoint(point);
        };

        mapRef.current.on('click', handleMapClick);
        // Force a size check on next tick to ensure container is fully rendered
        setTimeout(() => mapRef.current?.invalidateSize(), 100);

        return () => {
            mapRef.current?.off('click', handleMapClick);
        };
    }, [waypoints, maxWaypoints]);

    const handleManualPlot = () => {
        const l = parseFloat(manualInputs.lat);
        const ln = parseFloat(manualInputs.lon);

        if (!isNaN(l) && !isNaN(ln)) {
            if (l >= -90 && l <= 90 && ln >= -180 && ln <= 180) {
                const point = { lat: l, lon: ln };
                setWaypoints(prev => {
                    if (prev.length >= maxWaypoints) return [point];
                    return [...prev, point];
                });
                setIsManualMode(false);
                mapRef.current?.setView([l, ln], 4);
                if (variant === 'weather' && onPointSelect) {
                    onPointSelect(l, ln);
                }
            }
        }
    };

    // Route Drawing & Calculation
    useEffect(() => {
        if (!mapRef.current || !routeLayerRef.current) return;
        routeLayerRef.current.clearLayers();

        if (waypoints.length > 0) {
            const segmentDistances: { gc: number, rhumb: number }[] = [];

            waypoints.forEach((wp, idx) => {
                const pos: [number, number] = [wp.lat, wp.lon];

                // Marker
                L.circleMarker(pos, {
                    radius: 6,
                    color: idx === 0 ? '#D4AF37' : (idx === waypoints.length - 1 ? '#00e5ff' : '#ffffff'),
                    fillColor: '#0c1930',
                    fillOpacity: 1,
                    weight: 2
                }).addTo(routeLayerRef.current!)
                    .bindTooltip(`WP ${idx + 1}${idx === 0 ? ' (ST)' : (idx === waypoints.length - 1 ? ' (END)' : '')}`, { permanent: true, direction: 'top', className: 'tactical-tooltip' });

                // Path to previous WP
                if (idx > 0) {
                    const prev = waypoints[idx - 1];
                    const dists = calculateDistances(prev, wp);
                    segmentDistances.push(dists);

                    if (routeType === 'gc' || routeType === 'both') {
                        const gcPoints = getGreatCirclePoints([prev.lat, prev.lon], [wp.lat, wp.lon]);
                        L.polyline(gcPoints, { color: '#D4AF37', weight: 3, className: 'tactical-path' }).addTo(routeLayerRef.current!);
                    }

                    if (routeType === 'rhumb' || routeType === 'both') {
                        L.polyline([[prev.lat, prev.lon], [wp.lat, wp.lon]], {
                            color: '#00e5ff',
                            weight: 2,
                            dashArray: '5, 10',
                            className: 'tactical-path opacity-70'
                        }).addTo(routeLayerRef.current!);
                    }
                }
            });

            setDistances(segmentDistances);
        } else {
            setDistances([]);
        }
    }, [waypoints, routeType]);

    return (
        <section className={`flex flex-col w-full ${variant === 'weather' ? 'h-full' : ''} ${className}`}>
            {variant === 'tactical' && (
                <div className="flex items-center justify-between border-l-2 border-maritime-ocean pl-6 mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-maritime-brass uppercase tracking-tighter">Tactical Navigation Console</h3>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] mt-1 font-mono">100% Offline | Vectorial Plotting Engine | ECDIS Standard</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setRouteType('both')} className={`px-4 py-2 rounded-xl text-[9px] uppercase font-black transition-all border ${routeType === 'both' ? 'bg-white/10 text-white border-white/30' : 'border-white/10 text-white/40 hover:border-white/20'}`}>Compare Both</button>
                        <button onClick={() => setRouteType('gc')} className={`px-4 py-2 rounded-xl text-[9px] uppercase font-black transition-all border ${routeType === 'gc' ? 'bg-maritime-brass text-black border-maritime-brass' : 'border-white/10 text-white/40 hover:border-white/20'}`}>Great Circle Only</button>
                        <button onClick={() => setRouteType('rhumb')} className={`px-4 py-2 rounded-xl text-[9px] uppercase font-black transition-all border ${routeType === 'rhumb' ? 'bg-maritime-ocean text-black border-maritime-ocean' : 'border-white/10 text-white/40 hover:border-white/20'}`}>Rhumb Only</button>
                    </div>
                </div>
            )}

            <div className="flex-1 flex gap-6 min-h-0 relative">
                <div className={`relative flex-1 rounded-[3rem] overflow-hidden border border-white/10 glass shadow-2xl ${variant === 'tactical' ? 'h-[600px]' : 'h-full'}`}>
                    <div ref={mapContainerRef} className="w-full h-full bg-[#001a33]" />

                    {/* Loading State */}
                    {isLoading && (
                        <div className="absolute inset-0 z-[1002] bg-[#001a33] flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 border-t-2 border-b-2 border-maritime-ocean rounded-full animate-spin shadow-[0_0_20px_rgba(0,180,216,0.3)]" />
                            <div className="text-[10px] text-maritime-ocean font-black uppercase tracking-[0.4em] animate-pulse">Syncing Tactical Charts...</div>
                        </div>
                    )}

                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{ background: 'radial-gradient(circle, #00e5ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                    />

                    {variant === 'tactical' && (
                        <div className="absolute top-8 left-8 z-[1001] space-y-4">
                            <div className="glass bg-[#0c1930]/60 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] min-w-[320px]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-4 h-4 text-maritime-ocean animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Voyage Planner</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                                            className={`p-2 rounded-lg transition-colors ${isLibraryOpen ? 'bg-maritime-ocean text-black' : 'hover:bg-white/5 text-white/20'}`}
                                            title="Saved Routes"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setIsManualMode(!isManualMode)}
                                            className={`p-2 rounded-lg transition-colors ${isManualMode ? 'bg-maritime-brass text-black' : 'hover:bg-white/5 text-white/20'}`}
                                            title="Manual Entry"
                                        >
                                            <Keyboard className="w-4 h-4" />
                                        </button>
                                        {waypoints.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    setWaypoints([]);
                                                    setDistances([]);
                                                    setSelectedPoint(null);
                                                }}
                                                className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-red-400 transition-colors"
                                                title="Clear Route"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Waypoint Count Selector */}
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl mb-4 border border-white/5">
                                    <span className="text-[9px] font-black uppercase text-white/40">Max Waypoints</span>
                                    <div className="flex gap-1">
                                        {[2, 3, 5, 8].map(n => (
                                            <button
                                                key={n}
                                                onClick={() => setMaxWaypoints(n)}
                                                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${maxWaypoints === n ? 'bg-maritime-ocean text-black' : 'hover:bg-white/10 text-white/40'}`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {isManualMode ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[8px] uppercase text-white/40 font-black">Latitude</label>
                                                <input
                                                    type="text"
                                                    placeholder="00.000"
                                                    value={manualInputs.lat}
                                                    onChange={(e) => setManualInputs({ ...manualInputs, lat: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-white focus:border-maritime-brass/50 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[8px] uppercase text-white/40 font-black">Longitude</label>
                                                <input
                                                    type="text"
                                                    placeholder="00.000"
                                                    value={manualInputs.lon}
                                                    onChange={(e) => setManualInputs({ ...manualInputs, lon: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-white focus:border-maritime-brass/50 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleManualPlot}
                                            disabled={waypoints.length >= maxWaypoints}
                                            className="w-full py-3 bg-maritime-ocean text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50"
                                        >
                                            <Plus className="w-3 h-3" /> Add Waypoint {waypoints.length + 1}/{maxWaypoints}
                                        </button>
                                    </div>
                                ) : waypoints.length >= 2 ? (
                                    <div className="space-y-4">
                                        <div className="font-mono space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                            {distances.map((d, i) => (
                                                <div key={i} className="flex items-center gap-3 text-[10px]">
                                                    <div className="w-1 h-6 bg-maritime-ocean/20 rounded-full" />
                                                    <div className="flex-1 text-white/40">Leg {i + 1}</div>
                                                    <div className="text-white font-black">{(routeType === 'gc' ? d.gc : d.rhumb).toFixed(1)} NM</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-4 bg-maritime-brass/10 border border-maritime-brass/20 rounded-xl text-center">
                                            <span className="text-[8px] uppercase text-maritime-brass block mb-1">Total Voyage Distance</span>
                                            <div className="text-2xl font-black text-white">
                                                {distances.reduce((acc, d) => acc + (routeType === 'gc' ? d.gc : d.rhumb), 0).toLocaleString()} <span className="text-xs">NM</span>
                                            </div>
                                        </div>

                                        {/* Great Circle Savings Display */}
                                        {distances.length > 0 && (
                                            <div className="mt-4 px-4 py-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] uppercase text-white/40 font-black">Great Circle Savings</span>
                                                    <span className="text-sm font-black text-maritime-ocean">
                                                        {(distances.reduce((acc, d) => acc + d.rhumb, 0) - distances.reduce((acc, d) => acc + d.gc, 0)).toFixed(1)} <span className="text-[9px] text-white/40">NM</span>
                                                    </span>
                                                </div>
                                                <div className="text-[8px] text-white/30 font-mono leading-tight">
                                                    Distance saved by following the earth's curvature (Great Circle) vs constant heading (Rhumb Line).
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                        <div className="text-[10px] text-white/20 uppercase font-black leading-relaxed">
                                            {waypoints.length === 0 ? (
                                                <>Click map to set<br /><span className="text-maritime-brass text-xs">Start Waypoint</span></>
                                            ) : (
                                                <>WP 1 Set: <span className="text-maritime-brass">{waypoints[0].lat.toFixed(2)}N</span><br />
                                                    Click to set <span className="text-maritime-ocean text-xs">Next Waypoints</span></>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="absolute top-8 right-8 z-[1001] flex flex-col gap-2">
                        <button
                            onClick={() => mapRef.current?.setView([20, 0], 2.5)}
                            className="p-4 glass bg-[#0c1930]/40 border border-white/10 rounded-2xl text-maritime-ocean hover:text-white transition-colors"
                            title="Global View"
                        >
                            <Navigation className="w-5 h-5" />
                        </button>
                        <button onClick={() => mapRef.current?.zoomIn()} className="p-4 glass bg-[#0c1930]/40 border border-white/10 rounded-2xl text-maritime-brass hover:text-white transition-colors"><ZoomIn className="w-5 h-5" /></button>
                        <button onClick={() => mapRef.current?.zoomOut()} className="p-4 glass bg-[#0c1930]/40 border border-white/10 rounded-2xl text-maritime-brass hover:text-white transition-colors"><ZoomOut className="w-5 h-5" /></button>
                        <button onClick={() => { setWaypoints([]); setDistances([]); setIsManualMode(false); }} className="p-4 glass bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 hover:bg-red-500/20 transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>

                    {/* Library Sidebar (Drawer) */}
                    {variant === 'tactical' && (
                        <div className={`absolute top-0 right-0 h-full z-[1002] transition-transform duration-500 ease-in-out ${isLibraryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            <div className="w-80 h-full glass bg-[#0c1930]/90 backdrop-blur-3xl border-l border-white/10 p-8 flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-lg font-black text-maritime-brass uppercase tracking-tighter">Route Library</h4>
                                    <button onClick={() => setIsLibraryOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-white/40"><X className="w-5 h-5" /></button>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                    {savedRoutes.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-4">
                                            <BookOpen className="w-12 h-12" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">No routes archived</span>
                                        </div>
                                    ) : (
                                        savedRoutes.map((route: any) => (
                                            <div key={route.id} className="group p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-maritime-ocean/40 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-bold text-sm text-white truncate max-w-[140px]">{route.name}</div>
                                                    <button onClick={() => deleteRoute(route.id)} className="p-1 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="text-maritime-ocean font-black">{route.waypoints.length} WPTs</span>
                                                    <span className="text-white/30">{route.totalDistance.toFixed(0)} NM</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setWaypoints(route.waypoints);
                                                        setIsLibraryOpen(false);
                                                        mapRef.current?.setView([route.waypoints[0].lat, route.waypoints[0].lon], 4);
                                                    }}
                                                    className="w-full mt-3 py-2 bg-maritime-ocean/10 text-maritime-ocean rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-maritime-ocean hover:text-black transition-all"
                                                >
                                                    Load Route <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .leaflet-container { background: #001a33 !important; cursor: crosshair !important; }
                .tactical-path { filter: drop-shadow(0 0 5px currentColor); }
                .custom-seamark { filter: drop-shadow(0 0 5px rgba(0, 229, 255, 0.5)); }
                .leaflet-popup-content-wrapper { background: #0c1930 !important; border: 1px solid rgba(0, 180, 216, 0.3) !important; border-radius: 1rem !important; }
                .leaflet-popup-tip { background: #0c1930 !important; }
                .tactical-tooltip { 
                    background: rgba(12, 25, 48, 0.9) !important; 
                    border: 1px solid rgba(0, 180, 216, 0.4) !important; 
                    color: white !important; 
                    font-weight: 900 !important; 
                    font-size: 8px !important; 
                    text-transform: uppercase !important; 
                    letter-spacing: 0.1em !important; 
                    border-radius: 4px !important; 
                    padding: 2px 6px !important;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </section>
    );
}
