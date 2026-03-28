import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2
} from 'lucide-react';

interface FocusTabProps {
  focusTime: number;
  isFocusRunning: boolean;
  focusType: 'work' | 'break';
  focusTask: string;
  aiSuggestion: string;
  onStart: () => void;
  onTaskChange: (task: string) => void;
  formatTimer: (seconds: number) => string;
  ambientSound: string | null;
  toggleSound: (soundId: string) => void;
  sounds: any[];
}

const FocusTab: React.FC<FocusTabProps> = ({
  focusTime,
  isFocusRunning,
  focusType,
  focusTask,
  aiSuggestion,
  onStart,
  onTaskChange,
  formatTimer,
  ambientSound,
  toggleSound,
  sounds
}) => {
  return (
    <motion.div 
      key="focus"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="glass-card p-12 rounded-[48px] flex flex-col items-center text-center relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 ${focusType === 'work' ? 'from-blue-600/5 to-purple-600/5' : 'from-green-600/5 to-emerald-600/5'}`} />
        
        <div className="relative z-10 w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`w-2 h-2 rounded-full animate-ping ${focusType === 'work' ? 'bg-blue-500' : 'bg-green-500'}`} />
            <span className={`text-xs font-black uppercase tracking-[0.4em] ${focusType === 'work' ? 'text-blue-500' : 'text-green-500'}`}>
              {focusType === 'work' ? 'Deep Work Session' : 'Rest & Recharge'}
            </span>
          </div>

          <div className="text-[120px] font-black tracking-tighter tabular-nums leading-none mb-12 drop-shadow-2xl">
            {formatTimer(focusTime)}
          </div>

          <div className="space-y-6 mb-12">
            <input 
              type="text"
              value={focusTask}
              onChange={(e) => onTaskChange(e.target.value)}
              placeholder="What are you focusing on?"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <AnimatePresence mode="wait">
              {aiSuggestion && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-2 text-blue-400 text-sm italic"
                >
                  <Sparkles size={14} />
                  <span>{aiSuggestion}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={onStart}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-2xl ${isFocusRunning ? 'bg-white/10 text-white' : 'bg-blue-600 text-white shadow-blue-500/40'}`}
            >
              {isFocusRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-16 w-full">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Ambient Atmosphere</p>
          <div className="flex flex-wrap justify-center gap-3">
            {sounds.map((sound) => (
              <button
                key={sound.id}
                onClick={() => toggleSound(sound.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all border ${
                  ambientSound === sound.id 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span className="text-xl">{sound.icon}</span>
                <span className="text-xs font-bold">{sound.name}</span>
                {ambientSound === sound.id ? <Volume2 size={14} /> : <VolumeX size={14} className="opacity-30" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FocusTab;
