/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  { city: 'New York', zone: 'America/New_York' },
  { city: 'London', zone: 'Europe/London' },
  { city: 'Dubai', zone: 'Asia/Dubai' },
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

  // --- Effects ---
  
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
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            T
          </div>
          {!sidebarCollapsed && (
            <span className="text-xl font-bold tracking-tight">TimeOS</span>
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

        {/* --- Dashboard Content --- */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Hero Clock Card */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 rounded-[32px] flex flex-col items-center justify-center text-center relative overflow-hidden animate-float"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
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
              <motion.div 
                key={tz.city}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
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
              </motion.div>
            ))}
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Stopwatch Widget */}
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
                    onClick={startStopwatch}
                    className={`px-8 py-3 rounded-2xl font-bold transition-all ${isStopwatchRunning ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'}`}
                  >
                    {isStopwatchRunning ? 'Stop' : 'Start'}
                  </button>
                  <button 
                    onClick={resetStopwatch}
                    className="px-8 py-3 rounded-2xl font-bold bg-white/5 hover:bg-white/10 transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Timer Widget */}
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
                    onChange={(e) => setTimerInput(e.target.value)}
                    placeholder="MM:SS"
                    className="text-5xl font-mono tabular-nums mb-8 bg-transparent text-center focus:outline-none border-b border-white/10 w-40"
                  />
                )}
                <div className="flex gap-4">
                  <button 
                    onClick={startTimer}
                    className={`px-8 py-3 rounded-2xl font-bold transition-all ${isTimerRunning ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20'}`}
                  >
                    {isTimerRunning ? 'Pause' : 'Start'}
                  </button>
                  <button 
                    onClick={resetTimer}
                    className="px-8 py-3 rounded-2xl font-bold bg-white/5 hover:bg-white/10 transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Todo Widget */}
            <div className="glass-card p-8 rounded-3xl flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="text-emerald-500" size={24} />
                  <h3 className="font-bold">Quick Tasks</h3>
                </div>
                <span className="text-xs text-slate-400">{todos.filter(t => !t.completed).length} remaining</span>
              </div>
              
              <form onSubmit={addTodo} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a task..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <button type="submit" className="p-2 bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">
                  <Plus size={20} />
                </button>
              </form>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                <AnimatePresence initial={false}>
                  {todos.map(todo => (
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
                        onChange={() => toggleTodo(todo.id)}
                        className="w-4 h-4 rounded border-white/20 bg-transparent text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-slate-500' : ''}`}>
                        {todo.text}
                      </span>
                      <button 
                        onClick={() => deleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* System Info Widget */}
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

          </div>

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
