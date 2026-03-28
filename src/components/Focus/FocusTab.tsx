import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  Music
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
  spotifyPlaylist: string;
  setSpotifyPlaylist: (id: string) => void;
  volume: number;
  setVolume: (v: number) => void;
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
  sounds,
  spotifyPlaylist,
  setSpotifyPlaylist,
  volume,
  setVolume
}) => {
  const [showAudio, setShowAudio] = React.useState(false);
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
            <button 
              onClick={() => setShowAudio(!showAudio)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 glass-card ${showAudio ? 'text-blue-500' : 'text-slate-400'}`}
            >
              <Music size={24} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showAudio && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="relative z-10 mt-16 w-full overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 text-left">Ambient Atmosphere</p>
                  
                  {/* Volume Control */}
                  <div className="flex items-center gap-4 mb-6 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                    <Volume2 size={16} className="text-slate-400" />
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={volume} 
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-[10px] font-mono text-slate-500 w-8">{Math.round(volume * 100)}%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {sounds.map((sound) => (
                      <button
                        key={sound.id}
                        onClick={() => toggleSound(sound.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border ${
                          ambientSound === sound.mp3 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xl">{sound.icon}</span>
                        <span className="text-xs font-bold">{sound.name}</span>
                        {ambientSound === sound.mp3 ? <Volume2 size={14} /> : <VolumeX size={14} className="opacity-30" />}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 text-left">Spotify Focus</p>
                  <div className="flex-1 min-h-[200px] rounded-3xl overflow-hidden bg-black/20 border border-white/5 relative">
                    <iframe 
                      src={`https://open.spotify.com/embed/playlist/${spotifyPlaylist}?utm_source=generator&theme=0`} 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                      loading="lazy"
                      title="Spotify Playlist"
                      className="relative z-10"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900/50 backdrop-blur-sm z-0">
                      <p className="text-xs text-slate-400 mb-4">If the player doesn't load, you may need to log in to Spotify in this browser.</p>
                      <a 
                        href={`https://open.spotify.com/playlist/${spotifyPlaylist}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all"
                      >
                        Open in Spotify
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FocusTab;
