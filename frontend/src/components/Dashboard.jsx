import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrainDumpPanel from './BrainDumpPanel';
import FocusGuardian from './FocusGuardian';
import TimelineBento from './TimelineBento';
import StudyAuraChat from './StudyAuraChat';
import KnowledgeDungeon from './KnowledgeDungeon';

const Dashboard = () => {
  const [isDungeonActive, setIsDungeonActive] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-300 relative overflow-hidden">
      
      {/* Dynamic Background Portal Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] transition-all duration-1000 rounded-full pointer-events-none blur-[120px] ${
        isDungeonActive ? 'bg-amber-500/20' : 'bg-cyan-500/5'
      }`} />

      <AnimatePresence mode="wait">
        {isDungeonActive ? (
          /* KNOWLEDGE DUNGEON VIEW */
          <motion.div 
            key="dungeon"
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: "anticipate" }}
            className="relative z-20"
          >
            <KnowledgeDungeon onExit={() => setIsDungeonActive(false)} />
          </motion.div>
        ) : (
          /* MAIN DASHBOARD VIEW */
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-12 gap-6 p-6 relative z-10"
          >
            
            {/* Left Column - BrainDump */}
            <motion.div
              className="col-span-4"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
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
                  boxShadow: "0 0 40px rgba(245,158,11,0.3)",
                  borderColor: "rgba(245,158,11,0.8)" 
                }}
                whileTap={{ scale: 0.98 }}
                className="group w-full py-5 px-6 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-600/10 to-transparent border border-amber-500/40 text-amber-400 font-black tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all backdrop-blur-3xl overflow-hidden relative"
              >
                {/* Animated Flare effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <span className="text-2xl group-hover:rotate-12 transition-transform">⚔️</span> 
                Enter LearnQuest RPG Dungeon
              </motion.button>

              {/* Focus Guardian */}
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <FocusGuardian />
              </motion.div>
              
              {/* Timeline */}
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <TimelineBento />
              </motion.div>
            </div>

            {/* Right Column - AI Chat */}
            <motion.div
              className="col-span-3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <StudyAuraChat />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;