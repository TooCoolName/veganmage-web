import { MageFigureLayer, type MageStation } from "./MageFigureLayer";
import { MagePoolBackground } from "./MagePoolBackground";
import { MageWeaveTrail } from "./MageWeaveTrail";

export type { MageStation };

/**
 * Backward-compat wrapper: pool water (z-0) + weave trail (z-2) + mage figure
 * (z-1) as independent canvases. All palette lives in `./colors`: water in
 * `WATER`, weaves in `WEAVE`, the Mage's dots in `MAGE_DOTS` and its orb in
 * `MAGE_ORB`/`MAGE_ORB_SCROLL`.
 */
export function MageFigureField({ stations }: { stations?: MageStation[] }) {
  return (
    <>
      <MagePoolBackground />
      <MageFigureLayer stations={stations} />
      <MageWeaveTrail />
    </>
  );
}
