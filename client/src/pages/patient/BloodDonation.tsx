import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Droplets, Plus, Hospital, Phone, User, Calendar, CheckCircle, AlertCircle, ArrowLeft, X
} from 'lucide-react';
import { createBloodRequest, getBloodRequests, respondToBloodRequest } from '../../services/bloodService';
import { ThemeToggle } from '../../components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const BloodDonation = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<any[]>([]);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [formData, setFormData] = useState({
        patientName: '',
        bloodType: 'O+',
        hospital: '',
        age: '',
        phone: '',
        urgency: 'critical'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await getBloodRequests();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch blood requests', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const requestData = {
                ...formData,
                age: parseInt(formData.age),
                location: {
                    coordinates: [0, 0],
                    address: formData.hospital
                }
            };
            await createBloodRequest(requestData);
            setMessage({ type: 'success', text: 'Blood request posted successfully!' });
            setShowRequestForm(false);
            setFormData({
                patientName: '',
                bloodType: 'O+',
                hospital: '',
                age: '',
                phone: '',
                urgency: 'critical'
            });
            fetchRequests();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to post blood request.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    const handleRespond = async (requestId: string) => {
        try {
            await respondToBloodRequest(requestId);
            setMessage({ type: 'success', text: 'Response sent! Requester will be notified.' });
            fetchRequests();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to respond.' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#05070a] p-6 transition-colors duration-300 font-inter">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 text-slate-500 hover:text-blue-600 transition-all group">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-outfit uppercase italic tracking-tight flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-lg">
                                <Droplets className="w-6 h-6" />
                            </div>
                            Blood <span className="text-red-600">Network.</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={() => setShowRequestForm(!showRequestForm)}
                            className="bg-slate-900 dark:bg-red-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all flex items-center gap-2 shadow-xl shadow-red-600/10"
                        >
                            <Plus className="w-4 h-4" /> Request Blood
                        </button>
                    </div>
                </div>

                {message.text && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`mb-8 p-6 rounded-2xl flex items-center gap-4 border shadow-2xl ${message.type === 'success' ? 'bg-green-600/10 border-green-500/20 text-green-500' : 'bg-red-600/10 border-red-500/20 text-red-500'}`}>
                        {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        <p className="font-bold">{message.text}</p>
                    </motion.div>
                )}

                {/* Request Modal */}
                <AnimatePresence>
                    {showRequestForm && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-950 border dark:border-white/10 rounded-[2.5rem] w-full max-w-2xl p-10 space-y-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white font-outfit uppercase italic tracking-tight">Post <span className="text-red-600">Request.</span></h2>
                                    <button onClick={() => setShowRequestForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500"><X className="w-6 h-6" /></button>
                                </div>
                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Patient Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-4 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-red-600" />
                                            <input name="patientName" required className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-slate-700 dark:text-slate-200" placeholder="Full Name" value={formData.patientName} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Blood Group</label>
                                        <select name="bloodType" className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-black text-slate-700 dark:text-slate-200 appearance-none cursor-pointer" value={formData.bloodType} onChange={handleInputChange}>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Age</label>
                                        <input name="age" type="number" required className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-black text-slate-700 dark:text-slate-200" value={formData.age} onChange={handleInputChange} />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Hospital / Sector</label>
                                        <div className="relative group">
                                            <Hospital className="absolute left-4 top-4 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-red-600" />
                                            <input name="hospital" required className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-slate-700 dark:text-slate-200" placeholder="Emergency Location" value={formData.hospital} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Contact Signal</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-4 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-red-600" />
                                            <input name="phone" required className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-slate-700 dark:text-slate-200" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Urgency</label>
                                        <select name="urgency" className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-black text-red-600 appearance-none cursor-pointer" value={formData.urgency} onChange={handleInputChange}>
                                            <option value="critical">CRITICAL (NOW)</option>
                                            <option value="moderate">MODERATE</option>
                                            <option value="low">LOW</option>
                                        </select>
                                    </div>
                                    <button type="submit" disabled={loading} className="md:col-span-2 w-full py-5 bg-red-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 hover:scale-[1.02] transition-all">
                                        {loading ? 'Initializing Node...' : 'Broadcast SOS Request'}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 uppercase italic">
                    Live Broadcasts
                    <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">{requests.length} Active</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {requests.map(req => (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={req._id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6 group hover:border-red-500/30 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg group-hover:rotate-12 transition-transform">
                                        {req.bloodType}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">{req.patientName || 'Anonymous Node'}</h3>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Age: {req.age} • Linked Donors: {req.donors?.length || 0}</p>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${req.urgency === 'critical' ? 'bg-red-600/10 text-red-600 border border-red-500/20' : 'bg-orange-600/10 text-orange-600 border border-orange-500/20'}`}>
                                    {req.urgency}
                                </span>
                            </div>

                            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl space-y-3">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                                    <Hospital className="w-4 h-4 text-red-500" /> <span className="uppercase text-[10px] font-black">Location:</span> {req.hospital}
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                                    <Calendar className="w-4 h-4 text-red-500" /> <span className="uppercase text-[10px] font-black">Signal Created:</span> {new Date(req.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleRespond(req._id)}
                                    className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
                                >
                                    Fulfill Request
                                </button>
                                <a
                                    href={`tel:${req.phone}`}
                                    className="px-6 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                                >
                                    <Phone className="w-5 h-5" />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                    {requests.length === 0 && (
                        <div className="md:col-span-2 text-center py-24 bg-white/20 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10">
                            <Droplets className="w-20 h-20 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                            <p className="text-slate-500 font-black uppercase tracking-widest text-sm italic">No active blood signals in sector.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BloodDonation;
