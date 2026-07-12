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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "dark" | "light") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

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

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

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
            onClick={toggleTheme}
            className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 hover:bg-[var(--fg-08)] hover:scale-110 active:scale-95"
            aria-label="Toggle theme"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={`absolute transition-all duration-500 ${theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-75"}`} style={{ color: "var(--accent)" }}>
              <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={`absolute transition-all duration-500 ${theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`} style={{ color: "var(--fg-50)" }}>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-px transition-all duration-500 ${menuOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} style={{ background: "var(--fg)" }} />
            <span className={`block w-5 h-px transition-all duration-500 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} style={{ background: "var(--fg)" }} />
            <span className={`block w-5 h-px transition-all duration-500 ${menuOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} style={{ background: "var(--fg)" }} />
          </button>
        </div>
      </div>


      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ${menuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 pb-6 flex flex-col gap-4 backdrop-blur-md" style={{ background: "var(--bg-90)" }}>
          {links.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="font-display text-sm tracking-[.25em] uppercase transition-all duration-500 hover:text-[var(--accent)] hover:translate-x-2"
              style={{ color: "var(--fg-50)", transitionDelay: menuOpen ? `${i * 80}ms` : "0ms" }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
