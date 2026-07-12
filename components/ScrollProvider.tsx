"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // ── Lenis ultra-smooth scroll (disabled on touch devices to prevent jank with ScrollTrigger pins) ──
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -13 * t)),
      smoothWheel: !isTouchDevice,
      wheelMultiplier: 0.85,
      touchMultiplier: 1,
      infinite: false,
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // ── Smooth anchor scrolling ──
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a[href^='#']");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, {
        offset: -60,
        duration: 2,
        easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      });
    };
    document.addEventListener("click", handleAnchorClick);

    // ── data-reveal scroll reveals ──
    const setupReveals = () => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const direction = el.dataset.reveal || "up";
        const delay = parseFloat(el.dataset.revealDelay || "0");
        const from: gsap.TweenVars = { opacity: 0, duration: 1.2, ease: "power3.out", delay };

        if (direction === "up") { from.y = 60; }
        else if (direction === "down") { from.y = -60; }
        else if (direction === "left") { from.x = 80; }
        else if (direction === "right") { from.x = -80; }
        else if (direction === "scale") { from.scale = 0.92; from.y = 30; }

        gsap.from(el, {
          ...from,
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        });
      });
    };

    // ── Parallax backgrounds ──
    const setupParallax = () => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0.3");
        gsap.fromTo(el, { y: -60 * speed }, {
          y: 60 * speed, ease: "none",
          scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    };

    // ── Section divider draw-on ──
    const setupDividers = () => {
      gsap.utils.toArray<HTMLElement>(".section-divider-line").forEach((line) => {
        gsap.from(line, {
          scaleX: 0, duration: 1.2, ease: "power2.inOut",
          scrollTrigger: { trigger: line, start: "top 92%", toggleActions: "play none none none" },
        });
      });
    };

    // ── Smooth section fade-in on scroll ──
    // Each major section fades/slides up as it enters the viewport
    const setupSectionTransitions = () => {
      const isMobileDevice = window.innerWidth < 768;
      gsap.utils.toArray<HTMLElement>("section[id]").forEach((section) => {
        // Skip hero (own entrance) and story (pinned horizontal scroll conflicts with y offset)
        if (section.id === "hero" || section.id === "story" || section.id === "filmography") return;

        gsap.fromTo(section, {
          opacity: 0,
          y: isMobileDevice ? 30 : 60,
        }, {
          opacity: 1,
          y: 0,
          duration: isMobileDevice ? 0.7 : 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 92%",
            toggleActions: "play none none none",
          },
        });
      });
    };

    // ── Scroll-speed-based micro-interactions ──
    const setupScrollVelocity = () => {
      let lastScroll = 0;
      let velocity = 0;

      const velocityTick = () => {
        const sy = window.scrollY;
        velocity += (sy - lastScroll - velocity) * 0.08;
        lastScroll = sy;

        const clampedV = Math.max(-2, Math.min(2, velocity * 0.1));
        gsap.utils.toArray<HTMLElement>("[data-scroll-skew]").forEach((el) => {
          el.style.transform = `skewY(${clampedV}deg)`;
        });
      };

      gsap.ticker.add(velocityTick);
      return () => gsap.ticker.remove(velocityTick);
    };

    // ── Progressive image reveals ──
    const setupImageReveals = () => {
      gsap.utils.toArray<HTMLElement>("[data-img-reveal]").forEach((el) => {
        const img = el.querySelector("img");
        if (!img) return;

        gsap.from(el, {
          clipPath: "inset(100% 0 0 0)",
          duration: 1.4, ease: "power4.inOut",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        });
        gsap.from(img, {
          scale: 1.3,
          duration: 1.8, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        });
      });
    };

    let cleanupVelocity: (() => void) | undefined;

    requestAnimationFrame(() => requestAnimationFrame(() => {
      setupReveals();
      setupParallax();
      setupDividers();
      setupSectionTransitions();
      cleanupVelocity = setupScrollVelocity();
      setupImageReveals();
      setTimeout(() => ScrollTrigger.refresh(), 150);
    }));

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.ticker.remove(raf);
      cleanupVelocity?.();
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
