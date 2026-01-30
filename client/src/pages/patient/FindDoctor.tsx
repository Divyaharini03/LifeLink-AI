import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, MapPin, Star, Filter, ArrowLeft, CheckCircle2, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../../components/ThemeToggle';

const doctorsData = [
    { id: 1, name: "Dr. Sarah Wilson", specialty: "Cardiologist", hospital: "City General Hospital", rating: 4.9, distance: "1.2 km", available: true },
    { id: 2, name: "Dr. James Chen", specialty: "Neurologist", hospital: "Memorial Hospital", rating: 4.8, distance: "3.5 km", available: false },
    { id: 3, name: "Dr. Emily Brooks", specialty: "Pediatrician", hospital: "Children's Center", rating: 4.9, distance: "0.8 km", available: true },
    { id: 4, name: "Dr. Michael Ross", specialty: "Orthopedic", hospital: "Sports Clinic", rating: 4.7, distance: "5.1 km", available: true },
];

const FindDoctor = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("All");
    const [bookingId, setBookingId] = useState<number | null>(null);
    const [bookedSuccess, setBookedSuccess] = useState(false);

    const handleBookAppointment = (doctorId: number) => {
        setBookingId(doctorId);
        // Mock API call delay
        setTimeout(() => {
            setBookingId(null);
            setBookedSuccess(true);
            setTimeout(() => setBookedSuccess(false), 3000);
        }, 1500);
    };

    const filteredDoctors = doctorsData.filter(doc =>
        (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filter === "All" || doc.specialty === filter)
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#05070a] p-6 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <button onClick={() => navigate(-1)} className="mr-6 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 text-slate-500 hover:text-blue-600 transition-all group">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-outfit uppercase italic tracking-tight">Find <span className="text-blue-600">Doctor.</span></h1>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Search & Filter */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search name, specialty..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-medium text-slate-700 dark:text-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                        <select
                            className="pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none appearance-none font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All">All Specialties</option>
                            <option value="Cardiologist">Cardiologist</option>
                            <option value="Neurologist">Neurologist</option>
                            <option value="Pediatrician">Pediatrician</option>
                            <option value="Orthopedic">Orthopedic</option>
                        </select>
                    </div>
                </div>

                {/* Doctors List */}
                <div className="space-y-6">
                    {filteredDoctors.length === 0 ? (
                        <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10">
                            <p className="text-slate-500 font-bold uppercase tracking-widest">No medical professionals found</p>
                        </div>
                    ) : (
                        filteredDoctors.map(doctor => (
                            <div key={doctor.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-blue-500/10 transition-all flex flex-col md:flex-row items-center justify-between gap-8 group">
                                <div className="flex items-center gap-6 flex-1">
                                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-[1.5rem] flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-2xl group-hover:rotate-6 transition-transform">
                                        {doctor.name.split(' ')[1].charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">{doctor.name}</h3>
                                        <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-[10px]">{doctor.specialty}</p>
                                        <div className="flex flex-wrap items-center text-slate-500 dark:text-slate-400 text-xs font-bold gap-4 mt-2">
                                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-red-500" /> {doctor.hospital} • {doctor.distance}</span>
                                            <span className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-lg"><Star className="w-4 h-4 fill-current" /> {doctor.rating}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleBookAppointment(doctor.id)}
                                    disabled={bookingId !== null || !doctor.available}
                                    className={`
                                        px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all w-full md:w-auto shadow-xl flex items-center justify-center gap-3
                                        ${!doctor.available
                                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                                            : bookingId === doctor.id
                                                ? 'bg-blue-600 text-white cursor-wait'
                                                : 'bg-slate-900 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-500 shadow-slate-900/10 dark:shadow-blue-600/20 active:scale-95'}
                                    `}
                                >
                                    {bookingId === doctor.id ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Booking...
                                        </>
                                    ) : !doctor.available ? (
                                        "Unavailable"
                                    ) : (
                                        "Book Appointment"
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Success Message Overlay */}
                <AnimatePresence>
                    {bookedSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-blue-400/30 backdrop-blur-xl"
                        >
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-tighter leading-none">Appointment Reserved</h4>
                                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mt-1">Check your dashboard for details</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FindDoctor;
