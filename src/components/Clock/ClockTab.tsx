import React from 'react';
import { motion } from 'motion/react';
import { 
  Maximize2, 
  Minimize2, 
  ChevronLeft 
} from 'lucide-react';

interface ClockTabProps {
  isDarkMode: boolean;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  setActiveTab: (tab: string) => void;
  time: Date;
  is24Hour: boolean;
  formatDate: (date: Date) => string;
}

const ClockTab: React.FC<ClockTabProps> = ({
  isDarkMode,
  toggleFullscreen,
  isFullscreen,
  setActiveTab,
  time,
  is24Hour,
  formatDate
}) => {
  return (
    <motion.div 
      key="clock"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-colors duration-700 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}
    >
      <div className={`absolute inset-0 pointer-events-none z-10 ${isDarkMode ? 'bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)]' : 'bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(255,255,255,0.5)_100%)]'}`} />
      
      <div className="absolute top-12 right-12 flex gap-4 z-[110]">
        <button 
          onClick={toggleFullscreen}
          className={`p-4 rounded-full transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-slate-600 hover:text-black'}`}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`p-4 rounded-full transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-slate-600 hover:text-black'}`}
          title="Exit Focus Mode"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full p-6 md:p-12 lg:p-24 overflow-hidden">
        <div 
          className="flex items-center justify-center gap-2 md:gap-4 leading-none select-none transition-all duration-500 ease-out font-black tracking-tighter" 
          style={{ 
            fontSize: 'min(25vw, 45vh)',
            fontFamily: '"Inter", sans-serif'
          }}
        >
          <span className="tabular-nums">
            {time.getHours() % (is24Hour ? 24 : 12) || (is24Hour ? 0 : 12)}
          </span>
          <span className="opacity-20 animate-pulse">:</span>
          <span className="tabular-nums">
            {time.getMinutes().toString().padStart(2, '0')}
          </span>
          <span className="hidden xl:inline opacity-20 animate-pulse">:</span>
          <span className="hidden xl:inline tabular-nums opacity-40" style={{ fontSize: '0.6em' }}>
            {time.getSeconds().toString().padStart(2, '0')}
          </span>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
          className="mt-12 md:mt-20 flex flex-col items-center gap-8"
        >
          <div className="flex flex-col items-center gap-4">
            {!is24Hour && (
              <div className={`px-6 py-1.5 rounded-full border ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-500/5 border-blue-500/10 text-blue-600'}`}>
                <span className="text-sm md:text-base font-black tracking-[0.8em] uppercase">
                  {time.getHours() >= 12 ? 'PM' : 'AM'}
                </span>
              </div>
            )}
            <p className={`text-2xl md:text-5xl font-extralight tracking-[0.8em] uppercase text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {formatDate(time)}
            </p>
          </div>

          <div className="flex items-center gap-12 opacity-30">
            <div className={`h-px w-20 md:w-40 ${isDarkMode ? 'bg-gradient-to-r from-transparent via-white/50 to-transparent' : 'bg-gradient-to-r from-transparent via-black/50 to-transparent'}`} />
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className={`text-[10px] md:text-xs font-bold uppercase tracking-[2em] whitespace-nowrap ml-[2em] ${isDarkMode ? 'text-white' : 'text-black'}`}>
                Focus Active
              </span>
            </div>
            <div className={`h-px w-20 md:w-40 ${isDarkMode ? 'bg-gradient-to-r from-transparent via-white/50 to-transparent' : 'bg-gradient-to-r from-transparent via-black/50 to-transparent'}`} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ClockTab;
