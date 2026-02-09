import { useState, useMemo } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for initial implementation
const MAGES_DATA = [
    {
        id: 1,
        title: "Forest Guardian",
        description: "Protector of the ancient woodlands, speaking for those who cannot speak for themselves.",
        element: "Nature",
        color: "from-green-400 to-emerald-600"
    },
    {
        id: 2,
        title: "Aether Weaver",
        description: "Weaving the threads of digital potential and human compassion into a new reality.",
        element: "Cosmic",
        color: "from-purple-400 to-indigo-600"
    },
    {
        id: 3,
        title: "Solar Arcanist",
        description: "Harnessing the raw energy of the sun to illuminate the path forward.",
        element: "Fire",
        color: "from-orange-400 to-red-600"
    },
    {
        id: 4,
        title: "Tidal Mystic",
        description: "Flowing with the tides, understanding the depth of empathy required for change.",
        element: "Water",
        color: "from-blue-400 to-cyan-600"
    },
    {
        id: 5,
        title: "Terra Molder",
        description: "Shaping the earth to build sanctuaries visible only to the pure of heart.",
        element: "Earth",
        color: "from-amber-600 to-yellow-800"
    },
    {
        id: 6,
        title: "Wind Whisperer",
        description: "Carrying the seeds of change across vast distances on unseen currents.",
        element: "Air",
        color: "from-slate-300 to-slate-500"
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
                            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 group border border-base-200 hover:border-primary/20 overflow-hidden"
                        >
                            <div className={`h-24 bg-gradient-to-br ${mage.color} relative`}>
                                <div className="absolute top-4 right-4 badge badge-ghost bg-white/20 backdrop-blur-md border-none text-white shadow-sm">
                                    {mage.element}
                                </div>
                                <div className="absolute -bottom-6 left-6 w-12 h-12 bg-base-100 rounded-xl shadow-lg flex items-center justify-center border border-base-200 group-hover:scale-110 transition-transform duration-300">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                            <div className="card-body pt-8">
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
