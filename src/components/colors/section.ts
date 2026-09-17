import type { ThemeName } from "./theme";

/**
 * Section scene background: nebula and particle hues shared by every
 * `SectionScene` variant. Hardcoded hex rather than CSS tokens because
 * `THREE.Color` cannot parse the `oklch()` custom properties from
 * `getComputedStyle`.
 */
export const SECTION = {
  light: { primary: "#2eb45c", accent: "#c98a00" },
  dark: { primary: "#2fd06f", accent: "#ffd000" },
} as const satisfies Record<ThemeName, { primary: string; accent: string }>;
