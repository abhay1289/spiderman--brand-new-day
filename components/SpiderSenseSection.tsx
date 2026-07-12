"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SpiderSenseSection() {
  const s = useRef<HTMLElement>(null);
  const rings = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // rings expand with staggered spring physics
      const ringEls = rings.current?.children;
      if (ringEls) {
        Array.from(ringEls).forEach((ring, i) => {
          gsap.fromTo(
            ring,
            { scale: 0, opacity: 0.7, rotation: -20 },
            {
              scale: 1 + i * 0.6,
              opacity: 0,
              rotation: 20 + i * 10,
              duration: 2.5 + i * 0.3,
              delay: i * 0.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: s.current,
                start: "top 55%",
                toggleActions: "play none none none",
              },
            }
          );
        });
      }

      // spider icon drop-in with bounce
      gsap.from(".ss-icon", {
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 1.2,
        ease: "elastic.out(1,.4)",
        scrollTrigger: {
          trigger: s.current,
          start: "top 60%",
          toggleActions: "play none none none",
        },
      });

      // label fade
      gsap.from(".ss-label", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: s.current,
          start: "top 58%",
          toggleActions: "play none none none",
        },
      });

      // headline — word-by-word reveal
      const words = gsap.utils.toArray<HTMLElement>(".ss-word");
      gsap.from(words, {
        y: 60,
        opacity: 0,
        rotateX: 40,
        stagger: 0.08,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".ss-headline",
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });

      // body text
      gsap.from(".ss-body", {
        y: 40,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".ss-body",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // bottom divider
      gsap.from(".ss-divider > *", {
        scale: 0,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: ".ss-divider",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    }, s);
    return () => ctx.revert();
  }, []);

  const headlineWords = "Something wicked is coming.".split(" ");

  return (
    <section
      ref={s}
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div className="absolute inset-0 web-bg opacity-15 pointer-events-none" />
      <div className="absolute inset-0 hud-grid opacity-20 pointer-events-none" />

      {/* spider-sense concentric rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div ref={rings} className="relative w-[500px] h-[500px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{
                border: `1px solid var(--accent-${i < 2 ? "25" : "15"})`,
                boxShadow: i === 0 ? "var(--neon-glow)" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* wavy danger lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1200 400"
        fill="none"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M0,${180 + i * 8} Q300,${160 + i * 12 + Math.sin(i) * 20} 600,${200 + i * 6} T1200,${190 + i * 10}`}
            stroke={`rgba(226,54,54,${0.04 + i * 0.01})`}
            strokeWidth="0.8"
          >
            <animate
              attributeName="d"
              dur={`${4 + i * 0.5}s`}
              repeatCount="indefinite"
              values={`M0,${180 + i * 8} Q300,${160 + i * 12} 600,${200 + i * 6} T1200,${190 + i * 10};M0,${185 + i * 6} Q300,${170 + i * 10} 600,${190 + i * 8} T1200,${200 + i * 8};M0,${180 + i * 8} Q300,${160 + i * 12} 600,${200 + i * 6} T1200,${190 + i * 10}`}
            />
          </path>
        ))}
      </svg>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* spider icon */}
        <div className="ss-icon flex items-center justify-center mb-8">
          <svg width="40" height="40" viewBox="0 0 80 80" fill="none" style={{ opacity: 0.3 }}>
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

        <span
          className="ss-label block font-display text-[8px] tracking-[.7em] uppercase"
          style={{ color: "var(--accent-50)" }}
        >
          Spider-Sense Activated
        </span>

        {/* word-by-word headline */}
        <h2
          className="ss-headline font-serif-accent text-3xl md:text-5xl lg:text-6xl italic mt-6 leading-[1.3] text-glow overflow-hidden"
          style={{ color: "var(--fg)" }}
        >
          {headlineWords.map((word, i) => (
            <span
              key={i}
              className="ss-word inline-block mr-[0.3em]"
              style={{ willChange: "transform, opacity" }}
            >
              {word}
            </span>
          ))}
        </h2>

        <p
          className="ss-body mt-8 text-sm md:text-base leading-relaxed max-w-xl mx-auto font-light"
          style={{ color: "var(--fg-45)" }}
        >
          Every nerve in his body screams danger. A force beyond anything he&apos;s
          faced before lurks in the shadows of New York — invisible, unstoppable,
          and hunting the ones who forgot him.
        </p>

        <div className="ss-divider flex items-center justify-center gap-3 mt-10">
          <div
            className="h-px w-12"
            style={{
              background: "linear-gradient(to right, transparent, var(--accent-30))",
            }}
          />
          <div
            className="w-2 h-2 rotate-45 animate-pulse"
            style={{ background: "var(--accent-40)" }}
          />
          <div
            className="h-px w-12"
            style={{
              background: "linear-gradient(to left, transparent, var(--accent-30))",
            }}
          />
        </div>
      </div>
    </section>
  );
}
