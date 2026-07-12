"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ft-item", {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={ref} className="relative py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 web-bg opacity-10 pointer-events-none" />
      <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none" />

      {/* Top web divider */}
      <svg className="absolute top-0 left-0 w-full h-12 pointer-events-none" viewBox="0 0 1200 50" fill="none" preserveAspectRatio="none">
        <path d="M0,25 Q300,5 600,25 T1200,25" stroke="var(--accent-15)" strokeWidth="0.5" fill="none" />
        <path d="M0,25 Q300,45 600,25 T1200,25" stroke="var(--accent-10)" strokeWidth="0.5" fill="none" />
        <line x1="600" y1="0" x2="600" y2="50" stroke="var(--accent-10)" strokeWidth="0.5" />
      </svg>

      <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
        {/* Suit spider logo */}
        <div className="ft-item flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 80 80" fill="none" className="transition-transform duration-700 hover:scale-110 hover:rotate-12" style={{ opacity: 0.2 }}>
            <ellipse cx="40" cy="30" rx="6" ry="6" fill="var(--accent)" />
            <ellipse cx="40" cy="46" rx="7.5" ry="11" fill="var(--accent)" />
            <g stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round">
              <path d="M36,30 Q28,22 20,16 Q14,12 4,6" />
              <path d="M44,30 Q52,22 60,16 Q66,12 76,6" />
              <path d="M35,36 Q26,32 18,30 Q10,28 0,28" />
              <path d="M45,36 Q54,32 62,30 Q70,28 80,28" />
              <path d="M35,44 Q26,48 18,52 Q10,56 2,62" />
              <path d="M45,44 Q54,48 62,52 Q70,56 78,62" />
              <path d="M37,48 Q30,56 24,62 Q18,68 12,76" />
              <path d="M43,48 Q50,56 56,62 Q62,68 68,76" />
            </g>
          </svg>
        </div>

        <p className="ft-item font-display text-sm tracking-[.4em] uppercase" style={{ color: "var(--accent-40)" }}>
          Spider-Man: Brand New Day
        </p>

        <p className="ft-item text-xs max-w-sm mx-auto leading-relaxed" style={{ color: "var(--fg-20)" }}>
          July 31, 2026 &middot; In Theaters Everywhere
        </p>

        {/* Nav links with hover underline */}
        <div className="ft-item flex items-center justify-center gap-8">
          {["Story", "Trailer", "Characters", "Gallery", "Release"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="font-display text-[8px] tracking-[.3em] uppercase link-hover transition-all duration-300 pb-1 hover:text-[var(--accent-60)]"
              style={{ color: "var(--fg-25)" }}
            >
              {link}
            </a>
          ))}
        </div>

        <div className="ft-item flex items-center justify-center gap-3 pt-4">
          <div className="h-px w-8" style={{ background: "var(--fg-05)" }} />
          <p className="text-[9px] tracking-wider" style={{ color: "var(--fg-12)" }}>
            &copy; 2026 &mdash; Fan Project
          </p>
          <div className="h-px w-8" style={{ background: "var(--fg-05)" }} />
        </div>
      </div>
    </footer>
  );
}
