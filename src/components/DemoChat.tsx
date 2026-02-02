"use client";

import { Ship, Anchor, Compass, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function DemoChat() {
    const messages = [
        {
            role: "user",
            content: "I see 1 red light and 2 yellow lights, what should I do?"
        },
        {
            role: "captain",
            content: "Ahoy! You are likely observing a vessel engaged in a specific activity. According to COLREGs, a red light alone usually indicates the port side. However, two yellow flashing lights (side by side) often signal a high-speed craft in non-displacement mode. \n\n**Action Required:** \n1. Maintain a sharp lookout and check for CPA (Closest Point of Approach). \n2. In a crossing situation, if the red light is on your starboard, YOU are the give-way vessel. \n3. Alter course to starboard to pass at a safe distance. Stay clear of the high-speed craft's lane."
        }
    ];

    return (
        <div className="w-full max-w-2xl mx-auto mt-12 p-6 glass rounded-2xl shadow-2xl overflow-hidden pointer-events-none select-none border-t border-maritime-ocean/30">
            <div className="flex items-center gap-3 mb-6 border-b border-maritime-ocean/20 pb-4">
                <Ship className="text-maritime-orange w-6 h-6" />
                <span className="text-xs text-maritime-teal/50 uppercase tracking-[0.3em] font-mono">Bridge Interface | Read-Only</span>
                <div className="ml-auto flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-maritime-safety animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-maritime-ocean" />
                </div>
            </div>

            <div className="space-y-6 mb-6">
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.4 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] p-4 rounded-xl text-sm leading-relaxed ${msg.role === "user"
                                    ? "bg-maritime-ocean text-maritime-midnight ml-12 rounded-tr-none"
                                    : "bg-maritime-midnight border border-maritime-ocean/30 text-maritime-teal mr-12 rounded-tl-none font-mono"
                                }`}
                        >
                            {msg.role === "captain" && (
                                <div className="flex items-center gap-2 mb-2 text-[10px] text-maritime-orange uppercase tracking-tighter border-b border-maritime-orange/20 pb-1">
                                    <Compass className="w-3 h-3" />
                                    <span>Bridge Transmission</span>
                                </div>
                            )}
                            <div className="whitespace-pre-line">
                                {msg.content}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="relative opacity-60">
                <div className="w-full bg-maritime-midnight/50 border border-maritime-ocean/10 rounded-xl py-4 pl-6 pr-14 text-maritime-teal/30 italic text-sm">
                    "I see 1 red light and 2 yellow lights..."
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-maritime-ocean/20 text-maritime-midnight">
                    <ShieldCheck className="w-5 h-5 text-maritime-teal/40" />
                </div>
            </div>

            <p className="mt-4 text-center text-[9px] text-maritime-teal/30 uppercase tracking-[0.4em]">
                Interactive Terminal requires NavAI Mobile App
            </p>
        </div>
    );
}
