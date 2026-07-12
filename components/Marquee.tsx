"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const phrases = [
  "Everyone he loves has forgotten",
  "The world moved on",
  "But the spider remembers",
  "A brand new day is coming",
];

export default function Marquee() {
  const track = useRef<HTMLDivElement>(null);
  const speed = useRef(1);

  useEffect(() => {
    const el = track.current;
    if (!el) return;

    // measure one set width for seamless loop
    const firstSet = el.children[0] as HTMLElement;
    if (!firstSet) return;
    const setWidth = firstSet.offsetWidth;

    // GSAP ticker — manual xPercent for buttery smooth
    let x = 0;
    const base = 0.5; // px per frame at 60fps

    // scroll velocity skew
    let scrollVel = 0;
    let lastScroll = window.scrollY;

    const onScroll = () => {
      const now = window.scrollY;
      scrollVel = (now - lastScroll) * 0.02;
      lastScroll = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      // decay scroll velocity
      scrollVel *= 0.95;

      // total speed = base + scroll boost
      const s = base + Math.abs(scrollVel) * 0.8;
      x -= s * speed.current;

      // seamless reset
      if (x <= -setWidth) x += setWidth;

      el.style.transform = `translate3d(${x}px, 0, 0)`;

      // subtle skew based on velocity — feels physical
      const skew = Math.max(-3, Math.min(3, scrollVel * 2));
      el.style.setProperty("--skew", `${skew}deg`);
    };

    gsap.ticker.add(tick);

    // hover: slow to 30%
    const parent = el.parentElement;
    const onEnter = () => gsap.to(speed, { current: 0.3, duration: 0.8, ease: "power2.out" });
    const onLeave = () => gsap.to(speed, { current: 1, duration: 0.8, ease: "power2.out" });
    parent?.addEventListener("mouseenter", onEnter);
    parent?.addEventListener("mouseleave", onLeave);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("scroll", onScroll);
      parent?.removeEventListener("mouseenter", onEnter);
      parent?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const renderSet = () => (
    <div className="flex shrink-0 items-center">
      {phrases.map((phrase, i) => (
        <span key={i} className="flex items-center">
          <span
            className="font-display text-[11px] md:text-[13px] tracking-[0.35em] uppercase whitespace-nowrap px-6 md:px-10"
            style={{ color: "var(--fg-40)", transform: "skewX(var(--skew, 0deg))", transition: "transform .1s linear" }}
          >
            {phrase}
          </span>
          <svg width="8" height="8" viewBox="0 0 16 16" className="shrink-0 mx-2 md:mx-4" style={{ opacity: 0.2 }}>
            <path d="M8,1 L15,8 L8,15 L1,8 Z" fill="var(--accent)" />
          </svg>
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden" style={{ borderTop: "1px solid var(--fg-06)", borderBottom: "1px solid var(--fg-06)" }}>
      {/* fade masks on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, var(--bg), transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, var(--bg), transparent)" }} />

      <div className="py-4 md:py-5">
        <div ref={track} className="flex will-change-transform" style={{ transform: "translate3d(0,0,0)" }}>
          {/* 4 copies for seamless wrap at any width */}
          {renderSet()}
          {renderSet()}
          {renderSet()}
          {renderSet()}
        </div>
      </div>
    </div>
  );
}
