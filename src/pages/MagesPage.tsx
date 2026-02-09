
import { useState, useMemo } from 'react';
import { Search, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getMages } from '../lib/mages';

export function MagesPage() {
    const [filter, setFilter] = useState('');

    const mages = getMages();

    const filteredMages = useMemo(() => {
        return mages.filter(mage =>
            mage.data.meta?.title?.toLowerCase().includes(filter.toLowerCase()) ||
            mage.data.meta?.description?.toLowerCase().includes(filter.toLowerCase()) ||
            mage.data.meta?.author?.toLowerCase().includes(filter.toLowerCase())
        );
    }, [filter, mages]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-base-200 p-6 rounded-2xl shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="text-primary w-8 h-8" />
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
                            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 group border border-base-200 hover:border-primary/20 overflow-hidden h-full"
                        >
                            <div className={`h-24 bg-gradient-to-br from-primary/20 to-secondary/20 relative`}>
                                <div className="absolute -bottom-6 left-6 w-12 h-12 bg-base-100 rounded-xl shadow-lg flex items-center justify-center border border-base-200 group-hover:scale-110 transition-transform duration-300">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                            <div className="card-body pt-10">
                                <h2 className="card-title text-primary group-hover:text-primary-focus transition-colors">
                                    {mage.data.meta?.title || mage.id}
                                </h2>
                                {mage.data.meta?.author && (
                                    <div className="text-xs text-base-content/60 flex items-center gap-1 mb-2">
                                        <User className="w-3 h-3" />
                                        {mage.data.meta.author}
                                    </div>
                                )}
                                <p className="text-base-content/80 text-sm leading-relaxed line-clamp-3">
                                    {mage.data.meta?.description}
                                </p>
                                <div className="card-actions justify-end mt-auto pt-4">
                                    <Link
                                        to={`/mages/${mage.id}`}
                                        className="btn btn-sm btn-ghost hover:bg-primary/10 hover:text-primary group-hover:translate-x-1 transition-all"
                                    >
                                        View Details
                                    </Link>
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
