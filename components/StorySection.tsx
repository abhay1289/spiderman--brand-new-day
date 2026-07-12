"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const chapters = [
  { number: "01", title: "The Forgotten", text: "Four years have passed since Peter Parker made the ultimate sacrifice \u2014 erasing himself from the memory of everyone he loves. Now he walks through New York as a ghost in plain sight, watching MJ laugh at a caf\u00e9 she doesn\u2019t remember sharing with him.", image: "/spider-man-brand-new-day-using-phone-upside-down-3f-3840x2160.jpg" },
  { number: "02", title: "The Evolution", text: "Something is changing inside Peter. His spider-sense screams louder. His webs move differently. His body heals faster \u2014 and breaks in ways it never has. The isolation has awakened something in his DNA that was never meant to surface.", image: "/tom-holland-as-peter-parker-spider-man-brand-new-day-uz-3840x2160.jpg" },
  { number: "03", title: "The Unseen Threat", text: "A new villain has emerged from the shadows \u2014 one that no camera can capture, no witness can describe. People are vanishing. Buildings crumble with no visible cause. The city is under attack by a force that exists just beyond perception.", image: "/spider-man-brand-new-day-2026-qj-3840x2160.jpg" },
  { number: "04", title: "Brand New Day", text: "To save New York, Peter must do what terrifies him most \u2014 let people in again. Old allies. New faces. A war is coming that Spider\u2011Man cannot fight alone. The world forgot Peter Parker. But they\u2019re about to remember Spider\u2011Man.", image: "/spiderman-and-hulk-in-spiderman-brand-new-day-zm-3840x2160.jpg" },
];

export default function StorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const progressBar = containerRef.current?.querySelector(".story-progress-fill") as HTMLElement | null;

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const panels = gsap.utils.toArray<HTMLElement>(".story-panel");
      const totalScroll = () => track.scrollWidth - window.innerWidth;

      const horizontalTween = gsap.to(track, {
        x: () => -totalScroll(), ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${totalScroll()}`,
          pin: true,
          pinType: "transform",
          scrub: 2,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (progressBar) progressBar.style.transform = `scaleX(${self.progress})`;
          },
        },
      });

      panels.forEach((panel, i) => {
        const bg = panel.querySelector(".panel-bg");
        const num = panel.querySelector(".panel-num");
        const line = panel.querySelector(".panel-line");
        const ttl = panel.querySelector(".panel-title");
        const txt = panel.querySelector(".panel-text");
        const dots = panel.querySelector(".panel-dots");

        // Parallax background with subtle scale
        if (bg) {
          gsap.fromTo(bg, { x: -100, scale: 1.1 }, {
            x: 100, scale: 1, ease: "none",
            scrollTrigger: { trigger: panel, containerAnimation: horizontalTween, start: "left right", end: "right left", scrub: true },
          });
        }

        // Staggered content reveal per panel
        const tl = gsap.timeline({
          scrollTrigger: { trigger: panel, containerAnimation: horizontalTween, start: "left 75%", end: "left 25%", scrub: 1 },
        });

        tl.from(num, { y: 40, opacity: 0, duration: 0.3, ease: "power3.out" })
          .from(line, { scaleX: 0, duration: 0.4, ease: "power2.inOut" }, "-=.1")
          .from(ttl, { y: 100, opacity: 0, duration: 0.6, ease: "power4.out" }, "-=.15")
          .from(txt, { y: 60, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=.25");

        if (dots) {
          tl.from(dots, { opacity: 0, y: 20, duration: 0.3, ease: "power2.out" }, "-=.2");
        }

        // Subtle fade-out as panel leaves
        gsap.to(panel.querySelector(".relative.z-10"), {
          opacity: 0.3, x: i % 2 === 0 ? -30 : 30,
          ease: "power2.in",
          scrollTrigger: { trigger: panel, containerAnimation: horizontalTween, start: "right 30%", end: "right left", scrub: true },
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="story">

      <div ref={containerRef} className="relative overflow-hidden">
        <div ref={trackRef} className="story-track">
          {chapters.map((ch, i) => (
            <div key={ch.number} className="story-panel">
              <div className="panel-bg absolute inset-[-100px] bg-cover bg-center" style={{ backgroundImage: `url(${ch.image})` }} />
              <div className="absolute inset-0 z-[1]" style={{ background: `rgba(var(--img-overlay),.35)` }} />
              <div className="absolute inset-0 z-[1]" style={{ background: i % 2 === 0 ? `linear-gradient(to right, rgba(var(--img-overlay),.7), rgba(var(--img-overlay),.2), transparent)` : `linear-gradient(to left, rgba(var(--img-overlay),.7), rgba(var(--img-overlay),.2), transparent)` }} />
              <div className="absolute inset-0 z-[1]" style={{ background: `linear-gradient(to top, rgba(var(--img-overlay),.8), transparent, rgba(var(--img-overlay),.2))` }} />

              <div className={`relative z-10 w-full px-8 md:px-16 lg:px-24 flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-lg ${i % 2 === 0 ? "text-left" : "text-right"}`}>
                  <span className="panel-num inline-block font-display text-[10px] tracking-[.5em] uppercase" style={{ color: "var(--accent)", textShadow: "0 0 20px rgba(226,54,54,.3)" }}>Chapter {ch.number}</span>
                  <div className={`panel-line h-px my-5 w-16 ${i % 2 === 0 ? "origin-left" : "origin-right ml-auto"}`} style={{ background: "var(--accent-40)" }} />
                  <h3 className="panel-title font-serif-accent text-3xl md:text-5xl lg:text-6xl italic" style={{ color: "var(--fg)" }}>{ch.title}</h3>
                  <p className="panel-text mt-6 md:mt-8 leading-[1.9] text-sm md:text-base font-light" style={{ color: "var(--fg-90)" }}>{ch.text}</p>
                  <div className={`panel-dots flex gap-2 mt-8 ${i % 2 === 0 ? "" : "justify-end"}`}>
                    {chapters.map((_, j) => (
                      <div key={j} className="rounded-full transition-all duration-500" style={{ width: j === i ? 8 : 6, height: j === i ? 8 : 6, background: j === i ? "var(--accent-70)" : "var(--fg-15)", boxShadow: j === i ? "0 0 8px rgba(226,54,54,.3)" : "none" }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute top-0 left-0 bottom-0 w-16 z-[2] pointer-events-none" style={{ background: `linear-gradient(to right, var(--bg), transparent)` }} />
              <div className="absolute top-0 right-0 bottom-0 w-16 z-[2] pointer-events-none" style={{ background: `linear-gradient(to left, var(--bg), transparent)` }} />
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px z-20" style={{ background: "var(--fg-05)" }}>
          <div className="story-progress-fill h-full origin-left" style={{ background: "var(--accent-50)", transform: "scaleX(0)" }} />
        </div>
      </div>
    </section>
  );
}
