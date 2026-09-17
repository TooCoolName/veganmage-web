export type ThemeName = "light" | "dark";

export function currentTheme(): ThemeName {
  return document.documentElement.getAttribute("data-theme") === "custom-dark" ? "dark" : "light";
}

/**
 * How far the pool has recolored green -> gold: 0 at the top and bottom of the
 * page (green water), 1 at mid-scroll (yellow water). Shared by the pool and
 * the Mage's orb so both stay in lockstep.
 */
export function readPoolScroll(): number {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  const p = clamp01(window.scrollY / max);
  // hold green for the first/last 10% of the scroll, then ease the middle
  const q = clamp01((p - 0.1) / 0.8);
  return Math.sin(q * Math.PI);
}

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** smooth 0..1 ramp between `lo` and `hi` */
export function smoothstep(lo: number, hi: number, x: number): number {
  const t = clamp01((x - lo) / (hi - lo));
  return t * t * (3 - 2 * t);
}

/**
 * Sample a three-stop gradient (`start -> mid -> end`) at scroll position `p`
 * (0..1). Returns the two adjacent stops plus the 0..1 mix between them.
 * Routing through a `mid` stop keeps a green -> lime -> gold walk vivid
 * instead of dragging through muddy olive the way a direct `start -> end`
 * RGB lerp does. Shared by the mana pool (`WATER`) and the Mage's plasma orb
 * (`MAGE_ORB_SCROLL`) so both hues stay in lockstep.
 */
export function scrollTriad<T>(
  p: number,
  start: T,
  mid: T,
  end: T,
): { from: T; to: T; k: number } {
  const m = clamp01(p);
  return m < 0.5
    ? { from: start, to: mid, k: m * 2 }
    : { from: mid, to: end, k: (m - 0.5) * 2 };
}
