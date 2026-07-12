"use client";

import { useEffect, useRef } from "react";

interface Strand {
  x: number;
  y: number;
  baseX: number;
  len: number;
  angle: number;
  speed: number;
  opacity: number;
  drift: number;
  vx: number;
  vy: number;
}

export default function WebParticles() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const cvs = canvas.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    let w = (cvs.width = window.innerWidth);
    let h = (cvs.height = window.innerHeight);
    let frame = 0;

    const count = Math.floor((w * h) / 40000);
    const strands: Strand[] = Array.from({ length: count }, () => {
      const x = Math.random() * w;
      return {
        x,
        y: Math.random() * h,
        baseX: x,
        len: 20 + Math.random() * 50,
        angle: Math.random() * Math.PI * 2,
        speed: 0.12 + Math.random() * 0.25,
        opacity: 0.02 + Math.random() * 0.035,
        drift: (Math.random() - 0.5) * 0.002,
        vx: 0,
        vy: 0,
      };
    });

    const onMouse = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const scrollY = window.scrollY;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (const s of strands) {
        // gravity: drift upward
        s.y -= s.speed;
        s.angle += s.drift;

        // mouse repulsion — inverse square
        const dx = s.x - mx;
        const dy = (s.y + scrollY * 0.02) - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repulseRadius = 120;
        if (dist < repulseRadius && dist > 0) {
          const force = (1 - dist / repulseRadius) * 2;
          s.vx += (dx / dist) * force;
          s.vy += (dy / dist) * force;
        }

        // apply velocity with damping (friction)
        s.x += s.vx;
        s.vx *= 0.92;
        s.vy *= 0.92;

        // spring back to baseX
        s.x += (s.baseX - s.x) * 0.01;

        const py = s.y + scrollY * 0.02 + s.vy;

        if (s.y < -s.len) {
          s.y = h + s.len;
          s.x = Math.random() * w;
          s.baseX = s.x;
        }

        const ex = s.x + Math.cos(s.angle) * s.len;
        const ey = py + Math.sin(s.angle) * s.len;

        ctx.beginPath();
        ctx.moveTo(s.x, py);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(226, 54, 54, ${s.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ex, ey, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 54, 54, ${s.opacity * 1.5})`;
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    const onResize = () => {
      w = cvs.width = window.innerWidth;
      h = cvs.height = window.innerHeight;
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse, { passive: true });
    frame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
