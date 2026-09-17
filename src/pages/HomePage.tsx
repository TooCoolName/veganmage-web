import { Suspense, lazy, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { motion, type Variants } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Chrome,
  Feather,
  Focus,
  MessageCircle,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";
import mage1Url from "../assets/mage1.svg";
import mage2Url from "../assets/mage2.svg";
import { FigureGlyph } from "../components/FigureGlyph";
import { DiscordIcon } from "../components/DiscordIcon";
import type { MageStation } from "../components/MageFigureField";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";

const MageFigureField = lazy(() =>
  import("../components/MageFigureField").then((m) => ({
    default: m.MageFigureField,
  })),
);

const chromeWebStoreUrl =
  "https://chromewebstore.google.com/detail/vegan-mage/pijaleolnpgboehkbacgnidlpombkekj";

const discordUrl = "https://discord.gg/3VjKKfF5As";

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

const currentIcons = [Focus, MessageCircle, MessagesSquare];

export function HomePage() {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLElement | null>(null);
  const threadRef = useRef<HTMLElement | null>(null);
  const calmRef = useRef<HTMLElement | null>(null);
  const swimRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.title = t("meta.homeTitle");
  }, [t]);

  const currents = t("home.thread.currents", {
    returnObjects: true,
  }) as unknown as { title: string; body: string }[];

  // ── Background: green mage pool only ───────────────────────
  // MagePoolBackground (water) + MageFigureLayer (mage), nothing on top.
  // All sections stay transparent so the pool shows through.

  // the Mage gathers from dots at each stop down the page, scatters back
  // to dots when its section leaves, and the cloud swarms over to the next
  // stop. Later spawns are smaller — same posture, tapering size.
  // Each `at`/`scale` resolves per breakpoint (`base` → `xl`): phones tuck the
  // Mage into the corners, tablets let it surface, desktop gives it the most room.
  const stations = useMemo<MageStation[]>(
    () => [
      {
        // hero: holds the right, dropping lower and smaller on narrow screens
        ref: heroRef,
        at: {
          base: { x: 0.8, y: 0.3 },
          lg: { x: 0.76, y: 0.45 },
          xl: { x: 0.75, y: 0.45 },
        },
        scale: { base: 0.65, lg: 0.7, xl: 1 },
        hold: { up: 0.1, down: 0.3 },
      },
      {
        // calmer current: drifts to the left edge, out of the centered copy
        ref: calmRef,
        figure: mage1Url,
        at: {
          base: { x: 0.1, y: 0.0 },
          lg: { x: 0.15, y: 0.0 },
          xl: { x: 0.25, y: 0.5 },
        },
        scale: { base: 0.3, lg: 0.4, xl: 0.85 },
        hold: { up: 0.4, down: 0.35 },
      },
      {
        // come swim: swings back to the right and rises toward the CTA
        ref: swimRef,
        figure: mage2Url,
        at: {
          base: { x: 0.85, y: 0.0 },
          lg: { x: 0.8, y: 0.15 },
          xl: { x: 0.75, y: 0.45 },
        },
        scale: { base: 0.6, lg: 0.6, xl: 0.85 },
        hold: { up: 0.2, down: 0.75 },
      },
    ],
    [],
  );

  return (
    <div className="grain relative">
      <Suspense fallback={null}>
        <MageFigureField stations={stations} />
      </Suspense>

      {/* ─── Hero (kept, green) ───────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[calc(100svh-4.5rem)] flex-col justify-center overflow-hidden bg-transparent px-6 pt-24 pb-24 sm:pt-28 md:px-10 md:pb-28 lg:px-16 xl:px-24"
      >
        {/* feathered frosted patch behind the copy: veins stay visible around it */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-0 h-[85%] w-[95%] -translate-y-1/2 [mask-image:radial-gradient(ellipse_75%_75%_at_40%_50%,black_30%,transparent_78%)] md:w-[62%]"
        />
        <div className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-col items-start gap-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={rise}
            custom={0}
            className="flex items-center gap-4 text-[11px] font-semibold tracking-[0.35em] text-muted-foreground uppercase"
          >
            <FigureGlyph className="size-4 shrink-0 text-primary" />
            <span>{t("home.hero.kicker")}</span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={rise}
            custom={1}
            className="font-display max-w-[min(58rem,92vw)] text-[clamp(3rem,10.5vw,8.2rem)] leading-[0.92] font-light tracking-[-0.025em] text-balance"
          >
            <Trans
              i18nKey="home.hero.title"
              components={{ em: <em className="text-primary font-medium italic" /> }}
            />
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={rise}
            custom={2}
            className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            {t("home.hero.body")}
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={rise}
            custom={3}
            className="mt-2 flex flex-wrap items-center gap-4"
          >
            <a
              href={chromeWebStoreUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "group h-13 rounded-full bg-primary px-8 text-base font-semibold shadow-[0_0_70px_-15px_var(--primary)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_90px_-10px_var(--primary)]",
              )}
            >
              <Chrome className="size-5" />
              {t("common.addToChrome")}
              <ArrowUpRight className="size-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </a>
            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-13 items-center gap-2 rounded-full border border-border px-7 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <DiscordIcon className="size-5 text-primary" />
              {t("home.hero.joinRanks")}
              <span className="text-primary">→</span>
            </a>
          </motion.div>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={rise}
            custom={4}
            className="text-xs font-medium tracking-[0.14em] text-muted-foreground/70 uppercase"
          >
            {t("home.hero.meta")}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-8 left-6 z-10 hidden items-center gap-3 md:left-10 lg:flex xl:left-16"
        >
          <ArrowDown className="animate-bounce-slow size-4 text-muted-foreground" />
          <span className="text-[10px] font-semibold tracking-[0.4em] text-muted-foreground/70 uppercase">
            {t("home.hero.scroll")}
          </span>
        </motion.div>
        <div className="absolute top-1/2 right-8 z-10 hidden -translate-y-1/2 [writing-mode:vertical-rl] xl:block">
          <span className="text-[10px] font-semibold tracking-[0.5em] text-muted-foreground/50 uppercase">
            {t("home.hero.sideNote")}
          </span>
        </div>
      </section>

      {/* ─── 01 · The conversation is the prompt ─────────────── */}
      {/* Transparent — green pool shows through, bare text is dark. */}
      <section ref={threadRef} className="relative z-10 overflow-hidden bg-transparent">
        <div className="relative mx-auto w-full max-w-[90rem] px-6 py-32 md:px-10 md:py-40 lg:px-16 lg:py-56 xl:px-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={rise}
            className="flex flex-col gap-8"
          >
            <p className="flex items-center gap-4 text-[11px] font-semibold tracking-[0.35em] text-muted-foreground uppercase">
              <span className="h-px w-12 bg-primary/60" />
              {t("home.thread.kicker")}
            </p>
            <h2 className="font-display max-w-5xl text-5xl leading-[0.95] font-light tracking-tight text-balance text-foreground md:text-7xl xl:text-8xl">
              <Trans
                i18nKey="home.thread.title"
                components={{ em: <em className="text-primary italic" /> }}
              />
            </h2>
            <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
              {t("home.thread.body")}
            </p>
          </motion.div>

          <div className="mt-16 grid max-w-6xl grid-cols-1 items-stretch gap-6 md:mt-20 md:gap-8 lg:grid-cols-5">
            <motion.figure
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={rise}
              custom={0}
              className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/90 p-8 backdrop-blur-xl md:p-10 lg:col-span-3"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-32 right-0 size-96 rounded-full bg-accent/15 blur-3xl"
              />
              <figcaption className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.3em] text-muted-foreground uppercase">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                {t("home.thread.figureKicker")}
              </figcaption>
              <div className="mt-8 space-y-5">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-6">
                  <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                    {t("home.thread.postLabel")}
                  </p>
                  <p className="mt-2 text-lg leading-snug font-medium">
                    {t("home.thread.postQuote")}
                  </p>
                </div>
                <div className="ml-6 space-y-4 border-l-2 border-primary/30 pl-6 md:ml-10">
                  <div className="rounded-2xl bg-muted/70 p-5 text-[15px] leading-relaxed text-muted-foreground">
                    {t("home.thread.repliesNote")}
                  </div>
                  <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5">
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      {t("home.thread.targetLabel")}
                    </p>
                    <p className="mt-2 text-[15px] leading-relaxed">{t("home.thread.target")}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      {t("home.thread.instructionLabel")}
                    </p>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                      {t("home.thread.instruction")}
                    </p>
                  </div>
                </div>
              </div>
            </motion.figure>

            <div className="flex flex-col gap-6 md:gap-8 lg:col-span-2">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={rise}
                custom={1}
                className="group flex-1 rounded-[2rem] border border-border/60 bg-card/90 p-8 backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1.5 md:p-10"
              >
                <Feather className="size-8 text-primary" />
                <h3 className="font-display mt-6 text-2xl leading-tight font-light text-balance md:text-3xl">
                  <Trans
                    i18nKey="home.thread.noBlankTitle"
                    components={{ em: <em className="italic" /> }}
                  />
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {t("home.thread.noBlankBody")}
                </p>
              </motion.div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={rise}
                custom={2}
                className="flex-1 rounded-[2rem] border border-accent/30 bg-accent-card p-8 transition-transform duration-500 hover:-translate-y-1.5 md:p-10"
              >
                <ShieldCheck className="size-8 text-primary" />
                <h3 className="mt-6 text-2xl font-semibold tracking-tight md:text-3xl">
                  {t("home.thread.authorTitle")}
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {t("home.thread.authorBody")}
                </p>
              </motion.div>
            </div>
          </div>

          <ol className="mt-6 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 md:mt-8 md:gap-8 lg:grid-cols-3">
            {currents.map((current, index) => {
              const Icon = currentIcons[index];
              return (
                <motion.li
                  key={current.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={rise}
                  custom={index}
                  className="group rounded-[2rem] border border-border/60 bg-card/90 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/50 md:p-10"
                >
                  <Icon className="size-9 text-primary transition-colors duration-300 group-hover:text-accent" />
                  <h3 className="mt-6 text-3xl font-semibold tracking-tight">{current.title}</h3>
                  <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                    {current.body}
                  </p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ─── 02 · Calmer current ─────────────────────────────── */}
      {/* Transparent — green pool shows through, bare text is dark. */}
      <section ref={calmRef} className="relative z-10 overflow-hidden bg-transparent">
        <div className="relative overflow-hidden py-32 md:py-44 lg:py-64">
          {/* feathered frosted patch behind the heading */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-[6%] left-1/2 h-[52%] w-[94%] max-w-5xl -translate-x-1/2 [mask-image:radial-gradient(ellipse_75%_75%_at_50%_45%,black_30%,transparent_78%)"
          />
          <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center lg:mr-0 lg:ml-auto">
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={rise}
              className="mb-8 flex items-center gap-4 text-[11px] font-semibold tracking-[0.4em] text-muted-foreground uppercase"
            >
              <span className="h-px w-12 bg-primary/60" />
              {t("home.calm.kicker")}
              <span className="h-px w-12 bg-primary/60" />
            </motion.p>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={rise}
              className="font-display max-w-4xl text-6xl leading-[0.95] font-light tracking-tight text-balance text-foreground md:text-8xl"
            >
              <Trans
                i18nKey="home.calm.title"
                components={{ em: <em className="text-primary italic" /> }}
              />
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={rise}
              custom={1}
              className="mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl"
            >
              {t("home.calm.body")}
            </motion.p>

            <motion.figure
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={rise}
              custom={2}
              className="relative mt-16 w-full max-w-3xl overflow-hidden rounded-[2.5rem] border border-border/60 bg-card/85 p-10 text-left backdrop-blur-2xl md:p-14"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[80%] -translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
              />
              <figcaption className="relative flex items-center justify-between gap-4">
                <span className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.3em] text-muted-foreground uppercase">
                  <Feather className="size-4 text-primary" />
                  {t("home.calm.caption")}
                </span>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                  {t("home.calm.badge")}
                </span>
              </figcaption>
              <blockquote className="font-display relative mt-6 text-2xl leading-snug font-light text-balance text-foreground md:text-4xl">
                {t("home.calm.quote")}
              </blockquote>
              <div className="relative mt-8 flex flex-wrap items-center gap-3">
                {(t("home.calm.tones", { returnObjects: true }) as unknown as string[]).map(
                  (tone) => (
                    <span
                      key={tone}
                      className="rounded-full border border-border bg-muted/70 px-5 py-2 text-sm font-semibold text-muted-foreground"
                    >
                      {tone}
                    </span>
                  ),
                )}
                <span className="ml-auto hidden items-center gap-2 text-sm font-semibold text-primary sm:inline-flex">
                  {t("home.calm.refine")} <ArrowUpRight className="size-4" />
                </span>
              </div>
            </motion.figure>

            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={rise}
              custom={3}
              className="mt-10 text-xs font-medium tracking-[0.25em] text-muted-foreground/80 uppercase"
            >
              {t("home.calm.meta")}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ─── 03 · Come swim ───────────────────────────────── */}
      {/* Transparent — green pool shows through, bare text is dark. */}
      <section ref={swimRef} className="relative z-10 overflow-hidden bg-transparent">
        <div className="relative mx-auto flex w-full max-w-[90rem] flex-col gap-14 px-6 py-32 md:px-10 md:py-40 lg:px-16 lg:py-56 xl:px-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={rise}
            className="flex flex-col gap-10"
          >
            <p className="flex items-center gap-4 text-[11px] font-semibold tracking-[0.35em] text-muted-foreground uppercase">
              <Chrome className="size-4 text-primary" />
              {t("home.swim.kicker")}
            </p>
            <h2 className="font-display max-w-6xl text-[clamp(4rem,12vw,11rem)] leading-[0.9] font-light tracking-[-0.025em] text-balance text-foreground">
              <Trans
                i18nKey="home.swim.title"
                components={{ em: <em className="text-primary font-medium italic" /> }}
              />
            </h2>
            <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
              {t("home.swim.body")}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={rise}
            custom={1}
            className="flex flex-col gap-6 sm:flex-row sm:items-center"
          >
            <a
              href={chromeWebStoreUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "group h-16 rounded-full bg-primary px-10 text-lg font-semibold transition-all duration-300 hover:-translate-y-0.5",
              )}
            >
              <Chrome className="size-6" />
              {t("common.addToChromeFree")}
              <ArrowUpRight className="size-5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </a>
            <Link
              to="/heralds"
              className="inline-flex h-16 items-center justify-center gap-2 rounded-full border border-border px-9 text-base font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {t("home.swim.secondary")}
              <span className="text-primary">→</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
