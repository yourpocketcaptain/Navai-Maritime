import HomeClient from "./HomeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NavAI | Maritime AI Assistant & Professional Navigation Tools",
  description: "Experience the next level of maritime navigation with NavAI. Professional tools for anchor logic, stability calculations, and global weather routing. Your essential digital first mate for yachting and commercial shipping. Navegación náutica con Inteligencia Artificial.",
  keywords: ["Nautical AI", "Maritime Navigation", "Marine Assistant", "Yachting Tools", "Navegación Náutica", "Inteligencia Artificial Marítima", "Seguridad en el Mar", "Cálculos de Estabilidad"],
  openGraph: {
    title: "NavAI | Professional Maritime AI Assistant",
    description: "Advanced navigation tools and AI assistance for the modern mariner. Available online and offline.",
    images: ["/app-screenshot.png"],
  }
};

export default function Home() {
  return <HomeClient />;
}
