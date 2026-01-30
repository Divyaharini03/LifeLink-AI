import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, User, Phone, ChevronRight, ShieldCheck, Heart } from 'lucide-react';
import { registerUser } from '../services/authService';
import { ThemeToggle } from '../components/ThemeToggle';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'patient'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await registerUser(formData);
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
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-mesh flex font-inter">
            {/* Left Side - Visual Content */}
            <div className="hidden lg:flex w-[40%] bg-slate-950 relative overflow-hidden items-center justify-center p-16">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 blur-[150px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600/10 blur-[150px] rounded-full" />
                </div>

                <div className="relative z-10 space-y-12">
                    <Link to="/" className="flex items-center space-x-3 mb-10">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30">
                            <Activity className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-3xl font-black text-white font-outfit">LifeLink AI</span>
                    </Link>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-blue-500 font-bold uppercase tracking-widest text-xs">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Secure Network</span>
                        </div>
                        <h2 className="text-5xl font-extrabold text-white leading-tight font-outfit">Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">future</span> of healthcare.</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {[
                            { icon: <Heart className="w-5 h-5 text-red-400" />, text: "Priority emergency response" },
                            { icon: <Activity className="w-5 h-5 text-blue-400" />, text: "AI-powered health tracking" },
                            { icon: <ChevronRight className="w-5 h-5 text-green-400" />, text: "Global resource coordination" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/5"
                            >
                                <div className="p-2 bg-white/10 rounded-xl">{item.icon}</div>
                                <span className="text-slate-300 font-medium">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full lg:w-[60%] flex items-center justify-center p-8 sm:p-12 lg:p-24 relative lg:bg-white lg:dark:bg-[#05070a] lg:rounded-l-[4rem] shadow-2xl transition-colors duration-300">
                <div className="absolute top-12 left-12">
                    <ThemeToggle />
                </div>

                <Link to="/login" className="absolute top-12 right-12 lg:right-24 hidden sm:flex items-center px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-all text-sm">
                    Already registered? Log in
                </Link>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-xl space-y-10"
                >
                    <div className="space-y-3">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white font-outfit tracking-tight">Create Account</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Join thousands of others in the smarter way to heal.</p>
                    </div>

                    <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            {error && (
                                <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm font-bold flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-600" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-4 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                                <input name="name" required className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 dark:text-slate-200 shadow-inner" placeholder="John Doe" value={formData.name} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-4 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                                <input name="email" type="email" required className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 dark:text-slate-200 shadow-inner" placeholder="john@example.com" value={formData.email} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-4 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                                <input name="phone" type="tel" required className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 dark:text-slate-200 shadow-inner" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">I am a...</label>
                            <div className="relative group">
                                <select name="role" className="block w-full pl-4 pr-10 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-200 shadow-inner appearance-none cursor-pointer" value={formData.role} onChange={handleChange}>
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="hospital_admin">Hospital Admin</option>
                                    <option value="emergency_admin">Emergency Responder</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-4 text-slate-400 w-5 h-5 rotate-90" />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-4 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                                <input name="password" type="password" required className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 dark:text-slate-200 shadow-inner" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary h-16 flex items-center justify-center space-x-3 group"
                            >
                                <span className="font-bold text-xl">{loading ? 'Creating Account...' : 'Finish Registration'}</span>
                                {!loading && <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </form>

                    <div className="sm:hidden text-center">
                        <Link to="/login" className="text-blue-600 font-bold hover:underline font-inter">Already registered? Log in</Link>
                    </div>

                    <div className="flex items-center justify-center space-x-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        <span>Protected by AES-256</span>
                        <span>•</span>
                        <span>GDPR Compliant</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
