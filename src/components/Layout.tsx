import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Moon, Sun, Menu } from 'lucide-react';
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
        { path: '/mages', label: 'The Circle' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-base-200/50 font-sans selection:bg-primary selection:text-primary-content transition-colors duration-300">
            {/* Floating Navbar */}
            <div className="sticky top-0 z-50 w-full mb-4">
                <div className="navbar bg-base-100/80 backdrop-blur-xl shadow-lg border-b border-base-content/5 w-full transition-all duration-300 px-4">
                    <div className="navbar-start">
                        <Link to="/" className="btn btn-ghost text-xl font-bold flex items-center gap-2 hover:bg-transparent">
                            <div className="avatar placeholder">
                                <div className="text-neutral-content rounded-xl w-10 shadow-lg ring ring-primary ring-offset-base-100 ring-offset-2">
                                    <img src="/icon128.png" alt="Logo" className="opacity-90 mix-blend-multiply" />
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

            <footer className="footer footer-center p-10 bg-base-100 text-base-content rounded-t-3xl border-t border-base-content/5">
                <aside>
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-primary to-secondary rounded-xl shadow-lg flex items-center justify-center">
                            <img src="/icon128.png" alt="Logo" className="w-8 h-8 opacity-80 mix-blend-multiply" />
                        </div>
                    </div>
                    <p className="font-bold text-lg">
                        Vegan Mage Collective
                    </p>
                    <p className="text-base-content/60">Using technology to alleviate suffering.</p>
                    <p className="text-sm mt-4 opacity-50">Copyright © {new Date().getFullYear()} - All rights reserved</p>
                </aside>
                <nav>
                    <Link to="/" className="opacity-70 hover:opacity-100 transition-opacity hover:text-primary font-bold">
                        VM
                    </Link>
                </nav>
            </footer>
        </div>
    );
}
