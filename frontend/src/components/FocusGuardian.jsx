import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Settings, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

// Simulated AI Micro-Tasks (Makes it feel alive for the demo!)
const aiMicroTasks = [
  "Review your last Chem Lab summary for 60 seconds.",
  "Drink a glass of water and stretch your neck.",
  "Close your eyes and take 5 deep breaths.",
  "Jot down the main concept you just studied before leaving.",
  "Do 10 jumping jacks to reset your focus!"
];

const FocusGuardian = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(1500); // 25:00
  const [currentTask, setCurrentTask] = useState(aiMicroTasks[0]);

  // 1. The Standard Timer Logic
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

  // 2. NEW: The Real-Time Tab Switch Detector!
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If the user hides the tab AND the timer was running...
      if (document.hidden && isActive) {
        setIsActive(false); // PAUSE the timer instantly
        
        // Pick a random micro-task to simulate Bedrock AI
        const randomTask = aiMicroTasks[Math.floor(Math.random() * aiMicroTasks.length)];
        setCurrentTask(randomTask);
        
        // Fire the Alert Popup!
        setShowPopup(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive]);

  const startFocusSession = () => {
    setIsActive(true);
    setShowPopup(false);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`h-full bg-white/5 backdrop-blur-xl border rounded-2xl p-6 flex flex-col relative shadow-lg overflow-hidden transition-all duration-500 ${
      isActive ? 'border-cyan-400/30 ring-1 ring-cyan-400/10' : 'border-white/10'
    }`}>
      
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-100">Focus Guardian | Maintain Your Flow</h2>
        {isActive && (
          <motion.div 
            animate={{ opacity: [1, 0.4, 1], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold uppercase tracking-widest bg-cyan-400/10 px-2 py-1 rounded-md border border-cyan-400/20"
          >
            <ShieldCheck className="w-3 h-3" />
            Active Protection
          </motion.div>
        )}
      </div>

      {/* Timer Circle */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          animate={isActive ? { scale: [1, 1.02, 1] } : {}}
          transition={{ repeat: Infinity, duration: 4 }}
          className="relative"
        >
          {/* Pulsing Border */}
          <div className={`w-48 h-48 rounded-full p-1 transition-all duration-700 ${
            isActive 
              ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-[length:200%_200%] animate-gradient shadow-[0_0_50px_rgba(6,182,212,0.3)]' 
              : 'bg-white/10 shadow-none'
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
          disabled={isActive}
          className={`px-6 py-3 border rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            isActive ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 opacity-50 cursor-not-allowed' : 'bg-white/10 border-white/10 text-slate-200 hover:bg-white/20'
          }`}
        >
          <Play className="w-4 h-4" />
          {isActive ? 'Active' : 'Start Focus'}
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

      {/* THE TAB-SWITCH ALERT POPUP */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-4 left-4 right-4 bg-red-950/90 backdrop-blur-2xl border border-red-500/50 rounded-xl p-4 shadow-[0_0_40px_rgba(239,68,68,0.4)] z-30"
          >
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-red-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg animate-pulse">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-red-400 font-bold mb-1 uppercase tracking-tighter text-[11px]">
                  🚨 Distraction Detected
                </p>
                <p className="text-xs text-slate-200 leading-relaxed">
                  You left the study zone! The timer has been paused. 
                  Before you lose your flow, complete this <span className="text-red-300 font-semibold underline">micro-task</span>:
                  <br/><br/>
                  <span className="text-white font-medium bg-red-500/20 p-1.5 rounded inline-block w-full border border-red-500/30">
                    {currentTask}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FocusGuardian;