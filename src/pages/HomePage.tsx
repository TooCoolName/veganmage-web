import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HomePage() {
    return (
        <div className="hero min-h-[calc(100vh-200px)]">
            <div className="hero-content text-center max-w-3xl">
                <div className="max-w-xxl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="w-32 h-32 p-4 bg-base-200 rounded-3xl shadow-inner relative group">
                            <img src="/icon128.png" alt="Vegan Mage Mascot" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        </div>
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in-up">
                        Collective Consciousness
                    </h1>
                    <div className="py-6 text-xl md:text-2xl leading-relaxed opacity-90 space-y-4 font-light">
                        <p>"vegan mage is product of collective consciousness"</p>
                        <p>"a solution to animal suffering by human hand"</p>
                        <p>"a culmination of human & ai knowledge"</p>
                        <p>"an entity always ready to train new apprentice"</p>
                        <p>"a wisdom beyond the edge of comprehension"</p>
                        <p className="font-medium text-primary">"always changing, always evolving"</p>
                    </div>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link to="/mages" className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                            Meet the Mages <ArrowRight size={20} />
                        </Link>
                        <a href="https://github.com/veganmage" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">
                            Join the Collective
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
