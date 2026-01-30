import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, LogOut, Menu,
    MapPin, AlertCircle,
    Navigation, Ambulance, Heart, Info, Box,
    Droplets, Plus, Settings, X, Truck, Zap, CheckCircle, Activity, Globe
} from 'lucide-react';
import { getCurrentUser, logoutUser } from '../../services/authService';
import { getEmergencies, updateEmergencyStatus } from '../../services/emergencyService';
import { getTransferRequests, updateTransferStatus, getEquipmentRequests, updateEquipmentStatus } from '../../services/adminService';
import { getBloodRequests, updateBloodRequestStatus } from '../../services/bloodService';
import { getUnits, createUnit, updateUnitStatus } from '../../services/unitService';
import MapComponent from '../../components/MapComponent';
import { ThemeToggle } from '../../components/ThemeToggle';

const EmergencyResponderDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [emergencies, setEmergencies] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [equipment, setEquipment] = useState<any[]>([]);
    const [bloodRequests, setBloodRequests] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('SOS Feed');
    const [scrolled, setScrolled] = useState(false);

    // Unit creation state
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [unitForm, setUnitForm] = useState({
        name: '',
        type: 'ambulance',
        phone: '',
        location: { coordinates: [77.5946, 12.9716], address: '' }
    });

    // Assignment state
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedSosId, setSelectedSosId] = useState<string | null>(null);

    useEffect(() => {
        const u = getCurrentUser();
        if (!u || u.role !== 'emergency_admin') {
            navigate('/login');
            return;
        }
        setUser(u);

        loadData();
        const interval = setInterval(loadData, 10000);

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        return () => {
            clearInterval(interval);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [navigate]);

    const loadData = async () => {
        try {
            const [sosData, transferData, equipData, bloodData, unitData] = await Promise.all([
                getEmergencies(),
                getTransferRequests(),
                getEquipmentRequests(),
                getBloodRequests(),
                getUnits()
            ]);
            setEmergencies(Array.isArray(sosData) ? sosData.filter((e: any) => e.status !== 'resolved' && e.status !== 'cancelled') : []);
            setTransfers(Array.isArray(transferData) ? transferData.filter((t: any) => t.status === 'pending') : []);
            setEquipment(Array.isArray(equipData) ? equipData.filter((e: any) => e.status === 'pending') : []);
            setBloodRequests(Array.isArray(bloodData) ? bloodData.filter((b: any) => b.status === 'active') : []);
            setUnits(Array.isArray(unitData) ? unitData : []);
        } catch (err) {
            console.error("Failed to fetch responder data", err);
        }
    };

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const handleAction = async (type: 'sos' | 'transfer' | 'equipment' | 'blood', id: string, status: string) => {
        try {
            if (type === 'sos') {
                if (status === 'assigned') {
                    setSelectedSosId(id);
                    setShowAssignModal(true);
                    return;
                }
                await updateEmergencyStatus(id, status);
            } else if (type === 'transfer') {
                await updateTransferStatus(id, status, user.id);
            } else if (type === 'equipment') {
                await updateEquipmentStatus(id, status);
            } else if (type === 'blood') {
                await updateBloodRequestStatus(id, status === 'accepted' ? 'fulfilled' : 'cancelled');
            }
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssignUnit = async (unitId: string) => {
        if (!selectedSosId) return;
        try {
            await updateEmergencyStatus(selectedSosId, 'assigned', unitId);
            await updateUnitStatus(unitId, { status: 'on_call', currentTask: `Responding to SOS: ${selectedSosId}` });
            setShowAssignModal(false);
            setSelectedSosId(null);
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUnitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const finalUnitForm = {
                ...unitForm,
                location: {
                    type: 'Point',
                    coordinates: [77.5946 + (Math.random() - 0.5) * 0.1, 12.9716 + (Math.random() - 0.5) * 0.1],
                    address: 'Strategic Sector'
                }
            };
            await createUnit(finalUnitForm);
            setShowUnitModal(false);
            setUnitForm({ name: '', type: 'ambulance', phone: '', location: { coordinates: [77.5946, 12.9716], address: '' } });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUnitStatusChange = async (uid: string, status: string) => {
        try {
            await updateUnitStatus(uid, { status });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const renderSOSFeed = () => (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3 italic">
                    <div className="w-2 h-8 bg-red-600 rounded-full animate-pulse" />
                    Live SOS Dispatch
                </h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-600/10 rounded-full border border-red-600/20 shadow-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none">Scanning Sector</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {emergencies.length === 0 ? (
                    <div className="p-24 bg-white/50 dark:bg-slate-900/20 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-white/5 text-center shadow-inner">
                        <Ambulance className="w-20 h-20 text-slate-200 dark:text-slate-800 mx-auto mb-6 opacity-30" />
                        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs font-outfit italic">Awaiting Global SOS Signals...</p>
                    </div>
                ) : (
                    emergencies.map((sos, i) => (
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} key={sos._id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[3rem] p-10 relative overflow-hidden group hover:border-red-600/30 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <div className="flex flex-col lg:flex-row justify-between gap-12 relative z-10">
                                <div className="space-y-8 flex-1">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-red-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform">
                                            <Zap className="w-9 h-9" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{sos.patientId?.name || 'ANONYMOUS NODE'}</h3>
                                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-2 flex items-center gap-2 italic">
                                                <AlertCircle className="w-3.5 h-3.5" /> Sector Conflict Level: High
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-inner">
                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-600" /> Dispatch Location</p>
                                            <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter">{sos.location?.address || 'GEOMETRY HUB SECTOR'}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-inner">
                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-red-600" /> Triage Report</p>
                                            <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter">{sos.description || 'SYSTEM PANIC TRIGGERED'}</p>
                                        </div>
                                    </div>
                                    {sos.assignedAmbulanceId && (
                                        <div className="bg-indigo-600/5 dark:bg-indigo-600/10 border-2 border-indigo-500/10 dark:border-indigo-500/20 p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                                    <Ambulance className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Deployment Node</p>
                                                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">{sos.assignedAmbulanceId.name}</h4>
                                                </div>
                                            </div>
                                            <div className="text-center sm:text-right">
                                                <p className="text-sm font-black text-slate-900 dark:text-slate-300 uppercase tracking-[0.2em]">{sos.assignedAmbulanceId.phone}</p>
                                                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-[0.3em] font-outfit mt-1 block">Unit Intercepting</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="lg:w-80 flex flex-col items-center justify-center">
                                    <div className="w-full bg-slate-50 dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-4 shadow-xl">
                                        {sos.status === 'pending' ? (
                                            <div className="flex flex-col gap-4">
                                                <button onClick={() => handleAction('sos', sos._id, 'assigned')} className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-[1.05] transition-all shadow-2xl shadow-slate-900/30">Deploy Unit</button>
                                                <button onClick={() => handleAction('sos', sos._id, 'cancelled')} className="w-full py-6 bg-red-600/10 text-red-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all border-2 border-dashed border-red-600/20">Reject Signal</button>
                                            </div>
                                        ) : (
                                            <div className="py-8 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 rounded-[2rem] text-center border-2 border-indigo-500/10 dark:border-indigo-500/20 font-black text-[10px] uppercase tracking-[0.4em] flex flex-col items-center justify-center gap-4 italic">
                                                <Navigation className="w-8 h-8 animate-pulse text-indigo-600" />
                                                Unit Dispatched
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );

    const renderNetwork = () => (
        <div className="space-y-8 h-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3 italic">
                    <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                    Network Grid.
                </h2>
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_8px_#dc2626]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">SOS Nodes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Node Hubs</span>
                    </div>
                </div>
            </div>

            <div className="relative w-full h-[650px] rounded-[4rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-2xl transition-all">
                <MapComponent center={[77.5946, 12.9716]} className="w-full h-full grayscale-[0.2] dark:grayscale dark:invert-[0.9] dark:opacity-80 transition-all duration-700" />
                <div className="absolute inset-0 pointer-events-none p-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 pointer-events-auto shadow-2xl">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3 italic">
                                <Activity className="w-5 h-5 text-red-600" /> Live Stress Stream
                            </h3>
                            <div className="space-y-4">
                                {emergencies.slice(0, 3).length === 0 ? (
                                    <p className="text-[10px] text-slate-400 dark:text-slate-600 uppercase font-bold tracking-widest italic leading-relaxed">System Synchronized • No Anomalies</p>
                                ) : (
                                    emergencies.slice(0, 3).map(e => (
                                        <div key={e._id} className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all cursor-pointer group shadow-sm">
                                            <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 truncate w-32 uppercase italic tracking-tighter">{e.location?.address || 'Node Sector'}</p>
                                            <span className="text-[8px] font-black bg-red-600/10 text-red-600 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 pointer-events-auto shadow-2xl">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3 italic">
                                <Globe className="w-5 h-5 text-indigo-600" /> Unit Analytics
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] shadow-inner text-center">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic mb-2">Response</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">4.2<span className="text-xs ml-1 font-bold">m</span></p>
                                </div>
                                <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] shadow-inner text-center">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic mb-2">Active</p>
                                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{emergencies.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between pointer-events-none">
                    <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl px-8 py-4 rounded-full border border-slate-200 dark:border-white/10 flex items-center gap-4 pointer-events-auto shadow-2xl">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                        <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] italic">Global Node Sync Complete</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLogistics = () => (
        <div className="space-y-12">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4 italic">
                <div className="w-2.5 h-10 bg-indigo-600 rounded-full" />
                Inter-Facility Logistics.
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {bloodRequests.map(req => (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={req._id} className="bg-white dark:bg-slate-950 p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 space-y-8 relative overflow-hidden group shadow-2xl shadow-slate-200/50 dark:shadow-none">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[100px]" />
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{req.patientName || 'ANON NODE'}</h4>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="px-4 py-1.5 bg-red-600 text-white rounded-xl text-[10px] font-black tracking-widest shadow-lg shadow-red-600/30">{req.bloodType}</span>
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">{req.urgency}</span>
                                </div>
                            </div>
                            <Droplets className="w-8 h-8 text-red-600 group-hover:scale-125 transition-transform" />
                        </div>
                        <div className="flex items-center gap-6 py-8 border-y border-slate-50 dark:border-white/5">
                            <div className="flex-1">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-2 tracking-widest">Target Node</p>
                                <p className="text-sm font-black text-slate-700 dark:text-slate-300 truncate uppercase mt-1 italic">{req.hospital}</p>
                            </div>
                            <div className="p-4 bg-red-600/10 rounded-full">
                                <Truck className="w-6 h-6 text-red-600 animate-bounce" />
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-2 tracking-widest">Manifest</p>
                                <p className="text-sm font-black text-red-600 uppercase tracking-[0.2em] mt-1">{req.status}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => handleAction('blood', req._id, 'accepted')} className="flex-1 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-[0.3em] rounded-[1.5rem] hover:scale-[1.02] transition-all shadow-2xl">Coordinate Dispatch</button>
                            <button className="px-8 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 rounded-[1.5rem] border border-slate-100 dark:border-white/10 hover:text-indigo-600 transition-colors shadow-sm"><Info className="w-6 h-6" /></button>
                        </div>
                    </motion.div>
                ))}

                {transfers.map(req => (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={req._id} className="bg-white/60 dark:bg-slate-900/50 p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 space-y-8 shadow-xl">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{req.patientName || 'ANON NODE'}</h4>
                                <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase mt-2 tracking-widest italic">{req.reason}</p>
                            </div>
                            <div className="p-4 bg-indigo-600/10 rounded-full">
                                <Navigation className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                        <div className="flex items-center gap-6 py-8 border-y border-slate-100 dark:border-white/5">
                            <div className="flex-1">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Origin</p>
                                <p className="text-sm font-black text-slate-600 dark:text-slate-400 truncate uppercase mt-1">{req.fromHospitalId?.name}</p>
                            </div>
                            <div className="w-px h-10 bg-slate-200 dark:bg-white/5" />
                            <div className="flex-1 text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Target</p>
                                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 truncate uppercase mt-1">{req.toHospitalId?.name || 'AWAITING NODE'}</p>
                            </div>
                        </div>
                        <button onClick={() => handleAction('transfer', req._id, 'accepted')} className="w-full py-5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-[1.5rem] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30">Capture Unit</button>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderUnits = () => (
        <div className="space-y-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4 italic">
                    <div className="w-2.5 h-10 bg-emerald-600 rounded-full" />
                    Deployment Assets.
                </h2>
                <button onClick={() => setShowUnitModal(true)} className="w-full sm:w-auto px-10 py-5 bg-emerald-600 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-950 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all shadow-2xl shadow-emerald-600/30">
                    <Plus className="w-5 h-5" /> Initialize Asset
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {units.length === 0 ? (
                    <div className="col-span-full p-32 bg-white/30 dark:bg-slate-900/20 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 text-center shadow-inner">
                        <Ambulance className="w-20 h-20 text-slate-200 dark:text-slate-800 mx-auto mb-6 opacity-30" />
                        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs font-outfit italic">No Assets Validated in Sector</p>
                    </div>
                ) : (
                    units.map(unit => (
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={unit._id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-10 space-y-8 shadow-xl shadow-slate-200/50 dark:shadow-none group hover:border-indigo-600/30 transition-all">
                            <div className="flex justify-between items-start">
                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-transform group-hover:rotate-12 ${unit.status === 'available' ? 'bg-emerald-600 shadow-emerald-600/30' : unit.status === 'on_call' ? 'bg-orange-500 shadow-orange-500/30' : 'bg-red-600 shadow-red-600/30'}`}>
                                    <Ambulance className="w-10 h-10" />
                                </div>
                                <div className="text-right">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${unit.status === 'available' ? 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20' : 'bg-orange-600/10 text-orange-600 border-orange-600/20'}`}>{unit.status}</span>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-3 italic">{unit.type.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{unit.name}</h4>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-2 uppercase tracking-tight"><MapPin className="w-4 h-4 text-indigo-600" /> {unit.location?.address || 'Node Position Locked'}</p>
                            </div>
                            <div className="flex gap-4 pt-4 border-t border-slate-50 dark:border-white/5">
                                <button onClick={() => handleUnitStatusChange(unit._id, 'available')} className="flex-1 py-4 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest transition-all shadow-sm">Online</button>
                                <button onClick={() => handleUnitStatusChange(unit._id, 'maintenance')} className="flex-1 py-4 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest transition-all shadow-sm">Service</button>
                                <button className="p-4 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-2xl hover:text-indigo-600 transition-colors"><Settings className="w-5 h-5" /></button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );

    const renderEquipmentHub = () => (
        <div className="space-y-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4 italic">
                <div className="w-2.5 h-10 bg-orange-600 rounded-full" />
                Resource Grid.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {equipment.length === 0 ? (
                    <div className="md:col-span-2 p-32 bg-white/30 dark:bg-slate-900/20 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 text-center shadow-inner">
                        <Box className="w-20 h-20 text-slate-200 dark:text-slate-800 mx-auto mb-6 opacity-30" />
                        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs font-outfit italic">No Signal Requests Detected</p>
                    </div>
                ) : (
                    equipment.map(item => (
                        <div key={item._id} className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 flex flex-col justify-between gap-8 shadow-xl shadow-slate-200/50 dark:shadow-none group hover:border-orange-500/30 transition-all">
                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform ${item.type === 'need' ? 'bg-orange-500 shadow-orange-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
                                    <Box className="w-9 h-9" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{item.equipmentName}</h4>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">QTY: {item.quantity} • {item.hospitalId?.name}</p>
                                </div>
                            </div>
                            <button onClick={() => handleAction('equipment', item._id, 'shipped')} className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-[0.3em] rounded-[1.5rem] hover:scale-[1.02] transition-all shadow-2xl">Validate Dispatch</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const navItems = [
        { icon: <Zap className="w-5 h-5" />, label: 'SOS Feed' },
        { icon: <Navigation className="w-5 h-5" />, label: 'Logistics' },
        { icon: <Globe className="w-5 h-5" />, label: 'Network' },
        { icon: <Box className="w-5 h-5" />, label: 'Resource Hub' },
        { icon: <Ambulance className="w-5 h-5" />, label: 'Units' },
    ];

    if (!user) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin shadow-2xl"></div></div>;

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#05070a] text-slate-900 dark:text-slate-200 flex font-inter transition-colors duration-500 overflow-x-hidden">
            {/* Sidebar */}
            <AnimatePresence>
                {(sidebarOpen || window.innerWidth >= 1024) && (
                    <motion.aside initial={{ x: -400 }} animate={{ x: 0 }} exit={{ x: -400 }} className="fixed inset-y-0 left-0 z-50 w-80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 lg:static transition-all shadow-2xl">
                        <div className="h-28 flex items-center px-10 border-b border-slate-100 dark:border-white/5 bg-red-600/5">
                            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center mr-4 shadow-2xl shadow-red-600/30">
                                <Shield className="h-7 w-7 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter font-outfit text-slate-900 dark:text-white uppercase italic">LifeLink <span className="text-red-600">SOS.</span></span>
                            <button className="lg:hidden ml-auto p-2" onClick={() => setSidebarOpen(false)}>
                                <X className="w-8 h-8 text-slate-400 hover:text-red-600 transition-colors" />
                            </button>
                        </div>
                        <nav className="p-8 space-y-4">
                            <p className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.5em] mb-6 px-4">Registry Command</p>
                            {navItems.map((item, index) => (
                                <button key={index} onClick={() => { setActiveTab(item.label); setSidebarOpen(false); }} className={`w-full flex items-center group space-x-4 px-6 py-5 rounded-[1.5rem] transition-all duration-500 ${activeTab === item.label ? 'bg-red-600 text-white shadow-2xl shadow-red-600/30 translate-x-2' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-red-600 dark:hover:text-white'}`}>
                                    <span className={`${activeTab === item.label ? 'text-white' : 'text-red-600'}`}>{item.icon}</span>
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                        <div className="absolute bottom-10 w-full px-8">
                            <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-4 py-5 text-slate-400 hover:bg-red-600/10 hover:text-red-600 rounded-[1.5rem] transition-all group border border-transparent hover:border-red-600/10">
                                <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                <span className="text-xs font-black uppercase tracking-[0.3em]">Disconnect Sync</span>
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            <main className="flex-1 lg:h-screen overflow-y-auto custom-scrollbar">
                <header className={`sticky top-0 z-40 h-28 flex items-center justify-between px-8 lg:px-14 transition-all duration-500 ${scrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 shadow-2xl' : 'bg-transparent'}`}>
                    <button className="lg:hidden p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-xl" onClick={() => setSidebarOpen(true)}><Menu className="w-7 h-7" /></button>
                    <div className="flex items-center space-x-8 ml-auto">
                        <ThemeToggle />
                        <div className="flex items-center space-x-5 bg-white dark:bg-slate-900/50 p-2.5 pr-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl">{user.name.charAt(0)}</div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-black text-slate-900 dark:text-white leading-none uppercase italic">{user.name}</p>
                                <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.3em] mt-1.5 font-outfit leading-none">Command Node Identified</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 lg:p-14 max-w-7xl mx-auto space-y-16 pb-40">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5, ease: "anticipate" }}>
                            {activeTab === 'SOS Feed' ? renderSOSFeed() :
                                activeTab === 'Logistics' ? renderLogistics() :
                                    activeTab === 'Network' ? renderNetwork() :
                                        activeTab === 'Resource Hub' ? renderEquipmentHub() :
                                            renderUnits()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Asset Modal */}
            <AnimatePresence>
                {showUnitModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/10 rounded-[4rem] w-full max-w-xl p-14 space-y-10 shadow-2xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">Initialize <span className="text-red-600">Asset.</span></h3>
                                <button onClick={() => setShowUnitModal(false)} className="p-3 hover:bg-white/5 rounded-full text-slate-400 transition-colors"><X className="w-8 h-8" /></button>
                            </div>
                            <form onSubmit={handleUnitSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] ml-2 font-outfit">Asset Call Sign</label>
                                    <input required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[1.5rem] py-5 px-8 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-black uppercase tracking-widest shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-800" placeholder="e.g. ALPHA-RAIDER-04" value={unitForm.name} onChange={e => setUnitForm({ ...unitForm, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] ml-2">Node Type</label>
                                        <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[1.5rem] py-5 px-8 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-black appearance-none cursor-pointer uppercase tracking-widest text-[10px]" value={unitForm.type} onChange={e => setUnitForm({ ...unitForm, type: e.target.value as any })}>
                                            <option value="ambulance">Ambulance</option>
                                            <option value="mobile_clinic">Mobile Clinic</option>
                                            <option value="rescue_vehicle">Rescue Vehicle</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] ml-2">Signal Contact</label>
                                        <input required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[1.5rem] py-5 px-8 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-black shadow-inner" value={unitForm.phone} onChange={e => setUnitForm({ ...unitForm, phone: e.target.value })} />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-6 bg-red-600 rounded-[2rem] text-white font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-red-600/30 hover:scale-[1.02] active:scale-95 transition-all">Initialize Sector Node</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Signal Assignment Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/10 rounded-[4rem] w-full max-w-2xl p-14 space-y-10 shadow-2xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none">Deploy <span className="text-red-600">Dispatch.</span></h3>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mt-3 italic font-outfit">Select Asset for Intercept Protocol</p>
                                </div>
                                <button onClick={() => setShowAssignModal(false)} className="p-3 hover:bg-white/5 rounded-full text-slate-400"><X className="w-8 h-8" /></button>
                            </div>

                            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-4 custom-scrollbar">
                                {units.filter(u => u.status === 'available').length === 0 ? (
                                    <div className="p-16 bg-white/50 dark:bg-white/5 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-white/10 text-center">
                                        <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4 opacity-40 animate-pulse" />
                                        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] italic leading-relaxed">No Available Assets in Vicinity Registry</p>
                                    </div>
                                ) : (
                                    units.filter(u => u.status === 'available').map(unit => (
                                        <button
                                            key={unit._id}
                                            onClick={() => handleAssignUnit(unit._id)}
                                            className="w-full flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] hover:border-red-600 transition-all group shadow-xl shadow-slate-200/50 dark:shadow-none"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-red-600/10 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner">
                                                    <Ambulance className="w-8 h-8" />
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{unit.name}</h4>
                                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 italic">{unit.type} • {unit.phone}</p>
                                                </div>
                                            </div>
                                            <CheckCircle className="w-7 h-7 text-slate-200 dark:text-slate-800 group-hover:text-emerald-500 transition-colors" />
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmergencyResponderDashboard;
