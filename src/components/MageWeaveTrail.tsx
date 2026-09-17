import { useEffect, useRef } from "react";
import { cn } from "../lib/utils";
import { WEAVE } from "./colors/weave";
import { clamp01, currentTheme } from "./colors/theme";

/** lifetime of one fading path sample, in seconds */
const RIBBON_LIFE = 0.7;
/** cap on the fading braid behind the cursor */
const MAX_RIBBON = 64;
/** px between path samples, so a slow drag stays smooth */
const RIBBON_STEP = 2.2;
/** how many strands weave/cross along the trail */
const STRANDS = 3;
/** side-to-side spread of the braid, in px */
const WEAVE_AMPLITUDE = 14;
/** spatial tightness of the crossing pattern */
const WEAVE_FREQ = 0.045;
/** how fast the crossing pattern flows along the trail */
const WEAVE_SPEED = 7;
/** base radius of the sigil ring */
const SIGIL_RADIUS = 17;
/** cap on drifting dust motes, so a fast flick can't flood the canvas */
const MAX_DUST = 260;

const TAU = Math.PI * 2;

type Rgb = { r: number; g: number; b: number };
type TrailPt = { x: number; y: number; t: number };
type Dust = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  tint: number;
};

const GLYPHS = ["triangle", "square", "star", "circle"] as const;
type Glyph = (typeof GLYPHS)[number];

/** edges per shape — drives how many ticks cross the sigil's outer ring */
const EDGES: Record<Glyph, number> = {
  triangle: 3,
  square: 4,
  star: 5,
  circle: 2,
};

function toRgb(hex: string): Rgb {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgba(c: Rgb, a: number): string {
  return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${a})`;
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

type Strand = {
  f1: number;
  s1: number;
  p1: number;
  f2: number;
  s2: number;
  p2: number;
  a2: number;
  amp: number;
};

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let x = Math.imul(s ^ (s >>> 15), s | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** one-off random wavelengths/speeds per strand, so the braid never looks even */
function buildStrands(): Strand[] {
  const rnd = mulberry32(0x5a17);
  const out: Strand[] = [];
  for (let s = 0; s < STRANDS; s++) {
    out.push({
      f1: WEAVE_FREQ * (0.7 + rnd() * 1.3),
      s1: WEAVE_SPEED * (0.6 + rnd() * 1.1),
      p1: rnd() * TAU,
      f2: WEAVE_FREQ * (1.8 + rnd() * 2.6),
      s2: WEAVE_SPEED * (0.4 + rnd() * 1.4),
      p2: rnd() * TAU,
      a2: 0.3 + rnd() * 0.5,
      amp: 0.7 + rnd() * 0.7,
    });
  }
  return out;
}

/**
 * Mage cursor: an arcane sigil that spins on movement and scroll, with a
 * click-randomized triangle/square/star glyph, drifting dust, and a green/gold
 * braid of three strands crossing over each other as they fade off the path.
 * Owns its own transparent canvas, independent of the pool.
 */
export function MageWeaveTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.body.classList.add("mage-cursor-hidden");

    let w = window.innerWidth;
    let h = window.innerHeight;

    const head = { x: w / 2, y: h / 2 };
    const prevHead = { x: head.x, y: head.y };
    const target = { x: head.x, y: head.y };
    let hasPointer = false;
    let active = 0;
    let activeTarget = 0;
    let speed = 0;
    let last = performance.now();
    let pop = 0;
    let glyph: Glyph = "star";
    let scrollSpin = 0;
    let scrollSpeed = 0;
    let lastScrollY = window.scrollY;

    const dust: Dust[] = [];
    let dustAcc = 0;

    const addDust = (x: number, y: number, vx: number, vy: number, size: number) => {
      if (dust.length >= MAX_DUST) return;
      dust.push({
        x,
        y,
        vx,
        vy,
        life: 0,
        max: 0.4 + Math.random() * 0.7,
        size,
        tint: Math.random(),
      });
    };

    let colA = toRgb(WEAVE[currentTheme()].strand);
    let colB = toRgb(WEAVE[currentTheme()].strandAccent);
    let tgtA = { ...colA };
    let tgtB = { ...colB };
    let additive = WEAVE[currentTheme()].additive;
    let light = currentTheme() === "light";

    const observer = new MutationObserver(() => {
      const pal = WEAVE[currentTheme()];
      tgtA = toRgb(pal.strand);
      tgtB = toRgb(pal.strandAccent);
      additive = pal.additive;
      light = currentTheme() === "light";
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const layout = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    layout();

    const onPointer = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!hasPointer) {
        hasPointer = true;
        head.x = target.x;
        head.y = target.y;
        prevHead.x = head.x;
        prevHead.y = head.y;
      }
      activeTarget = 1;
    };
    const onLeave = () => {
      activeTarget = 0;
    };
    const onDown = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const others = GLYPHS.filter((g) => g !== glyph);
      glyph = others[Math.floor(Math.random() * others.length)];
      pop = 1;
      for (let k = 0; k < 16; k++) {
        const ang = Math.random() * TAU;
        const sp = 40 + Math.random() * 150;
        addDust(head.x, head.y, Math.cos(ang) * sp, Math.sin(ang) * sp, 1 + Math.random() * 2.2);
      }
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", layout);
    window.addEventListener("blur", onLeave);
    document.documentElement.addEventListener("mouseleave", onLeave);

    const ribbon: TrailPt[] = [];
    const arc = new Float64Array(MAX_RIBBON);
    const tanX = new Float64Array(MAX_RIBBON);
    const tanY = new Float64Array(MAX_RIBBON);
    const sx = new Float64Array(MAX_RIBBON);
    const sy = new Float64Array(MAX_RIBBON);
    const strands = buildStrands();

    /** three strands offset perpendicular to the path, weaving as they fade */
    const drawWeave = (rt: number) => {
      const n = ribbon.length;
      if (n < 2) return;

      arc[0] = 0;
      for (let i = 1; i < n; i++) {
        arc[i] =
          arc[i - 1] + Math.hypot(ribbon[i].x - ribbon[i - 1].x, ribbon[i].y - ribbon[i - 1].y);
      }

      let ltx = 1;
      let lty = 0;
      for (let i = 0; i < n; i++) {
        const a = ribbon[i > 0 ? i - 1 : 0];
        const b = ribbon[i < n - 1 ? i + 1 : n - 1];
        let tx = b.x - a.x;
        let ty = b.y - a.y;
        const len = Math.hypot(tx, ty);
        if (len < 1e-4) {
          tx = ltx;
          ty = lty;
        } else {
          tx /= len;
          ty /= len;
          ltx = tx;
          lty = ty;
        }
        tanX[i] = tx;
        tanY[i] = ty;
      }

      for (let s = 0; s < STRANDS; s++) {
        const color = s % 2 === 0 ? colA : colB;
        const sh = strands[s];
        const norm = 1 / (1 + sh.a2);
        for (let i = 0; i < n; i++) {
          const age = clamp01((rt - ribbon[i].t) / RIBBON_LIFE);
          const env = Math.sin(Math.PI * age);
          const wave =
            Math.sin(arc[i] * sh.f1 + rt * sh.s1 + sh.p1) +
            sh.a2 * Math.sin(arc[i] * sh.f2 + rt * sh.s2 + sh.p2);
          const off = WEAVE_AMPLITUDE * sh.amp * env * wave * norm;
          sx[i] = ribbon[i].x - tanY[i] * off;
          sy[i] = ribbon[i].y + tanX[i] * off;
        }
        for (let i = 1; i < n; i++) {
          const k = 1 - clamp01((rt - ribbon[i].t) / RIBBON_LIFE);
          const a = k * k;
          ctx.beginPath();
          ctx.moveTo(sx[i - 1], sy[i - 1]);
          ctx.lineTo(sx[i], sy[i]);
          ctx.lineWidth = 0.8 + k * 4.5;
          ctx.strokeStyle = rgba(color, a * 0.14);
          ctx.stroke();
          ctx.lineWidth = 0.6 + k * 1.7;
          ctx.strokeStyle = rgba(color, a * 0.8);
          ctx.stroke();
        }
      }
    };

    /** centre glyph: triangle, square, star, or circle — changed on each click */
    const drawGlyph = (rot: number, radius: number) => {
      const g = radius * (1 + pop * 0.3);
      const color = light ? colB : colA;
      ctx.beginPath();
      if (glyph === "circle") {
        ctx.arc(head.x, head.y, g, 0, TAU);
      } else {
        const verts: number[] = [];
        if (glyph === "square") {
          for (let k = 0; k < 4; k++) {
            const a = rot + Math.PI / 4 + (k * TAU) / 4;
            verts.push(head.x + Math.cos(a) * g, head.y + Math.sin(a) * g);
          }
        } else if (glyph === "triangle") {
          for (let k = 0; k < 3; k++) {
            const a = rot - Math.PI / 2 + (k * TAU) / 3;
            verts.push(head.x + Math.cos(a) * g, head.y + Math.sin(a) * g);
          }
        } else {
          for (let k = 0; k < 10; k++) {
            const a = rot - Math.PI / 2 + (k * TAU) / 10;
            const r = k % 2 === 0 ? g : g * 0.44;
            verts.push(head.x + Math.cos(a) * r, head.y + Math.sin(a) * r);
          }
        }
        ctx.moveTo(verts[0], verts[1]);
        for (let i = 2; i < verts.length; i += 2) ctx.lineTo(verts[i], verts[i + 1]);
        ctx.closePath();
      }
      ctx.fillStyle = rgba(color, 0.12);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = rgba(color, 0.16);
      ctx.stroke();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = rgba(color, 0.95);
      ctx.stroke();
    };

    /** the cursor: an arcane sigil that spins on movement and on scroll */
    const drawSigil = (rt: number) => {
      const boost = clamp01(speed / 1400 + scrollSpeed / 3000);
      const R = SIGIL_RADIUS * (1 + boost * 0.2);
      const outer = rt * (0.28 + boost * 1.1) + scrollSpin * 0.7;
      const inner = -(rt * (0.42 + boost * 1.5)) - scrollSpin * 1;
      const pulse = 0.65 + 0.35 * Math.sin(rt * 3.2);
      const ring = light ? colA : colB;

      ctx.beginPath();
      ctx.arc(head.x, head.y, R, 0, TAU);
      ctx.lineWidth = 5;
      ctx.strokeStyle = rgba(ring, 0.1);
      ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = rgba(ring, 0.9);
      ctx.stroke();

      const ticks = EDGES[glyph];
      for (let k = 0; k < ticks; k++) {
        const ang = outer + (k * TAU) / ticks;
        const c = Math.cos(ang);
        const s = Math.sin(ang);
        const long = k % 3 === 0;
        const r0 = R * (long ? 0.82 : 0.9);
        const r1 = R * (long ? 1.2 : 1.08);
        const color = k % 2 === 0 ? colA : colB;
        ctx.beginPath();
        ctx.moveTo(head.x + c * r0, head.y + s * r0);
        ctx.lineTo(head.x + c * r1, head.y + s * r1);
        ctx.lineWidth = long ? 1.9 : 1.1;
        ctx.strokeStyle = rgba(color, long ? 0.95 : 0.7);
        ctx.stroke();
      }

      drawGlyph(outer * 1.2 + inner * 0.2, R * 0.62);

      const core = 2.4 + pulse * 1.6 + boost * 1.2;
      const coreCol = light ? colA : colB;
      ctx.beginPath();
      ctx.arc(head.x, head.y, core * 2.6, 0, TAU);
      ctx.fillStyle = rgba(coreCol, 0.12 * pulse);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(head.x, head.y, core, 0, TAU);
      ctx.fillStyle = rgba(coreCol, 0.95);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(head.x, head.y, core * 0.45, 0, TAU);
      ctx.fillStyle = rgba({ r: 255, g: 255, b: 255 }, 0.85);
      ctx.fill();
    };

    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      prevHead.x = head.x;
      prevHead.y = head.y;
      const follow = 1 - Math.exp(-dt * 20);
      head.x += (target.x - head.x) * follow;
      head.y += (target.y - head.y) * follow;

      const moved = Math.hypot(head.x - prevHead.x, head.y - prevHead.y);
      speed += (moved / Math.max(dt, 1 / 120) - speed) * (1 - Math.exp(-dt * 8));
      active += (activeTarget - active) * (1 - Math.exp(-dt * 4));

      const sy = window.scrollY;
      const sd = sy - lastScrollY;
      lastScrollY = sy;
      scrollSpeed += (Math.abs(sd) / Math.max(dt, 1 / 120) - scrollSpeed) * (1 - Math.exp(-dt * 8));
      scrollSpin += sd * 0.0004;
      pop += (0 - pop) * (1 - Math.exp(-dt * 6));

      const fast = clamp01((speed - 30) / 900);
      dustAcc += dt * (fast * fast * 90 + clamp01((scrollSpeed - 60) / 2000) * 45);
      if (dustAcc > 1 && (moved > 0.3 || Math.abs(sd) > 1)) {
        const dirLen = Math.hypot(head.x - prevHead.x, head.y - prevHead.y) || 1;
        const dirX = (head.x - prevHead.x) / dirLen;
        const dirY = (head.y - prevHead.y) / dirLen;
        while (dustAcc >= 1 && dust.length < MAX_DUST) {
          dustAcc -= 1;
          const base = moved > 0.3 ? Math.atan2(-dirY, -dirX) : Math.random() * TAU;
          const ang = base + (Math.random() - 0.5) * 1.8;
          const sp = 12 + Math.random() * 60 * (0.4 + fast * 0.6);
          addDust(
            head.x + (Math.random() - 0.5) * 6,
            head.y + (Math.random() - 0.5) * 6,
            Math.cos(ang) * sp + (Math.random() - 0.5) * 16,
            Math.sin(ang) * sp + (Math.random() - 0.5) * 16 - 5,
            0.8 + Math.random() * 2,
          );
        }
      }
      if (dustAcc > 1) dustAcc = 0;

      const drag = Math.exp(-dt * 2.4);
      for (let i = dust.length - 1; i >= 0; i--) {
        const d = dust[i];
        d.life += dt;
        if (d.life >= d.max) {
          dust.splice(i, 1);
          continue;
        }
        d.vx *= drag;
        d.vy = d.vy * drag - 8 * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
      }

      const rt = now / 1000;
      const tail = ribbon[0];
      if (!tail || Math.hypot(head.x - tail.x, head.y - tail.y) > RIBBON_STEP) {
        ribbon.unshift({ x: head.x, y: head.y, t: rt });
        if (ribbon.length > MAX_RIBBON) ribbon.pop();
      } else {
        tail.x = head.x;
        tail.y = head.y;
        tail.t = rt;
      }
      while (ribbon.length > 0 && rt - ribbon[ribbon.length - 1].t > RIBBON_LIFE) {
        ribbon.pop();
      }

      const cl = 1 - Math.exp(-dt * 3);
      colA = mix(colA, tgtA, cl);
      colB = mix(colB, tgtB, cl);

      ctx.clearRect(0, 0, w, h);
      if (!hasPointer || active < 0.02) return;

      ctx.globalCompositeOperation = additive ? "lighter" : "source-over";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = active;

      drawWeave(rt);

      for (let i = 0; i < dust.length; i++) {
        const d = dust[i];
        const k = 1 - d.life / d.max;
        const color = mix(colA, colB, d.tint);
        const r = d.size * (0.3 + k * 0.7);
        if (d.size > 1.8) {
          ctx.beginPath();
          ctx.arc(d.x, d.y, r * 2.4, 0, TAU);
          ctx.fillStyle = rgba(color, k * k * 0.1);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, TAU);
        ctx.fillStyle = rgba(color, k * k * 0.85);
        ctx.fill();
      }

      drawSigil(rt);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", layout);
      window.removeEventListener("blur", onLeave);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      document.body.classList.remove("mage-cursor-hidden");
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("mage-weave pointer-events-none fixed inset-0 z-[60] size-full")}
    />
  );
}
