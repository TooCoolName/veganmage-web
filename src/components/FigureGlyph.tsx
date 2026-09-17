import mageMainUrl from "../assets/mage-main.svg";
import { cn } from "../lib/utils";

export function FigureGlyph({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block bg-current", className)}
      style={{
        maskImage: `url(${mageMainUrl})`,
        WebkitMaskImage: `url(${mageMainUrl})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}
