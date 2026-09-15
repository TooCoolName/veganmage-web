export const PALETTE = {
  light: {
    a: "#5ccf8a", // pool dust/mote color (shader uColorA)
    b: "#ffc81e", // secondary gold accent (reserved)
    cursorA: "#5ccf8a", // mouse weave strand green
    cursorB: "#e0a800", // mouse weave strand gold (darker for light)
    mageA: "#17a55c", // Mage dot cloud: primary green
    mageB: "#ffc81e", // Mage dot cloud: secondary gold
    mageC: "#fff4c2", // Mage dot cloud: highlight/white
    additive: false, // additive glow blending (false = normal dye)
    veins: true, // dye caustics toward glow instead of adding
    mageIntensity: 1, // Mage dot cloud brightness
    bgTop: "#fafdfb", // pool background: top
    bgBottom: "#f3f9f5", // pool background: bottom
    causticDensity: 0.75, // caustic frequency (higher = more/smaller shapes)
    causticSharp: 7, // caustic edge falloff (higher = thinner veins)
    glow: "#5fd894", // caustic glow color
    strength: 0.7, // caustic glow intensity
    wash: 0, // whole-surface mix toward glow (0 = veins only)
  },
  dark: {
    a: "#7ddba0", // pool dust/mote color (shader uColorA)
    b: "#ffe08a", // secondary gold accent (reserved)
    cursorA: "#17a750", // mouse weave strand green, matches dark --primary
    cursorB: "#d9a100", // mouse weave strand gold (darker for dark)
    mageA: "#7ddba0", // Mage dot cloud: primary green
    mageB: "#ffe08a", // Mage dot cloud: secondary gold
    mageC: "#fff4cf", // Mage dot cloud: highlight/white
    additive: true, // additive glow blending (true = light adds up)
    veins: false, // dye caustics toward glow instead of adding
    mageIntensity: 0.5, // Mage dot cloud brightness
    bgTop: "#45564a", // pool background: top
    bgBottom: "#36443b", // pool background: bottom
    causticDensity: 0.75, // caustic frequency (higher = more/smaller shapes)
    causticSharp: 7, // caustic edge falloff (higher = thinner veins)
    glow: "#5fdd94", // caustic glow color
    strength: 0.55, // caustic glow intensity
    wash: 0, // whole-surface mix toward glow (0 = veins only)
  },
} as const;

export type ThemeName = keyof typeof PALETTE;

/**
 * Scroll destination for the pool water: yellow/black.
 * The pool lerps base PALETTE -> SCROLL_GOLD -> base as the page
 * scrolls top -> middle -> bottom, directly on the shader uniforms
 * (no overlay on top).
 */
export const SCROLL_GOLD = {
  light: {
    bgTop: "#fffefb", // pool background: top
    bgBottom: "#fffdf2", // pool background: bottom
    glow: "#fce94f", // caustic glow color
    a: "#fce94f", // pool dust/mote color
    strength: 1.0, // caustic glow intensity
    wash: 0, // whole-surface mix toward glow
  },
  dark: {
    bgTop: "#5a5036", // pool background: top
    bgBottom: "#3a3524", // pool background: bottom
    glow: "#ffdf7a", // caustic glow color
    a: "#e8c257", // pool dust/mote color
    strength: 0.55, // caustic glow intensity
    wash: 0, // whole-surface mix toward glow
  },
} as const satisfies Record<
  ThemeName,
  { bgTop: string; bgBottom: string; glow: string; a: string; strength: number; wash: number }
>;

/**
 * Midpoint for the scroll recolor: saturated lime between green and gold.
 * Base -> MID -> GOLD stays vivid (green + yellow) instead of dragging
 * through muddy olive the way a direct RGB lerp does.
 */
export const SCROLL_MID = {
  light: {
    bgTop: "#fffefd", // pool background: top
    bgBottom: "#fffef6", // pool background: bottom
    glow: "#fdf5b8", // caustic glow color
    a: "#fdf5b8", // pool dust/mote color
    strength: 0.7, // caustic glow intensity
    wash: 0, // whole-surface mix toward glow
  },
  dark: {
    bgTop: "#3d4a40", // pool background: top
    bgBottom: "#333f37", // pool background: bottom
    glow: "#9fce7e", // caustic glow color
    a: "#9fce7e", // pool dust/mote color
    strength: 0.4, // caustic glow intensity
    wash: 0, // whole-surface mix toward glow
  },
} as const satisfies Record<
  ThemeName,
  { bgTop: string; bgBottom: string; glow: string; a: string; strength: number; wash: number }
>;

export function currentTheme(): ThemeName {
  return document.documentElement.getAttribute("data-theme") === "custom-dark" ? "dark" : "light";
}

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** clamp with a soft edge, so the Mage keeps a little parallax at the bounds */
export function soft(v: number, lo: number, hi: number): number {
  if (v < lo) return lo + (v - lo) * 0.3;
  if (v > hi) return hi + (v - hi) * 0.3;
  return v;
}
