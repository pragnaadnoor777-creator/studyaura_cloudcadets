import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrainDumpPanel from './BrainDumpPanel';
import FocusGuardian from './FocusGuardian';
import TimelineBento from './TimelineBento';
import StudyAuraChat from './StudyAuraChat';
import KnowledgeDungeon from './KnowledgeDungeon';

const Dashboard = () => {
  const [isDungeonActive, setIsDungeonActive] = useState(false);

  // If the switch is flipped, show the Dungeon with a Fade-in effect
  if (isDungeonActive) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
      >
        <KnowledgeDungeon onExit={() => setIsDungeonActive(false)} />
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen pb-10 bg-[#0B0F19] text-slate-300 relative overflow-hidden">
      
      {/* Subtle Background Portal Glow (appears on hover of dungeon button) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="grid grid-cols-12 gap-6 p-6 relative z-10">
        
        {/* Left Column - BrainDump */}
        <motion.div
          className="col-span-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BrainDumpPanel />
        </motion.div>

        {/* Middle Column - Focus & Gamification */}
        <div className="col-span-5 flex flex-col gap-6">
          
          {/* THE GAMIFIED DUNGEON PORTAL */}
          <motion.button
            onClick={() => setIsDungeonActive(true)}
            whileHover={{ 
              scale: 1.02, 
              boxShadow: "0_0_30px_rgba(245,158,11,0.4)",
              borderColor: "rgba(245,158,11,0.8)" 
            }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/40 text-amber-400 font-black tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all backdrop-blur-2xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xl">⚔️</span> Enter LearnQuest RPG Dungeon
          </motion.button>

          {/* Focus Guardian [cite: 4, 7-8] */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FocusGuardian />
          </motion.div>
          
          {/* Timeline */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <TimelineBento />
          </motion.div>
        </div>

        {/* Right Column - AI Chat (EL5 Mode) */}
        <motion.div
          className="col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StudyAuraChat />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;