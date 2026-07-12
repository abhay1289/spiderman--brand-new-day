import type { Metadata } from "next";
import { Orbitron, Rajdhani, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";
import SpiderCursor from "@/components/SpiderCursor";
import WebClickEffect from "@/components/WebClickEffect";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron", display: "swap" });
const rajdhani = Rajdhani({ weight: ["300", "400", "500", "600", "700"], subsets: ["latin"], variable: "--font-rajdhani", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: "Spider-Man: Brand New Day | July 31, 2026",
  description: "Everyone he loves has forgotten who he is. Spider-Man: Brand New Day — Coming July 31, 2026.",
  openGraph: { title: "Spider-Man: Brand New Day", description: "Everyone he loves has forgotten who he is.", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${orbitron.variable} ${rajdhani.variable} ${playfair.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}` }} />
      </head>
      <body className="antialiased">
        <SpiderCursor />
        <WebClickEffect />
        {children}
      </body>
    </html>
  );
}
