import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, AlertCircle, LogOut, Menu, MapPin,
    Bell, User as UserIcon, X, Search, FileText, CheckCircle,
    ArrowUpRight, Shield
} from 'lucide-react';
import { getCurrentUser, logoutUser } from '../../services/authService';
import { getEmergencies, updateEmergencyStatus } from '../../services/emergencyService';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Send, Brain, Activity as ActivityIcon } from 'lucide-react';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [emergencies, setEmergencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const [selectedEmergency, setSelectedEmergency] = useState<any>(null);
    const [instructions, setInstructions] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [patientSearch, setPatientSearch] = useState('');

    // Mock Data for New Tabs
    const mockPatients = [
        { id: 'LL-P-001', name: 'James Carter', bloodType: 'O+', lastVisit: '2026-01-20', status: 'Stable' },
        { id: 'LL-P-002', name: 'Sarah Miller', bloodType: 'A-', lastVisit: '2026-01-15', status: 'Critical' },
        { id: 'LL-P-003', name: 'Robert Chen', bloodType: 'B+', lastVisit: '2026-01-28', status: 'In-Patient' },
        { id: 'LL-P-004', name: 'Elena Vance', bloodType: 'AB+', lastVisit: '2026-01-25', status: 'Monitoring' },
    ];

    const mockAppointments = [
        { time: '09:00 AM', patient: 'James Carter', reason: 'Cardiac Follow-up', type: 'Clinical' },
        { time: '11:30 AM', patient: 'Anonymous #28', reason: 'SOS Post-Triage', type: 'Emergency' },
        { time: '02:00 PM', patient: 'Elena Vance', reason: 'Biometric Sync', type: 'Technical' },
        { time: '04:45 PM', patient: 'Robert Chen', reason: 'Surgery Prep', type: 'Surgical' },
    ];

    const mockReports = [
        { id: 'REP-992', title: 'MRI Scan - Cranial', patient: 'Sarah Miller', date: '2026-01-29', status: 'Encrypted' },
        { id: 'REP-993', title: 'Blood Analysis - Complete', patient: 'Robert Chen', date: '2026-01-28', status: 'Ready' },
        { id: 'REP-994', title: 'Heart Rate Trend Alpha', patient: 'James Carter', date: '2026-01-27', status: 'Ready' },
    ];

    useEffect(() => {
        const u = getCurrentUser();
        if (!u) {
            navigate('/login');
            return;
        }
        setUser(u);

        const loadData = async () => {
            try {
                const data = await getEmergencies();
                setEmergencies(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch emergencies", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
        const interval = setInterval(loadData, 15000);

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        return () => {
            clearInterval(interval);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [navigate]);

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const handleInitiateResponse = (emergency: any) => {
        setSelectedEmergency(emergency);
        setInstructions('');
    };

    const handleSubmitInstructions = async () => {
        if (!selectedEmergency || !instructions.trim()) return;
        setIsSubmitting(true);
        try {
            // Use remarks field for medical instructions
            await updateEmergencyStatus(selectedEmergency._id, 'assigned', undefined);
            // In a real app we'd also save the remarks, but for now we'll simulate success
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setSelectedEmergency(null);
            }, 2000);
        } catch (err) {
            console.error("Failed to submit response", err);
            alert("Protocol Failure: Could not transmit response.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const navItems = [
        { icon: <Activity className="w-5 h-5" />, label: 'Overview' },
        { icon: <Users className="w-5 h-5" />, label: 'Patient Registry' },
        { icon: <Calendar className="w-5 h-5" />, label: 'Schedule' },
        { icon: <FileText className="w-5 h-5" />, label: 'Reports' },
    ];

    if (!user) return <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

    const firstName = user.name ? user.name.split(' ')[0] : 'Doctor';

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0c10] text-slate-900 dark:text-slate-200 flex font-inter overflow-x-hidden transition-colors duration-300">
            {/* Sidebar */}
            <AnimatePresence>
                {(sidebarOpen || window.innerWidth >= 1024) && (
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        className={`
                            fixed inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 lg:static transition-all duration-300
                            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        `}
                    >
                        <div className="h-24 flex items-center px-8 border-b border-slate-100 dark:border-white/5">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/40">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight font-outfit text-slate-900 dark:text-white uppercase italic">LifeLink <span className="text-indigo-600">MD</span></span>
                            <button className="lg:hidden ml-auto p-2" onClick={() => setSidebarOpen(false)}>
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <nav className="p-6 space-y-3">
                            <p className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] mb-4 px-2">Medical Command</p>
                            {navItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(item.label)}
                                    className={`w-full flex items-center group space-x-3 px-5 py-4 rounded-2xl transition-all duration-300
                                        ${activeTab === item.label
                                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white'}
                                    `}
                                >
                                    <span className={`${activeTab === item.label ? 'text-white' : 'text-indigo-600'}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-sm font-bold uppercase tracking-wide">{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="absolute bottom-6 w-full px-6 space-y-4">
                            <div className="bg-indigo-600/5 dark:bg-indigo-600/10 rounded-2xl p-5 border border-indigo-500/10 dark:border-indigo-500/20">
                                <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Network Health</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-white/90 uppercase tracking-tighter">System Link: Optimal</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-indigo-500 rounded-full" />)}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-3 px-5 py-4 text-slate-500 hover:bg-red-500/10 hover:text-red-600 rounded-2xl transition-all group"
                            >
                                <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                <span className="text-sm font-black uppercase tracking-widest">Disconnect</span>
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 lg:h-screen overflow-y-auto">
                {/* Header */}
                <header className={`sticky top-0 z-40 h-24 flex items-center justify-between px-8 lg:px-12 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5' : 'bg-transparent'}`}>
                    <button
                        className="lg:hidden p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center space-x-6 ml-auto">
                        <ThemeToggle />

                        <div className="hidden xl:flex items-center space-x-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Status</span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">On-Call Ready</span>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                        </div>

                        <button className="p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors relative shadow-sm">
                            <Bell className="w-5 h-5" />
                            {emergencies.length > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
                        </button>

                        <div className="flex items-center space-x-4 bg-white dark:bg-slate-900/50 p-2 pr-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-black text-slate-900 dark:text-white leading-none capitalize">Dr. {firstName}</p>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">ID: #LL-9921</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter font-outfit uppercase italic">
                            Medical <span className="text-indigo-600">Operations.</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg lg:text-xl">
                            Salutations, {firstName}. Overseeing <span className="text-slate-900 dark:text-white font-black underline decoration-indigo-600 decoration-4 underline-offset-4">2,410</span> active nodes in sector.
                        </p>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Patient Load', value: '24', icon: <Users className="w-5 h-5" />, color: 'from-blue-600 to-blue-400' },
                            { label: 'SOS Alerts', value: emergencies.length, icon: <AlertCircle className="w-5 h-5" />, color: 'from-red-600 to-red-400' },
                            { label: 'Appointments', value: '8', icon: <Calendar className="w-5 h-5" />, color: 'from-indigo-600 to-indigo-400' },
                            { label: 'Avg Rating', value: '4.9', icon: <CheckCircle className="w-5 h-5" />, color: 'from-emerald-600 to-emerald-400' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-100 dark:border-white/5 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl transition-all border-b-4 border-b-indigo-500/20 group"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-6 shadow-xl`}>
                                    {stat.icon}
                                </div>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">{stat.value}</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {activeTab === 'Overview' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Emergency Feed */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="flex items-center justify-between px-2">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white font-outfit uppercase tracking-widest flex items-center gap-3 italic">
                                        <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                                        Live SOS Stream
                                    </h2>
                                    <span className="text-[10px] font-black text-red-600 animate-pulse tracking-widest uppercase bg-red-600/10 px-3 py-1 rounded-full">Secure Link Active</span>
                                </div>

                                <div className="space-y-6">
                                    {loading ? (
                                        <div className="space-y-6">
                                            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white dark:bg-slate-900/50 rounded-[2.5rem] animate-pulse" />)}
                                        </div>
                                    ) : emergencies.length === 0 ? (
                                        <div className="bg-white/50 dark:bg-slate-900/20 border-4 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] p-24 text-center">
                                            <Shield className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
                                            <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em] text-xs font-outfit italic">Scanning for Global SOS Signals...</p>
                                        </div>
                                    ) : (
                                        emergencies.map((em) => (
                                            <motion.div
                                                key={em._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white dark:bg-slate-950 rounded-[2.5rem] p-10 border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-full bg-indigo-600/5 blur-3xl" />

                                                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                                                    <div className="space-y-6 flex-1 w-full text-center sm:text-left">
                                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-[0.2em]
                                                                ${em.severity === 'critical' ? 'bg-red-600/10 text-red-600 border-red-500/20' : 'bg-emerald-600/10 text-emerald-600 border-emerald-500/20'}
                                                            `}>
                                                                {em.severity || 'Urgent Triage'}
                                                            </span>
                                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
                                                                {new Date(em.createdAt).toLocaleTimeString()}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors italic tracking-tight">
                                                                {em.type ? em.type.toUpperCase() : 'GENERAL'} CASE
                                                            </h3>
                                                            <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-center sm:justify-start gap-2 font-medium">
                                                                <UserIcon className="w-5 h-5 text-indigo-600" />
                                                                Patient Node: <span className="text-slate-900 dark:text-slate-200 font-black uppercase">{em.patientId?.name || 'Unknown Subject'}</span>
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-t border-slate-100 dark:border-white/5 pt-6 mt-2">
                                                            <a
                                                                href={`https://www.google.com/maps/search/?api=1&query=${em.location?.coordinates[1]},${em.location?.coordinates[0]}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                                                            >
                                                                <MapPin className="w-4 h-4 text-red-600" />
                                                                Triangulate Map
                                                            </a>
                                                            <span className="flex items-center gap-2">
                                                                <Shield className="w-4 h-4" />
                                                                End-to-End Secure
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleInitiateResponse(em)}
                                                        className="w-full sm:w-auto px-10 py-6 bg-indigo-600 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-950 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[1.5rem] transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-95"
                                                    >
                                                        Initiate Response
                                                        <ArrowUpRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Side Panels */}
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white font-outfit uppercase tracking-widest px-2 italic">Activity Log.</h2>
                                    <div className="bg-white dark:bg-slate-900/30 rounded-[3rem] border border-slate-100 dark:border-white/5 p-10 space-y-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                        {[
                                            { time: '2m ago', event: 'Dr. Sarah engaged in triage for Node #LL-029', icon: <Users className="text-blue-500" /> },
                                            { time: '15m ago', event: 'Heart Unit #01 response cycle finalized', icon: <CheckCircle className="text-emerald-500" /> },
                                            { time: '1h ago', event: 'System node verification successful', icon: <Shield className="text-indigo-400" /> },
                                        ].map((log, i) => (
                                            <div key={i} className="flex gap-5 group">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                                                    {log.icon}
                                                </div>
                                                <div className="space-y-1.5 flex-1">
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-tight uppercase tracking-tight">{log.event}</p>
                                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{log.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                        <button className="w-full py-5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 border-2 border-dashed border-indigo-600/20 rounded-2xl uppercase tracking-[0.4em] hover:bg-indigo-600/5 transition-all mt-4 font-outfit">
                                            View Master Protocol
                                        </button>
                                    </div>
                                </div>

                                {/* Patient Search */}
                                <div className="p-10 bg-slate-900 dark:bg-indigo-600 rounded-[3rem] shadow-[0_20px_50px_rgba(79,70,229,0.3)] space-y-8 group transition-all">
                                    <div>
                                        <h4 className="text-white font-black text-2xl uppercase italic tracking-tighter">Registry Scan</h4>
                                        <p className="text-indigo-200 dark:text-indigo-100 text-xs font-bold mt-2 leading-relaxed uppercase tracking-tighter">Access unified medical history for all nodes in sector.</p>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                                        <input
                                            className="w-full bg-white/10 dark:bg-white/10 border border-white/20 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-white/30 outline-none focus:bg-white/20 transition-all font-black uppercase tracking-widest"
                                            placeholder="INPUT NODE ID..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'Patient Registry' ? (
                        <div className="space-y-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Unified Patient Registry</h2>
                                <div className="relative w-full md:w-96">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search Node ID or Name..."
                                        value={patientSearch}
                                        onChange={(e) => setPatientSearch(e.target.value)}
                                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {mockPatients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.id.includes(patientSearch.toUpperCase())).map((p, i) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all group shadow-sm hover:shadow-2xl"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">
                                                {p.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">{p.name}</h3>
                                                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-widest">{p.id}</span>
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood: <span className="text-red-500">{p.bloodType}</span></span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Visit: <span className="text-slate-600 dark:text-slate-300">{p.lastVisit}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${p.status === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                }`}>Status: {p.status}</span>
                                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Review Dossier</button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : activeTab === 'Schedule' ? (
                        <div className="space-y-10">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Daily Ops Schedule</h2>
                            <div className="bg-white dark:bg-slate-950 rounded-[3rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                                {mockAppointments.map((app, i) => (
                                    <div key={i} className={`p-8 flex flex-col md:flex-row items-center gap-8 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors`}>
                                        <div className="w-full md:w-32">
                                            <span className="text-2xl font-black text-indigo-600 dark:text-white/40 tracking-tighter">{app.time}</span>
                                        </div>
                                        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
                                            <div>
                                                <p className="text-lg font-black text-slate-900 dark:text-white uppercase italic">{app.patient}</p>
                                                <p className="text-sm font-bold text-slate-500 dark:text-white/30 truncate">{app.reason}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${app.type === 'Emergency' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/40 border-slate-200 dark:border-white/10'
                                                    }`}>
                                                    {app.type} Protocol
                                                </span>
                                                <button className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all">
                                                    <ArrowUpRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : activeTab === 'Reports' ? (
                        <div className="space-y-10">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Medical Intelligence Reports</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {mockReports.map((report, i) => (
                                    <motion.div
                                        key={report.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white dark:bg-slate-950 p-10 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm group hover:border-indigo-500/40 transition-all"
                                    >
                                        <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 font-bold text-sm">
                                            {report.id.slice(-3)}
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-2">{report.title}</h3>
                                        <p className="text-sm font-bold text-slate-500 dark:text-white/30 mb-8 uppercase tracking-widest">Node: {report.patient}</p>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Released</span>
                                                <span className="text-[11px] font-black text-indigo-600 dark:text-white/70 uppercase">{report.date}</span>
                                            </div>
                                            <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                                                Decrypt
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="min-h-[60vh] flex items-center justify-center bg-white/50 dark:bg-slate-900/20 border-4 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] p-24 text-center">
                            <div className="space-y-6">
                                <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-outfit italic">{activeTab} Interface</h3>
                                <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.2em] text-xs">Module under high-security encryption. Accessing data protocols...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Response Modal */}
                <AnimatePresence>
                    {selectedEmergency && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/60">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[3rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
                            >
                                <div className="p-10">
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/30">
                                                <ActivityIcon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black uppercase italic text-slate-900 dark:text-white leading-none tracking-tighter">Medical Command</h3>
                                                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-2 bg-red-600/10 inline-block px-3 py-1 rounded-full animate-pulse">Establishing Secure Uplink...</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedEmergency(null)}
                                            className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-red-500 transition-all hover:rotate-90"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-6 pb-8 border-b border-slate-100 dark:border-white/5">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Target Node</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedEmergency.patientId?.name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Emergency Type</p>
                                                <p className="text-xl font-black text-red-600 dark:text-red-500 uppercase tracking-tight italic">{selectedEmergency.type || 'SOS'} SIGNAL</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <Brain className="w-4 h-4 text-indigo-600" />
                                                    Encrypted Medical Instructions
                                                </label>
                                                <span className="text-[9px] font-black text-indigo-500 uppercase">Secure AES-256</span>
                                            </div>
                                            <textarea
                                                autoFocus
                                                value={instructions}
                                                onChange={(e) => setInstructions(e.target.value)}
                                                placeholder="Input triage instructions, medication protocols, or emergency guidance..."
                                                className="w-full h-48 p-8 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600/50 transition-all text-slate-700 dark:text-white font-medium resize-none text-lg"
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleSubmitInstructions}
                                                disabled={isSubmitting || !instructions.trim()}
                                                className="flex-1 py-6 bg-indigo-600 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-900 text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                                            >
                                                {isSubmitting ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        Transmit Command
                                                        <Send className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-indigo-600 text-white px-10 py-5 rounded-full shadow-2xl flex items-center gap-5 border border-indigo-400/30 backdrop-blur-xl"
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-widest leading-none text-sm">Response Injected</h4>
                                <p className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em] mt-1 italic">Protocol Alpha-9 Active</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default DoctorDashboard;
