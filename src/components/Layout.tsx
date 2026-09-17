import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { buttonVariants } from './ui/button';
import { LanguagePicker } from './LanguagePicker';
import { Footer } from './Footer';
import { cn } from '../lib/utils';

export function Layout() {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const controlsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'custom-dark');
        localStorage.setItem('theme', 'custom-dark');
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    useEffect(() => {
        if (!isMenuOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsMenuOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMenuOpen]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinks = [
        { path: '/heralds', label: t('nav.heralds') },
    ];

    // Pages whose green pool reaches behind the footer.
    const poolPages = ['/', '/heralds'];
    const transparentFooter = poolPages.includes(location.pathname);

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground transition-colors duration-300">
            {/* Floating corners — no top bar, just top-left brand + top-right controls.
                Each corner feathers into the page via a soft halo + backdrop blur,
                so there is never a hard line / border feeling. */}
            <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-3 p-3 sm:p-4 md:p-6">
                {/* Top-left: brand */}
                <Link
                    to="/"
                    className="pointer-events-auto group relative flex h-12 items-center gap-2 rounded-full bg-background/55 pr-5 pl-2 shadow-[0_8px_32px_-12px_rgb(0_0_0/0.3)] backdrop-blur-xl backdrop-saturate-150 transition-opacity hover:opacity-90"
                >
                    {/* feathered halo that melts the pill edge into the background */}
                    <span
                        aria-hidden
                        className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-background/80 via-background/35 to-transparent blur-2xl"
                    />
                    <span className="relative flex items-center gap-2 text-xl font-bold">
                        <img src="/icon-128.png" alt="Logo" className="size-9 object-contain opacity-90" />
                        <span className="text-foreground dark:text-primary font-extrabold tracking-tight">
                            Vegan Mage
                        </span>
                    </span>
                </Link>

                {/* Top-right: controls (menu is always here, no center nav) */}
                <div ref={controlsRef} className="pointer-events-auto relative">
                    <div className="relative flex h-12 items-center gap-1 rounded-full bg-background/55 p-1.5 shadow-[0_8px_32px_-12px_rgb(0_0_0/0.3)] backdrop-blur-xl backdrop-saturate-150">
                        {/* feathered halo that melts the pill edge into the background */}
                        <span
                            aria-hidden
                            className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-bl from-background/80 via-background/35 to-transparent blur-2xl"
                        />
                        <LanguagePicker />
                        <button tabIndex={0} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'relative rounded-full transition-transform hover:scale-110 hover:text-primary active:scale-95')} onClick={toggleMenu} aria-label={t('common.toggleMenu')}>
                            <Menu size={24} />
                        </button>
                    </div>

                    {/* Menu dropdown */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                                className="absolute top-full right-0 z-40 mt-3"
                            >
                                <ul className="flex w-max flex-col rounded-2xl bg-card/90 text-card-foreground shadow-xl backdrop-blur-xl border border-border/60 p-2 gap-1">
                                    {navLinks.map((link) => (
                                        <li key={link.path}>
                                            <Link
                                                to={link.path}
                                                className={`block rounded-xl px-4 py-2.5 text-sm transition-colors hover:bg-muted hover:text-primary ${location.pathname === link.path ? 'bg-primary text-primary-foreground font-bold' : ''}`}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <main
                className={
                    location.pathname === '/'
                        ? 'flex-grow w-full'
                        : 'flex-grow container mx-auto px-4 md:px-8 pt-24 md:pt-28 pb-6 md:pb-10 max-w-7xl'
                }
            >
                <Outlet />
            </main>

            <Footer transparent={transparentFooter} />
        </div>
    );
}
