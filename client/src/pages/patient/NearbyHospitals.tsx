import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Navigation, Phone, Bed, MapPin, ArrowLeft, RefreshCw, Activity, ShieldCheck
} from 'lucide-react';
import MapComponent from '../../components/MapComponent';
import { getRealTimeHospitals } from '../../services/locationService';
import { ThemeToggle } from '../../components/ThemeToggle';

const NearbyHospitals = () => {
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const lastUpdateRef = useRef<number>(0);

    useEffect(() => {
        let watchId: number;

        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const newLoc: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setUserLocation(newLoc);

                    const now = Date.now();
                    if (now - lastUpdateRef.current > 60000 || lastUpdateRef.current === 0) {
                        fetchHospitals(newLoc[0], newLoc[1]);
                        lastUpdateRef.current = now;
                    }
                },
                (error) => {
                    console.error("Location error:", error);
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (userLocation) {
                fetchHospitals(userLocation[0], userLocation[1]);
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [userLocation]);

    const fetchHospitals = async (lat: number, lng: number) => {
        try {
            setLoading(true);
            const data = await getRealTimeHospitals(lat, lng);
            setHospitals(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleManualRefresh = () => {
        if (userLocation) {
            fetchHospitals(userLocation[0], userLocation[1]);
            lastUpdateRef.current = Date.now();
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#05070a] transition-colors duration-300 flex flex-col font-inter">
            {/* Header */}
            <header className="h-24 glass-dark lg:glass sticky top-0 z-50 px-8 flex items-center justify-between border-b border-white/20 dark:border-white/5">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm text-slate-600 dark:text-slate-400 border border-white/50 dark:border-white/10"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white font-outfit tracking-tight">Location Intelligence</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">System Live</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button
                        onClick={handleManualRefresh}
                        className={`p-3.5 bg-white dark:bg-slate-900 shadow-lg border border-slate-100 dark:border-white/10 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all ${loading ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <div className="hidden md:flex items-center gap-3 bg-slate-950 px-5 py-2.5 rounded-2xl border border-white/10 shadow-xl">
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none mt-0.5">Secure Node</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Scrollable List */}
                <div className="w-full lg:w-[480px] bg-white/40 dark:bg-black/40 backdrop-blur-md border-r border-slate-200 dark:border-white/5 h-[50vh] lg:h-[calc(100vh-96px)] overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-black text-slate-900 dark:text-white font-outfit tracking-tight flex items-center gap-2 uppercase text-xs">
                            <Activity className="w-4 h-4 text-red-500" />
                            Nearest Medical Units ({hospitals.length})
                        </h2>
                    </div>

                    {loading && hospitals.length === 0 ? (
                        <div className="space-y-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-40 bg-white/50 dark:bg-white/5 animate-pulse rounded-[2rem]" />
                            ))}
                        </div>
                    ) : (
                        <AnimatePresence>
                            {hospitals.map((hospital, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={hospital.id}
                                    className="card-premium p-8 group cursor-pointer hover:border-blue-500/30"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                            <Navigation className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{hospital.distance.toFixed(1)} km</span>
                                            <p className="text-[9px] font-extrabold text-blue-500 dark:text-blue-400 uppercase tracking-tighter">Fastest Response</p>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight leading-none mb-3 font-outfit uppercase italic">
                                        {hospital.name}
                                    </h3>

                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-start gap-2 mb-6 leading-relaxed">
                                        <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0 mt-0.5" />
                                        {hospital.address}
                                    </p>

                                    <div className="flex items-center gap-4 pt-6 mt-2 border-t border-slate-100 dark:border-white/5 justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                                <Bed className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Beds</p>
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{hospital.beds} Available</p>
                                            </div>
                                        </div>
                                        <a
                                            href={`tel:${hospital.phone}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white transition-all font-bold text-xs"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            <span>Contact</span>
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {hospitals.length === 0 && !loading && (
                        <div className="text-center py-20 bg-white/20 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-white/10 p-10">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h4 className="text-slate-900 dark:text-white font-black font-outfit tracking-tight text-lg mb-2 uppercase">Outside Coverage</h4>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No medical facilities detected within 5km.</p>
                        </div>
                    )}
                </div>

                {/* Map View */}
                <div className="flex-1 h-[50vh] lg:h-[calc(100vh-96px)] relative">
                    <MapComponent
                        center={userLocation || [20.5937, 78.9629]}
                        zoom={14}
                        markers={hospitals.map(h => ({
                            position: [h.location.lat, h.location.lng],
                            title: h.name
                        }))}
                        className="h-full w-full grayscale-[0.2] dark:grayscale dark:invert-[0.9] dark:opacity-80 transition-all duration-700"
                    />

                    {/* Floating Map Status Overlay */}
                    <div className="absolute top-8 right-8 z-[1000] bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-6 py-5 rounded-3xl border border-white dark:border-white/10 shadow-2xl max-w-[240px]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-slate-950 dark:bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <Activity className="w-6 h-6 text-blue-400 dark:text-white animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Scanning</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase font-outfit">Medical Node</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                <span>Signal Link</span>
                                <span className="text-blue-600 dark:text-blue-400">Stable</span>
                            </div>
                            <div className="h-1 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: ['20%', '90%', '40%', '85%'] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NearbyHospitals;
