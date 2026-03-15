import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, BrainCircuit, History } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const StudyAuraChat = () => {
  const [activeTab, setActiveTab] = useState('Ask AWS');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const [chatHistory, setChatHistory] = useState([
    { id: 1, type: 'ai', text: 'Hello! I am your StudyAura AI assistant. How can I help you conquer your syllabus today?', tab: 'Ask AWS' }
  ]);

  const tabs = [
    { name: 'Ask AWS', icon: <Sparkles className="w-3 h-3" /> },
    { name: 'Explain Like I\'m 5', icon: <BrainCircuit className="w-3 h-3" /> },
    { name: 'Future You Simulator', icon: <History className="w-3 h-3" /> }
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text: inputText, tab: activeTab };
    setChatHistory(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulated AWS Bedrock Response Logic 
    setTimeout(() => {
      let aiText = "That's a great question! Let me process that for you.";
      
      if (activeTab === "Explain Like I'm 5") {
        aiText = `Imagine ${inputText} is like a box of LEGOs. You organize them so you can find the right piece faster!`;
      } else if (activeTab === "Ask AWS") {
        aiText = `Based on AWS documentation, ${inputText} is best handled using a combination of Lambda and DynamoDB.`;
      }

      setChatHistory(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: aiText, tab: activeTab }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col shadow-lg overflow-hidden border-t-cyan-500/30">
      
      {/* Top Navigation Tabs */}
      <div className="border-b border-white/10 px-4 pt-4 bg-white/5">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className="relative pb-3 text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <span className={activeTab === tab.name ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}>
                {tab.icon} {tab.name}
              </span>
              {activeTab === tab.name && (
                <motion.div
                  layoutId="activeChatTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Message Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        <AnimatePresence>
          {chatHistory.filter(m => m.tab === activeTab).map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: message.type === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${message.type === 'user'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] rounded-tr-none'
                    : 'bg-white/10 backdrop-blur-xl text-slate-300 border border-white/10 rounded-tl-none'
                  }
                `}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/5 backdrop-blur-xl px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1 border border-white/5">
              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/20">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus-within:border-cyan-400/50 transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Ask ${activeTab}...`}
            className="flex-1 bg-transparent text-slate-300 placeholder:text-slate-600 text-sm focus:outline-none py-2"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSendMessage}
            className="p-2 bg-cyan-500 text-white rounded-lg shadow-lg"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default StudyAuraChat;