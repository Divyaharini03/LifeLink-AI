import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Check } from 'lucide-react';

interface SOSButtonProps {
    onActivate: () => void;
    onCancel?: () => void;
    isSent?: boolean;
}

export const SOSButton = ({ onActivate, onCancel, isSent = false }: SOSButtonProps) => {
    const [isPressing, setIsPressing] = useState(false);
    const [progress, setProgress] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const controls = useAnimation();

    const startPress = () => {
        if (isSent) return;
        setIsPressing(true);
        setProgress(0);
        controls.start({
            scale: 0.96,
            transition: { duration: 0.1 }
        });

        timerRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    onActivate();
                    return 100;
                }
                return prev + 1;
            });
        }, 30);
    };

    const stopPress = () => {
        setIsPressing(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setProgress(0);
        controls.start({
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 15 }
        });
    };

    useEffect(() => {
        if (!isSent) {
            setProgress(0);
            setIsPressing(false);
            controls.set({ scale: 1 });
        }
    }, [isSent, controls]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Outer Glow */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`absolute inset-0 rounded-full blur-3xl opacity-30 pointer-events-none ${isSent ? 'bg-emerald-600' : 'bg-red-600'}`}
                />

                {/* Progress Ring */}
                <svg className="w-full h-full -rotate-90 absolute inset-0 pointer-events-none">
                    <circle
                        cx="128"
                        cy="128"
                        r="110"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-white/5"
                    />
                    {!isSent && (
                        <motion.circle
                            cx="128"
                            cy="128"
                            r="110"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray="691"
                            strokeDashoffset={691 - (691 * progress) / 100}
                            strokeLinecap="round"
                            className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                        />
                    )}
                </svg>

                <motion.button
                    onPointerDown={startPress}
                    onPointerUp={stopPress}
                    onPointerCancel={stopPress}
                    animate={controls}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSent}
                    className={`w-40 h-40 rounded-full shadow-2xl flex items-center justify-center text-xl font-bold uppercase transition-all duration-500 relative z-10 ${isSent
                            ? 'bg-emerald-500 shadow-emerald-500/30 scale-110'
                            : isPressing
                                ? 'bg-red-700 shadow-inner'
                                : 'bg-gradient-to-br from-red-600 to-red-800 shadow-red-600/40 hover:shadow-red-600/60'
                        }`}
                >
                    {isSent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center justify-center"
                        >
                            <Check className="w-12 h-12 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col items-center justify-center"
                        >
                            <span className="text-white/80 text-sm">{isPressing ? 'SIGNALING' : 'HOLD'}</span>
                            <span className="text-white text-2xl font-black">SOS</span>
                        </motion.div>
                    )}
                    {!isSent && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            style={{
                                background: `conic-gradient(from 0deg, #f87171 ${progress}%, transparent ${progress}%)`,
                            }}
                        >
                            <div className={`w-36 h-36 rounded-full ${isPressing ? 'bg-black/40' : 'bg-black/30'} transition-colors`} />
                        </motion.div>
                    )}
                </motion.button>
            </div>

            {/* Confirmation & Cancel Controls */}
            {isSent && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex flex-col items-center gap-4 w-full"
                >
                    <div className="text-center">
                        <p className="text-lg font-bold text-emerald-400 uppercase tracking-widest leading-none">SENT</p>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">Emergency Signal Active</p>
                    </div>

                    {onCancel && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Abort this emergency request?")) {
                                    onCancel();
                                }
                            }}
                            className="mt-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 transition-all active:scale-95"
                        >
                            Cancel SOS
                        </button>
                    )}
                </motion.div>
            )}
        </div>
    );
};
