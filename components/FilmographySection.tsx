"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const films = [
  {
    title: "Spider-Man: Homecoming",
    year: "2017",
    number: "01",
    director: "Jon Watts",
    cast: "Tom Holland, Michael Keaton, Robert Downey Jr.",
    rating: "92%",
    runtime: "2h 13m",
    synopsis:
      "Under the watchful eye of Tony Stark, Peter Parker tries to fall back into his normal daily routine \u2014 but when the Vulture emerges, everything he holds most important will be threatened.",
    image: "/spider_man_homecoming_rating.jpg",
  },
  {
    title: "Spider-Man: Far From Home",
    year: "2019",
    number: "02",
    director: "Jon Watts",
    cast: "Tom Holland, Jake Gyllenhaal, Zendaya",
    rating: "90%",
    runtime: "2h 9m",
    synopsis:
      "On a school trip to Europe, Peter is recruited by Nick Fury to team up with Mysterio to battle the Elementals \u2014 but nothing is as it seems.",
    image: "/images (1).jpeg",
  },
  {
    title: "Spider-Man: No Way Home",
    year: "2021",
    number: "03",
    director: "Jon Watts",
    cast: "Tom Holland, Benedict Cumberbatch, Willem Dafoe",
    rating: "93%",
    runtime: "2h 28m",
    synopsis:
      "When a spell tears a hole in the multiverse, Peter must face villains from across realities \u2014 and make an impossible sacrifice to save everyone he loves.",
    image: "/SpidermanNoWayHome-keyart.jpg",
  },
  {
    title: "Spider-Man: Brand New Day",
    year: "2026",
    number: "04",
    director: "Destin Daniel Cretton",
    cast: "Tom Holland, Zendaya, Mark Ruffalo",
    rating: "Coming Soon",
    runtime: "TBA",
    synopsis:
      "Four years after erasing himself from everyone\u2019s memory, Peter walks through New York as a ghost in plain sight. When an unseen threat emerges, Spider-Man must let people in again.",
    image: "/new-spider-man-brand-new-day-posters-released_wpqv.jpg",
  },
];

export default function FilmographySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D tilt + internal image parallax + cursor light
  const handlePosterMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    gsap.to(card, { rotateY: x * 6, rotateX: -y * 4, duration: 0.8, ease: "power2.out", overwrite: "auto" });

    // Parallax the image opposite to cursor
    const img = card.querySelector("img");
    if (img) gsap.to(img, { x: x * -8, y: y * -8, scale: 1.04, duration: 1, ease: "power2.out", overwrite: "auto" });

    // Move the light spot
    const light = card.querySelector(".poster-light") as HTMLElement;
    if (light) {
      light.style.opacity = "1";
      light.style.left = `${((e.clientX - rect.left) / rect.width) * 100}%`;
      light.style.top = `${((e.clientY - rect.top) / rect.height) * 100}%`;
    }
  }, []);

  const handlePosterLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    gsap.to(card, { rotateY: 0, rotateX: 0, duration: 1.4, ease: "elastic.out(1,.4)", overwrite: "auto" });

    const img = card.querySelector("img");
    if (img) gsap.to(img, { x: 0, y: 0, scale: 1, duration: 1.2, ease: "elastic.out(1,.5)", overwrite: "auto" });

    const light = card.querySelector(".poster-light") as HTMLElement;
    if (light) light.style.opacity = "0";
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll<HTMLElement>(".film-card"));
    if (cards.length === 0) return;

    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      const totalCards = cards.length;
      const scrollPerCard = window.innerHeight * (isMobile ? 0.6 : 0.85);

      // Initial states with staggered children
      cards.forEach((card, i) => {
        gsap.set(card, {
          opacity: i === 0 ? 1 : 0,
          pointerEvents: i === 0 ? "auto" : "none",
          force3D: true,
        });
        if (i > 0) {
          const poster = card.querySelector(".film-poster");
          const filmNum = card.querySelector(".film-num-label");
          const filmTitle = card.querySelector(".film-title");
          const filmMeta = card.querySelector(".film-meta");
          const filmSynopsis = card.querySelector(".film-synopsis");
          const filmCredits = card.querySelector(".film-credits");
          if (poster) gsap.set(poster, { x: isMobile ? -20 : -50, opacity: 0, scale: isMobile ? 0.97 : 0.94 });
          if (filmNum) gsap.set(filmNum, { x: isMobile ? -10 : -20, opacity: 0 });
          if (filmTitle) gsap.set(filmTitle, { y: isMobile ? 15 : 30, opacity: 0 });
          if (filmMeta) gsap.set(filmMeta, { y: isMobile ? 10 : 20, opacity: 0 });
          if (filmSynopsis) gsap.set(filmSynopsis, { y: isMobile ? 10 : 20, opacity: 0 });
          if (filmCredits) gsap.set(filmCredits, { y: isMobile ? 8 : 15, opacity: 0 });
        }
      });

      // Dot indicators
      const dots = Array.from(container.querySelectorAll<HTMLElement>(".film-dot"));
      const updateDots = (activeIdx: number) => {
        dots.forEach((dot, j) => {
          const isActive = j === activeIdx;
          dot.style.width = isActive ? "24px" : "6px";
          dot.style.background = isActive ? "#e23636" : "rgba(245,245,245,.15)";
          dot.style.boxShadow = isActive ? "0 0 12px rgba(226,54,54,.4)" : "none";
        });
      };

      // Animate the vertical divider pulse
      const dividerGlow = container.querySelector(".divider-glow") as HTMLElement;
      if (dividerGlow) {
        gsap.to(dividerGlow, {
          y: "100%", duration: 3, ease: "none", repeat: -1,
        });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${scrollPerCard * totalCards}`,
          pin: true,
          pinType: isMobile ? "fixed" : "transform",
          anticipatePin: 1,
          scrub: isMobile ? 0.3 : 0.8,
          onUpdate: (self) => {
            const progressFill = container.querySelector(".film-progress-fill") as HTMLElement;
            if (progressFill) progressFill.style.transform = `scaleX(${self.progress})`;
            const counter = container.querySelector(".film-counter");
            const idx = Math.min(totalCards - 1, Math.floor(self.progress * totalCards));
            if (counter) counter.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(totalCards).padStart(2, "0")}`;
            updateDots(idx);
          },
        },
      });

      // Staggered transitions
      cards.forEach((card, i) => {
        if (i < totalCards - 1) {
          const next = cards[i + 1];
          const nextPoster = next.querySelector(".film-poster");
          const nextNum = next.querySelector(".film-num-label");
          const nextTitle = next.querySelector(".film-title");
          const nextMeta = next.querySelector(".film-meta");
          const nextSynopsis = next.querySelector(".film-synopsis");
          const nextCredits = next.querySelector(".film-credits");

          // Exit current
          tl.to(card, { opacity: 0, pointerEvents: "none", duration: 0.45, ease: "power2.in", force3D: true }, i + 0.55);

          // Enter next card
          tl.to(next, { opacity: 1, pointerEvents: "auto", duration: 0.45, ease: "power2.out", force3D: true }, i + 0.5);

          // Staggered entrance — poster first, then text elements cascade
          if (nextPoster) tl.to(nextPoster, { x: 0, opacity: 1, scale: 1, duration: isMobile ? 0.5 : 0.6, ease: "power3.out" }, i + 0.5);
          if (nextNum) tl.to(nextNum, { x: 0, opacity: 1, duration: isMobile ? 0.35 : 0.4, ease: "power3.out" }, i + 0.55);
          if (nextTitle) tl.to(nextTitle, { y: 0, opacity: 1, duration: isMobile ? 0.4 : 0.5, ease: "power3.out" }, i + 0.58);
          if (nextMeta) tl.to(nextMeta, { y: 0, opacity: 1, duration: isMobile ? 0.35 : 0.4, ease: "power3.out" }, i + 0.62);
          if (nextSynopsis) tl.to(nextSynopsis, { y: 0, opacity: 1, duration: isMobile ? 0.35 : 0.45, ease: "power3.out" }, i + 0.65);
          if (nextCredits) tl.to(nextCredits, { y: 0, opacity: 1, duration: isMobile ? 0.3 : 0.4, ease: "power3.out" }, i + 0.68);
        }
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section id="filmography">
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ height: "100vh", background: "var(--bg)" }}
      >
        {/* Ambient glow — left side */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 50% 50% at 25% 50%, rgba(226,54,54,.035), transparent 70%)",
        }} />

        {/* Vertical divider with traveling glow */}
        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 z-[12] w-px" style={{
          background: "linear-gradient(to bottom, transparent 5%, var(--fg-06) 15%, var(--fg-06) 85%, transparent 95%)",
        }}>
          <div className="divider-glow absolute left-0 w-full h-24 -translate-y-full" style={{
            background: "linear-gradient(to bottom, transparent, rgba(226,54,54,.25), transparent)",
          }} />
        </div>

        {/* Counter + dots */}
        <div className="absolute top-6 md:top-10 right-6 md:right-10 z-20 flex flex-col items-end gap-2.5">
          <span className="film-counter font-display text-[10px] tracking-[.3em] tabular-nums" style={{ color: "var(--fg-25)" }}>
            01 / 04
          </span>
          <div className="flex items-center gap-1.5">
            {films.map((_, j) => (
              <div
                key={j}
                className="film-dot h-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
                style={{
                  width: j === 0 ? 24 : 6,
                  background: j === 0 ? "#e23636" : "rgba(245,245,245,.15)",
                  boxShadow: j === 0 ? "0 0 12px rgba(226,54,54,.4)" : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Film cards */}
        {films.map((film, i) => (
          <div key={film.year} className="film-card absolute inset-0 z-10">
            {/* Mobile: vertical stack | Desktop: side-by-side */}
            <div className="w-full h-full flex flex-col md:flex-row">

              {/* ── Top/Left: Poster ── */}
              <div className="film-poster relative w-full md:w-1/2 flex items-end md:items-center justify-center pt-12 pb-3 md:py-0" style={{ perspective: "900px", flex: "0 0 auto" }}>
                <div className="relative w-[42vw] max-w-[200px] md:w-[320px] md:max-w-none lg:w-[380px]">
                  {/* Glow behind poster */}
                  <div className="absolute -inset-8 md:-inset-12 rounded-3xl blur-3xl opacity-[.12] pointer-events-none" style={{
                    background: "radial-gradient(circle, rgba(226,54,54,.6), transparent 70%)",
                  }} />

                  <div
                    onMouseMove={handlePosterMove}
                    onMouseLeave={handlePosterLeave}
                    className="relative rounded-lg overflow-hidden group"
                    style={{
                      aspectRatio: "3/4",
                      transformStyle: "preserve-3d",
                      border: "1px solid rgba(226,54,54,.1)",
                      boxShadow: "0 8px 40px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.03) inset",
                    }}
                  >
                    <img
                      src={film.image}
                      alt={film.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
                      loading={i === 0 ? "eager" : "lazy"}
                      style={{ willChange: "transform" }}
                    />

                    {/* Cursor-following light spot */}
                    <div
                      className="poster-light absolute w-48 h-48 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
                      style={{
                        background: "radial-gradient(circle, rgba(255,255,255,.12), transparent 70%)",
                        opacity: 0,
                        mixBlendMode: "overlay",
                      }}
                    />

                    {/* Shine sweep on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" style={{
                      background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,.03) 45%, rgba(255,255,255,.06) 50%, rgba(255,255,255,.03) 55%, transparent 60%)",
                    }} />

                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
                      background: "linear-gradient(to right, transparent, rgba(226,54,54,.4), transparent)",
                    }} />

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-px" style={{
                      background: "linear-gradient(to right, transparent, rgba(226,54,54,.15), transparent)",
                    }} />

                    {/* Year badge */}
                    <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-1 h-1 rotate-45" style={{ background: "rgba(226,54,54,.8)" }} />
                      <span className="font-display text-[9px] tracking-[.4em] uppercase" style={{
                        color: "rgba(255,255,255,.9)",
                        textShadow: "0 1px 6px rgba(0,0,0,.8)",
                      }}>
                        {film.year}
                      </span>
                    </div>

                    {/* Film number — large, bottom right of poster */}
                    <div className="absolute bottom-2 right-3 md:bottom-3 md:right-4 font-display text-[36px] md:text-[56px] leading-none font-bold pointer-events-none select-none opacity-[.06] group-hover:opacity-[.12] transition-opacity duration-700">
                      {film.number}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Bottom/Right: Info ── */}
              <div className="w-full md:w-1/2 flex-1 flex items-start md:items-center px-5 md:px-0 pt-4 md:pt-0 overflow-hidden">
                <div className="w-full md:pl-14 lg:pl-20 md:pr-10 lg:pr-16">

                  {/* Film number label */}
                  <div className="film-num-label flex items-center gap-2 md:gap-3 mb-2 md:mb-8">
                    <div className="h-px w-5" style={{ background: "var(--accent-40)" }} />
                    <span className="font-display text-[9px] md:text-[10px] tracking-[.4em] md:tracking-[.5em] uppercase" style={{
                      color: "var(--accent)",
                      textShadow: "0 0 20px rgba(226,54,54,.25)",
                    }}>
                      Film {film.number}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="film-title font-serif-accent text-xl sm:text-2xl md:text-4xl lg:text-5xl italic leading-[1.15]" style={{ color: "var(--fg)" }}>
                    {film.title}
                  </h3>

                  {/* Meta */}
                  <div className="film-meta flex items-center gap-2 md:gap-3 mt-2.5 md:mt-6">
                    <div className="flex items-center gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full transition-all duration-300 hover:scale-105" style={{
                      background: "rgba(226,54,54,.08)",
                      border: "1px solid rgba(226,54,54,.12)",
                    }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="rgba(226,54,54,.8)" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span className="font-display text-[9px] md:text-[10px] tracking-[.15em] uppercase" style={{ color: "var(--accent-70)" }}>
                        {film.rating}
                      </span>
                    </div>
                    <span className="w-px h-3" style={{ background: "var(--fg-08)" }} />
                    <span className="font-display text-[9px] md:text-[10px] tracking-[.2em] uppercase" style={{ color: "var(--fg-30)" }}>
                      {film.runtime}
                    </span>
                  </div>

                  {/* Synopsis */}
                  <p className="film-synopsis mt-2.5 md:mt-7 text-[11px] md:text-sm leading-[1.6] md:leading-[2] font-light" style={{ color: "var(--fg-45)" }}>
                    {film.synopsis}
                  </p>

                  {/* Director & Cast — rows with hover highlight */}
                  <div className="film-credits mt-3 md:mt-8 space-y-0" style={{ borderTop: "1px solid var(--fg-06)" }}>
                    <div className="group/row flex items-center justify-between py-1.5 md:py-3.5 transition-all duration-300 hover:pl-2" style={{ borderBottom: "1px solid var(--fg-04)" }}>
                      <span className="font-display text-[8px] md:text-[9px] tracking-[.3em] md:tracking-[.4em] uppercase transition-colors duration-300 group-hover/row:text-[rgba(245,245,245,.35)]" style={{ color: "var(--fg-20)" }}>
                        Director
                      </span>
                      <span className="text-[11px] md:text-sm font-light transition-colors duration-300 group-hover/row:text-[rgba(245,245,245,.7)]" style={{ color: "var(--fg-50)" }}>
                        {film.director}
                      </span>
                    </div>
                    <div className="group/row flex items-center justify-between py-1.5 md:py-3.5 transition-all duration-300 hover:pl-2">
                      <span className="font-display text-[8px] md:text-[9px] tracking-[.3em] md:tracking-[.4em] uppercase transition-colors duration-300 group-hover/row:text-[rgba(245,245,245,.35)]" style={{ color: "var(--fg-20)" }}>
                        Cast
                      </span>
                      <span className="text-[11px] md:text-sm font-light text-right transition-colors duration-300 group-hover/row:text-[rgba(226,54,54,.7)]" style={{ color: "var(--accent-50)" }}>
                        {film.cast}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="h-px" style={{ background: "var(--fg-05)" }}>
            <div className="film-progress-fill h-full origin-left" style={{
              background: "linear-gradient(to right, rgba(226,54,54,.5), rgba(226,54,54,.25))",
              transform: "scaleX(0)",
              boxShadow: "0 0 6px rgba(226,54,54,.2)",
            }} />
          </div>
        </div>
      </div>
    </section>
  );
}
