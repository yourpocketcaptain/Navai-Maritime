"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Anchor, Wind, MapPin, Loader2, CloudSun, Map as MapIcon, X } from "lucide-react";

// Dynamically import the OfflineNauticalMap to avoid SSR issues with Leaflet
const OfflineNauticalMap = dynamic(() => import("@/components/OfflineNauticalMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-maritime-midnight flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-maritime-ocean" />
            <p className="text-maritime-teal/40 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Inertial Nav Systems...</p>
        </div>
    )
});

export default function NavigationPage() {
    const { isClient, loading: authLoading } = useAuth();
    const router = useRouter();

    const [coords, setCoords] = useState<{ lat: number, lon: number } | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [weatherLoading, setWeatherLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isClient) {
            router.push("/login?role=client");
        }
    }, [isClient, authLoading, router]);

    const handleLocationSelect = (lat: number, lon: number) => {
        setCoords({ lat, lon });
        setShowSidebar(true);
        setWeatherLoading(true);
    };

    if (authLoading || !isClient) {
        return (
            <div className="min-h-screen bg-maritime-midnight flex items-center justify-center">
                <Loader2 className="animate-spin text-maritime-ocean w-8 h-8" />
            </div>
        );
    }

    return (
        <main className="fixed inset-0 bg-maritime-midnight overflow-hidden flex flex-col pt-16">
            {/* Top Bar Overlay */}
            <div className="absolute top-4 right-8 z-[2000] flex gap-4">
                <button
                    onClick={() => router.push("/client")}
                    className="glass border border-white/10 px-6 py-2 rounded-xl flex items-center gap-3 text-white/60 hover:text-maritime-ocean transition-all group backdrop-blur-xl shadow-2xl"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Back to Bridge</span>
                </button>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative">
                <OfflineNauticalMap variant="weather" onPointSelect={handleLocationSelect} className="h-full" />

                {/* Enhanced Instruction Overlay */}
                {!coords && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none px-4 w-full max-w-lg">
                        <div className="glass bg-maritime-ocean/10 backdrop-blur-2xl border border-maritime-ocean/30 p-4 rounded-3xl flex items-center gap-4 animate-in fade-in zoom-in slide-in-from-top-4 duration-1000 shadow-2xl shadow-maritime-ocean/10">
                            <div className="p-3 bg-maritime-ocean/20 rounded-2xl">
                                <CloudSun className="w-5 h-5 text-maritime-ocean animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Navigational Intel</h4>
                                <p className="text-white/60 text-xs font-medium leading-tight">
                                    Click anywhere on the maritime chart to receive real-time weather meteograms and vessel advisories.
                                </p>
                            </div>
                            <div className="hidden md:block whitespace-nowrap px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[8px] text-white/40 uppercase font-black">
                                Interaction Point
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Weather Sidebar / Panel */}
            <aside
                className={`fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-[#0c1930]/95 backdrop-blur-2xl border-l border-white/10 z-[2005] transition-transform duration-500 ease-out shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-8 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-maritime-ocean/10 rounded-2xl text-maritime-ocean">
                                <CloudSun className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-maritime-brass font-bold text-lg uppercase tracking-tight">Weather Forecast</h2>
                                <p className="text-white/20 text-[10px] font-mono tracking-widest">OPENPORTGUIDE METEOGRAM</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSidebar(false)}
                            className="p-3 hover:bg-white/5 rounded-2xl transition-all text-white/20 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        {coords ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                {/* Coordinates Badge */}
                                <div className="flex gap-4">
                                    <div className="flex-1 glass p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="w-3 h-3 text-maritime-ocean" />
                                            <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest">Latitude</span>
                                        </div>
                                        <div className="text-maritime-teal font-mono font-bold text-lg">{coords.lat.toFixed(5)}°N</div>
                                    </div>
                                    <div className="flex-1 glass p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="w-3 h-3 text-maritime-ocean" />
                                            <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest">Longitude</span>
                                        </div>
                                        <div className="text-maritime-teal font-mono font-bold text-lg">{coords.lon.toFixed(5)}°E</div>
                                    </div>
                                </div>

                                {/* Weather Meteogram Image */}
                                <div className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-inner bg-black/40 min-h-[400px]">
                                    {weatherLoading && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-maritime-midnight/80 z-10">
                                            <Loader2 className="w-8 h-8 animate-spin text-maritime-ocean" />
                                            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Syncing with NOAA Satellite...</span>
                                        </div>
                                    )}
                                    <img
                                        src={`https://weather.openportguide.de/cgi-bin/weather.pl/weather.png?var=meteogram&lat=${coords.lat}&lon=${coords.lon}&label=NavAI+Navigation+Portal&lang=es&unit=metric&nx=600&ny=750`}
                                        alt="Meteogram"
                                        onLoad={() => setWeatherLoading(false)}
                                        className={`w-full h-auto transition-opacity duration-700 ${weatherLoading ? 'opacity-0' : 'opacity-100'}`}
                                    />
                                    <div className="absolute bottom-4 right-4 bg-maritime-midnight/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[8px] text-white/40 uppercase tracking-widest">Powered by OpenPortGuide</span>
                                    </div>
                                </div>

                                {/* Warnings & Advice */}
                                <div className="p-6 bg-maritime-orange/5 border border-maritime-orange/20 rounded-3xl space-y-3">
                                    <div className="flex items-center gap-2 text-maritime-orange">
                                        <Wind className="w-4 h-4" />
                                        <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Safety Advisory</span>
                                    </div>
                                    <p className="text-xs text-white/60 leading-relaxed italic">
                                        Coordinate data is for informational purposes. Always verify with official NavTex transmissions and local pilot charts.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
                                <div className="p-6 bg-white/5 rounded-full border border-white/10">
                                    <MapIcon className="w-12 h-12 text-maritime-teal" />
                                </div>
                                <div>
                                    <h3 className="text-maritime-brass font-bold uppercase tracking-widest text-sm">Station Offline</h3>
                                    <p className="text-xs text-white/40 mt-2">Select a navigational point on the map to begin transmission signal.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 180, 216, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 180, 216, 0.3); }
            `}</style>
        </main>
    );
}
