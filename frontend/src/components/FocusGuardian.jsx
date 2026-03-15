import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Settings, X, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

const FocusGuardian = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(1500); // 25:00

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  // Demo Logic: Trigger Nudge after 5 seconds of "Focus"
  const startFocusSession = () => {
    setIsActive(true);
    setShowPopup(false);
    setTimeout(() => {
      if (isActive) setShowPopup(true); // Simulated nudge logic
    }, 5000);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col relative shadow-lg overflow-hidden">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-100">Focus Guardian | Maintain Your Flow</h2>
        {isActive && (
          <motion.div 
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold uppercase tracking-widest"
          >
            <ShieldCheck className="w-3 h-3" />
            Active Protection
          </motion.div>
        )}
      </div>

      {/* Timer Circle */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          animate={isActive ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 4 }}
          className="relative"
        >
          {/* Pulsing Border */}
          <div className={`w-48 h-48 rounded-full p-1 transition-all duration-700 ${
            isActive ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_50px_rgba(6,182,212,0.5)]' : 'bg-white/10 shadow-none'
          }`}>
            <div className="w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center">
              <span className={`text-5xl font-bold transition-colors ${isActive ? 'text-slate-100' : 'text-slate-500'}`}>
                {formatTime(seconds)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center mt-6 z-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startFocusSession}
          className={`px-6 py-3 border rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            isActive ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-white/10 border-white/10 text-slate-200'
          }`}
        >
          <Play className="w-4 h-4" />
          {isActive ? 'Resuming...' : 'Start Focus'}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsActive(false)}
          className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/15 transition-all flex items-center gap-2"
        >
          <Pause className="w-4 h-4" />
          Pause
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl text-slate-200 hover:bg-white/15 transition-all"
        >
          <Settings className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Floating Popup (The AI Nudge) */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-2xl border border-cyan-400/50 rounded-xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] z-30"
          >
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                <span className="text-cyan-400 font-bold block mb-1 uppercase tracking-tighter">Guardian Intervention</span>
                You've been still for a while. Try a <span className="text-cyan-400 font-semibold underline">micro-task</span>: Review your last Chem Lab summary.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FocusGuardian;