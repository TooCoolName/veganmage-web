import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Chrome, ArrowUpRight, Mail } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { FigureGlyph } from './FigureGlyph';
import { DiscordIcon } from './DiscordIcon';
import { cn } from '../lib/utils';
import type { ComponentType } from 'react';

const chromeWebStoreUrl =
    'https://chromewebstore.google.com/detail/vegan-mage/pijaleolnpgboehkbacgnidlpombkekj';

const discordUrl = 'https://discord.gg/3VjKKfF5As';

const rise: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
};

export function Footer({ transparent = false }: { transparent?: boolean }) {
    const { t } = useTranslation();

    const footerColumns: {
        title: string;
        links: { label: string; to?: string; href?: string; icon?: ComponentType<{ className?: string }> }[];
    }[] = [
        {
            title: t('footer.explore'),
            links: [
                { label: t('nav.home'), to: '/' },
                { label: t('nav.heralds'), to: '/heralds' },
            ],
        },
        {
            title: t('footer.extension'),
            links: [
                { label: t('common.addToChrome'), href: chromeWebStoreUrl, icon: Chrome },
                { label: t('footer.privacy'), to: '/veganmage/privacy' },
            ],
        },
        {
            title: t('footer.contact'),
            links: [
                {
                    label: t('common.joinDiscord'),
                    href: discordUrl,
                    icon: DiscordIcon,
                },
                {
                    label: 'veganmage@proton.me',
                    href: 'mailto:veganmage@proton.me',
                    icon: Mail,
                },
            ],
        },
    ];

    return (
        <footer
            className={cn(
                'relative z-10 mt-auto overflow-hidden',
                transparent
                    ? 'border-t border-transparent bg-transparent'
                    : 'border-t border-border/70 bg-card/70 backdrop-blur-xl',
            )}
        >
            {!transparent && (
                <>
                    <div
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/0 via-accent/70 to-primary/0"
                    />
                    <div aria-hidden className="footer-glow pointer-events-none absolute inset-0" />
                </>
            )}
            <div className="relative mx-auto w-full max-w-[90rem] px-6 py-14 md:px-10 md:py-20 lg:px-16 xl:px-24">
                {/* Closing statement + CTA */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={rise}
                    className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8"
                >
                    <div className="max-w-2xl space-y-4">
                        <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.35em] text-muted-foreground uppercase">
                            <FigureGlyph className="size-4 shrink-0 text-primary" />
                            {t('footer.closingKicker')}
                        </p>
                        <h2 className="font-display text-4xl leading-[1.04] font-light tracking-tight md:text-6xl">
                            <Trans
                                i18nKey="footer.closingTitle"
                                components={{ em: <em className="text-primary italic" /> }}
                            />
                        </h2>
                    </div>

                    <a
                        href={chromeWebStoreUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex w-full shrink-0 items-center justify-center gap-3 rounded-full border border-border bg-background/70 px-6 py-3.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary md:w-auto"
                    >
                        <Chrome className="size-4 text-primary" />
                        {t('common.addToChrome')}
                        <ArrowUpRight className="size-4 opacity-50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </a>
                </motion.div>

                <div className="mt-10 h-px w-full bg-border/70 md:mt-14" />

                {/* Columns */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={rise}
                    className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-10 md:mt-12 lg:grid-cols-4"
                >
                    <div className="col-span-2 space-y-4 lg:col-span-1">
                        <Link to="/" className="group flex items-center gap-3">
                            <img
                                src="/icon-128.png"
                                alt="Vegan Mage logo"
                                className="size-11 object-contain opacity-90 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
                            />
                            <span className="text-lg font-extrabold tracking-tight">Vegan Mage</span>
                        </Link>
                        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                            {t('footer.brandBlurb')}
                        </p>
                    </div>

                    {footerColumns.map((column) => (
                        <nav key={column.title} className="flex flex-col gap-4">
                            <h3 className="text-[11px] font-semibold tracking-[0.35em] text-muted-foreground uppercase">
                                {column.title}
                            </h3>
                            <ul className="flex flex-col gap-2.5">
                                {column.links.map((link) => {
                                    const Icon = link.icon;
                                    const content = (
                                        <>
                                            {Icon && <Icon className="size-3.5 opacity-70" />}
                                            {link.label}
                                            <ArrowUpRight className="size-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                                        </>
                                    );
                                    const className =
                                        'group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary';

                                    return (
                                        <li key={link.label}>
                                            {link.to ? (
                                                <Link to={link.to} className={className}>
                                                    {content}
                                                </Link>
                                            ) : (
                                                <a
                                                    href={link.href}
                                                    target={
                                                        link.href?.startsWith('mailto:')
                                                            ? undefined
                                                            : '_blank'
                                                    }
                                                    rel="noreferrer"
                                                    className={className}
                                                >
                                                    {content}
                                                </a>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    ))}
                </motion.div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center gap-3 border-t border-border/70 pt-6 text-center text-xs font-medium text-muted-foreground sm:flex-row sm:justify-between sm:text-left md:mt-14">
                    <p>{t('common.copyright', { year: new Date().getFullYear() })}</p>
                    <p className="flex items-center gap-2">
                        <FigureGlyph className="animate-pulse-slow size-3.5 shrink-0 text-primary" />
                        {t('common.madeWithCare')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
