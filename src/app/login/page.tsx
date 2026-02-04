"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Anchor, LogIn, Key, Mail, AlertTriangle, UserPlus, CheckCircle, ArrowLeft } from "lucide-react";

function LoginContent() {
    const { user, loginWithEmail, signUpWithEmail, isAdmin, isClient, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get("role");
    const isClientRole = roleParam === "client";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [verificationSent, setVerificationSent] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            if (isAdmin) {
                router.push("/admin");
            } else if (isClient) {
                router.push("/client");
            }
        }
    }, [user, isAdmin, isClient, loading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoggingIn(true);
        try {
            if (isRegistering) {
                await signUpWithEmail(email, password);
                setVerificationSent(true);
                setIsLoggingIn(false); // Stop loading to show success message
                // AuthContext useEffect would handle redirect if we didn't stop it, 
                // but usually user is logged in automatically. 
                // Ideally, we might want to sign them out or let them in but warn them.
                // For now, let's just show the message. 
            } else {
                await loginWithEmail(email, password);
            }
        } catch (err: any) {
            console.error(err);
            if (isRegistering) {
                setError(err.message || "Registration failed. Try again.");
            } else {
                setError("Invalid credentials. Access denied.");
            }
            setIsLoggingIn(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-maritime-midnight flex items-center justify-center">
                <div className="animate-spin text-maritime-ocean">
                    <Anchor className="w-8 h-8" />
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-maritime-midnight relative overflow-hidden flex flex-col items-center justify-center px-6">
            {/* Back to Home Button */}
            <button
                onClick={() => router.push("/")}
                className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 text-maritime-teal/60 hover:text-maritime-teal transition-colors text-xs uppercase tracking-[0.2em] group z-20"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Return to Home
            </button>

            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10">
                <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] animate-pulse rotate-3 bg-gradient-to-b from-maritime-ocean to-transparent blur-[120px]" />
            </div>

            <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl space-y-8 text-center shadow-2xl relative group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-maritime-ocean/5 blur-3xl rounded-[2rem] -z-10 group-hover:bg-maritime-ocean/10 transition-colors duration-700" />

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-maritime-ocean/30 bg-maritime-ocean/5 text-maritime-teal text-xs uppercase tracking-widest">
                    <Anchor className="w-3 h-3" />
                    <span>NavAI Terminal</span>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-light text-maritime-brass">
                        {isRegistering ? "Create Account" : (isClientRole ? "Client" : "Admin")} <span className="font-extrabold text-maritime-ocean italic">{isRegistering ? "Access" : "Portal"}</span>
                    </h1>
                    <p className="text-sm text-maritime-teal/60">
                        {isRegistering
                            ? "Join the next generation of maritime professionals."
                            : (isClientRole
                                ? "Access your maritime tools and academy."
                                : "Secure access for maritime intelligence management.")}
                    </p>
                </div>

                {user && !isAdmin && !isClientRole ? (
                    <div className="p-4 bg-maritime-orange/10 border border-maritime-orange/30 rounded-xl text-maritime-orange text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Access denied. Restricted to Captain Mariner.</span>
                    </div>
                ) : null}

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-maritime-teal/60 ml-2">Email Identifier</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-maritime-teal/40" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-maritime-clean placeholder-white/20 focus:outline-none focus:border-maritime-ocean/50 focus:bg-black/40 transition-all font-mono text-sm"
                                placeholder="captain@navai.app"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-maritime-teal/60 ml-2">Access Key</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-maritime-teal/40" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-maritime-clean placeholder-white/20 focus:outline-none focus:border-maritime-ocean/50 focus:bg-black/40 transition-all font-mono text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {verificationSent && (
                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-start gap-3 text-left">
                            <CheckCircle className="w-5 h-5 shrink-0" />
                            <div className="space-y-1">
                                <p className="font-bold">Account created successfully!</p>
                                <p className="opacity-80 text-xs">A verification email has been sent to <span className="text-white font-mono">{email}</span>. Please check your inbox and confirm your address.</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-400 text-xs text-center py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-maritime-ocean text-maritime-midnight rounded-2xl font-bold transition-all hover:scale-105 hover:bg-maritime-teal shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {isLoggingIn ? (
                            <div className="w-5 h-5 border-2 border-maritime-midnight border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                {isRegistering ? (
                                    <UserPlus className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                ) : (
                                    <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                )}
                                <span>{isRegistering ? "Create Account" : "Authenticate"}</span>
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError("");
                            }}
                            className="text-xs text-maritime-teal hover:text-maritime-orange transition-colors uppercase tracking-widest mt-4"
                        >
                            {isRegistering ? "Already have an account? Login" : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </form>

                <p className="text-[10px] text-maritime-teal/40 uppercase tracking-widest">
                    Authorized personnel only
                </p>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-maritime-midnight flex items-center justify-center">
                <div className="animate-spin text-maritime-ocean">
                    <Anchor className="w-8 h-8" />
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
