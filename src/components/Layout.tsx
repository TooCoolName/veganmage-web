import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Moon, Sun, Menu, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { buttonVariants } from './ui/button';
import { cn } from '../lib/utils';

export function Layout() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'custom-light');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'custom-light' ? 'custom-dark' : 'custom-light');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinks = [
        { path: '/', label: 'Home' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground transition-colors duration-300">
            {/* Floating Navbar */}
            <div className="sticky top-0 z-50 w-full">
                <div className="flex h-18 items-center justify-between bg-background/85 backdrop-blur-xl border-b border-border/70 w-full transition-all duration-300 px-4 md:px-8">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 text-xl font-bold transition-opacity hover:opacity-90">
                            <div>
                                <div className="rounded-full w-10 shadow-lg shadow-primary/10 ring ring-primary/60 ring-offset-card ring-offset-2 p-1.5 bg-card">
                                    <img src="/icon128.png" alt="Logo" className="opacity-90 object-contain" />
                                </div>
                            </div>
                            <span className="text-foreground font-extrabold tracking-tight hidden sm:inline-block">
                                Vegan Mage
                            </span>
                        </Link>
                    </div>

                    <div className="hidden lg:flex">
                        <ul className="flex px-1 gap-2 bg-muted/50 rounded-full p-1.5 backdrop-blur-sm border border-border/60">
                            {navLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={`rounded-full px-6 font-medium transition-all duration-200 ${location.pathname === link.path
                                             ? 'bg-primary text-primary-foreground shadow-md'
                                             : 'hover:bg-muted hover:text-primary'
                                             }`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex items-center gap-2">

                        <button onClick={toggleTheme} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'rounded-full hover:scale-110 active:scale-95')} aria-label="Toggle Theme">
                            {theme === 'custom-dark' ? <Sun className="w-6 h-6 text-accent" /> : <Moon className="w-6 h-6 text-primary" />}
                        </button>
                        <div className="lg:hidden">
                            <button tabIndex={0} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'rounded-full')} onClick={toggleMenu}>
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="lg:hidden absolute top-full right-4 z-40 mt-2"
                        >
                            <ul className="flex min-w-48 flex-col rounded-xl bg-card text-card-foreground shadow-xl border border-border/60 p-2 gap-2">
                                {navLinks.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            className={`rounded-md px-4 py-2 text-sm transition-colors hover:bg-muted hover:text-primary ${location.pathname === link.path ? 'bg-primary text-primary-foreground font-bold' : ''}`}
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

            <main className="flex-grow container mx-auto px-4 md:px-8 py-6 md:py-10 max-w-7xl">
                <Outlet />
            </main>

            <footer className="relative mt-auto bg-card/80 backdrop-blur-md border-t border-border/60 pt-12 pb-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center text-center gap-8">
                        {/* Brand Section */}
                        <div className="flex flex-col items-center gap-4">
                            <Link to="/" className="group relative">
                                <div className="w-16 h-16 bg-gradient-to-tr from-primary-card to-accent-card rounded-full flex items-center justify-center transform transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300 border border-border/60 p-3">
                                    <img src="/icon128.png" alt="Vegan Mage Logo" className="w-full h-full opacity-90 object-contain" />
                                </div>
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                            </Link>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">
                                    Vegan Mage
                                </h3>
                                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
                                    Using technology to alleviate suffering and cultivate compassion.
                                </p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex flex-wrap justify-center gap-8 text-sm font-medium">
                            <Link to="/" className="hover:text-primary transition-colors relative group">
                                Home
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full opacity-50" />
                            </Link>
                        </nav>

                        {/* Divider */}
                        <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                        {/* Copyright */}
                        <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground font-medium">
                            <p>
                                &copy; {new Date().getFullYear()} Vegan Mage. All rights reserved.
                            </p>
                            <p className="flex items-center gap-1.5 mt-1">
                                Made with <Heart className="w-3.5 h-3.5 text-destructive fill-current animate-pulse" /> for all beings
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
