import type { ThemeName } from "./theme";

/**
 * Mage dot cloud: the swarm of points that gathers into the plasma orb.
 * Consumed by `MageFigureLayer` only (shader uniforms uColorA/B/C, uIntensity).
 */
export const MAGE_DOTS = {
  light: {
    primary: "#17a55c", // primary green
    accent: "#ffc81e", // secondary gold
    highlight: "#fff4c2", // highlight/white
    additive: false, // additive glow blending (false = normal dye)
    intensity: 1, // dot cloud brightness
  },
  dark: {
    primary: "#7ddba0", // primary green
    accent: "#ffe08a", // secondary gold
    highlight: "#fff4cf", // highlight/white
    additive: true, // additive glow blending (true = light adds up)
    intensity: 0.5, // dot cloud brightness
  },
} as const satisfies Record<
  ThemeName,
  {
    primary: string;
    accent: string;
    highlight: string;
    additive: boolean;
    intensity: number;
  }
>;
