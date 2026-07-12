"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function WebDivider() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const paths = ref.current?.querySelectorAll<SVGPathElement>(".web-strand");
      if (!paths) return;
      paths.forEach((p, i) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(p, {
          strokeDashoffset: 0,
          duration: 1.2,
          delay: i * 0.08,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative py-8 md:py-12 overflow-hidden">
      <svg
        className="w-full h-16 md:h-20"
        viewBox="0 0 1200 80"
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* center point */}
        <circle cx="600" cy="40" r="3" fill="var(--accent-30)" />
        <circle cx="600" cy="40" r="6" fill="none" stroke="var(--accent-15)" strokeWidth=".5" />

        {/* radial web strands from center */}
        <path className="web-strand" d="M600,40 Q450,20 100,15" stroke="var(--accent-15)" strokeWidth=".8" />
        <path className="web-strand" d="M600,40 Q750,20 1100,15" stroke="var(--accent-15)" strokeWidth=".8" />
        <path className="web-strand" d="M600,40 Q450,50 100,65" stroke="var(--accent-15)" strokeWidth=".8" />
        <path className="web-strand" d="M600,40 Q750,50 1100,65" stroke="var(--accent-15)" strokeWidth=".8" />
        <path className="web-strand" d="M600,40 L100,40" stroke="var(--accent-12)" strokeWidth=".5" />
        <path className="web-strand" d="M600,40 L1100,40" stroke="var(--accent-12)" strokeWidth=".5" />
        <path className="web-strand" d="M600,40 Q400,10 50,5" stroke="var(--accent-08)" strokeWidth=".5" />
        <path className="web-strand" d="M600,40 Q800,10 1150,5" stroke="var(--accent-08)" strokeWidth=".5" />
        <path className="web-strand" d="M600,40 Q400,70 50,75" stroke="var(--accent-08)" strokeWidth=".5" />
        <path className="web-strand" d="M600,40 Q800,70 1150,75" stroke="var(--accent-08)" strokeWidth=".5" />

        {/* concentric arcs */}
        <path className="web-strand" d="M400,25 Q500,35 600,30 Q700,25 800,35" stroke="var(--accent-10)" strokeWidth=".5" fill="none" />
        <path className="web-strand" d="M300,20 Q450,40 600,35 Q750,30 900,45" stroke="var(--accent-08)" strokeWidth=".4" fill="none" />
        <path className="web-strand" d="M400,55 Q500,45 600,50 Q700,55 800,45" stroke="var(--accent-10)" strokeWidth=".5" fill="none" />
      </svg>
    </div>
  );
}
