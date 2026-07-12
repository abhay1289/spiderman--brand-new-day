"use client";

import { useEffect, useRef } from "react";

interface Strand {
  angle: number;
  len: number;
  cx: number; cy: number;
  progress: number;
  vel: number;
  baseWidth: number;
  wobble: number;
  droop: number;
  // sub-fiber offsets for rope texture
  fibers: { dx: number; dy: number; widthMul: number }[];
}

function playThwip() {
  try {
    const ctx = new AudioContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(3800, t);
    osc.frequency.exponentialRampToValueAtTime(250, t + 0.12);
    oscGain.gain.setValueAtTime(0.08, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(oscGain).connect(ctx.destination);
    osc.start();
    osc.stop(t + 0.2);

    const bufLen = Math.floor(ctx.sampleRate * 0.07);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      const env = 1 - i / bufLen;
      data[i] = (Math.random() * 2 - 1) * env * 0.7;
    }
    const noise = ctx.createBufferSource();
    const nGain = ctx.createGain();
    const nFilter = ctx.createBiquadFilter();
    noise.buffer = buf;
    nFilter.type = "bandpass";
    nFilter.frequency.value = 5000;
    nFilter.Q.value = 0.6;
    nGain.gain.setValueAtTime(0.07, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    noise.connect(nFilter).connect(nGain).connect(ctx.destination);
    noise.start();

    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.type = "triangle";
    snap.frequency.setValueAtTime(180, t);
    snap.frequency.exponentialRampToValueAtTime(50, t + 0.05);
    snapGain.gain.setValueAtTime(0.06, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    snap.connect(snapGain).connect(ctx.destination);
    snap.start();
    snap.stop(t + 0.09);

    setTimeout(() => ctx.close(), 500);
  } catch {}
}

function strandPt(ox: number, oy: number, s: Strand, t: number, age: number): [number, number] {
  const ex = ox + Math.cos(s.angle) * s.len;
  const ey = oy + Math.sin(s.angle) * s.len;
  const wobAmt = 1.2 * (1 - t * 0.8);
  const wx = Math.sin(age * 0.1 + s.wobble) * wobAmt;
  const wy = Math.cos(age * 0.08 + s.wobble) * wobAmt;
  const cx = s.cx + wx;
  const cy = s.cy + wy + s.droop;
  const u = 1 - t;
  return [
    u * u * ox + 2 * u * t * cx + t * t * ex,
    u * u * oy + 2 * u * t * cy + t * t * (ey + s.droop * 0.5),
  ];
}

function spawnWeb(c: CanvasRenderingContext2D, ox: number, oy: number) {
  const count = 12 + Math.floor(Math.random() * 5); // 12-16 radial strands like movie web
  const strands: Strand[] = [];

  for (let i = 0; i < count; i++) {
    const baseAngle = (i / count) * Math.PI * 2;
    const angle = baseAngle + (Math.random() - 0.5) * 0.25;
    const len = 55 + Math.random() * 80;
    const sway = (Math.random() - 0.5) * 14;
    const perpAngle = angle + Math.PI / 2;
    const mid = 0.4 + Math.random() * 0.2;
    const mx = ox + Math.cos(angle) * len * mid;
    const my = oy + Math.sin(angle) * len * mid;

    // 2-4 sub-fibers per strand for rope texture
    const fiberCount = 2 + Math.floor(Math.random() * 3);
    const fibers: Strand["fibers"] = [];
    for (let f = 0; f < fiberCount; f++) {
      fibers.push({
        dx: (Math.random() - 0.5) * 1.8,
        dy: (Math.random() - 0.5) * 1.8,
        widthMul: 0.3 + Math.random() * 0.5,
      });
    }

    strands.push({
      angle, len,
      cx: mx + Math.cos(perpAngle) * sway,
      cy: my + Math.sin(perpAngle) * sway,
      progress: 0,
      vel: 0.1 + Math.random() * 0.06, // faster shoot-out like movie
      baseWidth: 0.8 + Math.random() * 1.0,
      wobble: Math.random() * Math.PI * 2,
      droop: 0,
      fibers,
    });
  }

  strands.sort((a, b) => a.angle - b.angle);

  // 7 concentric rings for dense movie-web look
  const rings = [0.12, 0.22, 0.34, 0.46, 0.58, 0.7, 0.84];
  const ringSag = rings.map(() => 2 + Math.random() * 3.5);

  // Impact splat particles
  const splatCount = 6 + Math.floor(Math.random() * 4);
  const splats: { angle: number; r: number; size: number }[] = [];
  for (let i = 0; i < splatCount; i++) {
    splats.push({
      angle: Math.random() * Math.PI * 2,
      r: 3 + Math.random() * 8,
      size: 0.8 + Math.random() * 1.5,
    });
  }

  let opacity = 1;
  let age = 0;
  const birthTime = performance.now();

  const draw = () => {
    age++;
    const elapsed = performance.now() - birthTime;

    for (const s of strands) {
      s.vel *= 0.88;
      s.progress = Math.min(s.progress + s.vel, 1);
      if (s.progress > 0.92) s.droop += 0.04;
    }

    // ── SHADOW PASS — 3D depth ──
    c.save();
    c.translate(2, 4);
    c.globalAlpha = 0.15 * opacity;
    drawAllStrands(c, ox, oy, strands, age, true);
    drawAllSpirals(c, ox, oy, strands, rings, ringSag, age, true);
    c.restore();

    // ── MAIN PASS ──
    c.globalAlpha = 1;
    drawAllStrands(c, ox, oy, strands, age, false, opacity);
    drawAllSpirals(c, ox, oy, strands, rings, ringSag, age, false, opacity);

    // ── DROPLETS at intersections ──
    drawIntersections(c, ox, oy, strands, rings, age, opacity);

    // ── IMPACT SPLAT at center ──
    if (opacity > 0.1) {
      // messy center blob
      c.beginPath();
      c.arc(ox + 1.5, oy + 3, 5, 0, Math.PI * 2);
      c.fillStyle = `rgba(0,0,0,${0.12 * opacity})`;
      c.fill();

      for (const sp of splats) {
        const sx = ox + Math.cos(sp.angle) * sp.r;
        const sy = oy + Math.sin(sp.angle) * sp.r;
        c.beginPath();
        c.arc(sx, sy, sp.size, 0, Math.PI * 2);
        c.fillStyle = `rgba(230,235,240,${0.4 * opacity})`;
        c.fill();
        c.beginPath();
        c.arc(sx - sp.size * 0.2, sy - sp.size * 0.2, sp.size * 0.4, 0, Math.PI * 2);
        c.fillStyle = `rgba(255,255,255,${0.6 * opacity})`;
        c.fill();
      }

      // Center hub — dense silk blob
      c.beginPath();
      c.arc(ox, oy, 3.5, 0, Math.PI * 2);
      const hg = c.createRadialGradient(ox - 1, oy - 1.5, 0, ox, oy, 3.5);
      hg.addColorStop(0, `rgba(255,255,255,${0.9 * opacity})`);
      hg.addColorStop(0.3, `rgba(220,225,235,${0.7 * opacity})`);
      hg.addColorStop(0.7, `rgba(190,195,210,${0.4 * opacity})`);
      hg.addColorStop(1, `rgba(160,165,180,${0.1 * opacity})`);
      c.fillStyle = hg;
      c.fill();
    }

    // Start fading at 700ms, fully gone by ~1300ms (total life ~1.3s)
    if (elapsed > 700) {
      opacity = Math.max(0, 1 - (elapsed - 700) / 600);
    }

    return opacity > 0;
  };

  return draw;
}

function drawAllStrands(
  c: CanvasRenderingContext2D, ox: number, oy: number,
  strands: Strand[], age: number, isShadow: boolean, opacity = 1
) {
  for (const s of strands) {
    const t = s.progress;
    const [ex, ey] = strandPt(ox, oy, s, t, age);
    const wx = Math.sin(age * 0.1 + s.wobble) * 1.2 * (1 - t * 0.8);
    const wy = Math.cos(age * 0.08 + s.wobble) * 1.2 * (1 - t * 0.8);
    const ctrlX = s.cx + wx;
    const ctrlY = s.cy + wy + s.droop;
    const cxc = ox + (ctrlX - ox) * Math.min(t * 1.3, 1);
    const cyc = oy + (ctrlY - oy) * Math.min(t * 1.3, 1);

    if (isShadow) {
      c.beginPath();
      c.moveTo(ox, oy);
      c.quadraticCurveTo(cxc, cyc, ex, ey);
      c.strokeStyle = "rgba(0,0,0,1)";
      c.lineWidth = s.baseWidth + 3;
      c.lineCap = "round";
      c.stroke();
    } else {
      // Sub-fibers for rope/twisted silk texture
      for (const f of s.fibers) {
        c.beginPath();
        c.moveTo(ox + f.dx * 0.3, oy + f.dy * 0.3);
        c.quadraticCurveTo(cxc + f.dx, cyc + f.dy, ex + f.dx * 0.6, ey + f.dy * 0.6);
        c.strokeStyle = `rgba(210,215,225,${0.25 * opacity})`;
        c.lineWidth = s.baseWidth * f.widthMul;
        c.lineCap = "round";
        c.stroke();
      }

      // Outer diffuse glow — silvery
      c.beginPath();
      c.moveTo(ox, oy);
      c.quadraticCurveTo(cxc, cyc, ex, ey);
      c.strokeStyle = `rgba(180,190,210,${0.06 * opacity})`;
      c.lineWidth = s.baseWidth + 5;
      c.lineCap = "round";
      c.stroke();

      // Main silk body — silvery white
      c.strokeStyle = `rgba(220,225,235,${0.6 * opacity})`;
      c.lineWidth = s.baseWidth;
      c.stroke();

      // Inner bright specular core
      c.strokeStyle = `rgba(245,248,255,${0.45 * opacity})`;
      c.lineWidth = Math.max(s.baseWidth * 0.2, 0.25);
      c.stroke();

      // Tip anchor — sticky splat
      if (t > 0.6) {
        const tipR = s.baseWidth * 0.4 + 0.6;
        c.beginPath();
        c.arc(ex, ey, tipR, 0, Math.PI * 2);
        c.fillStyle = `rgba(220,225,235,${0.35 * opacity})`;
        c.fill();
        // highlight on tip
        c.beginPath();
        c.arc(ex - tipR * 0.25, ey - tipR * 0.25, tipR * 0.4, 0, Math.PI * 2);
        c.fillStyle = `rgba(255,255,255,${0.5 * opacity})`;
        c.fill();
      }
    }
  }
}

function drawAllSpirals(
  c: CanvasRenderingContext2D, ox: number, oy: number,
  strands: Strand[], rings: number[], ringSag: number[],
  age: number, isShadow: boolean, opacity = 1
) {
  for (let ri = 0; ri < rings.length; ri++) {
    const ringT = rings[ri];
    const sag = ringSag[ri];

    for (let i = 0; i < strands.length; i++) {
      const s1 = strands[i];
      const s2 = strands[(i + 1) % strands.length];
      if (s1.progress < ringT + 0.04 || s2.progress < ringT + 0.04) continue;

      const [x1, y1] = strandPt(ox, oy, s1, ringT, age);
      const [x2, y2] = strandPt(ox, oy, s2, ringT, age);

      let ad = s2.angle - s1.angle;
      if (ad < 0) ad += Math.PI * 2;
      const midA = s1.angle + ad / 2;

      const sagX = Math.cos(midA) * sag;
      const sagY = Math.sin(midA) * sag + sag * 0.35;
      const cmx = (x1 + x2) / 2 + sagX;
      const cmy = (y1 + y2) / 2 + sagY;

      // Thicker inner rings, thinner outer (like real web)
      const ringW = 0.3 + (1 - ringT) * 0.5;

      c.beginPath();
      c.moveTo(x1, y1);
      c.quadraticCurveTo(cmx, cmy, x2, y2);
      c.lineCap = "round";

      if (isShadow) {
        c.strokeStyle = "rgba(0,0,0,1)";
        c.lineWidth = ringW + 2;
        c.stroke();
      } else {
        const rOp = opacity * (0.45 - ringT * 0.15);
        // Outer glow
        c.strokeStyle = `rgba(180,190,210,${0.04 * opacity})`;
        c.lineWidth = ringW + 3;
        c.stroke();
        // Silk body
        c.strokeStyle = `rgba(215,220,230,${rOp})`;
        c.lineWidth = ringW;
        c.stroke();
        // Specular core
        c.strokeStyle = `rgba(245,248,255,${rOp * 0.4})`;
        c.lineWidth = Math.max(ringW * 0.2, 0.15);
        c.stroke();
      }
    }
  }
}

function drawIntersections(
  c: CanvasRenderingContext2D, ox: number, oy: number,
  strands: Strand[], rings: number[], age: number, opacity: number
) {
  for (const ringT of rings) {
    for (const s of strands) {
      if (s.progress < ringT + 0.04) continue;
      const [x, y] = strandPt(ox, oy, s, ringT, age);
      const r = 0.9 + (1 - ringT) * 0.6;

      // Glue droplet with specular highlight
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      const dg = c.createRadialGradient(x - r * 0.3, y - r * 0.35, 0, x, y, r);
      dg.addColorStop(0, `rgba(255,255,255,${0.8 * opacity})`);
      dg.addColorStop(0.35, `rgba(230,235,245,${0.4 * opacity})`);
      dg.addColorStop(1, `rgba(200,205,220,${0})`);
      c.fillStyle = dg;
      c.fill();
    }
  }
}

export default function WebClickEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeBursts = useRef<ReturnType<typeof spawnWeb>[]>([]);
  const running = useRef(false);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      cvs.width = window.innerWidth * dpr;
      cvs.height = window.innerHeight * dpr;
      cvs.style.width = window.innerWidth + "px";
      cvs.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const loop = () => {
      if (activeBursts.current.length === 0) { running.current = false; return; }
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      activeBursts.current = activeBursts.current.filter((draw) => draw());
      if (activeBursts.current.length > 0) {
        requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        running.current = false;
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-no-web]")) return;

      resize();
      playThwip();
      activeBursts.current = [];
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      activeBursts.current.push(spawnWeb(ctx, e.clientX, e.clientY));

      if (!running.current) {
        running.current = true;
        requestAnimationFrame(loop);
      }
    };

    window.addEventListener("click", onClick);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[99] pointer-events-none"
    />
  );
}
