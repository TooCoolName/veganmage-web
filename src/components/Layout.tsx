import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Moon, Sun, Menu, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        { path: '/mages', label: 'Circle of Mages' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-base-200/50 font-sans selection:bg-primary selection:text-primary-content transition-colors duration-300">
            {/* Floating Navbar */}
            <div className="sticky top-0 z-50 w-full mb-4">
                <div className="navbar bg-base-100/80 backdrop-blur-xl shadow-lg border-b border-base-content/5 w-full transition-all duration-300 px-4">
                    <div className="navbar-start">
                        <Link to="/" className="btn btn-ghost text-xl font-bold flex items-center gap-2 hover:bg-transparent">
                            <div className="avatar placeholder">
                                <div className="text-neutral-content rounded-full w-10 shadow-lg ring ring-primary ring-offset-base-100 ring-offset-2 p-1.5 bg-base-100">
                                    <img src="/icon128.png" alt="Logo" className="opacity-90 object-contain" />
                                </div>
                            </div>
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-extrabold tracking-tight hidden sm:inline-block">
                                Vegan Mage
                            </span>
                        </Link>
                    </div>

                    <div className="navbar-center hidden lg:flex">
                        <ul className="menu menu-horizontal px-1 gap-2 bg-base-200/50 rounded-full p-1.5 backdrop-blur-sm border border-base-content/5">
                            {navLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={`rounded-full px-6 font-medium transition-all duration-200 ${location.pathname === link.path
                                            ? 'bg-primary text-primary-content shadow-md'
                                            : 'hover:bg-base-300 hover:text-primary'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="navbar-end gap-2">

                        <button onClick={toggleTheme} className="btn btn-circle btn-ghost hover:scale-110 active:scale-95 transition-transform" aria-label="Toggle Theme">
                            <div className="swap swap-rotate">
                                <input type="checkbox" checked={theme === 'custom-dark'} readOnly />
                                <Sun className="swap-on fill-current w-6 h-6 text-warning" />
                                <Moon className="swap-off fill-current w-6 h-6 text-primary" />
                            </div>
                        </button>
                        <div className="lg:hidden">
                            <button tabIndex={0} className="btn btn-ghost btn-circle" onClick={toggleMenu}>
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
                            <ul className="menu bg-base-100 rounded-box shadow-xl border border-base-content/5 p-2 gap-2">
                                {navLinks.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            className={`${location.pathname === link.path ? 'active font-bold' : ''}`}
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

            <main className="flex-grow container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-7xl">
                <Outlet />
            </main>

            <footer className="relative mt-auto bg-base-100/80 backdrop-blur-md border-t border-base-content/5 pt-12 pb-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center text-center gap-8">
                        {/* Brand Section */}
                        <div className="flex flex-col items-center gap-4">
                            <Link to="/" className="group relative">
                                <div className="w-16 h-16 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-full flex items-center justify-center transform transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300 border border-base-content/5 p-3">
                                    <img src="/icon128.png" alt="Vegan Mage Logo" className="w-full h-full opacity-90 object-contain" />
                                </div>
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                            </Link>
                            <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    Vegan Mage
                                </h3>
                                <p className="text-sm text-base-content/60 mt-2 max-w-xs mx-auto leading-relaxed">
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
                            <Link to="/mages" className="hover:text-primary transition-colors relative group">
                                The Circle
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full opacity-50" />
                            </Link>
                        </nav>

                        {/* Divider */}
                        <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />

                        {/* Copyright */}
                        <div className="flex flex-col items-center gap-2 text-xs text-base-content/40 font-medium">
                            <p>
                                &copy; {new Date().getFullYear()} Vegan Mage. All rights reserved.
                            </p>
                            <p className="flex items-center gap-1.5 mt-1">
                                Made with <Heart className="w-3.5 h-3.5 text-error fill-current animate-pulse" /> for all beings
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
