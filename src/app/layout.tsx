import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NavAI | Your Digital First Mate - Maritime AI & Navigation Tools",
  description: "Next-gen maritime AI navigation and professional tools. Stability calculations, weather routing, and offline tools for the modern officer. Navegación náutica profesional.",
  keywords: ["Nautical AI", "Maritime Navigation", "Marine Assistant", "Yachting Tools", "Navegación Náutica", "Asistente Marítimo AI", "Seguridad en el Mar", "Calculadora Estabilidad"],
  authors: [{ name: "NavAI Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0F172A",
  openGraph: {
    title: "NavAI | Your Digital First Mate",
    description: "Professional maritime tools and AI navigation. Always ready, even offline.",
    url: "https://navai.app",
    siteName: "NavAI",
    images: [
      {
        url: "/app-screenshot.png",
        width: 1200,
        height: 630,
        alt: "NavAI Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NavAI | Your Digital First Mate",
    description: "Maritime AI navigation and professional tools at your fingertips.",
    images: ["/app-screenshot.png"],
  },
  verification: {
    google: "V4XUr10p5UYZDE3QQllPxWwIgwLcISuQ52573049V5I",
  },
};

import { AuthProvider } from "@/components/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
