"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Wind, Maximize, Minimize } from "lucide-react";

interface MapComponentProps {
    onLocationSelect: (lat: number, lon: number) => void;
}

export default function MapComponent({ onLocationSelect }: MapComponentProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || !mapContainerRef.current || mapRef.current) return;

        // Initialize Map
        const map = L.map(mapContainerRef.current, {
            center: [39.0, 2.0], // Initial center (Mediterranean)
            zoom: 7,
            zoomControl: false,
        });
        mapRef.current = map;

        // Base Layer: OpenStreetMap
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Overlay Layer: OpenSeaMap Seamarks
        L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openseamap.org">OpenSeaMap</a>',
            opacity: 1.0,
            zIndex: 1000
        }).addTo(map);

        // Add Zoom Control at bottom right
        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Click Event
        map.on("click", (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;

            // Move or create marker
            if (markerRef.current) {
                markerRef.current.setLatLng(e.latlng);
            } else {
                markerRef.current = L.marker(e.latlng).addTo(map);
            }

            onLocationSelect(lat, lng);
        });

        // Cleanup
        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [onLocationSelect]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim() || !mapRef.current) return;

        setSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newCoords: L.LatLngExpression = [parseFloat(lat), parseFloat(lon)];
                mapRef.current.setView(newCoords, 12);

                if (markerRef.current) {
                    markerRef.current.setLatLng(newCoords);
                } else {
                    markerRef.current = L.marker(newCoords).addTo(mapRef.current);
                }
                onLocationSelect(parseFloat(lat), parseFloat(lon));
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="relative w-full h-full group">
            {/* Search Bar */}
            <form
                onSubmit={handleSearch}
                className="absolute top-6 left-6 z-[1001] w-full max-w-sm"
            >
                <div className="relative glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searching ? 'text-maritime-ocean animate-pulse' : 'text-white/40'}`} />
                    <input
                        type="text"
                        placeholder="Search harbor, coast or island..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent pl-12 pr-4 py-4 text-sm text-white focus:outline-none placeholder:text-white/20"
                    />
                </div>
            </form>

            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full bg-[#001f3f]" />

            {/* Scale & Attribution Overlay */}
            <div className="absolute bottom-6 left-6 z-[1001] bg-maritime-midnight/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5 pointer-events-none">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
                    © OpenStreetMap contributors, © OpenSeaMap, Weather by OpenPortGuide
                </p>
            </div>

            {/* Map UI Fixes for Leaflet in Dark Mode */}
            <style jsx global>{`
                .leaflet-container {
                    background: #001f3f !important;
                }
                .leaflet-tile {
                    filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
                }
                .leaflet-tile-pane {
                    z-index: 1;
                }
                /* Do not invert seamark layer to keep colors correct */
                .leaflet-layer:nth-child(2) .leaflet-tile {
                    filter: none !important;
                }
                .leaflet-control-zoom {
                    border: none !important;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
                }
                .leaflet-control-zoom-in, .leaflet-control-zoom-out {
                    background: rgba(13, 25, 48, 0.8) !important;
                    color: #D4AF37 !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    backdrop-filter: blur(12px);
                }
                .leaflet-marker-icon {
                    filter: drop-shadow(0 0 10px #00B4D8);
                }
            `}</style>
        </div>
    );
}
