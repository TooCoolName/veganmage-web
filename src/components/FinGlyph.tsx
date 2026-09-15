import magefinUrl from "../assets/magefin.svg";
import { cn } from "../lib/utils";

export function FinGlyph({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block bg-current", className)}
      style={{
        maskImage: `url(${magefinUrl})`,
        WebkitMaskImage: `url(${magefinUrl})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}
