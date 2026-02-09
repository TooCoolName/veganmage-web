import { Link, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function Layout() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'custom-light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'custom-light' ? 'custom-dark' : 'custom-light');
    };

    return (
        <div className="min-h-screen flex flex-col bg-base-100 text-base-content font-sans">
            <nav className="navbar bg-base-100 border-b border-base-300 px-4 md:px-8 py-2 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
                <div className="flex-1">
                    <Link to="/" className="btn btn-ghost text-xl font-bold flex items-center gap-2">
                        <img src="/vite.svg" alt="Logo" className="w-8 h-8" />
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Vegan Mage
                        </span>
                    </Link>
                </div>
                <div className="flex-none gap-4">
                    <ul className="menu menu-horizontal px-1 gap-2">
                        <li>
                            <Link to="/" className="font-medium hover:text-primary transition-colors">Home</Link>
                        </li>
                        <li>
                            <Link to="/mages" className="font-medium hover:text-primary transition-colors">Mages</Link>
                        </li>
                    </ul>
                    <button onClick={toggleTheme} className="btn btn-circle btn-ghost btn-sm" aria-label="Toggle Theme">
                        {theme === 'custom-light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </nav>

            <main className="flex-grow container mx-auto px-4 md:px-8 py-8">
                <Outlet />
            </main>

            <footer className="footer footer-center p-4 bg-base-200 text-base-content rounded">
                <aside>
                    <p>Copyright © {new Date().getFullYear()} - All right reserved by Vegan Mage Collective</p>
                </aside>
            </footer>
        </div>
    );
}
