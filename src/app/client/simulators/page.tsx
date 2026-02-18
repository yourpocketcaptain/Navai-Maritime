
"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Anchor, ArrowLeft, Loader2, Anchor as AnchorIcon, RefreshCw } from "lucide-react";
import SmartAnchorSimulator from "@/components/tools/SmartAnchorSimulator";
import SmartKnotSelector from "@/components/tools/SmartKnotSelector";

export default function SimulatorsPage() {
    const { isClient, loading } = useAuth();
    const router = useRouter();
    const [activeSimulator, setActiveSimulator] = useState<string | null>(null);

    // If we only have one simulator for now, we can default to it or show a menu.
    // Given the prompt implies "a category of Simulators like Fleet Tools", 
    // it suggests a list view first, then selection.
    // For now, let's auto-select 'smart-anchor' if it's the only one, or show a grid.
    // Let's show a grid for future extensibility.

    useEffect(() => {
        if (!loading && !isClient) {
            router.push("/login?role=client");
        }
    }, [isClient, loading, router]);

    if (loading || !isClient) {
        return (
            <div className="min-h-screen bg-maritime-midnight flex items-center justify-center">
                <div className="animate-spin text-maritime-ocean"><Anchor className="w-8 h-8" /></div>
            </div>
        );
    }

    const simulators = [
        {
            id: 'smart-anchor',
            title: 'Smart Anchor Simulator',
            description: 'Visualize scope, catenary, and holding power for safe anchoring.',
            icon: AnchorIcon,
            color: 'text-maritime-orange'
        },
        {
            id: 'smart-knot',
            title: 'Smart Knot Selector',
            description: 'Determine the perfect knot for any object, hardware, and condition.',
            icon: RefreshCw,
            color: 'text-maritime-teal'
        }
    ];

    return (
        <main className="min-h-screen bg-maritime-midnight text-white pt-24 px-6 md:px-12 pb-24">
            <div className="max-w-6xl mx-auto space-y-8">
                <button onClick={() => activeSimulator ? setActiveSimulator(null) : router.push("/client")} className="group flex items-center gap-2 text-maritime-teal/60 hover:text-maritime-teal transition-colors text-xs uppercase tracking-[0.2em]">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    {activeSimulator ? "Back to Simulators" : "Back to Client Portal"}
                </button>

                {!activeSimulator ? (
                    <>
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-maritime-ocean/30 bg-maritime-ocean/5 text-maritime-teal text-[10px] uppercase tracking-widest font-bold">
                                <Anchor className="w-3 h-3" />
                                <span>Interactive Training</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-light text-maritime-brass">
                                Operational <span className="font-extrabold text-maritime-ocean italic">Simulators</span>
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {simulators.map(sim => (
                                <button
                                    key={sim.id}
                                    onClick={() => setActiveSimulator(sim.id)}
                                    className="glass border border-white/10 rounded-[2.5rem] p-8 text-left group transition-all hover:border-maritime-ocean/50 hover:scale-[1.02] relative overflow-hidden"
                                >
                                    <div className={`p-4 rounded-2xl bg-white/5 inline-block mb-6 ${sim.color} group-hover:bg-maritime-ocean group-hover:text-maritime-midnight transition-colors`}>
                                        <sim.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-maritime-teal transition-colors">{sim.title}</h3>
                                    <p className="text-sm text-white/40 leading-relaxed font-light">{sim.description}</p>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        {activeSimulator === 'smart-anchor' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-8 border-b border-white/10 pb-8">
                                    <h1 className="text-3xl font-light text-maritime-brass">
                                        Smart <span className="font-extrabold text-white">Anchor Simulator</span>
                                    </h1>
                                </div>
                                <SmartAnchorSimulator />
                            </div>
                        )}
                        {activeSimulator === 'smart-knot' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-8 border-b border-white/10 pb-8">
                                    <h1 className="text-3xl font-light text-maritime-brass">
                                        Smart <span className="font-extrabold text-white">Knot Selector</span>
                                    </h1>
                                </div>
                                <SmartKnotSelector />
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
