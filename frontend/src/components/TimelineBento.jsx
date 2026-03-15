import { motion, AnimatePresence } from 'framer-motion';
import { Code, BookOpen, Dumbbell, Coffee, Brain, Laptop, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const initialTasks = [
  { id: 1, icon: Code, name: 'DSA Practice', time: '11:00 AM', badge: 'Bedrock | DynamoDB', isActive: true },
  { id: 2, icon: BookOpen, name: 'Chem Lab Review', time: '1:30 PM', badge: 'Organic Chemistry', isActive: false },
  { id: 3, icon: Brain, name: 'AWS Study Session', time: '3:00 PM', badge: 'Lambda | S3', isActive: false },
  { id: 4, icon: Dumbbell, name: 'Gym Time', time: '5:00 PM', badge: 'Leg Day', isActive: false },
  { id: 5, icon: Coffee, name: 'Break & Reflect', time: '6:30 PM', badge: 'Mindfulness', isActive: false },
  { id: 6, icon: Laptop, name: 'Project Work', time: '8:00 PM', badge: 'React | Tailwind', isActive: false },
];

const TimelineBento = () => {
  const [isGenerated, setIsGenerated] = useState(false);

  // Demo Logic: Simulate the AI "appearing" after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => setIsGenerated(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col shadow-lg overflow-hidden relative">
      
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-100">Study Timeline</h2>
        {isGenerated && (
          <motion.span 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-[10px] bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded-md border border-cyan-400/30 font-bold uppercase tracking-widest"
          >
            AI Optimized
          </motion.span>
        )}
      </div>

      {/* Task Grid */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {!isGenerated ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            <p className="text-sm text-slate-400">Waiting for BrainDump input...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {initialTasks.map((task, index) => {
                const Icon = task.icon;
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
                    className={`
                      bg-white/5 backdrop-blur-xl border rounded-xl p-4 cursor-pointer transition-all relative group
                      ${task.isActive 
                        ? 'border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.2)]' 
                        : 'border-white/10 hover:border-white/30'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`
                        p-2 rounded-lg transition-colors
                        ${task.isActive 
                          ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg' 
                          : 'bg-white/10 group-hover:bg-white/20'
                        }
                      `}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[13px] font-bold text-slate-100 mb-0.5 truncate">{task.name}</h3>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{task.time}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-[9px] px-2 py-0.5 rounded border ${
                        task.isActive 
                        ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400' 
                        : 'bg-white/5 border-white/10 text-slate-500'
                      }`}>
                        {task.badge}
                      </span>
                      {task.isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Mini Hint for Demo */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <p className="text-[10px] text-slate-600 text-center italic italic">
          Tasks generated via AWS Bedrock & DynamoDB Scheduler
        </p>
      </div>
    </div>
  );
};

export default TimelineBento;