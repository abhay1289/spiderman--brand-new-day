"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function getTimeRemaining() {
  const diff = Math.max(0, new Date("2026-07-31T00:00:00").getTime() - Date.now());
  return { days: Math.floor(diff / 864e5), hours: Math.floor((diff / 36e5) % 24), minutes: Math.floor((diff / 6e4) % 60), seconds: Math.floor((diff / 1e3) % 60) };
}

const units: { key: keyof ReturnType<typeof getTimeRemaining>; label: string }[] = [
  { key: "days", label: "Days" }, { key: "hours", label: "Hrs" }, { key: "minutes", label: "Min" }, { key: "seconds", label: "Sec" },
];

export default function CountdownSection() {
  const [time, setTime] = useState(getTimeRemaining);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const id = setInterval(() => setTime(getTimeRemaining()), 1000); return () => clearInterval(id); }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const bg = sectionRef.current?.querySelector(".cd-bg");
      if (bg) gsap.fromTo(bg, { y: -60 }, { y: 60, ease: "none", scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: true } });

      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          y: 60, opacity: 0, stagger: .15, duration: 1.1, ease: "power3.out",
          scrollTrigger: { trigger: headerRef.current, start: "top 85%", toggleActions: "play none none none" },
        });
      }

      // Countdown units scale up from nothing
      gsap.utils.toArray<HTMLElement>(".cd-unit").forEach((unit, i) => {
        gsap.from(unit, {
          y: 80, opacity: 0, scale: 0.7, rotateX: -15,
          duration: 1.2, delay: i * 0.12, ease: "back.out(1.2)",
          scrollTrigger: { trigger: ".cd-grid", start: "top 82%", toggleActions: "play none none none" },
        });
      });

      gsap.from(".cd-cta", {
        y: 50, opacity: 0, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: ".cd-cta", start: "top 90%", toggleActions: "play none none none" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="release" className="relative py-20 md:py-28 overflow-hidden">
      <div className="cd-bg absolute inset-[-80px] bg-cover bg-center" style={{ backgroundImage: "url(/spider-man-brand-new-day-using-phone-upside-down-3f-3840x2160.jpg)" }} />
      <div className="absolute inset-0 z-[1]" style={{ background: `rgba(var(--img-overlay),.4)` }} />
      <div className="absolute inset-0 z-[1]" style={{ background: `linear-gradient(to top, rgba(var(--img-overlay),.75), transparent, rgba(var(--img-overlay),.55))` }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div ref={headerRef}>
          <span className="block font-display text-[10px] tracking-[.6em] uppercase" style={{ color: "var(--accent-70)" }}>Mark Your Calendar</span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl mt-4 tracking-[.12em] uppercase" style={{ color: "var(--fg)" }}>The Countdown</h2>
          <div className="mx-auto mt-6 h-px w-16" style={{ background: "linear-gradient(to right, transparent, var(--fg-15), transparent)" }} />
        </div>

        {/* Countdown boxes */}
        <div className="cd-grid flex items-center justify-center gap-3 sm:gap-4 md:gap-5 mt-12 md:mt-16">
          {units.map((u, i) => (
            <div key={u.key} className="flex items-center gap-3 sm:gap-4 md:gap-5">
              <div className="cd-unit flex flex-col items-center">
                <div
                  className="relative w-[72px] h-[88px] sm:w-[96px] sm:h-[112px] md:w-[120px] md:h-[140px] flex items-center justify-center rounded-lg overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(226,54,54,.15)]"
                  style={{
                    background: "rgba(226,54,54,.06)",
                    border: "1px solid rgba(226,54,54,.18)",
                    boxShadow: "0 0 30px rgba(226,54,54,.08), inset 0 1px 0 rgba(255,255,255,.04)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(to right, transparent, #e23636, transparent)" }} />
                  <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(226,54,54,.08), transparent)" }} />
                  <span
                    className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums digit-tick"
                    style={{
                      color: "#f5f5f5",
                      textShadow: "0 0 20px rgba(226,54,54,.5), 0 0 40px rgba(226,54,54,.2), 0 2px 4px rgba(0,0,0,.5)",
                    }}
                  >
                    {String(time[u.key]).padStart(2, "0")}
                  </span>
                </div>
                <span className="mt-3 font-display text-[9px] sm:text-[10px] tracking-[.4em] uppercase font-semibold" style={{ color: "rgba(226,54,54,.7)" }}>{u.label}</span>
              </div>
              {i < units.length - 1 && (
                <span className="font-display text-2xl sm:text-3xl md:text-4xl font-bold -mt-6 colon-blink" style={{ color: "rgba(226,54,54,.4)" }}>:</span>
              )}
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="flex items-center justify-center gap-2 mt-12">
          <div className="h-px w-8" style={{ background: "linear-gradient(to right, transparent, var(--fg-15))" }} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ background: "var(--accent-25)" }} />
          <div className="h-px w-8" style={{ background: "linear-gradient(to left, transparent, var(--fg-15))" }} />
        </div>

        <div className="cd-cta mt-10 space-y-5">
          <p className="font-serif-accent text-2xl md:text-4xl italic" style={{ color: "var(--fg-90)" }}>Are you ready?</p>
          <p className="font-display text-[9px] md:text-[11px] tracking-[.5em] uppercase" style={{ color: "var(--accent)" }}>July 31, 2026 &middot; In Theaters Everywhere</p>
        </div>
      </div>
    </section>
  );
}
