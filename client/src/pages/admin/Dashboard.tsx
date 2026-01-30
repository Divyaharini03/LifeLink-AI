import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, LogOut, Menu,
    X, FileText,
    Shield, Box, ArrowRightLeft, Plus, Info,
    CheckCircle, AlertCircle, TrendingUp, Search, ArrowUpRight
} from 'lucide-react';
import { getCurrentUser, logoutUser } from '../../services/authService';
import {
    getEquipmentRequests,
    getTransferRequests,
    createEquipmentRequest,
    createTransferRequest,
    updateEquipmentStatus,
    updateTransferStatus
} from '../../services/adminService';
import { ThemeToggle } from '../../components/ThemeToggle';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [equipmentRequests, setEquipmentRequests] = useState<any[]>([]);
    const [transferRequests, setTransferRequests] = useState<any[]>([]);
    const [, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');

    // Form states
    const [showEquipModal, setShowEquipModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

    const [equipForm, setEquipForm] = useState({
        equipmentName: '',
        quantity: 1,
        type: 'need',
        urgency: 'medium',
        description: ''
    });

    const [transferForm, setTransferForm] = useState({
        patientName: '',
        reason: '',
        urgency: 'medium',
        notes: ''
    });

    useEffect(() => {
        const u = getCurrentUser();
        if (!u) {
            navigate('/login');
            return;
        }
        setUser(u);

        loadData();
        const interval = setInterval(loadData, 30000);

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        return () => {
            clearInterval(interval);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [equipData, transferData] = await Promise.all([
                getEquipmentRequests(),
                getTransferRequests()
            ]);
            setEquipmentRequests(Array.isArray(equipData) ? equipData : []);
            setTransferRequests(Array.isArray(transferData) ? transferData : []);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const handleEquipSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createEquipmentRequest(equipForm);
            setShowEquipModal(false);
            setEquipForm({ equipmentName: '', quantity: 1, type: 'need', urgency: 'medium', description: '' });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleTransferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTransferRequest(transferForm);
            setShowTransferModal(false);
            setTransferForm({ patientName: '', reason: '', urgency: 'medium', notes: '' });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (type: 'equipment' | 'transfer', id: string, status: string) => {
        try {
            if (type === 'equipment') {
                await updateEquipmentStatus(id, status);
            } else {
                await updateTransferStatus(id, status, user.id);
            }
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const navItems = [
        { icon: <Activity className="w-5 h-5" />, label: 'Overview' },
        { icon: <Box className="w-5 h-5" />, label: 'Equipment Hub' },
        { icon: <ArrowRightLeft className="w-5 h-5" />, label: 'Transfers' },
        { icon: <Users className="w-5 h-5" />, label: 'Staffing' },
        { icon: <FileText className="w-5 h-5" />, label: 'Resources' },
    ];

    const renderOverview = () => (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Equipment Needs', value: equipmentRequests.filter(r => r.type === 'need' && r.status === 'pending').length, icon: <Box className="w-5 h-5" />, color: 'bg-orange-500' },
                    { label: 'Pending Transfers', value: transferRequests.filter(r => r.status === 'pending').length, icon: <ArrowRightLeft className="w-5 h-5" />, color: 'bg-blue-500' },
                    { label: 'Ready Offers', value: equipmentRequests.filter(r => r.type === 'offer' && r.status === 'pending').length, icon: <Plus className="w-5 h-5" />, color: 'bg-emerald-500' },
                    { label: 'Alert Signals', value: 'Live', icon: <AlertCircle className="w-5 h-5" />, color: 'bg-indigo-500' },
                ].map((stat, i) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl p-8 relative overflow-hidden group shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <div className={`absolute top-0 right-0 w-1.5 h-full ${stat.color} opacity-40`} />
                        <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center text-white mb-6 shadow-xl`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">{stat.value}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3 italic">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                        Critical Equipment Queue
                    </h2>
                    <div className="space-y-4">
                        {equipmentRequests.slice(0, 3).length === 0 ? (
                            <div className="p-12 text-center bg-white/50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Awaiting Resource Signals...</p>
                            </div>
                        ) : (
                            equipmentRequests.slice(0, 3).map(req => (
                                <div key={req._id} className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 flex justify-between items-center group shadow-sm hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${req.type === 'need' ? 'bg-orange-500' : 'bg-emerald-500'} shadow-lg`}>
                                            <Box className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-slate-900 dark:text-white font-black uppercase italic tracking-tight">{req.equipmentName}</h4>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">QTY: {req.quantity} • {req.hospitalId?.name}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab('Equipment Hub')} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3 italic">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                        Recent Patient Logistics
                    </h2>
                    <div className="space-y-4">
                        {transferRequests.slice(0, 3).length === 0 ? (
                            <div className="p-12 text-center bg-white/50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">No Terminal Activity...</p>
                            </div>
                        ) : (
                            transferRequests.slice(0, 3).map(req => (
                                <div key={req._id} className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 flex justify-between items-center shadow-sm hover:shadow-xl transition-all">
                                    <div>
                                        <h4 className="text-slate-900 dark:text-white font-black uppercase italic tracking-tight">{req.patientName || 'ANONYMOUS NODE'}</h4>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{req.reason}</p>
                                    </div>
                                    <span className="px-4 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/10">{req.status}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEquipmentHub = () => (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter font-outfit italic">Equipment Grid.</h2>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[1.5rem] py-4 pl-12 pr-6 text-sm text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold shadow-sm" placeholder="Search resources..." />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {equipmentRequests.length === 0 ? (
                    <div className="p-32 text-center bg-white/30 dark:bg-slate-900/40 rounded-[3.5rem] border-4 border-dashed border-slate-100 dark:border-white/5">
                        <Box className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs italic">Signal Lost • No Active Equipment Nodes</p>
                    </div>
                ) : (
                    equipmentRequests.map(req => (
                        <motion.div layout key={req._id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex flex-col xl:flex-row justify-between items-center gap-10 group shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/30 transition-all">
                            <div className="flex items-center gap-8 flex-1 w-full">
                                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-transform group-hover:rotate-6 ${req.type === 'need' ? 'bg-orange-500 shadow-orange-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
                                    <Box className="w-10 h-10" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{req.equipmentName}</h3>
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${req.urgency === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-white/10'}`}>{req.urgency}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                                        <Shield className="w-4 h-4 text-indigo-500" />
                                        {req.hospitalId?.name || 'Local Hospital'} • <span className="text-indigo-600">{req.hospitalId?.phone || 'Emergency Contact'}</span>
                                    </p>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mt-3">Node Broadcast {new Date(req.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 w-full xl:w-auto">
                                <div className="px-10 py-5 bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] border border-slate-100 dark:border-white/10 text-center min-w-[140px] shadow-inner">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch QTY</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{req.quantity}</p>
                                </div>
                                {req.status === 'pending' ? (
                                    <div className="flex gap-4 flex-1">
                                        <button onClick={() => handleStatusUpdate('equipment', req._id, 'fullfilled')} className={`flex-1 px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${req.type === 'need' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20' : 'bg-indigo-600 text-white shadow-indigo-600/30'}`}>
                                            {req.type === 'need' ? 'Capture Need' : 'Coordinate Batch'}
                                        </button>
                                        <button onClick={() => handleStatusUpdate('equipment', req._id, 'cancelled')} className="p-5 bg-red-600/10 text-red-600 rounded-[1.5rem] border border-red-500/20 hover:bg-red-600 hover:text-white transition-all">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-emerald-500 font-black uppercase tracking-[0.2em] text-[10px] px-10 py-6 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                                        <CheckCircle className="w-5 h-5 flex-shrink-0" /> {req.status}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );

    const renderTransfers = () => (
        <div className="space-y-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter font-outfit italic">Logistics Hub.</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {transferRequests.length === 0 ? (
                    <div className="lg:col-span-2 p-32 text-center bg-white/40 dark:bg-slate-900/40 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5">
                        <ArrowRightLeft className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-sm italic font-outfit">Logistics Terminal Idle • Monitoring Signals</p>
                    </div>
                ) : (
                    transferRequests.map(req => (
                        <motion.div key={req._id} className="bg-white dark:bg-slate-950 p-12 rounded-[3.5rem] border border-slate-100 dark:border-white/5 space-y-10 relative overflow-hidden group shadow-2xl shadow-slate-200/50 dark:shadow-none">
                            <div className="absolute top-0 right-0 w-48 h-full bg-blue-600/5 blur-[100px]" />

                            <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-3">
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter uppercase italic">{req.patientName || 'ANON NODE'}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">{req.status}</span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter italic">Reason: {req.reason}</span>
                                    </div>
                                </div>
                                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] flex items-center justify-center text-slate-400 shadow-inner group-hover:scale-110 transition-transform">
                                    <Activity className="w-8 h-8" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-6 py-10 border-y border-slate-100 dark:border-white/5 relative z-10">
                                <div className="text-center group-hover:-translate-x-2 transition-transform">
                                    <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase mb-3 tracking-widest">Origin</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white truncate px-2 italic">{req.fromHospitalId?.name || 'GENERIC FACILITY'}</p>
                                </div>
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />
                                    <div className="p-3 bg-blue-500/10 rounded-full animate-pulse">
                                        <ArrowRightLeft className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />
                                </div>
                                <div className="text-center group-hover:translate-x-2 transition-transform">
                                    <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase mb-3 tracking-widest">Destination</p>
                                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 truncate px-2 italic">{req.toHospitalId?.name || 'BROADCASTING...'}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 relative z-10">
                                {req.status === 'pending' ? (
                                    <button onClick={() => handleStatusUpdate('transfer', req._id, 'accepted')} className="flex-1 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all">Intercept Transfer</button>
                                ) : (
                                    <button disabled className="flex-1 py-6 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] border border-slate-200 dark:border-white/5">Manifest Solidified</button>
                                )}
                                <button className="px-8 bg-slate-50 dark:bg-white/5 rounded-[2rem] text-slate-400 dark:text-slate-500 hover:text-indigo-600 transition-all border border-slate-200 dark:border-white/10 shadow-sm">
                                    <Info className="w-6 h-6" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );

    const renderStaffing = () => (
        <div className="space-y-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter font-outfit italic">Medical Roster.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[
                    { name: 'Dr. Sarah Chen', dept: 'Emergency Medicine', status: 'On-Call', active: true },
                    { name: 'Dr. Michael Ross', dept: 'Cardiology', status: 'In-Surgery', active: false },
                    { name: 'Nurse Elena V.', dept: 'ICU Unit', status: 'Available', active: true },
                    { name: 'Dr. James Wilson', dept: 'Trauma Care', status: 'Responding', active: true },
                ].map((staff, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 flex items-center gap-6 shadow-xl shadow-slate-200/50 dark:shadow-none group hover:border-indigo-500/30 transition-all">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:rotate-12 transition-transform">
                            {staff.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-slate-900 dark:text-white font-black italic">{staff.name}</h4>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">{staff.dept}</p>
                            <div className="flex items-center gap-2 mt-4 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-full w-fit">
                                <div className={`w-2 h-2 rounded-full ${staff.active ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${staff.active ? 'text-emerald-500' : 'text-orange-500'}`}>{staff.status}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-indigo-600/5 dark:bg-indigo-600/10 p-16 rounded-[4rem] border-4 border-dashed border-indigo-500/20 text-center hover:bg-indigo-600/10 transition-all group pointer-events-auto cursor-pointer">
                <p className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.5em] text-[10px] italic">Register Deployment Node</p>
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mt-6 shadow-2xl group-hover:scale-120 transition-all">
                    <Plus className="w-8 h-8" />
                </div>
            </div>
        </div>
    );

    const renderResources = () => (
        <div className="space-y-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter font-outfit italic">Analytics & Flow.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                    { label: 'High-Flow Ventilators', count: 42, total: 50, color: 'bg-blue-600', glow: 'shadow-blue-600/20' },
                    { label: 'Critical Care Units', count: 18, total: 20, color: 'bg-red-600', glow: 'shadow-red-600/20' },
                    { label: 'Lox Oxygen Reserves', count: 85, total: 100, color: 'bg-emerald-600', glow: 'shadow-emerald-600/20' },
                    { label: 'Blood Inventory (O-)', count: 120, total: 200, color: 'bg-indigo-600', glow: 'shadow-indigo-600/20' },
                ].map((res, i) => (
                    <div key={i} className="bg-white dark:bg-slate-950 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 space-y-8 shadow-xl shadow-slate-200/50 dark:shadow-none group">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-3">{res.label}</p>
                                <h4 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic">{res.count}<span className="text-slate-200 dark:text-slate-800 text-3xl ml-2 tracking-widest">/ {res.total}</span></h4>
                            </div>
                            <div className={`w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors`}>
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="h-4 bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden p-1 shadow-inner">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(res.count / res.total) * 100}%` }} className={`h-full ${res.color} rounded-full ${res.glow} shadow-xl`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Equipment Hub': return renderEquipmentHub();
            case 'Transfers': return renderTransfers();
            case 'Staffing': return renderStaffing();
            case 'Resources': return renderResources();
            default: return renderOverview();
        }
    };

    if (!user) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-2xl"></div></div>;

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0c10] text-slate-900 dark:text-slate-200 flex font-inter transition-colors duration-500 overflow-x-hidden">
            {/* Sidebar */}
            <AnimatePresence>
                {(sidebarOpen || window.innerWidth >= 1024) && (
                    <motion.aside initial={{ x: -400 }} animate={{ x: 0 }} exit={{ x: -400 }} className="fixed inset-y-0 left-0 z-50 w-80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 lg:static transition-all duration-300">
                        <div className="h-28 flex items-center px-10 border-b border-slate-100 dark:border-white/5">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-2xl shadow-indigo-600/30">
                                <Shield className="h-7 w-7 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter font-outfit text-slate-900 dark:text-white uppercase italic">LifeLink <span className="text-indigo-600">Admin.</span></span>
                            <button className="lg:hidden ml-auto p-2" onClick={() => setSidebarOpen(false)}>
                                <X className="w-8 h-8 text-slate-400 hover:text-red-500 transition-colors" />
                            </button>
                        </div>

                        <nav className="p-8 space-y-3">
                            <p className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.5em] mb-6 px-4">Registry Control</p>
                            {navItems.map((item, index) => (
                                <button key={index} onClick={() => { setActiveTab(item.label); setSidebarOpen(false); }} className={`w-full flex items-center group space-x-4 px-6 py-5 rounded-[1.5rem] transition-all duration-500 ${activeTab === item.label ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 translate-x-1' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white'}`}>
                                    <span className={`${activeTab === item.label ? 'text-white' : 'text-indigo-600'}`}>{item.icon}</span>
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="absolute bottom-8 w-full px-8 space-y-6">
                            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/10 text-center shadow-inner">
                                <TrendingUp className="w-6 h-6 text-indigo-500 mx-auto mb-3" />
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Network Stream: Stable</p>
                            </div>
                            <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-3 py-5 text-slate-400 hover:bg-red-500/10 hover:text-red-600 rounded-[1.5rem] transition-all group border border-transparent hover:border-red-500/10">
                                <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                <span className="text-xs font-black uppercase tracking-[0.3em]">Disconnect Terminal</span>
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 lg:h-screen overflow-y-auto custom-scrollbar">
                <header className={`sticky top-0 z-40 h-28 flex items-center justify-between px-8 lg:px-14 transition-all duration-500 ${scrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 shadow-2xl' : 'bg-transparent'}`}>
                    <button className="lg:hidden p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-xl" onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-7 h-7" />
                    </button>

                    <div className="flex items-center space-x-8 ml-auto">
                        <ThemeToggle />

                        <div className="flex items-center space-x-5 bg-white dark:bg-slate-900/50 p-2.5 pr-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl">{user.name.charAt(0)}</div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-black text-slate-900 dark:text-white leading-none uppercase italic">{user.name}</p>
                                <p className="text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em] mt-1.5 font-outfit">Auth: Facility Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 lg:p-14 max-w-7xl mx-auto space-y-16 pb-40">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
                        <div className="space-y-4">
                            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter font-outfit uppercase italic leading-[0.9]">
                                Admin <span className="text-indigo-600 block sm:inline">Portal.</span>
                            </h1>
                            <p className="text-slate-500 font-bold text-lg lg:text-xl uppercase tracking-widest italic decoration-indigo-600/30 decoration-2 underline underline-offset-8">Critical Resource Logistics Terminal.</p>
                        </div>
                        <div className="flex flex-wrap gap-5 w-full xl:w-auto">
                            <button onClick={() => setShowEquipModal(true)} className="flex-1 sm:flex-none px-8 py-5 bg-indigo-600 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-950 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-600/30"><Plus className="w-5 h-5" /> Request Resource</button>
                            <button onClick={() => setShowTransferModal(true)} className="flex-1 sm:flex-none px-8 py-5 bg-white text-slate-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200/50 border border-slate-100"><ArrowRightLeft className="w-5 h-5 text-blue-600" /> Dispatch Transfer</button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5, ease: "anticipate" }}>
                            {renderTabContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Premium Modals */}
            <AnimatePresence>
                {(showEquipModal || showTransferModal) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl">
                        {showEquipModal && (
                            <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/10 rounded-[4rem] w-full max-w-xl p-14 space-y-10 shadow-2xl">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">New <span className="text-indigo-600">Signal.</span></h3>
                                    <button onClick={() => setShowEquipModal(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-colors"><X className="w-8 h-8" /></button>
                                </div>
                                <form onSubmit={handleEquipSubmit} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] ml-2 font-outfit">Resource Name</label>
                                        <input required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[1.5rem] py-5 px-8 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-black uppercase tracking-widest shadow-inner placeholder:text-slate-200 dark:placeholder:text-slate-800" value={equipForm.equipmentName} onChange={e => setEquipForm({ ...equipForm, equipmentName: e.target.value })} placeholder="Ex: Oxygen Tank Type-B" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] ml-2">Batch QTY</label>
                                            <input type="number" required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[1.5rem] py-5 px-8 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-black shadow-inner" value={equipForm.quantity} onChange={e => setEquipForm({ ...equipForm, quantity: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] ml-2">Logistics Type</label>
                                            <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[1.5rem] py-5 px-8 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-black appearance-none cursor-pointer uppercase tracking-widest text-[10px]" value={equipForm.type} onChange={e => setEquipForm({ ...equipForm, type: e.target.value as any })}>
                                                <option value="need">Sector Need</option>
                                                <option value="offer">Network Offer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full py-6 bg-indigo-600 rounded-[2rem] text-white font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all">Broadcast Terminal Signal</button>
                                </form>
                            </motion.div>
                        )}

                        {showTransferModal && (
                            <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/10 rounded-[4rem] w-full max-w-xl p-14 space-y-10 shadow-2xl">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">Manifest <span className="text-blue-600">Dispatch.</span></h3>
                                    <button onClick={() => setShowTransferModal(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-colors"><X className="w-8 h-8" /></button>
                                </div>
                                <form onSubmit={handleTransferSubmit} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] ml-2 font-outfit">Node Identifier</label>
                                        <input required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[1.5rem] py-5 px-8 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-black uppercase tracking-widest shadow-inner placeholder:text-slate-200 dark:placeholder:text-slate-800" value={transferForm.patientName} onChange={e => setTransferForm({ ...transferForm, patientName: e.target.value })} placeholder="Full Patient Name" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] ml-2 font-outfit">Medical Rationale</label>
                                        <textarea required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2rem] py-5 px-8 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold shadow-inner placeholder:text-slate-200 dark:placeholder:text-slate-800 resize-none uppercase text-xs tracking-widest" rows={4} value={transferForm.reason} onChange={e => setTransferForm({ ...transferForm, reason: e.target.value })} placeholder="Input detailed reasoning for transfer..." />
                                    </div>
                                    <button type="submit" className="w-full py-6 bg-blue-600 rounded-[2rem] text-white font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all">Initiate Logistic Sequence</button>
                                </form>
                            </motion.div>
                        )}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
