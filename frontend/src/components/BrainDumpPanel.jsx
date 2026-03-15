import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const BrainDumpPanel = () => {
  const [thoughts, setThoughts] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mentalLoad, setMentalLoad] = useState(null);

  const handleOrganize = () => {
    if (!thoughts.trim()) return;
    
    setIsProcessing(true);
    setMentalLoad(null);

    // Simulated AWS Lambda & Bedrock Processing
    setTimeout(() => {
      setIsProcessing(false);
      // Logic: If text is long, mental load is "HIGH"
      const loadStatus = thoughts.length > 50 ? 'HIGH' : 'MODERATE';
      setMentalLoad(loadStatus);
    }, 2000);
  };

  return (
    <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col shadow-lg relative overflow-hidden">
      
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-slate-100">StudyAura | Capture Your Chaos</h2>
          </div>
          
          {/* Mental Load Meter (Simulated AI Result) */}
          <AnimatePresence>
            {mentalLoad && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                  mentalLoad === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                Mental Load: {mentalLoad}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-sm text-slate-400">AI stress assistant analyzing your cognitive load</p>
      </div>

      {/* Textarea */}
      <div className="flex-1 mb-4 relative">
        <textarea
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          placeholder="Type messy thoughts (e.g., finish dsa assignment, exam tomorrow, lab record, gym...)"
          disabled={isProcessing}
          className="w-full h-full bg-black/20 border border-cyan-400/30 rounded-xl p-4 text-slate-300 placeholder:text-slate-500 resize-none focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-50"
        />
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 z-10"
            >
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-cyan-400 text-xs font-medium animate-pulse">Bedrock is organizing your chaos...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOrganize}
        disabled={isProcessing || !thoughts.trim()}
        className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl font-semibold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Organize My Chaos'}
      </motion.button>
    </div>
  );
};

export default BrainDumpPanel;