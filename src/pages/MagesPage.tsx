import { useState, useMemo } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for initial implementation
const MAGES_DATA = [
    {
        id: 1,
        title: "Forest Guardian",
        description: "Protector of the ancient woodlands, speaking for those who cannot speak for themselves.",
        image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80&w=800", // Placeholder
        element: "Nature"
    },
    {
        id: 2,
        title: "Aether Weaver",
        description: "Weaving the threads of digital potential and human compassion into a new reality.",
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800", // Placeholder
        element: "Cosmic"
    },
    {
        id: 3,
        title: "Solar Arcanist",
        description: "Harnessing the raw energy of the sun to illuminate the path forward.",
        image: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&q=80&w=800",
        element: "Fire"
    },
    {
        id: 4,
        title: "Tidal Mystic",
        description: "Flowing with the tides, understanding the depth of empathy required for change.",
        image: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=800",
        element: "Water"
    },
    {
        id: 5,
        title: "Terra Molder",
        description: "Shaping the earth to build sanctuaries visible only to the pure of heart.",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
        element: "Earth"
    },
    {
        id: 6,
        title: "Wind Whisperer",
        description: "Carrying the seeds of change across vast distances on unseen currents.",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
        element: "Air"
    }
];

export function MagesPage() {
    const [filter, setFilter] = useState('');

    const filteredMages = useMemo(() => {
        return MAGES_DATA.filter(mage =>
            mage.title.toLowerCase().includes(filter.toLowerCase()) ||
            mage.description.toLowerCase().includes(filter.toLowerCase()) ||
            mage.element.toLowerCase().includes(filter.toLowerCase())
        );
    }, [filter]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-base-200 p-6 rounded-2xl">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="text-primary" />
                        The Circle of Mages
                    </h1>
                    <p className="text-base-content/70 mt-1">Discover the entities guiding the evolution.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search mages..."
                        className="input input-bordered w-full pl-10 bg-base-100 focus:input-primary transition-all"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 w-5 h-5" />
                </div>
            </div>

            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence>
                    {filteredMages.map((mage) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            key={mage.id}
                            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 group border border-base-200 hover:border-primary/20"
                        >
                            <figure className="h-48 overflow-hidden relative">
                                <img
                                    src={mage.image}
                                    alt={mage.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-2 right-2 badge badge-secondary shadow-md">
                                    {mage.element}
                                </div>
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title text-primary group-hover:text-primary-focus transition-colors">
                                    {mage.title}
                                </h2>
                                <p className="text-base-content/80 text-sm leading-relaxed">
                                    {mage.description}
                                </p>
                                <div className="card-actions justify-end mt-4">
                                    <button className="btn btn-sm btn-ghost hover:bg-primary/10 hover:text-primary">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredMages.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <p className="text-xl">No mages found matching your search.</p>
                </div>
            )}
        </div>
    );
}
