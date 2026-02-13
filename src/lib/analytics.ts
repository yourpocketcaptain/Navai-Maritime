/**
 * NavAI Analytics Utility
 * Mocking GA4 and RevenueCat data for the Admin Dashboard MVP.
 */

export interface DailyStats {
    date: string;
    visitors: number;
    conversions: number;
}

export interface PostStats {
    slug: string;
    title: string;
    category: string;
    views: number;
    avgScroll: number;
    ctr: number;
    bounce: number;
}

export const mockDailyStats: DailyStats[] = [
    { date: "2026-02-06", visitors: 450, conversions: 12 },
    { date: "2026-02-07", visitors: 520, conversions: 18 },
    { date: "2026-02-08", visitors: 480, conversions: 15 },
    { date: "2026-02-09", visitors: 610, conversions: 22 },
    { date: "2026-02-10", visitors: 850, conversions: 45 },
    { date: "2026-02-11", visitors: 920, conversions: 52 },
    { date: "2026-02-12", visitors: 1100, conversions: 65 },
];

export const mockPostStats: PostStats[] = [
    {
        slug: "18-essential-maritime-calculations",
        title: "18 Essential Calculations Every Modern Captain Must Master",
        category: "Tutorial",
        views: 2450,
        avgScroll: 82,
        ctr: 8.5,
        bounce: 12,
    },
    {
        slug: "anchoring-math-guide",
        title: "The Anchoring Math: Stop guessing your chain length",
        category: "Tutorial",
        views: 1820,
        avgScroll: 75,
        ctr: 6.2,
        bounce: 18,
    },
    {
        slug: "digital-nomad-boat-office",
        title: "Why your next 'Home Office' should have a keel and sails",
        category: "Lifestyle",
        views: 5600,
        avgScroll: 45,
        ctr: 12.4,
        bounce: 35,
    },
    {
        slug: "captains-mindset-decisions",
        title: "The Captain’s Mindset: 3 Mental Frameworks for High-Stakes Decisions",
        category: "Technology",
        views: 3200,
        avgScroll: 68,
        ctr: 4.1,
        bounce: 22,
    },
];

export const mockSources = [
    { name: "Organic SEO", value: 45, color: "#3B82F6" },
    { name: "LinkedIn", value: 30, color: "#1D4ED8" },
    { name: "Direct", value: 15, color: "#60A5FA" },
    { name: "Referral", value: 10, color: "#93C5FD" },
];

export const mockDevices = [
    { name: "Mobile", value: 65, color: "#10B981" },
    { name: "Desktop", value: 35, color: "#3B82F6" },
];

import { analytics } from "./firebase";
import { logEvent } from "firebase/analytics";

/**
 * NavAI Analytics Utility
 * Transitioning from Mock to GA4 tracking.
 */

// ... (existing interfaces and mocks remain for now as fallbacks)

/**
 * Tracks a button click event for conversion analysis.
 */
export async function trackConversion(buttonId: string, params?: any) {
    console.log(`[Analytics] Tracked conversion on: ${buttonId}`);

    const instance = await analytics;
    if (instance) {
        logEvent(instance, 'conversion', {
            button_id: buttonId,
            ...params
        });
    }
}
