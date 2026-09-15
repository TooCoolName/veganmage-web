import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { Flag } from "./Flag";
import { cn } from "../lib/utils";
import { changeLanguage, languages, type LanguageCode } from "../i18n";

export function LanguagePicker() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCode = (i18n.resolvedLanguage ?? i18n.language) as LanguageCode;
  const active = languages.find((language) => language.code === activeCode) ?? languages[0];

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectLanguage = (code: LanguageCode) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "relative rounded-full text-[11px] font-bold tracking-[0.14em] text-card-foreground transition-transform hover:scale-110 hover:text-primary active:scale-95",
        )}
        aria-label={t("common.chooseLanguage")}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {active.short}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            role="menu"
            aria-label={t("common.language")}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            className="absolute top-full right-0 z-40 mt-3 flex w-max flex-col gap-1 whitespace-nowrap rounded-2xl border border-border/60 bg-card/90 p-2 text-card-foreground shadow-xl backdrop-blur-xl"
          >
            {languages.map((language) => {
              const isActive = language.code === active.code;
              return (
                <li key={language.code} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={isActive}
                    onClick={() => selectLanguage(language.code)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted hover:text-primary",
                      isActive && "bg-primary/10 font-bold text-primary",
                    )}
                  >
                    <Flag
                      code={language.flag}
                      className="h-4 w-6 shrink-0 rounded-[3px] shadow-sm ring-1 ring-black/10"
                    />
                    <span>{language.label}</span>
                    {isActive && <Check className="ml-auto size-4" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
