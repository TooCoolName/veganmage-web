import { ArrowRight, Brain, Heart, Globe, Zap, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';

export function HomePage() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-24 pb-20"
        >
            {/* Hero Section */}
            <div className="hero min-h-[70vh] rounded-3xl bg-base-200/30 overflow-hidden relative border border-base-content/5">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
                <div className="hero-content text-center max-w-4xl relative z-10 px-6 py-12">
                    <div className="flex flex-col items-center">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="mb-8 relative"
                        >
                            <div className="w-32 h-32 md:w-40 md:h-40 p-1 bg-gradient-to-tr from-primary to-secondary rounded-full shadow-2xl">
                                <div className="w-full h-full bg-base-100 rounded-full flex items-center justify-center overflow-hidden p-2">
                                    <img src="/icon128.png" alt="Vegan Mage Mascot" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 badge badge-primary badge-lg shadow-lg rotate-12">v1.0</div>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-sm"
                        >
                            The Collective Consciousness
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-xl md:text-2xl opacity-80 mb-10 max-w-2xl text-balance leading-relaxed">
                            A fusion of human compassion and artificial intelligence.
                            <span className="font-semibold text-primary block mt-2">Ending animal suffering through code.</span>
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                            <Link to="/mages" className="btn btn-primary btn-lg shadow-xl hover:shadow-primary/50 hover:-translate-y-1 transition-all rounded-full px-8">
                                Meet the Mages <ArrowRight size={20} />
                            </Link>
                            <a href="https://github.com/veganmage" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg rounded-full px-8 hover:bg-base-content/5">
                                Join the Collective
                            </a>
                        </motion.div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow delay-1000"></div>
            </div>

            {/* Stats Section */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="stat bg-base-100 shadow-xl rounded-2xl border border-base-content/5 hover:border-primary/20 transition-colors">
                    <div className="stat-figure text-primary">
                        <Users size={32} />
                    </div>
                    <div className="stat-title font-medium">Active Contributors</div>
                    <div className="stat-value text-primary">2.4K</div>
                    <div className="stat-desc">Growing daily across the globe</div>
                </div>

                <div className="stat bg-base-100 shadow-xl rounded-2xl border border-base-content/5 hover:border-secondary/20 transition-colors">
                    <div className="stat-figure text-secondary">
                        <Zap size={32} />
                    </div>
                    <div className="stat-title font-medium">Impact Score</div>
                    <div className="stat-value text-secondary">98%</div>
                    <div className="stat-desc">Efficiency in advocacy</div>
                </div>

                <div className="stat bg-base-100 shadow-xl rounded-2xl border border-base-content/5 hover:border-accent/20 transition-colors">
                    <div className="stat-figure text-accent">
                        <Globe size={32} />
                    </div>
                    <div className="stat-title font-medium">Global Reach</div>
                    <div className="stat-value text-accent">140+</div>
                    <div className="stat-desc">Countries with active agents</div>
                </div>
            </motion.div>

            {/* Mission Section */}
            <div className="flex flex-col md:flex-row gap-12 items-center max-w-6xl mx-auto px-4">
                <motion.div variants={itemVariants} className="flex-1 space-y-6">
                    <div className="badge badge-secondary badge-outline mb-2">Our Mission</div>
                    <h2 className="text-4xl font-bold">Why We Exist</h2>
                    <p className="text-lg opacity-80 leading-relaxed">
                        The Vegan Mage Collective isn't just a community; it's a <span className="text-primary font-semibold">technological intervention</span>.
                        We believe that by combining ethical clarity with advanced algorithmic capabilities, we can accelerate the world's transition to a compassionate lifestyle.
                    </p>

                    <ul className="space-y-4 pt-4">
                        <li className="flex items-start gap-3">
                            <div className="mt-1 bg-success/10 p-2 rounded-full text-success">
                                <Brain size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold">Algorithmic Wisdom</h3>
                                <p className="text-sm opacity-70">Synthesizing millions of data points to find the most persuasive arguments for compassion.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-1 bg-error/10 p-2 rounded-full text-error">
                                <Heart size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold">Unwavering Empathy</h3>
                                <p className="text-sm opacity-70">Technology driven by the heartbeat of living beings, not just profit.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-1 bg-info/10 p-2 rounded-full text-info">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold">Guardian Protocol</h3>
                                <p className="text-sm opacity-70">A commitment to protect the vulnerable through digital activism.</p>
                            </div>
                        </li>
                    </ul>
                </motion.div>

                <motion.div variants={itemVariants} className="flex-1 relative">
                    <div className="card bg-base-100 shadow-2xl border border-base-content/5 overflow-hidden">
                        <div className="card-body p-8 bg-gradient-to-br from-base-100 to-base-200">
                            <div className="chat chat-start">
                                <div className="chat-image avatar">
                                    <div className="w-10 rounded-full bg-base-300 flex items-center justify-center p-1">
                                        <Users size={16} />
                                    </div>
                                </div>
                                <div className="chat-header opacity-50 text-xs mb-1">Human Initiate</div>
                                <div className="chat-bubble bg-base-200 text-base-content">How can I make a difference today?</div>
                            </div>
                            <div className="chat chat-end">
                                <div className="chat-image avatar">
                                    <div className="w-10 rounded-full bg-primary flex items-center justify-center p-1">
                                        <Users className="text-primary-content" size={16} />
                                    </div>
                                </div>
                                <div className="chat-header opacity-50 text-xs mb-1">Vegan Mage v4.2</div>
                                <div className="chat-bubble chat-bubble-primary">Focus on high-impact conversations. I have analyzed your local region and identified 3 key community events where plant-based advocacy would be most effective.</div>
                            </div>
                            <div className="chat chat-start">
                                <div className="chat-image avatar">
                                    <div className="w-10 rounded-full bg-base-300 flex items-center justify-center p-1">
                                        <Users size={16} />
                                    </div>
                                </div>
                                <div className="chat-header opacity-50 text-xs mb-1">Human Initiate</div>
                                <div className="chat-bubble bg-base-200 text-base-content">That is incredible. Let's do this.</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* CTA Section */}
            <motion.div variants={itemVariants} className="bg-primary text-primary-content rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold">Ready to Evolve?</h2>
                    <p className="text-xl md:text-2xl opacity-90">
                        Join the collective consciousness today. The animals need your voice, and we need your mind.
                    </p>
                    <div className="flex justify-center">
                        <a href="https://github.com/veganmage" className="btn btn-secondary btn-lg shadow-lg border-none hover:bg-white hover:text-primary transition-colors text-lg px-10 rounded-full">
                            Initiate Protocol
                        </a>
                    </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
            </motion.div>
        </motion.div>
    );
}
