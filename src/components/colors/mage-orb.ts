import type { ThemeName } from "./theme";

/**
 * Mage plasma orb shell ("bubble"): the glass tint and the silhouette ink that
 * `MageFigureLayer` composites behind the plasma. Consumed together with
 * `MAGE_ORB_SCROLL`.
 *
 * The backing is a direct per-theme color, so the orb background is explicit
 * and can never fall back to the other theme's glass:
 * - `glass` is the ball's own opaque backing. Light floats the plasma on a
 *   near-white green; dark sinks it into a near-black tint, so the orb never
 *   shows the pool behind it.
 * - `ink` + `inkAmount` decide what the Mage's silhouette blends toward.
 *   Light inks the figure white so it glows out of the glass; dark inks it
 *   black so it sinks in.
 * - `veil` washes the churn over the figure on top of that ink (light: high,
 *   so the figure reads through white; dark: low, so it stays submerged).
 */
export const MAGE_ORB = {
  light: {
    glass: "#f2fbf5", // near-white green backing so plasma reads as green on light
    ink: "#ffffff", // silhouette inks white so the figure glows out of the glass
    inkAmount: 0.9, // how strongly the silhouette inks over the glass
    veil: 0.85, // how far the plasma is washed to the ink over the figure
  },
  dark: {
    glass: "#0a120d", // near-black green backing so the orb stays a dark world
    ink: "#000000", // silhouette inks black so the figure sinks into the glass
    inkAmount: 0.86, // how strongly the silhouette inks over the glass
    veil: 0.28, // dim the plasma over the figure so it stays submerged
  },
} as const satisfies Record<
  ThemeName,
  { glass: string; ink: string; inkAmount: number; veil: number }
>;

/** one plasma-body / filament / rim colour set for a single scroll stop */
export type OrbStop = { main: string; accent: string; highlight: string };

/**
 * Plasma orb colour, customisable independently of the dot cloud
 * (`MAGE_DOTS`). The palette walks `green -> mid -> yellow` in step with the
 * mana pool's own scroll recolor (`scrollTriad`), so the ball is green over
 * green water and yellow over yellow water. Every stop carries its own `main`
 * (plasma body), `accent` (hot filaments) and `highlight` (rim/specular), and
 * the light/dark stops are tuned per theme, so the ball stays monochrome —
 * green plasma reads green-on-black, yellow plasma reads yellow-on-black,
 * never one hue polluted with another.
 */
export const MAGE_ORB_SCROLL = {
  light: {
    green: { main: "#7fd6a2", accent: "#4ec77c", highlight: "#ffffff" },
    mid: { main: "#b7dd6a", accent: "#8ab648", highlight: "#f2fbdc" },
    yellow: { main: "#d4e37a", accent: "#b6c93e", highlight: "#f6fbc6" },
  },
  dark: {
    green: { main: "#5ecb88", accent: "#3f9e68", highlight: "#c6f5da" },
    mid: { main: "#d5e089", accent: "#a9b44b", highlight: "#f1f6c8" },
    yellow: { main: "#ffdf7a", accent: "#ffe08a", highlight: "#fff4cf" },
  },
} as const satisfies Record<ThemeName, Record<"green" | "mid" | "yellow", OrbStop>>;
