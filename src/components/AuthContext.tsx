"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    isClient: boolean;
    rank: string; // 'cadet' or 'captain'
    loginWithGoogle: () => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ["yourpocketcaptain@gmail.com"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [rank, setRank] = useState<string>("cadet");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeRank = () => { };

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setUser(user);

            if (user) {
                const userRef = doc(db, "users", user.uid);

                // Sync verification status and last login
                setDoc(userRef, {
                    emailVerified: user.emailVerified,
                    lastLogin: new Date().toISOString()
                }, { merge: true }).catch(console.error);

                unsubscribeRank = onSnapshot(
                    userRef,
                    (userDoc) => {
                        if (userDoc.exists()) {
                            setRank(userDoc.data().rank || "cadet");
                        } else {
                            setRank("cadet");
                        }
                        setLoading(false);
                    },
                    (error) => {
                        console.error("Error fetching user rank:", error);
                        setRank("cadet"); // Fallback
                        setLoading(false); // Ensure loading stops even on error
                    }
                );
            } else {
                setRank("cadet");
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            unsubscribeRank();
        };
    }, []);

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Google Login failed:", error);
            throw error;
        }
    };

    const loginWithEmail = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Email Login failed:", error);
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // Create user document with default rank
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                rank: "cadet",
                createdAt: new Date().toISOString(),
                role: "client",
                emailVerified: user.emailVerified
            });

            // Send verification email
            await sendEmailVerification(user);
        } catch (error) {
            console.error("Sign Up failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const isClient = !!user;
    const isAdmin = !!user && ADMIN_EMAILS.includes(user.email || "");

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, isClient, rank, loginWithGoogle, loginWithEmail, signUpWithEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
