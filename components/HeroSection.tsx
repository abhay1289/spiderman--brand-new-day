"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const heroImages = [
  { src: "/spiderman-edge-of-tomorrow-72-3840x2160.jpg", pos: "center 20%" },
  { src: "/tom-holland-as-peter-parker-spider-man-brand-new-day-uz-3840x2160.jpg", pos: "center 30%" },
];

function getTimeLeft() {
  const diff = Math.max(0, new Date("2026-07-31T00:00:00").getTime() - Date.now());
  return {
    d: Math.floor(diff / 864e5),
    h: Math.floor((diff / 36e5) % 24),
    m: Math.floor((diff / 6e4) % 60),
    s: Math.floor((diff / 1e3) % 60),
  };
}

export default function HeroSection() {
  const s = useRef<HTMLElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const fg = useRef<HTMLDivElement>(null);
  const parallaxWrap = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const sub = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = s.current?.getBoundingClientRect();
    if (!rect) return;
    mouseTarget.current = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };
  }, []);

  useEffect(() => {
    const section = s.current;
    if (!section) return;
    const slides = slidesRef.current.filter(Boolean) as HTMLDivElement[];
    if (slides.length < 2) return;

    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Content hidden initially — waits for preloader
      gsap.set([title.current, sub.current, countdownRef.current, ctaRef.current], { opacity: 0, y: isMobile ? 30 : 50, force3D: true });
      if (scrollHintRef.current) gsap.set(scrollHintRef.current, { opacity: 0, y: 20 });

      slides.forEach((slide) => {
        gsap.set(slide, { opacity: 0, scale: 1, force3D: true });
      });

      // Hero entrance — zooms in from scaled up
      let revealed = false;
      const revealHero = () => {
        if (revealed) return;
        revealed = true;

        const entry = gsap.timeline();

        // Scale-based entrance without expensive filter blur
        entry.fromTo(slides[0],
          { scale: isMobile ? 1.3 : 1.6, opacity: 0 },
          { scale: 1.05, opacity: 1, duration: isMobile ? 1.8 : 2.4, ease: "power3.out", force3D: true },
          0
        );

        // Text rises after the zoom-out settles — staggered for drama
        const textStart = isMobile ? 0.6 : 0.9;
        entry
          .to(title.current, { y: 0, opacity: 1, duration: isMobile ? 1 : 1.4, ease: "power4.out", force3D: true }, textStart)
          .to(sub.current, { y: 0, opacity: 1, duration: isMobile ? 0.9 : 1.2, ease: "power3.out", force3D: true }, textStart + 0.2)
          .to(countdownRef.current, { y: 0, opacity: 1, duration: isMobile ? 0.7 : 0.9, ease: "power3.out", force3D: true }, textStart + 0.4)
          .to(ctaRef.current, { y: 0, opacity: 1, duration: isMobile ? 0.6 : 0.8, ease: "back.out(1.4)", force3D: true }, textStart + 0.6);

        if (scrollHintRef.current) {
          entry.to(scrollHintRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, textStart + 1.4);
        }

        // Start simple crossfade slideshow after reveal
        const revealDuration = isMobile ? 1.8 : 2.4;
        entry.call(() => startSlideshow(), [], revealDuration + 0.5);
      };

      const onPreloaderExit = () => revealHero();
      window.addEventListener("preloader-exit", onPreloaderExit);

      // Fallback in case event is missed
      const fallbackTimer = setTimeout(() => {
        if (title.current && gsap.getProperty(title.current, "opacity") === 0) revealHero();
      }, 5000);

      // ── Scroll-driven hero exit — parallax fade ──
      gsap.to(fg.current, {
        y: -80, opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "60% top", scrub: 1.5 },
      });

      if (scrollHintRef.current) {
        gsap.to(scrollHintRef.current, {
          opacity: 0,
          scrollTrigger: { trigger: section, start: "5% top", end: "15% top", scrub: true },
        });
      }

      // ── Cinematic zoom-in crossfade — 4s per image ──
      let current = 0;
      const holdDuration = 4;
      const fadeDuration = 1;

      const runSlide = () => {
        const nextIdx = (current + 1) % slides.length;
        const cur = slides[current];
        const next = slides[nextIdx];

        // Crossfade
        gsap.set(next, { scale: 1, opacity: 0, force3D: true });
        gsap.to(next, { opacity: 1, duration: fadeDuration, ease: "power2.inOut" });
        gsap.to(cur, { opacity: 0, duration: fadeDuration, ease: "power2.inOut" });

        // Cinematic slow zoom on the new image
        gsap.to(next, { scale: 1.12, duration: holdDuration + fadeDuration, ease: "none", force3D: true });

        current = nextIdx;
        gsap.delayedCall(holdDuration, runSlide);
      };

      const startSlideshow = () => {
        current = 0;
        // Zoom on first image while it's showing
        gsap.to(slides[0], { scale: 1.12, duration: holdDuration, ease: "none", force3D: true });
        gsap.delayedCall(holdDuration, runSlide);
      };

      return () => {
        window.removeEventListener("preloader-exit", onPreloaderExit);
        clearTimeout(fallbackTimer);
      };
    }, section);

    // Mouse parallax — desktop only
    let raf = 0;
    if (!isMobile) {
      const damping = 0.04;
      const parallaxLoop = () => {
        mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * damping;
        mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * damping;
        const mx = mouseCurrent.current.x;
        const my = mouseCurrent.current.y;
        if (parallaxWrap.current) {
          parallaxWrap.current.style.transform = `translate3d(${mx * -8}px,${my * -5}px,0)`;
        }
        raf = requestAnimationFrame(parallaxLoop);
      };
      section.addEventListener("mousemove", handleMouseMove);
      raf = requestAnimationFrame(parallaxLoop);
    }

    // Scroll parallax for images — lighter on mobile
    const onScroll = () => {
      const sy = window.scrollY;
      const sectionH = section.offsetHeight;
      if (sy < sectionH) {
        const ratio = sy / sectionH;
        const offset = isMobile ? ratio * 30 : ratio * 80;
        slides.forEach((slide) => {
          const img = slide.querySelector("img");
          if (img) img.style.transform = `translate3d(0,${offset}px,0) scale(1.08)`;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      ctx.revert();
      if (!isMobile) section.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [handleMouseMove]);

  return (
    <section ref={s} id="hero" className="relative overflow-hidden" style={{ height: "100vh" }}>
      {heroImages.map((img, i) => (
        <div key={img.src} ref={(el) => { slidesRef.current[i] = el; }} className="absolute inset-0 z-0">
          <img src={img.src} alt="" className="w-full h-[120%] object-cover" style={{ objectPosition: img.pos, willChange: "transform", transform: "translateY(0) scale(1.08)" }} />
        </div>
      ))}

      <div className="absolute inset-0 z-[2] pointer-events-none" style={{ background: `linear-gradient(to top, rgba(var(--img-overlay),.88), rgba(var(--img-overlay),.2) 55%, rgba(var(--img-overlay),.08))` }} />
      <div className="absolute inset-0 z-[2] pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 40%, transparent 25%, rgba(var(--img-overlay),.5) 100%)` }} />

      <div ref={fg} className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <div ref={parallaxWrap} style={{ willChange: "transform" }}>
        <div className="text-center px-4 max-w-5xl mx-auto">
          <h1 ref={title} className="font-display text-[clamp(2.5rem,8vw,7rem)] leading-[.9] tracking-[.08em] uppercase glitch hero-title-glow" data-text="SPIDER-MAN" style={{ color: "var(--fg)" }}>
            SPIDER-MAN
          </h1>

          <h2 ref={sub} className="font-serif-accent text-[clamp(1.2rem,3.5vw,3.5rem)] italic mt-2 md:mt-3 tracking-[.12em]" style={{ color: "var(--accent)" }}>
            Brand New Day
          </h2>

          <div ref={countdownRef} className="mt-8 flex items-center justify-center gap-4 sm:gap-6">
            {([
              { v: time.d, l: "Days" },
              { v: time.h, l: "Hrs" },
              { v: time.m, l: "Min" },
              { v: time.s, l: "Sec" },
            ] as const).map((u) => (
              <div key={u.l} className="flex flex-col items-center">
                <div
                  className="countdown-box relative w-[56px] h-[68px] sm:w-[68px] sm:h-[80px] md:w-[80px] md:h-[96px] flex items-center justify-center rounded-lg overflow-hidden transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-[rgba(226,54,54,.4)] hover:shadow-[0_0_30px_rgba(226,54,54,.15)]"
                  style={{
                    background: "rgba(226,54,54,.06)",
                    border: "1px solid rgba(226,54,54,.18)",
                    boxShadow: "0 0 20px rgba(226,54,54,.08), inset 0 1px 0 rgba(255,255,255,.04)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(to right, transparent, #e23636, transparent)" }} />
                  <span
                    className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums"
                    style={{
                      color: "#f5f5f5",
                      textShadow: "0 0 20px rgba(226,54,54,.5), 0 0 40px rgba(226,54,54,.2), 0 2px 4px rgba(0,0,0,.5)",
                    }}
                  >
                    {String(u.v).padStart(2, "0")}
                  </span>
                </div>
                <span className="mt-2 font-display text-[9px] sm:text-[10px] tracking-[.4em] uppercase font-semibold" style={{ color: "rgba(226,54,54,.7)" }}>{u.l}</span>
              </div>
            ))}
          </div>

          <div ref={ctaRef} className="mt-10">
            <a
              href="#release"
              className="group relative inline-flex items-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 rounded-full font-display text-xs sm:text-sm tracking-[.3em] uppercase overflow-hidden transition-all duration-600 ease-out hover:scale-[1.03] hover:tracking-[.35em] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #e23636 0%, #c42020 50%, #8b1a1a 100%)",
                color: "#fff",
                boxShadow: "0 0 24px rgba(226,54,54,.2), 0 4px 16px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.1)",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute top-0 -left-full w-full h-full transition-all duration-700 group-hover:left-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent)" }} />
              </span>
              <svg width="16" height="16" viewBox="0 0 80 80" fill="none" className="relative z-10 opacity-80">
                <ellipse cx="40" cy="30" rx="5" ry="5" fill="currentColor" />
                <ellipse cx="40" cy="44" rx="6.5" ry="9.5" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
                  <path d="M36,30 Q28,22 20,16" /><path d="M44,30 Q52,22 60,16" />
                  <path d="M35,36 Q26,32 18,30" /><path d="M45,36 Q54,32 62,30" />
                  <path d="M35,44 Q26,48 18,52" /><path d="M45,44 Q54,48 62,52" />
                  <path d="M37,48 Q30,56 24,62" /><path d="M43,48 Q50,56 56,62" />
                </g>
              </svg>
              <span className="relative z-10">Book Ticket</span>
            </a>
          </div>
        </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollHintRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <span className="font-display text-[8px] tracking-[.5em] uppercase" style={{ color: "var(--fg-35)" }}>Scroll</span>
        <div className="w-[1px] h-8" style={{ background: "linear-gradient(to bottom, var(--fg-25), transparent)" }}>
          <div className="w-full h-3 rounded-full" style={{ background: "var(--accent-40)", animation: "scroll-hint 2s ease-in-out infinite" }} />
        </div>
      </div>

      <div ref={vignetteRef} className="absolute inset-0 z-[3] pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(0,0,0,.65) 100%)", opacity: 0 }} />
      <div className="absolute bottom-0 left-0 right-0 h-44 z-[3] pointer-events-none" style={{ background: "linear-gradient(to top, var(--bg), transparent)" }} />
    </section>
  );
}
