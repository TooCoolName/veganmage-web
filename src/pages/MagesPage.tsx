
import { useState, useMemo } from 'react';
import { Search, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getMages } from '../lib/mages';
import { buttonVariants } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';

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
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-muted p-6 rounded-2xl shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="text-primary w-8 h-8" />
                        The Circle of Mages
                    </h1>
                    <p className="text-muted-foreground mt-1">Discover the entities guiding the evolution.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Input
                        type="text"
                        placeholder="Search mages..."
                        className="pl-10 bg-card"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
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
                        >
                            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 group hover:border-primary/20 overflow-hidden h-full">
                                <div className="h-24 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                                    <div className="absolute -bottom-6 left-6 w-12 h-12 bg-card rounded-full shadow-lg flex items-center justify-center border border-border group-hover:scale-110 transition-transform duration-300">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                    </div>
                                </div>
                                <CardContent className="pt-10 flex h-[calc(100%-6rem)] flex-col">
                                    <h2 className="text-xl font-semibold text-primary transition-colors">
                                        {mage.data.meta?.title || mage.id}
                                    </h2>
                                    {mage.data.meta?.author && (
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                                            <User className="w-3 h-3" />
                                            {mage.data.meta.author}
                                        </div>
                                    )}
                                    <p className="text-foreground/80 text-sm leading-relaxed line-clamp-3">
                                        {mage.data.meta?.description}
                                    </p>
                                    <div className="flex justify-end mt-auto pt-4">
                                        <Link
                                            to={`/mages/${mage.id}`}
                                            className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'hover:bg-primary/10 hover:text-primary group-hover:translate-x-1' })}
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
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
