"use client";

import { useEffect, useState, useRef } from "react";

const links = [
  { label: "Characters", href: "#characters" },
  { label: "Story", href: "#story" },
  { label: "Trailer", href: "#trailer" },
  { label: "Gallery", href: "#gallery" },
  { label: "Release", href: "#release" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: "-40% 0px -40% 0px" });
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const sy = window.scrollY;
        setScrolled(sy > 80);
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(docH > 0 ? sy / docH : 0);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${scrolled ? "backdrop-blur-md" : ""}`}
      style={{
        background: scrolled ? "rgba(var(--c-bg),.4)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(var(--c-fg),.04)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          className="font-display text-lg tracking-[.4em] uppercase transition-all duration-500 flex items-center gap-2 group"
          style={{ color: "var(--accent)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 80 80"
            fill="none"
            className="transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:drop-shadow-[0_0_6px_rgba(226,54,54,.4)]"
            style={{ opacity: 0.7 }}
          >
            <ellipse cx="40" cy="30" rx="6" ry="6" fill="currentColor" />
            <ellipse cx="40" cy="46" rx="7.5" ry="11" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
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
          <span className="flex flex-col leading-tight transition-transform duration-300 group-hover:translate-x-0.5">
            <span className="text-[11px] tracking-[.35em]">Spider-Man</span>
            <span className="text-[8px] tracking-[.3em]" style={{ color: "var(--fg-50)" }}>Brand New Day</span>
          </span>
        </a>

        <div className="flex items-center gap-6 md:gap-10">
          <div className="hidden md:flex items-center gap-10">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`font-display text-[9px] tracking-[.3em] uppercase link-hover nav-link transition-all duration-500 pb-1 ${activeSection === l.href.slice(1) ? "nav-link-active" : ""}`}
                style={{ color: activeSection === l.href.slice(1) ? "var(--fg)" : "var(--fg-70)" }}
              >
                {l.label}
              </a>
            ))}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <span className={`absolute block w-5 h-[1.5px] rounded-full transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)] ${menuOpen ? "rotate-45 bg-[#e23636]" : "-translate-y-[5px]"}`} style={{ background: menuOpen ? undefined : "var(--fg)" }} />
            <span className={`absolute block w-5 h-[1.5px] rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} style={{ background: "var(--fg)" }} />
            <span className={`absolute block w-5 h-[1.5px] rounded-full transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)] ${menuOpen ? "-rotate-45 bg-[#e23636]" : "translate-y-[5px]"}`} style={{ background: menuOpen ? undefined : "var(--fg)" }} />
          </button>
        </div>
      </div>

      {/* Mobile menu — fullscreen overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-500 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(6,6,8,.97)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex flex-col justify-center items-center h-full gap-1">
          {links.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="font-display text-2xl tracking-[.3em] uppercase py-4 transition-all duration-500"
              style={{
                color: activeSection === l.href.slice(1) ? "#e23636" : "rgba(245,245,245,.5)",
                transform: menuOpen ? "translateY(0)" : `translateY(${20 + i * 10}px)`,
                opacity: menuOpen ? 1 : 0,
                transitionDelay: menuOpen ? `${150 + i * 60}ms` : "0ms",
              }}
            >
              {l.label}
            </a>
          ))}
          <div className="mt-8 h-px w-12" style={{ background: "linear-gradient(to right, transparent, rgba(226,54,54,.3), transparent)" }} />
          <p className="mt-4 font-display text-[8px] tracking-[.5em] uppercase" style={{ color: "rgba(245,245,245,.2)" }}>
            July 31, 2026
          </p>
        </div>
      </div>
    </nav>
  );
}
