"use client";

import { useState, useRef, useEffect } from "react";
import { Languages, ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-xs uppercase tracking-widest text-maritime-teal/80"
            >
                <Languages className="w-4 h-4 text-maritime-orange" />
                <span className="hidden sm:inline">{language === 'en' ? 'English' : 'Español'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 w-32 bg-maritime-midnight border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 backdrop-blur-xl z-[60] animate-in fade-in zoom-in-95 duration-200">
                    <button
                        onClick={() => { setLanguage('en'); setIsOpen(false); }}
                        className={`w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors ${language === 'en' ? 'text-maritime-orange' : 'text-white/60'}`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => { setLanguage('es'); setIsOpen(false); }}
                        className={`w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors ${language === 'es' ? 'text-maritime-orange' : 'text-white/60'}`}
                    >
                        Español
                    </button>
                </div>
            )}
        </div>
    );
}
