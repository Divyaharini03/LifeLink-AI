import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Search, Droplets,
    FileText, Calendar, LogOut, Navigation, Menu, User as UserIcon, X,
    Shield, Ambulance, Loader2, CheckCircle2
} from 'lucide-react';
import { SOSButton } from '../../components/SOSButton';
import MapComponent from '../../components/MapComponent';
import { getCurrentUser, logoutUser } from '../../services/authService';
import { createEmergency, getEmergencies, updateEmergencyStatus } from '../../services/emergencyService';
import { ThemeToggle } from '../../components/ThemeToggle';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeEmergency, setActiveEmergency] = useState<any>(null);
    const [resetCounter, setResetCounter] = useState(0);
    const [cancelling, setCancelling] = useState(false);
    const cancellingRef = useRef(false);
    const recentlyCancelledIds = useRef<Set<string>>(new Set());

    // Synchronize ref with state
    useEffect(() => {
        cancellingRef.current = cancelling;
    }, [cancelling]);

    useEffect(() => {
        const u = getCurrentUser();
        if (!u) {
            navigate('/login');
        } else {
            setUser(u);
        }

        let watchId: number;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => setLocation(position.coords),
                (error) => console.error("GPS Error:", error),
                { enableHighAccuracy: true }
            );
        }

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [navigate]);

    // Check for active SOS periodically
    useEffect(() => {
        if (!user) return;
        const checkActiveEmergency = async () => {
            if (cancellingRef.current) return;
            try {
                const emergencies = await getEmergencies();
                if (cancellingRef.current) return;
                const active = Array.isArray(emergencies)
                    ? emergencies
                        .filter((e: any) => {
                            const pId = String(e.patientId?._id || e.patientId);
                            const eId = String(e._id || e.id);
                            const myId = String(user.id || (user as any)._id);
                            const isMyEmergency = pId === myId;

                            return isMyEmergency &&
                                e.status !== 'resolved' &&
                                e.status !== 'cancelled' &&
                                !recentlyCancelledIds.current.has(eId);
                        })
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
                    : null;

                // Only update if we're not in the middle of a cancellation
                if (!cancellingRef.current) {
                    const currentId = activeEmergency ? String(activeEmergency._id || activeEmergency.id) : null;
                    const nextId = active ? String(active._id || active.id) : null;

                    if (nextId !== currentId) {
                        setActiveEmergency(active);
                    } else if (active && JSON.stringify(active.status) !== JSON.stringify(activeEmergency?.status)) {
                        setActiveEmergency(active);
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        };

        checkActiveEmergency();
        const interval = setInterval(checkActiveEmergency, 3000); // 3s polling for better response
        return () => clearInterval(interval);
    }, [user, cancelling]);

    const handleSOS = async () => {
        // Use current location or fallback to a default if GPS is blocked/slow
        const coords = location || {
            latitude: 20.5937, // Default coordinates (India center as example)
            longitude: 78.9629
        };

        try {
            const response = await createEmergency({
                location: {
                    type: 'Point',
                    coordinates: [coords.longitude, coords.latitude],
                    address: location ? 'Current Location' : 'Last Known Location (Estimated)'
                },
                type: 'ambulance',
                description: 'Patient SOS Triggered from Dashboard'
            });
            setActiveEmergency(response.emergency);
        } catch (error) {
            console.error("SOS Creation Error:", error);
            alert('Failed to send SOS. Please check your connection.');
        }
    };

    const handleCancelSOS = async () => {
        if (!activeEmergency || cancelling) return;

        // Optimistic update for immediate feedback
        cancellingRef.current = true;
        setCancelling(true);

        const idToCancel = String(activeEmergency._id || activeEmergency.id);
        console.log("Cancelling emergency:", idToCancel);
        recentlyCancelledIds.current.add(idToCancel);

        // Immediate UI reset
        setActiveEmergency(null);
        setResetCounter(prev => prev + 1);

        try {
            await updateEmergencyStatus(idToCancel, 'cancelled');
            console.log("SOS Cancelled successfully on server");
        } catch (error: any) {
            console.error("Cancellation error:", error);
            // Even if server call fails, we've already cleared UI and set recentlyCancelled
        } finally {
            // Cool-down period to ensure polling doesn't catch the old state during sync
            setTimeout(() => {
                setCancelling(false);
                cancellingRef.current = false;
            }, 5000); // Increased cooldown for more reliable sync
        }
    };

    const handleContactRescue = () => {
        if (!activeEmergency?.assignedAmbulanceId) {
            alert('No rescue unit assigned yet. Please wait.');
            return;
        }
        // Try to open dialer
        window.open(`tel:${activeEmergency.assignedAmbulanceId.phone}`);
    };

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const [showAppointments, setShowAppointments] = useState(false);
    const [showRecords, setShowRecords] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleAction = (label: string) => {
        if (label === 'Appointments') {
            setShowAppointments(true);
        } else if (label === 'Medical Records') {
            setShowRecords(true);
        }
    };

    const handleMockRequest = (type: string) => {
        setRequesting(true);
        setTimeout(() => {
            setRequesting(false);
            setSuccessMsg(`${type} request sent successfully!`);
            setTimeout(() => setSuccessMsg(''), 3000);
        }, 1500);
    };

    const navItems = [
        { icon: <Activity className="w-5 h-5" />, label: 'Overview', active: true },
        { icon: <Search className="w-5 h-5" />, label: 'Find Doctor', link: '/find-doctor' },
        { icon: <Calendar className="w-5 h-5" />, label: 'Appointments' },
        { icon: <FileText className="w-5 h-5" />, label: 'Medical Records' },
    ];

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#05070a] text-slate-900 dark:text-white selection:bg-blue-500/30 font-inter overflow-x-hidden relative flex transition-colors duration-500">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-600/5 blur-[80px] rounded-full" />
            </div>

            {/* Sidebar with Premium Glassmorphism */}
            <AnimatePresence>
                {(sidebarOpen || window.innerWidth >= 1024) && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className={`
                            fixed inset-y-0 left-0 z-50 w-72 backdrop-blur-2xl bg-white dark:bg-black/40 text-slate-900 dark:text-white border-r border-slate-200 dark:border-white/5 lg:static transition-all duration-500
                            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        `}
                    >
                        <div className="h-24 flex items-center px-8 bg-gradient-to-b from-white dark:from-white/5 to-transparent">
                            <motion.div
                                whileHover={{ rotate: 180 }}
                                className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20"
                            >
                                <Activity className="h-6 w-6 text-white" />
                            </motion.div>
                            <span className="text-xl font-bold tracking-tight font-outfit uppercase">
                                LIFE<span className="text-blue-500">LINK</span>
                            </span>
                            <button className="lg:hidden ml-auto p-2" onClick={() => setSidebarOpen(false)}>
                                <X className="w-6 h-6 text-white/30" />
                            </button>
                        </div>

                        <nav className="p-6 mt-4 space-y-2">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-5 mb-4 italic">Command Center</p>
                            {navItems.map((item, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ x: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if (item.link) {
                                            navigate(item.link);
                                        } else {
                                            handleAction(item.label);
                                        }
                                    }}
                                    className={`w-full flex items-center group space-x-3 px-6 py-4 rounded-2xl transition-all duration-300
                                        ${item.active
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-[0_10px_25px_rgba(37,99,235,0.25)] text-white font-black uppercase tracking-[0.1em] text-[11px]'
                                            : 'text-white/40 hover:bg-white/5 hover:text-white font-bold text-xs'}
                                    `}
                                >
                                    <span className={`transition-all duration-300 ${item.active ? 'text-white' : 'text-blue-500'}`}>
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                    {item.active && <motion.div layoutId="nav-dot" className="w-1.5 h-1.5 bg-white rounded-full ml-auto shadow-[0_0_10px_#fff]" />}
                                </motion.button>
                            ))}
                        </nav>

                        <div className="absolute bottom-6 w-full px-6">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-3 px-6 py-4 text-slate-500 dark:text-red-400/60 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 rounded-2xl transition-all group font-bold uppercase tracking-widest text-[11px]"
                            >
                                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 lg:max-h-screen lg:overflow-y-auto relative z-10 flex flex-col">
                {/* Header */}
                <header className={`sticky top-0 z-40 h-24 flex items-center justify-between px-8 lg:px-12 transition-all duration-500 ${scrolled ? 'backdrop-blur-xl bg-white/80 dark:bg-black/60 border-b border-slate-200 dark:border-white/5 shadow-lg shadow-slate-200/20 dark:shadow-black/40' : 'bg-transparent'}`}>
                    <div className="flex items-center gap-6">
                        <button
                            className="lg:hidden p-3 backdrop-blur-lg bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Vital Stats Ticker */}
                        <div className="hidden xl:flex items-center gap-8 py-2 px-6 backdrop-blur-md bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/40">Server: <span className="text-emerald-500">READY</span></span>
                            </div>
                            <div className="w-px h-4 bg-slate-200 dark:bg-white/10" />
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/40">Encryption: <span className="text-blue-500">AES-256</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <ThemeToggle />
                        <div className="flex items-center space-x-4 bg-white dark:bg-white/5 backdrop-blur-md p-1.5 pr-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300">
                            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all">
                                <UserIcon className="w-6 h-6" />
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none uppercase tracking-tight">{user.name}</p>
                                <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1 opacity-70">Patient ID #{user.id?.slice(-8)}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 lg:p-12 max-w-[1600px] mx-auto w-full space-y-12">
                    {/* Hero Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <p className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-3 flex items-center gap-2">
                                <span className="w-6 h-px bg-blue-500" /> PATIENT PORTAL
                            </p>
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-outfit uppercase">
                                Medical <span className="text-blue-500">Dashboard.</span>
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-5 shadow-sm dark:shadow-xl"
                        >
                            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest mb-0.5">System Date</p>
                                <p className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Vitals Feed - NEW ADVANCED SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'HEART RATE', value: '72', unit: 'BPM', status: 'Normal', color: 'text-rose-500' },
                            { label: 'BLOOD OXYGEN', value: '98', unit: '%', status: 'Optimal', color: 'text-emerald-500' },
                            { label: 'SYNC STATUS', value: 'LIVE', unit: '', status: 'Active', color: 'text-blue-500' },
                            { label: 'RESPONSE PRIORITY', value: 'HIGH', unit: '', status: 'Secured', color: 'text-indigo-500' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/5 p-6 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all group overflow-hidden relative shadow-sm"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 -skew-x-12 translate-x-12 group-hover:translate-x-8 transition-transform" />
                                <p className="text-[9px] font-bold text-slate-500 dark:text-white/30 tracking-[0.2em] uppercase mb-4">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className={`text-4xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</h3>
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase">{stat.unit}</span>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${stat.color.replace('text', 'bg')}`} />
                                    <span className="text-[9px] font-bold text-slate-500 dark:text-white/60 tracking-widest">{stat.status}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* SOS Section - REDESIGNED FOR MAX IMPACT */}
                    <div className="relative group overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-[#0c0d0f] dark:to-[#05070a] rounded-[4rem] p-12 lg:p-16 shadow-xl dark:shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-white/[0.03] transition-all duration-500">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-red-600/5 transition-colors duration-1000" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-16">
                            <div className="max-w-2xl space-y-10 text-center xl:text-left">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center space-x-3 bg-slate-100 dark:bg-white/5 backdrop-blur-xl text-slate-600 dark:text-white px-4 py-2 rounded-full border border-slate-200 dark:border-white/10"
                                >
                                    <div className="relative flex h-2.5 w-2.5">
                                        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div>
                                        <div className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Emergency Protocols Active</span>
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight uppercase"
                                >
                                    Instant SOS <br />
                                    <span className="text-red-500 drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]">Assistance.</span>
                                </motion.h2>

                                <p className="text-slate-500 dark:text-white/50 text-base font-medium leading-relaxed max-w-lg">
                                    Secure and immediate satellite-linked emergency protocols. One touch activates rapid responder dispatch.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto xl:mx-0">
                                    <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/10 backdrop-blur-xl group/card hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 text-left shadow-sm">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform">
                                            <Navigation className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Signal Status</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                            {location ? 'Precision Lock' : 'Searching...'}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/10 backdrop-blur-xl group/card hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 text-left shadow-sm">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform">
                                            <Shield className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Protection Layer</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">ACTIVE DEFENSE</p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500/20 blur-[60px] rounded-full scale-75 animate-pulse" />
                                <SOSButton
                                    key={activeEmergency ? `sent-${String(activeEmergency._id || activeEmergency.id)}` : `ready-v${resetCounter}`}
                                    onActivate={handleSOS}
                                    onCancel={handleCancelSOS}
                                    isSent={!!activeEmergency}
                                />
                            </div>
                        </div>

                        {/* Status Panel if SOS Active */}
                        <AnimatePresence>
                            {activeEmergency && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-12 relative z-10 p-8 bg-red-600 rounded-[2.5rem] border border-red-500 shadow-2xl text-white overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-full bg-white/10 -skew-x-12 translate-x-32" />
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white text-red-600 rounded-full flex items-center justify-center animate-bounce">
                                                    <Activity className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black uppercase italic tracking-tight">Help is on the way!</h3>
                                                    <p className="text-sm font-bold opacity-90 uppercase tracking-widest mt-1">Status: {activeEmergency.status} • Emergency ID #{activeEmergency._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                            {activeEmergency.assignedAmbulanceId ? (
                                                <div className="bg-black/20 p-6 rounded-3xl border border-white/10 space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <Ambulance className="w-8 h-8" />
                                                        <div>
                                                            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Assigned Unit</p>
                                                            <h4 className="text-xl font-black">{activeEmergency.assignedAmbulanceId.name}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-6">
                                                        <div>
                                                            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Contact</p>
                                                            <p className="font-bold">{activeEmergency.assignedAmbulanceId.phone}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Type</p>
                                                            <p className="font-bold uppercase">{activeEmergency.assignedAmbulanceId.type}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 py-4">
                                                    <div className="w-4 h-4 bg-white/20 rounded-full animate-ping" />
                                                    <p className="text-sm font-bold uppercase tracking-widest">Dispatching nearest available unit...</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="md:w-64 flex flex-col gap-3">
                                            <button
                                                disabled={cancelling}
                                                onClick={handleContactRescue}
                                                className="w-full py-4 bg-white text-red-600 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                Contact Rescue
                                            </button>
                                            <button
                                                disabled={cancelling}
                                                onClick={handleCancelSOS}
                                                className="w-full py-4 bg-black/20 hover:bg-black/30 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {cancelling ? 'Cancelling...' : 'Cancel Call'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {location && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-14 relative z-10 w-full h-80 lg:h-[400px] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl"
                            >
                                <MapComponent center={[location.latitude, location.longitude]} className="h-full w-full" />
                                <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">GPS Signal Locked</span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Quick Actions - HIGH TECH OVERHAUL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                        {[
                            {
                                icon: <Search className="w-8 h-8" />,
                                title: "Doctor Intel",
                                desc: "Biometric matching with medical elite.",
                                link: "/find-doctor",
                                accent: "group-hover:text-blue-500",
                                glow: "shadow-blue-500/20"
                            },
                            {
                                icon: <Droplets className="w-8 h-8" />,
                                title: "Blood Donor",
                                desc: "Request emergency blood units and find donors.",
                                link: "/blood-donation",
                                accent: "group-hover:text-red-500",
                                glow: "shadow-red-500/20"
                            },
                            {
                                icon: <Navigation className="w-8 h-8" />,
                                title: "NearBy Hosps",
                                desc: "Locate and navigate to the nearest hospitals.",
                                link: "/nearby-hospitals",
                                accent: "group-hover:text-emerald-500",
                                glow: "shadow-emerald-500/20"
                            }
                        ].map((card, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -15, scale: 1.02 }}
                                onClick={() => navigate(card.link)}
                                className="group relative bg-white dark:bg-[#0c0d0f] p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/[0.03] cursor-pointer overflow-hidden shadow-xl dark:shadow-2xl transition-all duration-500"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] dark:from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-white/5 -skew-x-12 translate-x-16 group-hover:translate-x-10 transition-transform duration-700" />

                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-2xl flex items-center justify-center text-slate-400 dark:text-white/50 mb-8 group-hover:bg-blue-600 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all duration-500 shadow-xl group-hover:rotate-6">
                                        {card.icon}
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">{card.title}</h4>
                                    <p className="text-slate-500 dark:text-white/50 mt-3 font-medium text-sm leading-relaxed max-w-[200px]">
                                        {card.desc}
                                    </p>

                                    <div className={`mt-8 flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-all ${card.accent}`}>
                                        <span className="w-5 h-px bg-white/20 group-hover:w-8 group-hover:bg-current transition-all" />
                                        Launch Module
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {/* Intelligence Feed - NEW BOTTOM SECTION */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="xl:col-span-2 bg-white dark:bg-white/5 backdrop-blur-xl rounded-[3rem] border border-slate-200 dark:border-white/5 p-10 overflow-hidden relative shadow-sm dark:shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Medical Activity</h3>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest mt-1">Real-time health timeline</p>
                                </div>
                                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-500/20">
                                    LIVE FEED
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { time: '12:45 PM', event: 'Profile Synced with Satellite Node', icon: <Navigation className="w-4 h-4" /> },
                                    { time: '10:30 AM', event: 'Biometric Heartbeat Verified', icon: <Activity className="w-4 h-4" /> },
                                    { time: 'Yesterday', event: 'Encrypted Records Updated', icon: <FileText className="w-4 h-4" /> }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-6 group cursor-default">
                                        <div className="text-slate-400 dark:text-white/20 font-bold text-[10px] uppercase w-16">{item.time}</div>
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40 group-hover:bg-blue-600/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">
                                            {item.icon}
                                        </div>
                                        <div className="text-sm font-bold text-slate-600 dark:text-white/70 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.event}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <Shield className="w-12 h-12 mb-6 opacity-80" />
                                    <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Neural Link <br /> Secured.</h3>
                                    <p className="mt-6 text-white/70 font-bold text-sm leading-relaxed italic">
                                        "Your medical data is protected by Grade-IV encryption protocols."
                                    </p>
                                </div>
                                <button className="mt-12 w-full py-4 bg-white text-[#1e293b] rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all">
                                    Privacy Vault
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Command Center Modals & Overlays */}
                <AnimatePresence>
                    {(showAppointments || showRecords) && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white dark:bg-[#0c0d0f] w-full max-w-lg rounded-[3rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl"
                            >
                                <div className="p-10">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                                                {showAppointments ? <Calendar className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white leading-none">
                                                    {showAppointments ? 'Appointments' : 'Medical Records'}
                                                </h3>
                                                <p className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest mt-1">LifeLink Command Node</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setShowAppointments(false); setShowRecords(false); }}
                                            className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {showAppointments ? (
                                        <div className="space-y-6">
                                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 text-center">
                                                <p className="text-slate-500 dark:text-white/40 font-bold uppercase tracking-widest text-xs">No Scheduled Appointments</p>
                                            </div>
                                            <button
                                                onClick={() => { setShowAppointments(false); navigate('/find-doctor'); }}
                                                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                                            >
                                                Book New Session
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 gap-4">
                                                {['Radiology Scan', 'Blood Report', 'Biometric History'].map((doc, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-700 dark:text-white/80">{doc}</span>
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Encrypted</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => handleMockRequest('Medical Records')}
                                                disabled={requesting}
                                                className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {requesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Synchronizing...</> : 'Request Official Copy'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-emerald-400/30 backdrop-blur-xl"
                        >
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-tighter leading-none">Transmission Success</h4>
                                <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mt-1">{successMsg}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default PatientDashboard;
