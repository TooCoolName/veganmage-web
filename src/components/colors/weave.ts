import type { ThemeName } from "./theme";

/**
 * Cursor weave trail: the green/gold braid drawn by `MageWeaveTrail`.
 * Independent of the pool and the Mage's orb.
 */
export const WEAVE = {
  light: {
    strand: "#5ccf8a", // green weave strand
    strandAccent: "#e0a800", // gold weave strand (darker for light)
    additive: false, // additive glow blending
  },
  dark: {
    strand: "#17a750", // green weave strand, matches dark --primary
    strandAccent: "#d9a100", // gold weave strand (darker for dark)
    additive: true, // additive glow blending
  },
} as const satisfies Record<ThemeName, { strand: string; strandAccent: string; additive: boolean }>;
