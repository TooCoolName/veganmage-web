import type { ThemeName } from "./theme";

/**
 * Mana pool water: caustics, dust motes, ripple/void colors and the base
 * background. Consumed by `MagePoolBackground` only.
 */
export const WATER = {
  light: {
    dust: "#5ccf8a", // drifting dust/mote color (shader uColorA)
    dustAccent: "#ffc81e", // secondary gold accent (reserved)
    additive: false, // additive glow blending (false = normal dye)
    veins: true, // dye caustics toward glow instead of adding
    bgTop: "#fafdfb", // pool background: top
    bgBottom: "#f3f9f5", // pool background: bottom
    causticDensity: 0.75, // caustic frequency (higher = more/smaller shapes)
    causticSharp: 7, // caustic edge falloff (higher = thinner veins)
    glow: "#5fd894", // caustic glow color
    strength: 0.7, // caustic glow intensity
    wash: 0, // whole-surface mix toward glow (0 = veins only)
    voidColor: "#ddf3e6", // cosmic void core the Mage's release burns into (pale green)
    voidStrength: 0.9, // how fully a release erases the water
  },
  dark: {
    dust: "#7ddba0", // drifting dust/mote color (shader uColorA)
    dustAccent: "#ffe08a", // secondary gold accent (reserved)
    additive: true, // additive glow blending (true = light adds up)
    veins: false, // dye caustics toward glow instead of adding
    bgTop: "#45564a", // pool background: top
    bgBottom: "#36443b", // pool background: bottom
    causticDensity: 0.75, // caustic frequency (higher = more/smaller shapes)
    causticSharp: 7, // caustic edge falloff (higher = thinner veins)
    glow: "#5fdd94", // caustic glow color
    strength: 0.55, // caustic glow intensity
    wash: 0, // whole-surface mix toward glow (0 = veins only)
    voidColor: "#03100a", // cosmic void core the Mage's release burns into
    voidStrength: 0.82, // how fully a release erases the water
  },
} as const;

export type WaterScrollStop = {
  bgTop: string;
  bgBottom: string;
  glow: string;
  dust: string;
  strength: number;
  wash: number;
};

/**
 * Scroll destination for the pool water: yellow/black.
 * The pool lerps base WATER -> WATER_SCROLL_GOLD -> base as the page
 * scrolls top -> middle -> bottom, directly on the shader uniforms
 * (no overlay on top).
 */
export const WATER_SCROLL_GOLD = {
  light: {
    bgTop: "#fffefb", // pool background: top
    bgBottom: "#fffdf2", // pool background: bottom
    glow: "#fce94f", // caustic glow color
    dust: "#fce94f", // drifting dust/mote color
    strength: 1.0, // caustic glow intensity
    wash: 0, // whole-surface mix toward glow
  },
  dark: {
    bgTop: "#5a5036", // pool background: top
    bgBottom: "#3a3524", // pool background: bottom
    glow: "#ffdf7a", // caustic glow color
    dust: "#e8c257", // drifting dust/mote color
    strength: 0.55, // caustic glow intensity
    wash: 0, // whole-surface mix toward glow
  },
} as const satisfies Record<ThemeName, WaterScrollStop>;

/**
 * Midpoint for the scroll recolor: saturated lime between green and gold.
 * Base -> MID -> GOLD stays vivid (green + yellow) instead of dragging
 * through muddy olive the way a direct RGB lerp does.
 */
export const WATER_SCROLL_MID = {
  light: {
    bgTop: "#fffefd", // pool background: top
    bgBottom: "#fffef6", // pool background: bottom
    glow: "#fdf5b8", // caustic glow color
    dust: "#fdf5b8", // drifting dust/mote color
    strength: 0.7, // caustic glow intensity
    wash: 0, // whole-surface mix toward glow
  },
  dark: {
    bgTop: "#3d4a40", // pool background: top
    bgBottom: "#333f37", // pool background: bottom
    glow: "#9fce7e", // caustic glow color
    dust: "#9fce7e", // drifting dust/mote color
    strength: 0.4, // caustic glow intensity
    wash: 0, // whole-surface mix toward glow
  },
} as const satisfies Record<ThemeName, WaterScrollStop>;
