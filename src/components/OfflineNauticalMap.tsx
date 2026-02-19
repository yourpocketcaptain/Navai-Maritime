"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toJpeg } from 'html-to-image';
import {
    Navigation, ZoomIn, ZoomOut, Trash2,
    Activity, Keyboard, Send, Plus, Save, BookOpen, ChevronRight, X, Camera, Compass, Maximize2, Minimize2
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
    const uiContainerRef = useRef<HTMLDivElement | null>(null);
    const controlsContainerRef = useRef<HTMLDivElement | null>(null);
    const seamarkLayerRef = useRef<L.LayerGroup | null>(null);

    const { user } = useAuth();
    const [selectedPoint, setSelectedPoint] = useState<{ lat: number, lon: number } | null>(null);
    const [waypoints, setWaypoints] = useState<{ lat: number, lon: number }[]>([]);
    const [maxWaypoints, setMaxWaypoints] = useState(20);
    const [routeType, setRouteType] = useState<'gc' | 'rhumb' | 'both'>('both');
    const [isLoading, setIsLoading] = useState(true);
    const [distances, setDistances] = useState<{ gc: number, rhumb: number, bearing: number }[]>([]);
    const [isManualMode, setIsManualMode] = useState(false);
    const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
    const [routeName, setRouteName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [manualInputs, setManualInputs] = useState({
        lat: "", lon: ""
    });
    const [isPlotting, setIsPlotting] = useState(true);
    const [speed, setSpeed] = useState<string>("10");
    const [isFullscreen, setIsFullscreen] = useState(false);

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

        let bearing = toDeg(Math.atan2(dL, dPhi));
        if (bearing < 0) bearing += 360;

        return { gc: gcDist, rhumb: rhumbDist, bearing };
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
        if (!user) return;
        if (!confirm("Are you sure you want to delete this route?")) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/routes`, routeId));
            loadSavedRoutes();
        } catch (error) {
            console.error("Error deleting route:", error);
        }
    };

    // Expose delete function to window for Leaflet markers
    useEffect(() => {
        (window as any).deleteWaypoint = (index: number) => {
            setWaypoints(prev => prev.filter((_, i) => i !== index));
        };
    }, []);

    useEffect(() => {
        loadSavedRoutes();
    }, []);

    // Reactive Map Click Handler (Prevents stale closures)
    useEffect(() => {
        if (!mapRef.current) return;

        const handleMapClick = (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            const point = { lat, lon: lng };

            if (variant === 'tactical') {
                if (!isPlotting) return;

                setWaypoints(prev => {
                    if (prev.length >= maxWaypoints) return prev;
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
    }, [waypoints, maxWaypoints, isPlotting]);

    const handleManualPlot = () => {
        const l = parseFloat(manualInputs.lat);
        const ln = parseFloat(manualInputs.lon);

        if (!isNaN(l) && !isNaN(ln)) {
            if (l >= -90 && l <= 90 && ln >= -180 && ln <= 180) {
                const point = { lat: l, lon: ln };
                setWaypoints(prev => {
                    if (prev.length >= maxWaypoints) return prev;
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
            const segmentDistances: { gc: number, rhumb: number, bearing: number }[] = [];

            waypoints.forEach((wp, idx) => {
                const pos: [number, number] = [wp.lat, wp.lon];

                // Custom DivIcon for Waypoint with Delete Button
                const iconHtml = `
                    <div class="relative group">
                        <div class="w-3 h-3 rounded-full border-2 border-white ${idx === 0 ? 'bg-[#D4AF37]' : (idx === waypoints.length - 1 ? 'bg-[#00e5ff]' : 'bg-[#0c1930]')}"></div>
                        <button onclick="event.stopPropagation(); window.deleteWaypoint(${idx})" class="absolute -top-4 -right-4 w-4 h-4 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                            ×
                        </button>
                    </div>
                `;

                const icon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-wp-marker',
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                });

                L.marker(pos, { icon }).addTo(routeLayerRef.current!)
                    .bindTooltip(`
                        <div class="flex flex-col items-center">
                            <span class="font-bold">WP ${idx + 1}</span>
                            <span class="text-[9px] font-mono opacity-80">${wp.lat.toFixed(4)}, ${wp.lon.toFixed(4)}</span>
                        </div>
                    `, {
                        permanent: true,
                        direction: 'bottom',
                        offset: [0, 10],
                        className: 'tactical-tooltip'
                    });

                // Path and Heading Label
                if (idx > 0) {
                    const prev = waypoints[idx - 1];
                    const dists = calculateDistances(prev, wp);
                    segmentDistances.push(dists);

                    // Draw Route Line
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

                    // Add Heading Label at Midpoint
                    const midLat = (prev.lat + wp.lat) / 2;
                    const midLon = (prev.lon + wp.lon) / 2;
                    const bearingHtml = `<div class="bg-[#0c1930]/80 text-[#00e5ff] text-[8px] font-black px-1 rounded border border-[#00e5ff]/30 backdrop-blur-sm">${dists.bearing.toFixed(0)}°</div>`;

                    L.marker([midLat, midLon], {
                        icon: L.divIcon({
                            html: bearingHtml,
                            className: 'bearing-label',
                            iconSize: [30, 12],
                            iconAnchor: [15, 6]
                        })
                    }).addTo(routeLayerRef.current!);
                }
            });

            setDistances(segmentDistances);
        } else {
            setDistances([]);
        }
    }, [waypoints, routeType]);

    const handleExportImage = async (route: any) => {
        if (!mapContainerRef.current) return;

        // Load route to ensure it's visible
        setWaypoints(route.waypoints);

        // Fit bounds to show entire route
        if (mapRef.current && route.waypoints.length > 0) {
            const bounds = L.latLngBounds(route.waypoints.map((wp: any) => [wp.lat, wp.lon]));
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }

        // Wait for map to settle/render
        await new Promise(resolve => setTimeout(resolve, 800));

        // Create Stats Overlay for the Image
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.bottom = '20px';
        overlay.style.left = '20px';
        overlay.style.background = 'rgba(12, 25, 48, 0.9)';
        overlay.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        overlay.style.borderRadius = '12px';
        overlay.style.padding = '16px';
        overlay.style.zIndex = '100000'; // Ensure it's above everything
        overlay.style.color = 'white';
        overlay.style.fontFamily = 'monospace';
        overlay.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.gap = '4px';

        // Hide UI Panels
        if (uiContainerRef.current) {
            uiContainerRef.current.style.display = 'none';
        }
        if (controlsContainerRef.current) {
            controlsContainerRef.current.style.display = 'none';
        }
        overlay.style.gap = '4px';
        overlay.innerHTML = `
            <div style="font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,0.4); font-weight: 900; letter-spacing: 0.1em;">Voyage Plan</div>
            <div style="font-size: 18px; font-weight: 900; color: white;">${route.name}</div>
            <div style="display: flex; gap: 12px; margin-top: 8px;">
                <div>
                    <div style="font-size: 8px; text-transform: uppercase; color: rgba(255,255,255,0.4);">Total Distance</div>
                    <div style="font-size: 14px; font-weight: 700; color: #00e5ff;">${route.totalDistance.toFixed(1)} NM</div>
                </div>
                <div>
                    <div style="font-size: 8px; text-transform: uppercase; color: rgba(255,255,255,0.4);">Waypoints</div>
                    <div style="font-size: 14px; font-weight: 700; color: #D4AF37;">${route.waypoints.length}</div>
                </div>
            </div>
            <div style="font-size: 8px; text-transform: uppercase; color: rgba(255,255,255,0.2); margin-top: 10px;">Generated by NAVAI</div>
        `;
        mapContainerRef.current.appendChild(overlay);

        try {
            const dataUrl = await toJpeg(mapContainerRef.current, {
                quality: 0.9,
                backgroundColor: '#001a33',
                pixelRatio: 2
            });
            const link = document.createElement('a');
            link.download = `NAVAI-${route.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.jpg`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Export failed:", error);
            alert("Could not export image.");
        } finally {
            if (mapContainerRef.current.contains(overlay)) {
                mapContainerRef.current.removeChild(overlay);
            }
            // Restore UI Panels
            if (uiContainerRef.current) {
                uiContainerRef.current.style.display = 'flex';
            }
            if (controlsContainerRef.current) {
                controlsContainerRef.current.style.display = 'flex';
            }
        }
    };

    const [isPanelMinimized, setIsPanelMinimized] = useState(false);

    return (
        <section className={`flex flex-col w-full ${variant === 'weather' ? 'h-full' : ''} ${className}`}>
            {variant === 'tactical' && (
                <div className="flex items-center justify-between border-l-2 border-maritime-ocean pl-6 mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-maritime-brass uppercase tracking-tighter">Tactical Navigation Console</h3>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] mt-1 font-mono">Distance Calculator & GC Comparator | Vectorial Plotting Engine</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsFullscreen(!isFullscreen)} className="px-3 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setRouteType('both')} className={`px-4 py-2 rounded-xl text-[9px] uppercase font-black transition-all border ${routeType === 'both' ? 'bg-white/10 text-white border-white/30' : 'border-white/10 text-white/40 hover:border-white/20'}`}>Compare Both</button>
                        <button onClick={() => setRouteType('gc')} className={`px-4 py-2 rounded-xl text-[9px] uppercase font-black transition-all border ${routeType === 'gc' ? 'bg-maritime-brass text-black border-maritime-brass' : 'border-white/10 text-white/40 hover:border-white/20'}`}>Great Circle Only</button>
                        <button onClick={() => setRouteType('rhumb')} className={`px-4 py-2 rounded-xl text-[9px] uppercase font-black transition-all border ${routeType === 'rhumb' ? 'bg-maritime-ocean text-black border-maritime-ocean' : 'border-white/10 text-white/40 hover:border-white/20'}`}>Rhumb Only</button>
                    </div>
                </div>
            )}

            <div className={`flex-1 flex gap-6 min-h-0 relative ${isFullscreen ? 'fixed inset-0 z-[5000] bg-maritime-midnight p-4' : ''}`}>
                <div className={`relative flex-1 rounded-[3rem] overflow-hidden border border-white/10 glass shadow-2xl ${variant === 'tactical' ? (isFullscreen ? 'h-full' : 'h-[600px]') : 'h-full'}`}>
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
                        <div ref={uiContainerRef} className="absolute top-8 left-8 z-[1001] flex flex-col gap-4 max-h-[85vh] pointer-events-none">
                            {/* Main Panel */}
                            <div className="pointer-events-auto shadow-2xl">
                                <div className={`glass bg-[#0c1930]/60 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] transition-all duration-300 overflow-y-auto custom-scrollbar max-h-[50vh] ${isPanelMinimized ? 'w-auto min-w-[200px]' : 'w-[260px]'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Activity className="w-4 h-4 text-maritime-ocean animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Voyage Planner</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {!isPanelMinimized && (
                                                <>

                                                    <button
                                                        onClick={() => {
                                                            const newMode = !isManualMode;
                                                            setIsManualMode(newMode);
                                                            if (newMode) setIsPlotting(true);
                                                        }}
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
                                                                setIsPlotting(true);
                                                            }}
                                                            className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-red-400 transition-colors"
                                                            title="Clear Route"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <div className="w-px h-6 bg-white/10 mx-1 self-center" />
                                                </>
                                            )}
                                            <button
                                                onClick={() => setIsPanelMinimized(!isPanelMinimized)}
                                                className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-colors"
                                            >
                                                {isPanelMinimized ? <ChevronRight className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4 -rotate-90" />}
                                            </button>
                                        </div>
                                    </div>
                                    {!isPanelMinimized && (
                                        <div>
                                            {/* Status / Done Button */}
                                            <div className="mb-4">
                                                {isPlotting ? (
                                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black uppercase text-maritime-ocean">Plotting Mode Active</span>
                                                            <span className="text-[8px] text-white/30">Click map to add waypoints ({waypoints.length}/{maxWaypoints})</span>
                                                        </div>
                                                        {waypoints.length > 0 && (
                                                            <button
                                                                onClick={() => { setIsPlotting(false); setIsManualMode(false); }}
                                                                className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-[9px] font-black uppercase hover:bg-green-500/30 transition-all"
                                                            >
                                                                Done
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black uppercase text-white/40">Route Locked</span>
                                                                <span className="text-[8px] text-white/30">{waypoints.length} Waypoints Set</span>
                                                            </div>
                                                            <button
                                                                onClick={() => setIsPlotting(true)}
                                                                className="px-3 py-1 bg-white/5 text-white/60 border border-white/10 rounded-lg text-[9px] font-black uppercase hover:bg-white/10 hover:text-white transition-all"
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                                                            <input
                                                                type="text"
                                                                placeholder="Voyage Name..."
                                                                value={routeName}
                                                                onChange={(e) => setRouteName(e.target.value)}
                                                                className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white focus:border-maritime-ocean/50 outline-none"
                                                            />
                                                            <div className="col-span-1 relative">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={speed}
                                                                    onChange={(e) => setSpeed(e.target.value)}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white focus:border-maritime-ocean/50 outline-none pr-6"
                                                                />
                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-white/30 font-black">KTS</span>
                                                            </div>
                                                            <button
                                                                onClick={saveRoute}
                                                                disabled={isSaving || !routeName}
                                                                className="col-span-1 py-1.5 bg-maritime-ocean text-black rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-1 hover:bg-white transition-colors disabled:opacity-50"
                                                            >
                                                                <Save className="w-3 h-3" /> Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
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
                                                    <div className="font-mono space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {distances.map((d, i) => (
                                                            <div key={i} className="flex items-center gap-3 text-[10px]">
                                                                <div className="w-1 h-6 bg-maritime-ocean/20 rounded-full" />
                                                                <div className="flex-1 text-white/40 flex flex-col">
                                                                    <span>Leg {i + 1}</span>
                                                                    <span className="text-[9px] text-maritime-brass font-black uppercase">COG {d.bearing.toFixed(0)}°</span>
                                                                </div>
                                                                <div className="text-white font-black">{(routeType === 'gc' ? d.gc : d.rhumb).toFixed(1)} NM</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="p-4 bg-maritime-brass/10 border border-maritime-brass/20 rounded-xl text-center">
                                                        <span className="text-[8px] uppercase text-maritime-brass block mb-1">Total Voyage Distance</span>
                                                        <div className="text-2xl font-black text-white">
                                                            {distances.reduce((acc, d) => acc + (routeType === 'gc' ? d.gc : d.rhumb), 0).toLocaleString()} <span className="text-xs">NM</span>
                                                        </div>
                                                        <div className="mt-2 text-[10px] text-white/60 font-mono border-t border-maritime-brass/10 pt-2">
                                                            Est. Time: <span className="text-white font-bold">
                                                                {(() => {
                                                                    const dist = distances.reduce((acc, d) => acc + (routeType === 'gc' ? d.gc : d.rhumb), 0);
                                                                    const kts = parseFloat(speed) || 1;
                                                                    const hours = dist / kts;
                                                                    const d = Math.floor(hours / 24);
                                                                    const h = (hours % 24).toFixed(1);
                                                                    return `${d}d ${h}h`;
                                                                })()}
                                                            </span>
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
                                                            <span>Click map to set<br /><span className="text-maritime-brass text-xs">Start Waypoint</span></span>
                                                        ) : (
                                                            <span>WP 1 Set: <span className="text-maritime-brass">{waypoints[0].lat.toFixed(2)}N</span><br />
                                                                Click to set <span className="text-maritime-ocean text-xs">Next Waypoints</span></span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Saved Routes Panel (Ventanita inferior) */}
                            <div className="pointer-events-auto glass bg-[#0c1930]/60 backdrop-blur-2xl border border-white/10 p-4 rounded-[1.5rem] w-[260px] animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl flex flex-col gap-3 max-h-[30vh]">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-3 h-3 text-maritime-ocean" />
                                        <span className="text-[9px] font-black uppercase text-white/60 tracking-wider">Saved Routes</span>
                                    </div>
                                </div>

                                <div className="overflow-y-auto custom-scrollbar flex flex-col gap-2">
                                    {savedRoutes.length === 0 ? (
                                        <div className="py-6 text-center text-[9px] text-white/20 uppercase font-black">No saved routes</div>
                                    ) : (
                                        savedRoutes.map((route: any) => (
                                            <div key={route.id} className="group p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-white leading-none mb-1">{route.name}</span>
                                                    <span className="text-[8px] text-white/40 uppercase font-mono">{route.waypoints.length} WPTs • {route.totalDistance.toFixed(0)} NM</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setWaypoints(route.waypoints);
                                                            mapRef.current?.setView([route.waypoints[0].lat, route.waypoints[0].lon], 4);
                                                        }}
                                                        className="px-2 py-1 bg-maritime-ocean/20 text-maritime-ocean rounded text-[9px] font-black uppercase hover:bg-maritime-ocean hover:text-black transition-colors"
                                                    >
                                                        Load
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleExportImage(route); }}
                                                        className="p-1.5 bg-white/5 text-white/40 hover:text-maritime-ocean hover:bg-maritime-ocean/10 rounded-lg transition-colors"
                                                        title="Export Image"
                                                    >
                                                        <Camera className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteRoute(route.id)}
                                                        className="p-1.5 bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div ref={controlsContainerRef} className="absolute top-8 right-8 z-[1001] flex flex-col gap-2">
                        <button
                            onClick={() => mapRef.current?.setView([20, 0], 2.5)}
                            className="p-4 glass bg-[#0c1930]/40 border border-white/10 rounded-2xl text-maritime-ocean hover:text-white transition-colors"
                            title="Global View"
                        >
                            <Navigation className="w-5 h-5" />
                        </button>
                        <div className="p-4 glass bg-[#0c1930]/40 border border-white/10 rounded-2xl flex items-center justify-center text-maritime-brass" title="Compass">
                            <Compass className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
                        </div>
                        <button onClick={() => mapRef.current?.zoomIn()} className="p-4 glass bg-[#0c1930]/40 border border-white/10 rounded-2xl text-maritime-brass hover:text-white transition-colors"><ZoomIn className="w-5 h-5" /></button>
                        <button onClick={() => mapRef.current?.zoomOut()} className="p-4 glass bg-[#0c1930]/40 border border-white/10 rounded-2xl text-maritime-brass hover:text-white transition-colors"><ZoomOut className="w-5 h-5" /></button>
                        <button onClick={() => { setWaypoints([]); setDistances([]); setIsManualMode(false); }} className="p-4 glass bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 hover:bg-red-500/20 transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>


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
        </section >
    )
}
