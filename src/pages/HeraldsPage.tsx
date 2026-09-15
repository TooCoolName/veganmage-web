import { Suspense, lazy, useEffect, useMemo, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, BookOpen, Globe2, MessagesSquare, ScrollText } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { DiscordIcon } from "../components/DiscordIcon";
import { FinGlyph } from "../components/FinGlyph";
import type { MageStation } from "../components/MageFinField";
import { heraldSites, type Herald } from "../generated/heralds";

const discordUrl = "https://discord.gg/3VjKKfF5As";

const MageFinField = lazy(() =>
  import("../components/MageFinField").then((m) => ({
    default: m.MageFinField,
  })),
);

const rise: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.12 * i,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

function HeraldList({ heralds }: { heralds: Herald[] }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.3em] text-muted-foreground uppercase">
        <ScrollText className="size-3.5 shrink-0 text-primary" />
        {t("heralds.postAndComments")}
      </p>
      <div className="space-y-2">
        {heralds.map((herald) => (
          <div
            key={herald.file}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3"
          >
            <span className="text-sm font-semibold">{herald.name}</span>
            <Badge variant="outline" className="shrink-0 border-primary/30 text-primary">
              {herald.version}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeraldsPage() {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.title = t("nav.heralds");
  }, [t]);

  // The Mage surfaces once, over the hero, then drifts back into the pool.
  const stations = useMemo<MageStation[]>(
    () => [
      {
        ref: heroRef,
        at: { x: 0.76, y: 0.42 },
        scale: 1,
        hold: { up: 0.2, down: 0.45 },
      },
    ],
    [],
  );

  return (
    <div className="grain relative">
      <Suspense fallback={null}>
        <MageFinField stations={stations} />
      </Suspense>

      <div className="relative z-10 space-y-16 pb-16 md:space-y-24 md:pb-24">
        {/* ─── Hero (bare copy over the pool) ─────────────────── */}
        <section
          ref={heroRef}
          className="relative flex min-h-[48svh] flex-col justify-center py-10 md:py-16"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={rise}
            className="flex flex-col items-start gap-6"
          >
            <p className="flex items-center gap-4 text-[11px] font-semibold tracking-[0.35em] text-muted-foreground uppercase">
              <FinGlyph className="size-4 shrink-0 text-primary" />
              {t("heralds.badge")}
            </p>
            <h1 className="font-display max-w-4xl text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.95] font-light tracking-[-0.025em] text-balance">
              {t("heralds.title")}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {t("heralds.body")}
            </p>
          </motion.div>
        </section>

        {/* ─── Supported websites ──────────────────────────────── */}
        <section aria-labelledby="supported-domains" className="relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={rise}
            className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-4 text-[11px] font-semibold tracking-[0.35em] text-muted-foreground uppercase">
                <span className="h-px w-12 bg-primary/60" />
                {t("heralds.whereCaptureWorks")}
              </p>
              <h2
                id="supported-domains"
                className="font-display text-4xl leading-[0.95] font-light tracking-tight text-balance md:text-6xl"
              >
                {t("heralds.supportedWebsites")}
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {t("heralds.unsupportedNote")}
              </p>
            </div>
            <span className="inline-flex w-fit shrink-0 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              {t("heralds.siteCount", { count: heraldSites.length })}
            </span>
          </motion.div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
            {heraldSites.map((site, index) => (
              <motion.article
                key={site.domain}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={rise}
                custom={index}
                className="group flex flex-col gap-6 rounded-[2rem] border border-border/60 bg-card/90 p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/50 md:p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Globe2 className="size-5" />
                  </span>
                  <h3 className="text-lg font-bold tracking-tight break-all">{site.domain}</h3>
                </div>
                <HeraldList heralds={site.quests} />
              </motion.article>
            ))}
          </div>
        </section>

        {/* ─── How it works / request support ──────────────────── */}
        <section className="grid gap-6 md:grid-cols-2 lg:gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={rise}
            custom={0}
            className="rounded-[2rem] border border-border/60 bg-card/90 p-10 backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1.5 md:p-12"
          >
            <BookOpen className="size-8 text-primary" />
            <h2 className="font-display mt-6 text-3xl leading-tight font-light md:text-4xl">
              {t("heralds.howTitle")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {t("heralds.howBody")}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={rise}
            custom={1}
            className="rounded-[2rem] border border-accent/30 bg-accent-card p-10 transition-transform duration-500 hover:-translate-y-1.5 md:p-12"
          >
            <MessagesSquare className="size-8 text-primary" />
            <h2 className="font-display mt-6 text-3xl leading-tight font-light md:text-4xl">
              {t("heralds.requestTitle")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {t("heralds.communityBody")}
            </p>
            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              className="group mt-5 inline-flex items-center gap-2 font-semibold text-primary underline underline-offset-4 transition-colors hover:text-accent"
            >
              <DiscordIcon className="size-4 shrink-0" />
              {t("common.joinDiscord")}
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <p className="mt-6 border-t border-border/60 pt-6 text-sm leading-relaxed text-muted-foreground">
              <Trans
                i18nKey="heralds.requestBody"
                values={{ email: "veganmage@proton.me" }}
                components={{
                  a: (
                    <a
                      className="font-semibold text-primary underline underline-offset-4 transition-colors hover:text-accent"
                      href="mailto:veganmage@proton.me"
                    />
                  ),
                }}
              />
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
