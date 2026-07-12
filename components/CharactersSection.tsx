"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const cast = [
  { name: "Tom Holland", character: "Peter Parker / Spider-Man", description: "A hero the world forgot. Four years of solitude have changed him in ways he\u2019s only beginning to understand.", accent: "#e23636", image: "/spider-man-no-way-home-premiere-8-e1639494961349.webp" },
  { name: "Zendaya", character: "MJ", description: "She doesn\u2019t remember him. But something about that stranger feels impossibly familiar.", accent: "#d4a843", image: "/zendaya-spiderman-3.webp" },
  { name: "Jon Bernthal", character: "Frank Castle / Punisher", description: "Justice without mercy. A vigilante whose war on crime collides with Spider\u2011Man\u2019s path.", accent: "#9ca3af", image: "/Jon_Bernthal.webp" },
  { name: "Sadie Sink", character: "Unknown Role", description: "A new face in Peter\u2019s fractured world. Her arrival changes everything.", accent: "#10b981", image: "/Sadie-Sink-Stranger-Things-5-Los-Angeles-Premiere-112525-b2541f44aaba473292f39a4dbb1fef3c.jpg" },
  { name: "Jacob Batalon", character: "Ned Leeds", description: "Peter\u2019s former best friend at MIT, building Spidey Tracker to find the hero who saved his life.", accent: "#2563eb", image: "/los-angeles-dec-13-jacob-batalon-at-the-spider-man-no-way-home-premiere-at-the-village-theater-on-december-13-2021-in-los-angeles-ca-free-photo.jpg" },
  { name: "Mark Ruffalo", character: "Bruce Banner / Hulk", description: "When the threat escalates beyond the streets, Banner answers the call.", accent: "#22c55e", image: "/Mark_Ruffalo_at_the_Toronto_premiere_of_The_Avengers.jpg" },
  { name: "Tramell Tillman", character: "Unknown Role", description: "A presence that commands every room. His true allegiance remains hidden.", accent: "#8b5cf6", image: "/images.jpeg" },
  { name: "Michael Mando", character: "Mac Gargan / Scorpion", description: "A familiar threat resurfaces with a vendetta that time hasn\u2019t dulled.", accent: "#eab308", image: "/michael-mando-440nw-8883039bw.jpg" },
];

export default function CharactersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          y: 60, opacity: 0, stagger: .15, duration: 1.1, ease: "power3.out",
          scrollTrigger: { trigger: headerRef.current, start: "top 85%", toggleActions: "play none none none" },
        });
      }

      // Staggered card entrance with slight rotation
      const isMobile = window.innerWidth < 768;
      gsap.utils.toArray<HTMLElement>(".cast-card").forEach((card, i) => {
        gsap.from(card, {
          y: isMobile ? 50 : 100, opacity: 0, scale: isMobile ? 0.94 : 0.88, rotateY: isMobile ? 0 : (i % 2 === 0 ? -8 : 8),
          duration: 1.2, delay: i * 0.07, ease: "power4.out",
          scrollTrigger: { trigger: ".cast-grid", start: "top 82%", toggleActions: "play none none none" },
        });

        // Subtle parallax per card on scroll — reduced on mobile
        gsap.to(card, {
          y: isMobile ? (i % 2 === 0 ? -6 : -10) : (i % 2 === 0 ? -20 : -35), ease: "none",
          scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 2 },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - .5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - .5) * 2;
    gsap.to(card, { rotateY: x * 5, rotateX: -y * 5, duration: .8, ease: "power2.out", overwrite: "auto" });
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    gsap.to(card, { rotateY: 0, rotateX: 0, duration: 1.2, ease: "elastic.out(1,.4)", overwrite: "auto" });
  }, []);

  return (
    <section ref={sectionRef} id="characters" className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={headerRef} className="text-center mb-16 md:mb-20">
          <span className="block font-display text-[9px] tracking-[.6em] uppercase" style={{ color: "var(--accent-60)" }}>Ensemble</span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl mt-3 tracking-[.12em] uppercase" style={{ color: "var(--fg)" }}>The Cast</h2>
          <div className="mx-auto mt-6 h-px w-16" style={{ background: "linear-gradient(to right, transparent, var(--fg-15), transparent)" }} />
        </div>

        <div className="cast-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 perspective-shallow">
          {cast.map((m) => (
            <div key={m.name} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
              className="cast-card card-shine group relative overflow-hidden cursor-default rounded-lg shadow-depth-1"
              style={{ transformStyle: "preserve-3d", aspectRatio: "3/4" }}>
              <img src={m.image} alt={m.name} className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-1000 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105" />

              {/* Gradient overlay */}
              <div className="absolute inset-0 z-[1] transition-opacity duration-500" style={{ background: `linear-gradient(to top, rgba(var(--img-overlay),.88) 0%, rgba(var(--img-overlay),.3) 40%, transparent 65%)` }} />
              <div className="absolute inset-0 z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to top, rgba(var(--img-overlay),.92) 0%, rgba(var(--img-overlay),.15) 50%, transparent 70%)` }} />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-3 md:p-5">
                <div className="inline-flex items-center gap-1 md:gap-1.5 mb-1.5 md:mb-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 rotate-45" style={{ background: m.accent }} />
                  <span className="font-display text-[7px] md:text-[8px] tracking-[.2em] md:tracking-[.3em] uppercase" style={{ color: m.accent }}>{m.character}</span>
                </div>
                <h3 className="font-display text-[10px] md:text-sm tracking-[.15em] md:tracking-[.2em] uppercase transition-all duration-700 ease-out group-hover:-translate-y-0.5 group-hover:tracking-[.25em]" style={{ color: "var(--fg)" }}>{m.name}</h3>
                <div className="h-px w-6 md:w-8 my-1.5 md:my-2 origin-left transition-all duration-700 ease-out group-hover:w-12" style={{ background: `linear-gradient(to right, ${m.accent}, transparent)` }} />
                <p className="text-[10px] md:text-[11px] leading-[1.5] md:leading-[1.7] max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-700 ease-out overflow-hidden" style={{ color: "var(--fg-70)" }}>{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
