import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Activity, Shield, Zap, Heart,
    ArrowRight, Globe, Users
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

const LandingPage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen gradient-mesh selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center space-x-2"
                        >
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tight text-slate-900 font-outfit">
                                LifeLink<span className="text-blue-600">AI</span>
                            </span>
                        </motion.div>

                        <div className="hidden md:flex items-center space-x-8">
                            {['Home', 'Solutions', 'Network', 'About'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                                    {item}
                                </a>
                            ))}
                            <Link to="/login" className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Log in</Link>
                            <ThemeToggle />
                            <Link to="/register" className="btn-primary py-2 text-sm">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative">
                <div className="max-w-7xl mx-auto text-center lg:text-left grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="space-y-8"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-blue-700 text-xs font-bold uppercase tracking-wider">Next-Gen Emergency Management</span>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                            AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Healthcare</span> Coordination.
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            The world's first AI-driven emergency response and resource coordination platform. Saving lives through real-time data and intelligent routing.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link to="/register" className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4">
                                <span>Try LifeLink AI</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-slate-700 hover:bg-white transition-all flex items-center justify-center space-x-2">
                                <Globe className="w-5 h-5" />
                                <span>View Network</span>
                            </button>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start space-x-4 pt-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                                ))}
                            </div>
                            <p className="text-sm text-slate-500 font-medium">
                                Joined by <span className="text-blue-600 font-bold">10,000+</span> healthcare professionals
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Abstract Hero Image/Element */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/20 blur-[100px] rounded-full" />
                        <div className="relative card-premium p-4 animate-float">
                            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000"
                                    alt="Healthcare Dashboard"
                                    className="opacity-80 hover:opacity-100 transition-opacity duration-500"
                                />
                            </div>
                            {/* Floating Micro-UI element */}
                            <motion.div
                                initial={{ x: 50 }}
                                animate={{ x: 0 }}
                                className="absolute -right-8 bottom-12 glass p-4 rounded-2xl shadow-xl border border-white/50 max-w-[200px]"
                            >
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-red-600" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-900 underline">SOS Triggered</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '70%' }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="h-full bg-red-600"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="solutions" className="py-24 px-4 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <h2 className="text-blue-600 font-bold tracking-widest uppercase text-sm">Features</h2>
                        <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                            One platform. Infinite <span className="text-blue-600 italic">solutions.</span>
                        </h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Shield className="w-8 h-8" />,
                                title: "Smart SOS",
                                desc: "One-touch emergency activation with precise geolocation and severity prediction.",
                                color: "bg-blue-50 text-blue-600"
                            },
                            {
                                icon: <Zap className="w-8 h-8" />,
                                title: "Real-time Triage",
                                desc: "AI algorithms matching patients with the best hospital based on real-time availability.",
                                color: "bg-amber-50 text-amber-600"
                            },
                            {
                                icon: <Users className="w-8 h-8" />,
                                title: "Resource Network",
                                desc: "Community-driven blood donation and resource exchange in times of crisis.",
                                color: "bg-red-50 text-red-600"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="card-premium p-8 group"
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 ${feature.color}`}>
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h4>
                                <p className="text-slate-500 leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 glass border-y border-white/50 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 text-center">
                    {[
                        { val: "99.9%", label: "System Uptime" },
                        { val: "< 2s", label: "Response Delay" },
                        { val: "500+", label: "Hospitals Connected" },
                        { val: "24/7", label: "AI Monitoring" }
                    ].map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                            <h5 className="text-4xl font-extrabold text-slate-900 mb-2">{stat.val}</h5>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-4 bg-slate-950 text-white">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-2 space-y-6">
                        <div className="flex items-center space-x-2">
                            <Activity className="h-8 w-8 text-blue-500" />
                            <span className="text-2xl font-black font-outfit">LifeLink AI</span>
                        </div>
                        <p className="text-slate-400 max-w-sm leading-relaxed">
                            Redefining the future of emergency healthcare through artificial intelligence and seamless community interaction.
                        </p>
                    </div>
                    <div>
                        <h6 className="font-bold mb-6 text-slate-100">Quick Links</h6>
                        <ul className="space-y-4 text-slate-400 text-sm">
                            <li><Link to="/login" className="hover:text-blue-500 transition-colors">Emergency Dashboard</Link></li>
                            <li><Link to="/register" className="hover:text-blue-500 transition-colors">Join as Doctor</Link></li>
                            <li><Link to="/register" className="hover:text-blue-500 transition-colors">Register Hospital</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h6 className="font-bold mb-6 text-slate-100">Contact</h6>
                        <ul className="space-y-4 text-slate-400 text-sm">
                            <li className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-red-500" />
                                Made with passion
                            </li>
                            <li>support@lifelink.ai</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <p>© 2026 LifeLink AI. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white">Privacy</a>
                        <a href="#" className="hover:text-white">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
