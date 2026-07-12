"use client";

import { useEffect, useRef } from "react";

export default function SpiderCursor() {
  const el = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const glowPos = useRef({ x: 0, y: 0 });
  const angle = useRef(0);
  const frame = useRef(0);
  const spawned = useRef(false);

  // Idle wandering state
  const lastMouseMove = useRef(0);
  const isWandering = useRef(false);
  const wanderTarget = useRef({ x: 0, y: 0 });
  const wanderPauseUntil = useRef(0);
  const wanderPhase = useRef<"moving" | "pausing">("pausing");

  useEffect(() => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    pos.current = { x: cx, y: cy };
    target.current = { x: cx, y: cy };
    wanderTarget.current = { x: cx, y: cy };
    lastMouseMove.current = Date.now();

    if (el.current) {
      el.current.style.opacity = "0";
      el.current.style.transform = `translate(${cx}px,${cy}px) scale(0)`;
    }
    if (glowRef.current) {
      glowRef.current.style.transform = `translate(${cx}px,${cy}px)`;
      glowRef.current.style.opacity = "0";
    }
    glowPos.current = { x: cx, y: cy };

    const doSpawn = () => {
      if (spawned.current || !el.current) return;
      spawned.current = true;
      const p = pos.current;
      el.current.style.transition = "opacity .8s ease-out, transform 1.2s cubic-bezier(.22,1.2,.36,1)";
      el.current.style.opacity = "1";
      el.current.style.transform = `translate(${p.x}px,${p.y}px) scale(1)`;
      if (glowRef.current) glowRef.current.style.opacity = "0.4";
      setTimeout(() => {
        if (el.current) el.current.style.transition = "none";
      }, 1300);
    };

    // Spawn after preloader exits (with small delay for hero to settle)
    const onPreloaderExit = () => { setTimeout(doSpawn, 2000); };
    window.addEventListener("preloader-exit", onPreloaderExit);

    // Fallback if preloader event is missed
    const spawnTimer = setTimeout(doSpawn, 10000);

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      lastMouseMove.current = Date.now();
      isWandering.current = false;
    };

    // Pick a new wander destination — nearby, organic movement
    function pickWanderTarget() {
      const pad = 60;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cur = pos.current;

      // Wander within 100-300px of current position, clamped to viewport
      const wanderDist = 100 + Math.random() * 200;
      const wanderAngle = Math.random() * Math.PI * 2;
      const nx = Math.max(pad, Math.min(w - pad, cur.x + Math.cos(wanderAngle) * wanderDist));
      const ny = Math.max(pad, Math.min(h - pad, cur.y + Math.sin(wanderAngle) * wanderDist));
      wanderTarget.current = { x: nx, y: ny };
      wanderPhase.current = "moving";
    }

    const IDLE_THRESHOLD = 2000; // 2 seconds before spider starts exploring
    const stiffness = 0.07;
    const damping = 0.78;
    const wanderStiffness = 0.02; // slower, more organic for wandering
    const wanderDamping = 0.88;
    let prevSpeed = 0;

    const loop = () => {
      if (!spawned.current) { frame.current = requestAnimationFrame(loop); return; }

      const now = Date.now();
      const idleTime = now - lastMouseMove.current;

      // Start wandering after idle threshold
      if (idleTime > IDLE_THRESHOLD && !isWandering.current) {
        isWandering.current = true;
        wanderPauseUntil.current = now + 300 + Math.random() * 500; // brief pause before first move
        wanderPhase.current = "pausing";
      }

      let activeTarget = target.current;
      let activeStiffness = stiffness;
      let activeDamping = damping;

      if (isWandering.current) {
        activeStiffness = wanderStiffness;
        activeDamping = wanderDamping;

        if (wanderPhase.current === "pausing") {
          // Spider is pausing — stay still
          activeTarget = pos.current;
          if (now > wanderPauseUntil.current) {
            pickWanderTarget();
          }
        } else {
          // Spider is moving toward wander target
          activeTarget = wanderTarget.current;
          const dx = wanderTarget.current.x - pos.current.x;
          const dy = wanderTarget.current.y - pos.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Arrived — pause for 0.5-2 seconds then pick new target
          if (dist < 8) {
            wanderPhase.current = "pausing";
            wanderPauseUntil.current = now + 500 + Math.random() * 1500;
          }
        }
      }

      const fx = (activeTarget.x - pos.current.x) * activeStiffness;
      const fy = (activeTarget.y - pos.current.y) * activeStiffness;
      vel.current.x = (vel.current.x + fx) * activeDamping;
      vel.current.y = (vel.current.y + fy) * activeDamping;
      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;

      const speed = Math.sqrt(vel.current.x ** 2 + vel.current.y ** 2);
      prevSpeed += (speed - prevSpeed) * 0.08;

      if (speed > 0.15) {
        const ta = Math.atan2(vel.current.y, vel.current.x) * (180 / Math.PI) + 90;
        let diff = ta - angle.current;
        diff = ((diff + 540) % 360) - 180;
        // Faster rotation response when wandering for more lively feel
        const rotSpeed = isWandering.current ? 0.08 : 0.05;
        angle.current += diff * rotSpeed;
      }

      if (el.current) {
        el.current.style.transform = `translate(${pos.current.x}px,${pos.current.y}px) rotate(${angle.current}deg)`;
        const legDur = prevSpeed > 4 ? "0.06s" : prevSpeed > 1.5 ? "0.14s" : prevSpeed > 0.4 ? "0.3s" : "1.8s";
        el.current.style.setProperty("--leg-speed", legDur);
        el.current.style.setProperty("--leg-amp", `${Math.min(10, 2 + prevSpeed * 1.8)}deg`);
      }

      if (glowRef.current) {
        const glowTarget = isWandering.current ? pos.current : target.current;
        glowPos.current.x += (glowTarget.x - glowPos.current.x) * 0.04;
        glowPos.current.y += (glowTarget.y - glowPos.current.y) * 0.04;
        const glowScale = 1 + Math.min(prevSpeed * 0.08, 0.6);
        const glowOpacity = Math.min(0.5 + prevSpeed * 0.06, 0.9);
        glowRef.current.style.transform = `translate(${glowPos.current.x}px,${glowPos.current.y}px) scale(${glowScale})`;
        glowRef.current.style.opacity = String(glowOpacity);
      }

      frame.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    frame.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("preloader-exit", onPreloaderExit);
      cancelAnimationFrame(frame.current);
      clearTimeout(spawnTimer);
    };
  }, []);

  return (
    <>
    {/* Cursor glow */}
    <div
      ref={glowRef}
      className="fixed top-0 left-0 z-[99997] pointer-events-none"
      style={{
        willChange: "transform, opacity",
        marginLeft: -80,
        marginTop: -80,
        width: 160,
        height: 160,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(226,54,54,.25) 0%, rgba(226,54,54,.08) 35%, rgba(226,54,54,.02) 60%, transparent 80%)",
        filter: "blur(10px)",
        opacity: 0,
        mixBlendMode: "screen",
      }}
    />
    <div
      ref={el}
      className="fixed top-0 left-0 z-[99998] pointer-events-none"
      style={{ willChange: "transform", marginLeft: -24, marginTop: -24, opacity: 0 }}
    >
      <svg width="48" height="48" viewBox="0 0 96 96" fill="none">
        <defs>
          {/* 3D depth shadow — contact + ambient */}
          <filter id="cs" x="-40%" y="-30%" width="180%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="b1" />
            <feOffset dy="2" result="o1" />
            <feFlood floodColor="#000" floodOpacity=".5" result="c1" />
            <feComposite in="c1" in2="o1" operator="in" result="s1" />
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b2" />
            <feOffset dy="4" result="o2" />
            <feFlood floodColor="#000" floodOpacity=".18" result="c2" />
            <feComposite in="c2" in2="o2" operator="in" result="s2" />
            <feMerge><feMergeNode in="s2" /><feMergeNode in="s1" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* chitin texture */}
          <filter id="ct" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="3" numOctaves="4" seed="5" result="n" />
            <feColorMatrix type="saturate" values="0" in="n" result="g" />
            <feBlend in="SourceGraphic" in2="g" mode="multiply" result="t" />
            <feComposite in="t" in2="SourceGraphic" operator="in" />
          </filter>
          {/* head — top-lit 3D sphere */}
          <radialGradient id="hg" cx="38%" cy="28%" r="62%">
            <stop offset="0%" stopColor="#d44040" />
            <stop offset="30%" stopColor="#a82222" />
            <stop offset="65%" stopColor="#5c0e0e" />
            <stop offset="100%" stopColor="#1a0303" />
          </radialGradient>
          {/* abdomen — deeper, richer */}
          <radialGradient id="ag" cx="40%" cy="25%" r="68%">
            <stop offset="0%" stopColor="#c83535" />
            <stop offset="25%" stopColor="#9a1e1e" />
            <stop offset="55%" stopColor="#4e0a0a" />
            <stop offset="100%" stopColor="#120202" />
          </radialGradient>
          {/* rim light bottom */}
          <radialGradient id="rb" cx="50%" cy="88%" r="50%">
            <stop offset="0%" stopColor="rgba(255,90,70,.18)" />
            <stop offset="100%" stopColor="rgba(255,90,70,0)" />
          </radialGradient>
          {/* rim light top-right */}
          <radialGradient id="rt" cx="72%" cy="12%" r="45%">
            <stop offset="0%" stopColor="rgba(200,215,255,.1)" />
            <stop offset="100%" stopColor="rgba(200,215,255,0)" />
          </radialGradient>
          {/* pedicel */}
          <radialGradient id="pg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#5a1010" />
            <stop offset="100%" stopColor="#220404" />
          </radialGradient>
          {/* leg stroke */}
          <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5c1010" />
            <stop offset="50%" stopColor="#7a1818" />
            <stop offset="100%" stopColor="#2a0505" />
          </linearGradient>
        </defs>

        <g filter="url(#cs)">
          {/* ── LEGS — double stroke for cylindrical depth ── */}
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Group A */}
            <path d="M42,35 Q32,26 24,19 Q17,14 6,7" stroke="#1a0404" strokeWidth="2.6" className="spider-leg-a" />
            <path d="M42,35 Q32,26 24,19 Q17,14 6,7" stroke="url(#lg)" strokeWidth="1.6" className="spider-leg-a" />
            <path d="M54,43 Q66,38 76,36 Q84,34 96,33" stroke="#1a0404" strokeWidth="2.6" className="spider-leg-a" />
            <path d="M54,43 Q66,38 76,36 Q84,34 96,33" stroke="url(#lg)" strokeWidth="1.6" className="spider-leg-a" />
            <path d="M42,53 Q30,58 22,63 Q12,68 2,76" stroke="#1a0404" strokeWidth="2.6" className="spider-leg-a" />
            <path d="M42,53 Q30,58 22,63 Q12,68 2,76" stroke="url(#lg)" strokeWidth="1.6" className="spider-leg-a" />
            <path d="M52,58 Q62,68 68,76 Q74,84 82,94" stroke="#1a0404" strokeWidth="2.6" className="spider-leg-a" />
            <path d="M52,58 Q62,68 68,76 Q74,84 82,94" stroke="url(#lg)" strokeWidth="1.6" className="spider-leg-a" />
            {/* Group B */}
            <path d="M54,35 Q64,26 72,19 Q79,14 90,7" stroke="#1a0404" strokeWidth="2.6" className="spider-leg-b" />
            <path d="M54,35 Q64,26 72,19 Q79,14 90,7" stroke="url(#lg)" strokeWidth="1.6" className="spider-leg-b" />
            <path d="M42,43 Q30,38 20,36 Q12,34 0,33" stroke="#1a0404" strokeWidth="2.6" className="spider-leg-b" />
            <path d="M42,43 Q30,38 20,36 Q12,34 0,33" stroke="url(#lg)" strokeWidth="1.6" className="spider-leg-b" />
            <path d="M54,53 Q66,58 74,63 Q84,68 94,76" stroke="#1a0404" strokeWidth="2.6" className="spider-leg-b" />
            <path d="M54,53 Q66,58 74,63 Q84,68 94,76" stroke="url(#lg)" strokeWidth="1.6" className="spider-leg-b" />
            <path d="M44,58 Q34,68 28,76 Q22,84 14,94" stroke="#1a0404" strokeWidth="2.6" className="spider-leg-b" />
            <path d="M44,58 Q34,68 28,76 Q22,84 14,94" stroke="url(#lg)" strokeWidth="1.6" className="spider-leg-b" />
          </g>

          {/* joint bumps */}
          <g fill="#3a0808">
            <circle cx="24" cy="19" r="1.2" className="spider-leg-a" />
            <circle cx="72" cy="19" r="1.2" className="spider-leg-b" />
            <circle cx="76" cy="36" r="1.2" className="spider-leg-a" />
            <circle cx="20" cy="36" r="1.2" className="spider-leg-b" />
            <circle cx="22" cy="63" r="1.2" className="spider-leg-a" />
            <circle cx="74" cy="63" r="1.2" className="spider-leg-b" />
            <circle cx="68" cy="76" r="1.2" className="spider-leg-a" />
            <circle cx="28" cy="76" r="1.2" className="spider-leg-b" />
          </g>

          {/* ── BODY with chitin texture ── */}
          <g filter="url(#ct)">
            <ellipse cx="48" cy="36" rx="7" ry="7.5" fill="url(#hg)" />
            <ellipse cx="48" cy="55" rx="9" ry="12" fill="url(#ag)" />
          </g>

          {/* pedicel */}
          <ellipse cx="48" cy="44" rx="3.5" ry="2.5" fill="url(#pg)" />

          {/* rim lighting */}
          <ellipse cx="48" cy="36" rx="7" ry="7.5" fill="url(#rb)" />
          <ellipse cx="48" cy="36" rx="7" ry="7.5" fill="url(#rt)" />
          <ellipse cx="48" cy="55" rx="9" ry="12" fill="url(#rb)" />
          <ellipse cx="48" cy="55" rx="9" ry="12" fill="url(#rt)" />

          {/* specular highlights */}
          <ellipse cx="45.5" cy="32.5" rx="2.5" ry="1.8" fill="rgba(255,255,255,.1)" />
          <ellipse cx="45" cy="51" rx="3" ry="2" fill="rgba(255,255,255,.04)" />

          {/* abdomen markings */}
          <path d="M48,44 L48,67" stroke="#0e0202" strokeWidth=".4" opacity=".5" />
          <path d="M39,54 Q48,50 57,54" stroke="#0e0202" strokeWidth=".35" fill="none" opacity=".4" />
          <path d="M40,58 Q48,55 56,58" stroke="#0e0202" strokeWidth=".35" fill="none" opacity=".3" />
          {/* hourglass */}
          <path d="M46,52 L48,54.5 L50,52 Z" fill="rgba(226,54,54,.2)" stroke="#e23636" strokeWidth=".4" opacity=".7" />
          <path d="M46,57 L48,54.5 L50,57 Z" fill="rgba(226,54,54,.2)" stroke="#e23636" strokeWidth=".4" opacity=".7" />

          {/* contour rim */}
          <ellipse cx="48" cy="36" rx="7" ry="7.5" fill="none" stroke="rgba(255,200,200,.06)" strokeWidth=".4" />
          <ellipse cx="48" cy="55" rx="9" ry="12" fill="none" stroke="rgba(255,200,200,.04)" strokeWidth=".4" />

          {/* spinnerets */}
          <ellipse cx="47" cy="66.5" rx=".6" ry=".9" fill="#1a0303" />
          <ellipse cx="49" cy="66.5" rx=".6" ry=".9" fill="#1a0303" />
        </g>
      </svg>
    </div>
    </>
  );
}
