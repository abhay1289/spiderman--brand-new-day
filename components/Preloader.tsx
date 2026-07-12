"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Preloader() {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const eyeL = useRef<SVGPathElement>(null);
  const eyeR = useRef<SVGPathElement>(null);
  const eyeLWhite = useRef<SVGPathElement>(null);
  const eyeRWhite = useRef<SVGPathElement>(null);
  const eyeGroup = useRef<SVGGElement>(null);
  const svgWrap = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const lPath = eyeL.current;
    const rPath = eyeR.current;
    const lW = eyeLWhite.current;
    const rW = eyeRWhite.current;
    const group = eyeGroup.current;
    const wrap = svgWrap.current;
    const bg = bgRef.current;
    if (!lPath || !rPath || !lW || !rW || !group || !wrap || !bg) return;

    document.body.style.overflow = "hidden";

    const lLen = lPath.getTotalLength();
    const rLen = rPath.getTotalLength();
    const lwLen = lW.getTotalLength();
    const rwLen = rW.getTotalLength();

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        setTimeout(() => setDone(true), 50);
      },
    });

    tl.set(lPath, { strokeDasharray: lLen, strokeDashoffset: lLen, fill: "none" })
      .set(rPath, { strokeDasharray: rLen, strokeDashoffset: rLen, fill: "none" })
      .set(lW, { strokeDasharray: lwLen, strokeDashoffset: lwLen, fill: "none", opacity: 0 })
      .set(rW, { strokeDasharray: rwLen, strokeDashoffset: rwLen, fill: "none", opacity: 0 })
      .set(group, { opacity: 0 });

    let t = 0.5;

    // ═══ EYES OPEN ═══
    tl.to(group, { opacity: 1, duration: 0.3 }, t);
    tl.to(lPath, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, t + 0.05)
      .to(rPath, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, t + 0.1);
    tl.to([lPath, rPath], { fill: "#080808", duration: 0.4, ease: "power2.out" }, t + 0.6);
    t += 1.2;

    // Lenses activate
    tl.to([lW, rW], { opacity: 1, duration: 0.08 }, t);
    tl.to(lW, { strokeDashoffset: 0, duration: 0.5, ease: "power2.inOut" }, t)
      .to(rW, { strokeDashoffset: 0, duration: 0.5, ease: "power2.inOut" }, t + 0.04);
    tl.to([lW, rW], { fill: "url(#lensFill)", duration: 0.4, ease: "power2.out" }, t + 0.3);
    t += 0.9;

    // ═══ LOOK LEFT ═══
    tl.to(group, { x: -18, duration: 0.5, ease: "power2.out" }, t);
    tl.to(group, { scaleY: 0.92, duration: 0.25, ease: "power1.out" }, t)
      .to(group, { scaleY: 1, duration: 0.3, ease: "power1.out" }, t + 0.25);
    t += 0.8;

    // ═══ LOOK RIGHT ═══
    tl.to(group, { x: 20, duration: 0.7, ease: "power2.inOut" }, t);
    tl.to(group, { scaleY: 0.9, duration: 0.2, ease: "power1.out" }, t + 0.1)
      .to(group, { scaleY: 1, duration: 0.3, ease: "power1.out" }, t + 0.3);
    t += 1.0;

    // ═══ SETTLE CENTER ═══
    tl.to(group, { x: 0, duration: 0.45, ease: "elastic.out(1, 0.65)" }, t);
    t += 0.55;

    // ═══ ONE BLINK — then cinematic iris reveal ═══
    // Blink shut
    tl.to(group, { scaleY: 0.02, duration: 0.1, ease: "power4.in" }, t);
    t += 0.2; // Beat of darkness — tension builds

    // Signal hero to prepare behind the mask
    tl.call(() => window.dispatchEvent(new Event("preloader-exit")), [], t);

    // Eyes REOPEN with dramatic intensity — like awakening
    tl.to(group, { scaleY: 1.3, scaleX: 1.15, duration: 0.4, ease: "back.out(1.8)" }, t);

    t += 0.25;

    // ── Iris reveal — hero emerges through the eye opening ──
    // A radial mask punches a growing hole in the dark overlay,
    // exactly like light pouring through the Spider-Man mask lenses
    const maxR = Math.hypot(window.innerWidth, window.innerHeight);
    const revealProxy = { r: 0 };
    tl.to(revealProxy, {
      r: maxR,
      duration: 1.6,
      ease: "power3.inOut",
      onUpdate: () => {
        const r = revealProxy.r;
        const soft = Math.max(80, r * 0.25);
        const inner = Math.max(0, r - soft);
        const outer = r + soft * 0.3;
        const mask = `radial-gradient(circle at 50% 50%, transparent ${inner}px, white ${outer}px)`;
        bg.style.webkitMaskImage = mask;
        (bg.style as any).maskImage = mask;
      },
    }, t);

    // SVG eyes zoom toward you — like you're flying through them
    tl.to(wrap, {
      scale: 16,
      opacity: 0,
      duration: 1.5,
      ease: "power2.inOut",
    }, t + 0.05);

    // Eyes widen further during zoom — adds life
    tl.to(group, {
      scaleX: 2, scaleY: 2,
      duration: 1.2, ease: "power2.in",
    }, t + 0.1);

    // Final cleanup
    tl.set(root.current, { display: "none" }, t + 1.8);

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[200] overflow-hidden">
      {/* Solid background — hero is behind this, iris mask will punch through it */}
      <div ref={bgRef} className="absolute inset-0 z-[201]" style={{ background: "#0a0a0c" }} />

      {/* Eyes — sit above everything, will zoom out to reveal hero */}
      <div ref={svgWrap} className="absolute inset-0 z-[203] flex items-center justify-center" style={{ willChange: "transform" }}>
        <svg width="420" height="200" viewBox="-95 -45 190 90" fill="none" className="overflow-visible">
          <defs>
            <radialGradient id="suitRed" cx="50%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#e03030" />
              <stop offset="30%" stopColor="#cc2222" />
              <stop offset="60%" stopColor="#a81a1a" />
              <stop offset="100%" stopColor="#6e0e0e" />
            </radialGradient>
            <radialGradient id="lensFill" cx="40%" cy="30%" r="72%" fx="35%" fy="25%">
              <stop offset="0%" stopColor="#f0f0ee" />
              <stop offset="25%" stopColor="#e5e3e0" />
              <stop offset="50%" stopColor="#d8d5d0" />
              <stop offset="75%" stopColor="#c0bcb6" />
              <stop offset="100%" stopColor="#9a9590" />
            </radialGradient>
            <radialGradient id="specA" cx="30%" cy="22%" r="28%">
              <stop offset="0%" stopColor="rgba(255,255,255,.35)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <radialGradient id="specB" cx="55%" cy="65%" r="25%">
              <stop offset="0%" stopColor="rgba(255,255,255,.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          <g ref={eyeGroup} style={{ transformOrigin: "0 0" }}>
            {/* LEFT EYE */}
            <path d="M-5,-22 C-14,-38 -58,-33 -66,-7 C-62,24 -40,33 -14,26 C0,21 3,-6 -5,-22 Z" fill="url(#suitRed)" stroke="#5a0e0e" strokeWidth="0.5" />
            <path ref={eyeL} d="M-6,-18 C-14,-33 -54,-28 -61,-5 C-58,20 -38,28 -15,22 C-2,17 1,-4 -6,-18 Z" stroke="#080808" strokeWidth="4.5" strokeLinejoin="round" fill="none" />
            <path ref={eyeLWhite} d="M-8,-13 C-13,-24 -47,-20 -52,-4 C-50,14 -35,20 -17,16 C-6,12 -3,-3 -8,-13 Z" stroke="rgba(100,95,90,.25)" strokeWidth="0.3" fill="none" />
            <ellipse cx="-35" cy="-8" rx="7" ry="4.5" fill="url(#specA)" transform="rotate(-12 -35 -8)" />
            <ellipse cx="-28" cy="7" rx="5" ry="3" fill="url(#specB)" transform="rotate(-5 -28 7)" />

            {/* RIGHT EYE */}
            <path d="M5,-22 C14,-38 58,-33 66,-7 C62,24 40,33 14,26 C0,21 -3,-6 5,-22 Z" fill="url(#suitRed)" stroke="#5a0e0e" strokeWidth="0.5" />
            <path ref={eyeR} d="M6,-18 C14,-33 54,-28 61,-5 C58,20 38,28 15,22 C2,17 -1,-4 6,-18 Z" stroke="#080808" strokeWidth="4.5" strokeLinejoin="round" fill="none" />
            <path ref={eyeRWhite} d="M8,-13 C13,-24 47,-20 52,-4 C50,14 35,20 17,16 C6,12 3,-3 8,-13 Z" stroke="rgba(100,95,90,.25)" strokeWidth="0.3" fill="none" />
            <ellipse cx="35" cy="-8" rx="7" ry="4.5" fill="url(#specA)" transform="rotate(12 35 -8)" />
            <ellipse cx="28" cy="7" rx="5" ry="3" fill="url(#specB)" transform="rotate(5 28 7)" />
          </g>
        </svg>
      </div>
    </div>
  );
}
