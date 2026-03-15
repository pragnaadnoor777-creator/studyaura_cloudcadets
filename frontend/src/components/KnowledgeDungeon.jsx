import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sword, Shield, ChevronRight, Lock, Loader2 } from 'lucide-react';

// Your Golden Key
const API_URL = "https://7kn2ndhmp5.execute-api.us-east-1.amazonaws.com/dev";

const KnowledgeDungeon = ({ onExit }) => {
  const [xp, setXp] = useState(120);
  const [currentRoom, setCurrentRoom] = useState(1);
  const [showReward, setShowReward] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  
  // Changed rooms to State so AWS can populate them dynamically
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Phase 3 Wiring: Fetch Dynamic Dungeon from AWS
  useEffect(() => {
    const fetchCustomDungeon = async () => {
      try {
        // Bug fix: must include action: "generate" — backend returns 400 without it
        const response = await fetch(`${API_URL}/dungeon`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: "student123", action: "generate" })
        });
        const data = await response.json();

        // Bug fix: backend returns a single challenge object { roomName, question, correctAnswer, explanation }
        // not an array of customRooms. Normalize it into the shape the UI expects.
        if (data.roomName && data.question) {
          setRooms([{
            id: 1,
            name: data.roomName,
            question: data.question,
            correctAnswer: data.correctAnswer,
            explanation: data.explanation,
            // Open-ended answer — options array is empty; handleAnswer uses verify action instead
            options: [],
          }]);
        } else {
          // Fallback if the backend returns an unexpected shape
          setRooms([
            { id: 1, name: 'Arrays', question: 'What is the time complexity of accessing an element in an array?', options: ['A. O(n)', 'B. O(log n)', 'C. O(1)', 'D. O(n²)'], correct: 2 },
            { id: 2, name: 'Linked Lists', question: 'Which structure uses Last-In, First-Out (LIFO)?', options: ['A. Queue', 'B. Stack', 'C. Array', 'D. Graph'], correct: 1 }
          ]);
        }
      } catch (error) {
        console.error("Failed to load custom dungeon", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomDungeon();
  }, []);

  const handleAnswer = async (indexOrText) => {
    const room = rooms[currentRoom - 1];

    // Multiple-choice path (fallback static rooms)
    if (room.options && room.options.length > 0) {
      if (indexOrText === room.correct) {
        setIsCorrect(true);
        setShowReward(true);
        setXp(prev => prev + 20);
      } else {
        setIsCorrect(false);
        setTimeout(() => setIsCorrect(null), 1000);
      }
      return;
    }

    // Open-ended path (Bedrock-generated rooms) — use the verify action
    try {
      const response = await fetch(`${API_URL}/dungeon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: "student123",
          action: "verify",
          question: room.question,
          correctAnswer: room.correctAnswer,
          userAnswer: indexOrText,
        }),
      });
      const data = await response.json();
      if (data.isCorrect) {
        setIsCorrect(true);
        setShowReward(true);
        setXp(prev => prev + (data.xpAwarded || 20));
      } else {
        setIsCorrect(false);
        setTimeout(() => setIsCorrect(null), 1000);
      }
    } catch (e) {
      console.error("Answer verify failed", e);
    }
  };

  const nextRoom = () => {
    if (currentRoom < rooms.length) {
      setCurrentRoom(prev => prev + 1);
      setShowReward(false);
      setIsCorrect(null);
    } else {
      alert("Dungeon Cleared! +50 XP Bonus!");
      onExit();
    }
  };

  // Loading Screen while AWS Bedrock generates the Dungeon
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <p className="text-amber-500 font-bold tracking-widest animate-pulse">GENERATING CUSTOM DUNGEON...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto pb-32 bg-[#0B0F19] text-slate-300 font-sans p-6 relative">
      
      {/* Top HUD Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-white/5 backdrop-blur-xl border border-amber-500/20 p-4 rounded-2xl mb-6 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
      >
        <div className="flex items-center gap-4">
          <Sword className="text-amber-500 w-6 h-6" />
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            StudyAura LearnQuest
          </h1>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-amber-400 font-bold tracking-widest text-lg">XP: {xp} <span className="text-slate-500 mx-2">|</span> Level: 3</div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium uppercase tracking-wider text-slate-400">Dungeon Progress</span>
            <div className="w-48 h-3 bg-black/50 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                animate={{ width: `${(currentRoom / rooms.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              ></motion.div>
            </div>
          </div>
          <button onClick={onExit} className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all">
            Exit
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Room Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-fit"
        >
          <h2 className="text-xl font-bold text-slate-100 mb-6 border-b border-white/10 pb-4">Dungeon Map</h2>
          <ul className="space-y-4">
            {rooms.map((room) => (
              <li key={room.id} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${currentRoom === room.id ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'bg-white/5 border-transparent text-slate-500'}`}>
                {currentRoom > room.id ? <Trophy className="w-4 h-4 text-green-400" /> : room.id === currentRoom ? <Sword className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                Room {room.id}: {room.name}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Center Area - The Question Challenge */}
        <motion.div 
          key={currentRoom}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-9 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
        >
          <div className="text-center mb-10">
            <h3 className="text-amber-500 font-bold tracking-widest uppercase text-sm mb-2">Challenge Round</h3>
            <h2 className="text-3xl font-bold text-slate-100">Room {currentRoom}: {rooms[currentRoom-1]?.name}</h2>
          </div>

          <div className={`bg-black/40 border rounded-2xl p-8 mb-8 text-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-all ${isCorrect === true ? 'border-green-500/50' : isCorrect === false ? 'border-red-500/50 animate-shake' : 'border-amber-500/20'}`}>
            <p className="text-2xl text-slate-200 leading-relaxed font-medium">
              "{rooms[currentRoom-1]?.question}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {rooms[currentRoom-1]?.options && rooms[currentRoom-1].options.length > 0 ? (
              rooms[currentRoom-1].options.map((answer, i) => (
                <button 
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={showReward}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-400/10 text-xl font-semibold text-slate-300 transition-all text-left hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] disabled:opacity-50"
                >
                  {answer}
                </button>
              ))
            ) : (
              // Open-ended answer input for Bedrock-generated rooms
              <div className="col-span-2 flex gap-3">
                <input
                  id="open-answer"
                  type="text"
                  placeholder="Type your answer..."
                  disabled={showReward}
                  className="flex-1 bg-black/20 border border-cyan-400/30 rounded-xl px-5 py-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-50 text-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !showReward) {
                      handleAnswer(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  disabled={showReward}
                  onClick={() => {
                    const input = document.getElementById('open-answer');
                    if (input?.value.trim()) {
                      handleAnswer(input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg disabled:opacity-50 hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Action Bar */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-[#0B0F19]/90 backdrop-blur-2xl border-t border-white/10 p-4 flex items-center justify-between z-50 px-10"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 border-2 border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center text-3xl">
            {isCorrect === false ? '🤯' : '🧙‍♂️'}
          </div>
          <AnimatePresence>
            {showReward && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <Trophy className="w-5 h-5" /> +20 XP Correct! Room Cleared!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <button 
          onClick={nextRoom}
          disabled={!showReward}
          className={`px-10 py-4 rounded-xl font-bold text-xl transition-all flex items-center gap-2 ${showReward ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105' : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'}`}
        >
          {currentRoom === rooms.length ? 'Finish Dungeon' : 'Next Room'} <ChevronRight className="w-6 h-6" />
        </button>
      </motion.div>
    </div>
  );
};

export default KnowledgeDungeon;