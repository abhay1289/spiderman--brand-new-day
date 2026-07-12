"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const images: { src: string; label: string; span: string; tall?: boolean }[] = [
  { src: "/spider-man-brand-new-day-2026-qj-3840x2160.jpg", label: "Rebirth", span: "" },
  { src: "/tom-holland-as-peter-parker-spider-man-brand-new-day-uz-3840x2160.jpg", label: "Peter Parker", span: "" },
  { src: "/spider-man-brand-new-day-using-phone-upside-down-3f-3840x2160.jpg", label: "Downtime", span: "" },
  { src: "/spider-man-brand-3840x2160-26610.jpg", label: "The Swing", span: "md:col-span-2" },
  { src: "/spiderman-and-hulk-in-spiderman-brand-new-day-zm-3840x2160.jpg", label: "Team Up", span: "", tall: true },
];

export default function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    gsap.to(card, { rotateY: x * 4, rotateX: -y * 4, duration: 0.8, ease: "power2.out", overwrite: "auto" });
    const img = card.querySelector("img");
    if (img) gsap.to(img, { x: x * -6, y: y * -6, duration: 1, ease: "power2.out", overwrite: "auto" });
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    gsap.to(card, { rotateY: 0, rotateX: 0, duration: 1.4, ease: "elastic.out(1,.4)", overwrite: "auto" });
    const img = card.querySelector("img");
    if (img) gsap.to(img, { x: 0, y: 0, duration: 1.2, ease: "elastic.out(1,.5)", overwrite: "auto" });
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".gal-card").forEach((card, i) => {
        // Clip-path reveal — wipes in from bottom
        gsap.from(card, {
          clipPath: "inset(100% 0 0 0)", opacity: 0,
          duration: isMobile ? 0.9 : 1.3, delay: i * (isMobile ? 0.05 : 0.1), ease: "power4.inOut",
          scrollTrigger: { trigger: card, start: "top 92%", toggleActions: "play none none none" },
        });

        // Image scale-in after clip reveal
        const img = card.querySelector("img");
        if (img) {
          gsap.from(img, {
            scale: isMobile ? 1.15 : 1.35, duration: isMobile ? 1.2 : 1.8, delay: i * (isMobile ? 0.05 : 0.1), ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 92%", toggleActions: "play none none none" },
          });

          // Parallax on scroll — reduced on mobile
          gsap.to(img, {
            y: isMobile ? -15 : -40, ease: "none",
            scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: isMobile ? 0.8 : 1.5 },
          });
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="gallery" className="relative py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 perspective-shallow">
          {images.map((img) => (
            <div
              key={img.label}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className={`gal-card gallery-card card-shine group relative ${img.tall ? "aspect-[8/9]" : "aspect-video"} ${img.span} shadow-depth-2 rounded-lg overflow-hidden`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <img src={img.src} alt={img.label} className="w-full h-full object-cover scale-110 transition-transform duration-1000 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.14]" loading="lazy" style={{ willChange: "transform" }} />
              <div className="absolute inset-0 opacity-50 group-hover:opacity-15 transition-opacity duration-1000 ease-out" style={{ background: `linear-gradient(to top, rgba(var(--img-overlay),.6), rgba(var(--img-overlay),.05), transparent)` }} />
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <div className="flex items-center gap-3">
                  <div className="h-px w-5 group-hover:w-14 transition-all duration-700 ease-[cubic-bezier(.4,0,.2,1)]" style={{ background: "linear-gradient(to right, var(--accent), var(--accent-40))" }} />
                  <span className="font-display text-[9px] tracking-[.4em] uppercase transition-all duration-700 ease-out group-hover:tracking-[.55em]" style={{ color: "var(--fg-90)" }}>{img.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
