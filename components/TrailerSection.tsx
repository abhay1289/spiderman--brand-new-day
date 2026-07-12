"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const YOUTUBE_ID = "8TZMtslA3UY";
const YOUTUBE_URL = `https://www.youtube.com/watch?v=${YOUTUBE_ID}`;
const THUMBNAIL_URL = `https://img.youtube.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`;

export default function TrailerSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cinematic clip-path reveal — wipes open from center
      gsap.from(".trailer-card", {
        clipPath: "inset(8% 20% 8% 20%)", opacity: 0,
        duration: 1.6, ease: "power4.inOut",
        scrollTrigger: { trigger: ".trailer-card", start: "top 88%", toggleActions: "play none none none" },
      });

      // Parallax on the thumbnail
      const img = sectionRef.current?.querySelector(".trailer-card img");
      if (img) {
        gsap.to(img, {
          y: -50, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 2 },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="trailer" className="relative overflow-hidden">
      <div className="trailer-card">
        <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="block relative w-full group overflow-hidden" style={{ paddingBottom: "56.25%" }}>
          <img src={THUMBNAIL_URL} alt="Spider-Man: Brand New Day Official Trailer" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
          <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-30" style={{ opacity: 0.4, background: "radial-gradient(circle at center, rgba(0,0,0,.1) 0%, rgba(0,0,0,.5) 100%)" }} />

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="relative w-18 h-18 md:w-24 md:h-24 rounded-full flex items-center justify-center play-breathe transition-all duration-700 ease-out group-hover:scale-110" style={{ background: "rgba(var(--c-accent),.9)", border: "1px solid rgba(255,255,255,.1)" }}>
              {/* Pulse ring on hover */}
              <div className="absolute -inset-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animation: "pulse-ring 2s ease-in-out infinite", border: "1px solid rgba(var(--c-accent),.3)" }} />
              <div className="absolute -inset-6 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700" style={{ animation: "pulse-ring 2s ease-in-out infinite .5s", border: "1px solid rgba(var(--c-accent),.15)" }} />
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-1 md:w-10 md:h-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,.3)]">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Watch label — appears on hover */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:translate-y-[52px] md:group-hover:translate-y-[68px] translate-y-[60px] md:translate-y-[76px]">
            <span className="font-display text-[9px] tracking-[.5em] uppercase" style={{ color: "rgba(255,255,255,.7)" }}>Watch Trailer</span>
          </div>

        </a>
      </div>
    </section>
  );
}
