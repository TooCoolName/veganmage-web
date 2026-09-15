import { MageFinLayer, type MageStation } from "./MageFinLayer";
import { MagePoolBackground } from "./MagePoolBackground";
import { MageWeaveTrail } from "./MageWeaveTrail";

export type { MageStation };

/**
 * Backward-compat wrapper: pool water (z-0) + weave trail (z-2) + mage fin
 * (z-1) as independent canvases. Edit colors in MagePoolBackground (water),
 * MageFinLayer (mage), or MageWeaveTrail (green/gold mouse weaves).
 */
export function MageFinField({ stations }: { stations?: MageStation[] }) {
  return (
    <>
      <MagePoolBackground />
      <MageFinLayer stations={stations} />
      <MageWeaveTrail />
    </>
  );
}
