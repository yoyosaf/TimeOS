/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './components/Logo';
import { 
  Clock, 
  Globe, 
  Settings, 
  LayoutDashboard, 
  Hourglass as TimerIcon, 
  Timer as StopwatchIcon, 
  Search, 
  Bell, 
  User, 
  Sun, 
  Moon, 
  Maximize2, 
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Battery,
  Wifi,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Timezone {
  city: string;
  zone: string;
  isLocal?: boolean;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// --- Constants ---
const TIMEZONES: Timezone[] = [
  { city: 'Local Time', zone: Intl.DateTimeFormat().resolvedOptions().timeZone, isLocal: true },
];

export default function App() {
  // --- State ---
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(() => localStorage.getItem('is24Hour') === 'true');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Stopwatch State
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerInput, setTimerInput] = useState('05:00');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Todo State
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Check global markets', completed: false },
      { id: '2', text: 'Sync with London team', completed: true },
    ];
  });
  const [newTodo, setNewTodo] = useState('');

  // System Info State
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Sticky Note State
  const [stickyNote, setStickyNote] = useState(() => localStorage.getItem('stickyNote') || 'Welcome to TimeOS! Write your notes here...');

  // Reminder State
  const [reminders, setReminders] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [];
  });
  const [newReminder, setNewReminder] = useState('');

  // --- Effects ---
  
  // Persistence
  useEffect(() => {
    localStorage.setItem('stickyNote', stickyNote);
  }, [stickyNote]);

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);
  
  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Theme Management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('is24Hour', String(is24Hour));
  }, [is24Hour]);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // System Info
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- Handlers ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Stopwatch Logic
  const startStopwatch = () => {
    if (isStopwatchRunning) {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    } else {
      const startTime = Date.now() - stopwatchTime;
      stopwatchRef.current = setInterval(() => {
        setStopwatchTime(Date.now() - startTime);
      }, 10);
    }
    setIsStopwatchRunning(!isStopwatchRunning);
  };

  const resetStopwatch = () => {
    if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    setStopwatchTime(0);
    setIsStopwatchRunning(false);
  };

  // Timer Logic
  const startTimer = () => {
    if (isTimerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (timerSeconds <= 0) {
        const [m, s] = timerInput.split(':').map(Number);
        const total = (m || 0) * 60 + (s || 0);
        if (total <= 0) return;
        setTimerSeconds(total);
      }
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  // Todo Logic
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([{ id: Date.now().toString(), text: newTodo, completed: false }, ...todos]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  // --- Formatters ---
  const formatTime = (date: Date, zone?: string) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !is24Hour,
      timeZone: zone
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const formatTimer = (s: number) => {
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      
      {/* --- Sidebar --- */}
      <aside 
        className={`glass-card h-full border-r transition-all duration-300 flex flex-col z-50 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="p-6 flex flex-col items-center gap-4">
          <Logo className="scale-75 origin-top" showText={!sidebarCollapsed} />
          {!sidebarCollapsed && (
            <span className="text-sm font-medium text-slate-400 tracking-[0.2em] uppercase text-center">
              by safikul islam
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            collapsed={sidebarCollapsed}
            onClick={() => setActiveTab('dashboard')}
          />
          <SidebarItem 
            icon={<Clock size={20} />} 
            label="Clock" 
            active={activeTab === 'clock'} 
            collapsed={sidebarCollapsed}
            onClick={() => setActiveTab('clock')}
          />
          <SidebarItem 
            icon={<Globe size={20} />} 
            label="Timezones" 
            active={activeTab === 'timezones'} 
            collapsed={sidebarCollapsed}
            onClick={() => setActiveTab('timezones')}
          />
          <SidebarItem 
            icon={<TimerIcon size={20} />} 
            label="Tools" 
            active={activeTab === 'tools'} 
            collapsed={sidebarCollapsed}
            onClick={() => setActiveTab('tools')}
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            collapsed={sidebarCollapsed}
            onClick={() => setActiveTab('settings')}
          />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* --- Top Navbar --- */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 glass-card">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search tools..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIs24Hour(!is24Hour)}
              className="text-xs font-mono px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              {is24Hour ? '24H' : '12H'}
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <div className="w-px h-6 bg-white/10 mx-2" />
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white">
                <User size={16} />
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Alex Rivera</span>
                  <span className="text-[10px] text-slate-400">Pro Plan</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- Dynamic Content Area --- */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Hero Clock Card */}
                <motion.section 
                  className="glass-card p-12 rounded-[32px] flex flex-col items-center justify-center text-center relative overflow-hidden animate-float"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
                  <Logo className="scale-110 mb-8" />
                  <span className="text-blue-500 font-semibold tracking-widest uppercase text-xs mb-4">
                    {getGreeting()}
                  </span>
                  <h1 className="text-7xl md:text-9xl font-bold tracking-tighter clock-glow mb-4 tabular-nums">
                    {formatTime(time)}
                  </h1>
                  <p className="text-xl text-slate-400 font-medium">
                    {formatDate(time)}
                  </p>
                </motion.section>

                {/* Timezone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {TIMEZONES.map((tz, idx) => (
                    <div 
                      key={tz.city}
                      className={`glass-card p-6 rounded-3xl ${tz.isLocal ? 'ring-2 ring-blue-500/20' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-semibold text-slate-400">{tz.city}</span>
                        {tz.isLocal && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold uppercase">
                            Local
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-bold tabular-nums">
                        {formatTime(time, tz.zone).split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                        {tz.zone.split('/')[1].replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Widgets Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                  <StopwatchWidget 
                    stopwatchTime={stopwatchTime} 
                    isStopwatchRunning={isStopwatchRunning} 
                    onStart={startStopwatch} 
                    onReset={resetStopwatch} 
                    formatStopwatch={formatStopwatch}
                  />
                  <TimerWidget 
                    timerSeconds={timerSeconds} 
                    timerInput={timerInput} 
                    isTimerRunning={isTimerRunning} 
                    onStart={startTimer} 
                    onReset={resetTimer} 
                    onInputChange={setTimerInput} 
                    formatTimer={formatTimer}
                  />
                  <TodoWidget 
                    todos={todos} 
                    newTodo={newTodo} 
                    onAdd={addTodo} 
                    onToggle={toggleTodo} 
                    onDelete={deleteTodo} 
                    onInputChange={setNewTodo}
                  />
                  <StickyNoteWidget 
                    stickyNote={stickyNote} 
                    onStickyNoteChange={setStickyNote} 
                  />
                  <ReminderWidget 
                    reminders={reminders} 
                    newReminder={newReminder} 
                    onNewReminderChange={setNewReminder} 
                    onAddReminder={(text: string) => {
                      if (!text.trim()) return;
                      const reminder = { id: Date.now().toString(), text, completed: false };
                      setReminders([...reminders, reminder]);
                      setNewReminder('');
                    }} 
                    onToggleReminder={(id: string) => {
                      setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
                    }} 
                    onDeleteReminder={(id: string) => {
                      setReminders(reminders.filter(r => r.id !== id));
                    }} 
                  />
                  <SystemWidget 
                    isOnline={isOnline} 
                    batteryLevel={batteryLevel} 
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'clock' && (
              <motion.div 
                key="clock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveTab('dashboard')}
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] pointer-events-none z-10" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('dashboard');
                  }}
                  className="absolute top-12 right-12 p-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-600 hover:text-white transition-all z-[110]"
                  title="Exit Focus Mode"
                >
                  <Minimize2 size={32} />
                </button>

                <div className="relative z-20 flex flex-col items-center justify-center w-full h-full p-6 md:p-12 lg:p-24 overflow-hidden">
                  <div 
                    className="flex items-center justify-center gap-[0.05em] md:gap-[0.1em] leading-none select-none transition-all duration-500 ease-out" 
                    style={{ 
                      fontSize: 'min(18vw, 35vh)',
                      filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.5))'
                    }}
                  >
                    <FlipUnit 
                      value={time.getHours() % (is24Hour ? 24 : 12) || (is24Hour ? 0 : 12)} 
                      showLabel={false}
                    />
                    <div className="flex flex-col items-center justify-center opacity-20 animate-pulse mx-[0.1em]" style={{ fontSize: '0.35em' }}>
                      <div className="w-[0.2em] h-[0.2em] rounded-full bg-white mb-[0.5em] shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                      <div className="w-[0.2em] h-[0.2em] rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    </div>
                    <FlipUnit value={time.getMinutes()} showLabel={false} />
                    
                    <div className="hidden xl:flex flex-col items-center justify-center opacity-20 animate-pulse mx-[0.1em]" style={{ fontSize: '0.35em' }}>
                      <div className="w-[0.2em] h-[0.2em] rounded-full bg-white mb-[0.5em] shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                      <div className="w-[0.2em] h-[0.2em] rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    </div>
                    <div className="hidden xl:block">
                      <FlipUnit value={time.getSeconds()} showLabel={false} />
                    </div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
                    className="mt-16 md:mt-24 flex flex-col items-center gap-10"
                  >
                    <div className="flex flex-col items-center gap-4">
                      {!is24Hour && (
                        <div className="px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                          <span className="text-xs md:text-sm font-black text-blue-400 tracking-[0.8em] uppercase ml-[0.8em]">
                            {time.getHours() >= 12 ? 'Post Meridiem' : 'Ante Meridiem'}
                          </span>
                        </div>
                      )}
                      <p className="text-2xl md:text-5xl text-slate-600 font-extralight tracking-[0.8em] uppercase ml-[0.8em]">
                        {formatDate(time)}
                      </p>
                    </div>

                    <div className="flex items-center gap-12 opacity-30">
                      <div className="h-px w-20 md:w-40 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[2em] text-white whitespace-nowrap ml-[2em]">
                          System Active
                        </span>
                      </div>
                      <div className="h-px w-20 md:w-40 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'timezones' && (
              <motion.div 
                key="timezones"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold tracking-tight">Global Timezones</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                    <Plus size={18} /> Add Timezone
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {TIMEZONES.map((tz) => (
                    <div key={tz.city} className="glass-card p-8 rounded-3xl">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-bold">{tz.city}</h3>
                          <p className="text-sm text-slate-400">{tz.zone}</p>
                        </div>
                        {tz.isLocal && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold uppercase">
                            Current Location
                          </span>
                        )}
                      </div>
                      <div className="text-5xl font-mono font-bold tabular-nums mb-2">
                        {formatTime(time, tz.zone).split(' ')[0]}
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: tz.zone }).format(time)}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'tools' && (
              <motion.div 
                key="tools"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <StopwatchWidget 
                  stopwatchTime={stopwatchTime} 
                  isStopwatchRunning={isStopwatchRunning} 
                  onStart={startStopwatch} 
                  onReset={resetStopwatch} 
                  formatStopwatch={formatStopwatch}
                />
                <TimerWidget 
                  timerSeconds={timerSeconds} 
                  timerInput={timerInput} 
                  isTimerRunning={isTimerRunning} 
                  onStart={startTimer} 
                  onReset={resetTimer} 
                  onInputChange={setTimerInput} 
                  formatTimer={formatTimer}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto space-y-8"
              >
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <div className="glass-card rounded-3xl overflow-hidden divide-y divide-white/5">
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">Dark Mode</h4>
                      <p className="text-sm text-slate-400">Switch between light and dark themes</p>
                    </div>
                    <button 
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-blue-600' : 'bg-slate-600'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">24-Hour Format</h4>
                      <p className="text-sm text-slate-400">Toggle between 12h and 24h time display</p>
                    </div>
                    <button 
                      onClick={() => setIs24Hour(!is24Hour)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${is24Hour ? 'bg-blue-600' : 'bg-slate-600'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${is24Hour ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">Sidebar Collapsed</h4>
                      <p className="text-sm text-slate-400">Keep the sidebar small by default</p>
                    </div>
                    <button 
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${sidebarCollapsed ? 'bg-blue-600' : 'bg-slate-600'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${sidebarCollapsed ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <footer className="pt-8 pb-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">
              TimeOS v2.4.0 • Dashboard UI Concept • Built for Performance
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

// --- Widget Components ---

function FlipUnit({ value, label, showLabel = true }: { value: number, label?: string, showLabel?: boolean }) {
  const [prevValue, setPrevValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setPrevValue(value);
        setIsFlipping(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  const format = (v: number) => v.toString().padStart(2, '0');

  return (
    <div className="flip-unit-container" onClick={(e) => e.stopPropagation()}>
      <div className="flip-card">
        <div className="flip-card-top" data-value={format(value)}></div>
        <div className="flip-card-bottom" data-value={format(prevValue)}></div>
        {isFlipping && (
          <>
            <div className="flip-card-top-flip" data-value={format(prevValue)}></div>
            <div className="flip-card-bottom-flip" data-value={format(value)}></div>
          </>
        )}
      </div>
      {showLabel && label && <span className="flip-unit-label">{label}</span>}
    </div>
  );
}

function StopwatchWidget({ stopwatchTime, isStopwatchRunning, onStart, onReset, formatStopwatch }: any) {
  return (
    <div className="glass-card p-8 rounded-3xl flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <StopwatchIcon className="text-blue-500" size={24} />
        <h3 className="font-bold">Stopwatch</h3>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="text-5xl font-mono tabular-nums mb-8">
          {formatStopwatch(stopwatchTime)}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onStart}
            className={`px-8 py-3 rounded-2xl font-bold transition-all ${isStopwatchRunning ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'}`}
          >
            {isStopwatchRunning ? 'Stop' : 'Start'}
          </button>
          <button 
            onClick={onReset}
            className="px-8 py-3 rounded-2xl font-bold bg-white/5 hover:bg-white/10 transition-all"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function TimerWidget({ timerSeconds, timerInput, isTimerRunning, onStart, onReset, onInputChange, formatTimer }: any) {
  return (
    <div className="glass-card p-8 rounded-3xl flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <TimerIcon className="text-purple-500" size={24} />
        <h3 className="font-bold">Countdown Timer</h3>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        {isTimerRunning || timerSeconds > 0 ? (
          <div className="text-5xl font-mono tabular-nums mb-8">
            {formatTimer(timerSeconds)}
          </div>
        ) : (
          <input 
            type="text" 
            value={timerInput}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="MM:SS"
            className="text-5xl font-mono tabular-nums mb-8 bg-transparent text-center focus:outline-none border-b border-white/10 w-40"
          />
        )}
        <div className="flex gap-4">
          <button 
            onClick={onStart}
            className={`px-8 py-3 rounded-2xl font-bold transition-all ${isTimerRunning ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20'}`}
          >
            {isTimerRunning ? 'Pause' : 'Start'}
          </button>
          <button 
            onClick={onReset}
            className="px-8 py-3 rounded-2xl font-bold bg-white/5 hover:bg-white/10 transition-all"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function TodoWidget({ todos, newTodo, onAdd, onToggle, onDelete, onInputChange }: any) {
  return (
    <div className="glass-card p-8 rounded-3xl flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-emerald-500" size={24} />
          <h3 className="font-bold">Quick Tasks</h3>
        </div>
        <span className="text-xs text-slate-400">{todos.filter((t: any) => !t.completed).length} remaining</span>
      </div>
      
      <form onSubmit={onAdd} className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={newTodo}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        <button type="submit" className="p-2 bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">
          <Plus size={20} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        <AnimatePresence initial={false}>
          {todos.map((todo: any) => (
            <motion.div 
              key={todo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group"
            >
              <input 
                type="checkbox" 
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
                className="w-4 h-4 rounded border-white/20 bg-transparent text-emerald-600 focus:ring-emerald-500"
              />
              <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-slate-500' : ''}`}>
                {todo.text}
              </span>
              <button 
                onClick={() => onDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SystemWidget({ isOnline, batteryLevel }: any) {
  return (
    <div className="glass-card p-8 rounded-3xl flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Cpu className="text-orange-500" size={24} />
        <h3 className="font-bold">System Status</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Network</span>
            <Wifi size={14} className={isOnline ? 'text-emerald-500' : 'text-red-500'} />
          </div>
          <span className="text-lg font-bold">{isOnline ? 'Online' : 'Offline'}</span>
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${isOnline ? 'w-full bg-emerald-500' : 'w-0 bg-red-500'}`} />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Battery</span>
            <Battery size={14} className={batteryLevel && batteryLevel > 20 ? 'text-emerald-500' : 'text-red-500'} />
          </div>
          <span className="text-lg font-bold">{batteryLevel !== null ? `${batteryLevel}%` : 'N/A'}</span>
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500" 
              style={{ width: `${batteryLevel || 0}%` }} 
            />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2 col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Performance</span>
            <span className="text-[10px] text-emerald-500 font-bold">OPTIMAL</span>
          </div>
          <div className="flex items-end gap-1 h-8">
            {[40, 70, 45, 90, 65, 80, 50, 85, 60, 75].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-blue-500/50 rounded-t-sm animate-pulse" 
                style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StickyNoteWidget({ stickyNote, onStickyNoteChange }: any) {
  return (
    <div className="glass-card p-8 rounded-3xl flex flex-col bg-yellow-500/5 border-yellow-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          Sticky Note
        </h3>
      </div>
      <textarea 
        value={stickyNote}
        onChange={(e) => onStickyNoteChange(e.target.value)}
        className="flex-1 bg-transparent border-none resize-none focus:outline-none text-sm leading-relaxed text-slate-300 font-medium placeholder:text-slate-600 min-h-[150px]"
        placeholder="Type your notes here..."
      />
    </div>
  );
}

function ReminderWidget({ reminders, newReminder, onNewReminderChange, onAddReminder, onToggleReminder, onDeleteReminder }: any) {
  return (
    <div className="glass-card p-8 rounded-3xl flex flex-col bg-purple-500/5 border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          Reminders
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-500 uppercase tracking-wider">
          {reminders.filter((r: any) => !r.completed).length} Pending
        </span>
      </div>

      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={newReminder}
          onChange={(e) => onNewReminderChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAddReminder(newReminder)}
          placeholder="Set a reminder..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
        <button 
          onClick={() => onAddReminder(newReminder)}
          className="p-2 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors text-white"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[200px]">
        {reminders.map((reminder: any) => (
          <div 
            key={reminder.id}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onToggleReminder(reminder.id)}
                className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${
                  reminder.completed ? 'bg-purple-600 border-purple-600' : 'border-white/20 hover:border-purple-500'
                }`}
              >
                {reminder.completed && <div className="w-2 h-2 bg-white rounded-full" />}
              </button>
              <span className={`text-sm transition-all ${reminder.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                {reminder.text}
              </span>
            </div>
            <button 
              onClick={() => onDeleteReminder(reminder.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-500 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {reminders.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 py-8">
            <Bell size={32} className="mb-2 opacity-20" />
            <p className="text-xs font-medium">No reminders set</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function SidebarItem({ icon, label, active, collapsed, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean,
  collapsed?: boolean,
  onClick?: () => void
}) {
  return (
    <div 
      onClick={onClick}
      className={`sidebar-item ${active ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
      {active && !collapsed && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
      )}
    </div>
  );
}
