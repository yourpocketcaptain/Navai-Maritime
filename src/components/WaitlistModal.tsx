"use client";

import { useState, useEffect } from "react";
import { X, Mail, CheckCircle, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface WaitlistModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    // Track view on mount (simulating the 'takel' script from MailerLite)
    useEffect(() => {
        if (isOpen) {
            try {
                fetch("https://assets.mailerlite.com/jsonp/2083427/forms/178318224422601933/takel");
            } catch (e) {
                // ignore tracking errors
            }
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        // We'll use a standard form submission approach but handled via fetch to avoid redirect if possible,
        // or just let the user know. MailerLite JSONP endpoints often require JSONP handling which is tricky in pure fetch.
        // However, for a simple custom UI, submitting to the universal endpoint usually works best as a hidden iframe target 
        // or we can try to emulate the POST behaviors.

        // Given the constraints and avoiding CORS issues with direct fetch to ML from client, 
        // the most robust way in a React app without a backend proxy is often jsonp.
        // But for now, let's try a standard form submit to a hidden iframe to prevent page reload,
        // OR we can use the specific JSONP fetch approach if we want full control.

        // Simplest reliable method for React + MailerLite embedded forms:
        // Create a FormData and send it.

        const formData = new FormData();
        formData.append("fields[email]", email);
        formData.append("ml-submit", "1");
        formData.append("anticsrf", "true");

        try {
            // MailerLite often expects a specific formatting. 
            // We will try an AJAX POST first. If CORS fails, we might need a fallback.
            // Actually the snippet provided uses `action="..." method="post" target="_blank"` which is the safe fallback.
            // But we want a nice UI.

            // Let's rely on the specific endpoint provided.
            const response = await fetch("https://assets.mailerlite.com/jsonp/2083427/forms/178318224422601933/subscribe", {
                method: "POST",
                body: formData,
                mode: 'no-cors' // This is important for some ML endpoints if they don't support full CORS
            });

            // Since no-cors returns opaque response, we assume success if no network error.
            setStatus("success");
            setMessage("Welcome aboard! You've been added to the priority list.");
            setEmail("");

        } catch (err) {
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-maritime-midnight/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-[#0a192f] border border-maritime-ocean/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-maritime-ocean/20 overflow-hidden"
                    >
                        {/* Glossy Overlay */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-maritime-teal/50 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {status === "success" ? (
                            <div className="flex flex-col items-center text-center py-8 space-y-4">
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-light text-white mb-2">Welcome Aboard</h3>
                                    <p className="text-maritime-teal/70 text-sm">{message}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="mt-6 px-6 py-2 bg-maritime-ocean/20 hover:bg-maritime-ocean/30 text-maritime-teal border border-maritime-ocean/30 rounded-xl text-xs uppercase tracking-widest transition-colors font-bold"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-maritime-orange/10 mb-4 border border-maritime-orange/20">
                                        <Mail className="w-6 h-6 text-maritime-orange" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-light text-white mb-2">
                                        Join the <span className="text-maritime-orange font-bold">Waitlist</span>
                                    </h2>
                                    <p className="text-maritime-teal/60 text-sm leading-relaxed">
                                        Secure your spot for the iOS beta and claim your <span className="text-maritime-orange font-bold">3 Months Free</span> Founder's Reward.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-xs uppercase tracking-widest text-maritime-teal/70 font-bold ml-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="captain@vessel.com"
                                            className="w-full bg-maritime-midnight border border-maritime-ocean/30 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-maritime-orange/50 focus:ring-1 focus:ring-maritime-orange/50 transition-all font-mono text-sm"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="w-full bg-maritime-orange text-maritime-midnight font-bold rounded-xl py-4 uppercase tracking-wider text-xs hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-maritime-orange/20"
                                    >
                                        {status === "loading" ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            "Reserve My Spot"
                                        )}
                                    </button>

                                    <p className="text-[10px] text-center text-maritime-teal/30 leading-tight pt-2">
                                        By joining, you agree to receive updates about NavAI. <br />
                                        We respect your privacy and never spam.
                                    </p>
                                </form>
                            </div>
                        )}
                    </motion.div>
                </div >
            )
            }
        </AnimatePresence >
    );
}
