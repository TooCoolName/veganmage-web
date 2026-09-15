import { useId } from "react";

export type FlagCode = "gb" | "cz";

interface FlagProps {
  code: FlagCode;
  className?: string;
}

export function Flag({ code, className }: FlagProps) {
  const clipId = `flag-${useId().replace(/:/g, "")}`;

  if (code === "cz") {
    return (
      <svg viewBox="0 0 60 40" className={className} aria-hidden focusable="false">
        <rect width="60" height="20" fill="#fff" />
        <rect y="20" width="60" height="20" fill="#d7141a" />
        <polygon points="0,0 30,20 0,40" fill="#11457e" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden focusable="false">
      <clipPath id={clipId}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#00247d" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        clipPath={`url(#${clipId})`}
        stroke="#cf142b"
        strokeWidth="4"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6" />
    </svg>
  );
}
