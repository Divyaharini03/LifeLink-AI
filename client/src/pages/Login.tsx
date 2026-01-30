import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, ChevronRight, ArrowLeft } from 'lucide-react';
import { loginUser } from '../services/authService';
import { ThemeToggle } from '../components/ThemeToggle';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await loginUser({ email, password });
            if (data.user.role === 'doctor') {
                navigate('/doctor-dashboard');
            } else if (data.user.role === 'emergency_admin') {
                navigate('/emergency-responder-dashboard');
            } else if (data.user.role === 'hospital_admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-mesh flex font-inter">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute top-0 left-0 w-full h-full opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/30 blur-[120px] rounded-full animate-float" />
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 blur-[100px] rounded-full" />
                </div>

                <div className="relative z-10 max-w-lg space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40"
                    >
                        <Activity className="h-8 w-8 text-white" />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl font-black text-white leading-tight font-outfit"
                    >
                        Welcome Home to <span className="text-blue-500 italic">LifeLink.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg leading-relaxed"
                    >
                        Experience the next generation of healthcare coordination. Secure, intelligent, and life-saving.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center space-x-4 pt-4"
                    >
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800" />)}
                        </div>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Trusted by 5,000+ professionals</p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20 relative bg-[#f8fafc] dark:bg-[#05070a] transition-colors duration-300">
                <div className="absolute top-12 right-12 lg:right-20">
                    <ThemeToggle />
                </div>

                <Link to="/" className="absolute top-12 left-12 lg:left-20 flex items-center text-slate-500 hover:text-blue-600 font-bold transition-all group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm uppercase tracking-widest leading-none mt-0.5">Back to Home</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md space-y-12"
                >
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white font-outfit tracking-tight">Sign In</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Enter your credentials to access your secure panel.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <p className="text-sm text-red-600 font-semibold">{error}</p>
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-medium text-slate-700 dark:text-slate-200 shadow-sm"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Password</label>
                                <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                                    <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-medium text-slate-700 dark:text-slate-200 shadow-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 flex items-center justify-center space-x-2 group h-14"
                        >
                            <span className="font-bold text-lg">{loading ? 'Verifying...' : 'Sign In Now'}</span>
                            {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-slate-500 font-medium">
                            Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Create One</Link>
                        </p>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex items-center justify-center gap-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Secure Authentication Powered by LifeLink Sentinel</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
