"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HubNode {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
  angle: number;
  color: string;
}

const nodes: HubNode[] = [
  { id: "villains", label: "Villains", subtitle: "The Sinister Threat", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm-5.5 9.5c.28-2.53 3.46-3.5 5.5-3.5s5.22.97 5.5 3.5H6.5z", angle: 0, color: "rgba(139,26,26,.9)" },
  { id: "allies", label: "Allies", subtitle: "Those Who Remain", icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z", angle: 60, color: "rgba(37,99,235,.9)" },
  { id: "powers", label: "Powers", subtitle: "Spider-Sense Awakened", icon: "M7 14l5-5 5 5z M7 10l5-5 5 5z", angle: 120, color: "rgba(212,168,67,.9)" },
  { id: "multiverse", label: "Multiverse", subtitle: "Infinite Possibilities", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", angle: 180, color: "rgba(147,51,234,.9)" },
  { id: "suits", label: "Suits", subtitle: "Evolution of the Spider", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z", angle: 240, color: "rgba(226,54,54,.9)" },
  { id: "legacy", label: "Legacy", subtitle: "Great Responsibility", icon: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z", angle: 300, color: "rgba(226,54,54,.9)" },
];

const SVG_SIZE = 800;
const SVG_C = SVG_SIZE / 2;
const SVG_R = SVG_SIZE * 0.325;

function nodeXY(angle: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: SVG_C + Math.cos(rad) * SVG_R, y: SVG_C + Math.sin(rad) * SVG_R };
}

function webPath(angle: number) {
  const { x, y } = nodeXY(angle);
  const mx = (SVG_C + x) / 2 - (y - SVG_C) * 0.1;
  const my = (SVG_C + y) / 2 + (x - SVG_C) * 0.1;
  return `M ${SVG_C} ${SVG_C} Q ${mx} ${my} ${x} ${y}`;
}

function arcPath(a1: number, a2: number) {
  const p1 = nodeXY(a1);
  const p2 = nodeXY(a2);
  const mx = (p1.x + p2.x) / 2 - (p2.y - p1.y) * 0.15;
  const my = (p1.y + p2.y) / 2 + (p2.x - p1.x) * 0.15;
  return `M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`;
}

export default function SpiderVerseHub() {
  const sectionRef = useRef<HTMLElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const strandRefs = useRef<(SVGPathElement | null)[]>([]);
  const arcRefs = useRef<(SVGPathElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const strands = strandRefs.current.filter(Boolean) as SVGPathElement[];
      const arcs = arcRefs.current.filter(Boolean) as SVGPathElement[];
      const nodeEls = nodeRefs.current.filter(Boolean) as HTMLDivElement[];
      const dots = dotRefs.current.filter(Boolean) as SVGCircleElement[];

      // Measure strand lengths
      const strandLengths = strands.map((s) => s.getTotalLength());
      const arcLengths = arcs.map((a) => a.getTotalLength());

      // Init: hide everything
      gsap.set(strands, (i: number) => ({
        strokeDasharray: strandLengths[i],
        strokeDashoffset: strandLengths[i],
      }));
      gsap.set(arcs, (i: number) => ({
        strokeDasharray: arcLengths[i],
        strokeDashoffset: arcLengths[i],
      }));
      gsap.set(nodeEls, { scale: 0, opacity: 0 });
      gsap.set(hubRef.current, { scale: 0, opacity: 0 });
      gsap.set(dots, { opacity: 0, scale: 0 });

      // ── Master timeline triggered on scroll ──
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          toggleActions: "play none none none",
        },
      });

      // 1. Title fades in
      tl.from(titleRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power3.out",
      });

      // 2. Hub scales up with elastic spring
      tl.to(hubRef.current, {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "elastic.out(1,0.6)",
      }, "-=0.3");

      // 3. Web strands draw outward from center — staggered
      strands.forEach((strand, i) => {
        tl.to(strand, {
          strokeDashoffset: 0,
          duration: 0.9,
          ease: "power3.out",
        }, `-=${i === 0 ? 0.5 : 0.75}`);
      });

      // 4. Nodes bloom at the end of each strand
      nodeEls.forEach((node, i) => {
        tl.to(node, {
          scale: 1,
          opacity: 1,
          duration: 0.7,
          ease: "back.out(1.6)",
        }, `-=${i === 0 ? 0.3 : 0.55}`);
      });

      // 5. Arc connections between adjacent nodes
      arcs.forEach((arc, i) => {
        tl.to(arc, {
          strokeDashoffset: 0,
          duration: 0.6,
          ease: "power2.out",
        }, `-=${i === 0 ? 0 : 0.45}`);
      });

      // 6. Flow dots appear
      tl.to(dots, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
      }, "-=0.3");

      // ── Continuous animations (only while in view) ──
      const continuousTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          toggleActions: "play pause resume pause",
        },
      });

      // Hub gentle float
      continuousTl.to(hubRef.current, {
        y: -10,
        duration: 3.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Flow dots travel along strands
      dots.forEach((dot, i) => {
        const strand = strands[i];
        if (!strand) return;
        const length = strandLengths[i];

        // Animate dot along the path using motionPath-like manual approach
        const proxy = { progress: 0 };
        gsap.to(proxy, {
          progress: 1,
          duration: 3 + i * 0.3,
          ease: "none",
          repeat: -1,
          onUpdate() {
            const point = strand.getPointAtLength(proxy.progress * length);
            dot.setAttribute("cx", String(point.x));
            dot.setAttribute("cy", String(point.y));
          },
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            toggleActions: "play pause resume pause",
          },
        });
      });

      // Nodes gentle breathing scale
      nodeEls.forEach((node, i) => {
        gsap.to(node, {
          scale: 1.04,
          duration: 2.5 + i * 0.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.4,
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            toggleActions: "play pause resume pause",
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="spiderverse"
      className="relative py-24 md:py-36 overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(226,54,54,.05) 0%, transparent 65%)",
        }}
      />

      {/* Section Title */}
      <div ref={titleRef} className="relative z-10 text-center mb-16 md:mb-24 px-6">
        <p className="font-display text-[10px] md:text-[11px] tracking-[.6em] uppercase mb-3" style={{ color: "var(--accent-50)" }}>
          The Spider-Verse
        </p>
        <h2 className="font-display text-3xl md:text-5xl lg:text-6xl tracking-[.12em] uppercase" style={{ color: "var(--fg)" }}>
          Web of Connections
        </h2>
        <div className="mx-auto mt-4 h-px w-24" style={{ background: "linear-gradient(to right, transparent, var(--accent-30), transparent)" }} />
        <p className="font-serif-accent text-base md:text-lg italic mt-4 max-w-lg mx-auto" style={{ color: "var(--fg-40)" }}>
          Every thread connects. Every choice ripples across the multiverse.
        </p>
      </div>

      {/* ── Constellation ── */}
      <div className="relative z-10 mx-auto" style={{ width: "min(800px, 90vw)", height: "min(800px, 90vw)" }}>

        {/* SVG layer */}
        <svg viewBox="0 0 800 800" className="absolute inset-0 w-full h-full pointer-events-none" fill="none" style={{ zIndex: 1 }}>
          <defs>
            <radialGradient id="strand-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(226,54,54,.12)" />
              <stop offset="100%" stopColor="rgba(226,54,54,0)" />
            </radialGradient>
            <filter id="glow-sm">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Outer ring arc connections */}
          {nodes.map((node, i) => {
            const next = nodes[(i + 1) % nodes.length];
            return (
              <path
                key={`arc-${i}`}
                ref={(el) => { arcRefs.current[i] = el; }}
                d={arcPath(node.angle, next.angle)}
                stroke="var(--fg-05)"
                strokeWidth="0.8"
                fill="none"
                strokeLinecap="round"
              />
            );
          })}

          {/* Hub-to-node strands */}
          {nodes.map((node, i) => (
            <path
              key={node.id}
              ref={(el) => { strandRefs.current[i] = el; }}
              d={webPath(node.angle)}
              stroke="var(--accent-20)"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
              filter="url(#glow-sm)"
            />
          ))}

          {/* Flow dots — positioned via JS */}
          {nodes.map((node, i) => (
            <circle
              key={`dot-${node.id}`}
              ref={(el) => { dotRefs.current[i] = el; }}
              r="2.5"
              fill="var(--accent-60)"
              filter="url(#glow-sm)"
            />
          ))}
        </svg>

        {/* ── Central Hub ── */}
        <div
          ref={hubRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ width: "112px", height: "112px", zIndex: 10 }}
        >
          {/* Outer glow */}
          <div className="absolute inset-[-14px] rounded-full" style={{ border: "1px solid var(--accent-15)", boxShadow: "0 0 50px rgba(226,54,54,.1)" }} />
          {/* Pulse */}
          <div className="absolute inset-[-4px] rounded-full" style={{ border: "2px solid var(--accent-25)", animation: "hub-pulse 3s ease-in-out infinite" }} />
          {/* Circle */}
          <div
            className="relative w-full h-full rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(226,54,54,.12), rgba(226,54,54,.04))",
              border: "2px solid var(--accent-30)",
              boxShadow: "0 0 60px rgba(226,54,54,.12), inset 0 2px 12px rgba(226,54,54,.06)",
              backdropFilter: "blur(16px)",
            }}
          >
            <svg width="52" height="52" viewBox="0 0 80 80" fill="none" style={{ opacity: 0.8 }}>
              <ellipse cx="40" cy="28" rx="6" ry="6" fill="var(--accent)" />
              <ellipse cx="40" cy="46" rx="8" ry="12" fill="var(--accent)" />
              <g stroke="var(--accent)" strokeWidth="2.5" fill="none" strokeLinecap="round">
                <path d="M36,28 Q28,20 18,14" /><path d="M44,28 Q52,20 62,14" />
                <path d="M34,36 Q24,32 14,30" /><path d="M46,36 Q56,32 66,30" />
                <path d="M34,46 Q24,50 14,56" /><path d="M46,46 Q56,50 66,56" />
                <path d="M36,52 Q28,60 22,68" /><path d="M44,52 Q52,60 58,68" />
              </g>
            </svg>
          </div>
          <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[9px] tracking-[.5em] uppercase" style={{ color: "var(--accent-50)" }}>
            Spider-Man
          </p>
        </div>

        {/* ── Orbiting Nodes ── */}
        {nodes.map((node, i) => {
          const rad = (node.angle - 90) * (Math.PI / 180);
          const xPct = Math.cos(rad) * 32.5;
          const yPct = Math.sin(rad) * 32.5;
          return (
            <div
              key={node.id}
              ref={(el) => { nodeRefs.current[i] = el; }}
              className="absolute group"
              style={{
                left: `calc(50% + ${xPct}%)`,
                top: `calc(50% + ${yPct}%)`,
                transform: "translate(-50%, -50%)",
                zIndex: 10,
              }}
            >
              <div
                className="relative w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-1"
                style={{
                  background: "var(--card-bg)",
                  border: `1px solid ${node.color.replace(".9)", ".12)")}`,
                  boxShadow: `0 0 24px ${node.color.replace(".9)", ".04)")}, inset 0 1px 0 rgba(255,255,255,.02)`,
                  backdropFilter: "blur(16px)",
                }}
              >
                {/* Top accent */}
                <div
                  className="absolute top-0 left-4 right-4 h-[1px] transition-all duration-700 group-hover:left-2 group-hover:right-2"
                  style={{ background: `linear-gradient(to right, transparent, ${node.color.replace(".9)", ".35)")}, transparent)` }}
                />
                <svg width="24" height="24" viewBox="0 0 24 24" className="transition-transform duration-700 group-hover:scale-110" style={{ color: node.color, fill: "currentColor" }}>
                  <path d={node.icon} />
                </svg>
                <p className="font-display text-[7px] md:text-[8px] tracking-[.35em] uppercase transition-all duration-700 group-hover:tracking-[.4em]" style={{ color: "var(--fg-60)" }}>
                  {node.label}
                </p>
              </div>
              {/* Hover subtitle */}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                <p className="font-serif-accent text-[10px] italic" style={{ color: "var(--fg-30)" }}>{node.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}

