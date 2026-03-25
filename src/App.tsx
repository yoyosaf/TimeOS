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
  Cpu,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  MapPin
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

// --- Components ---
function WeatherWidget({ weather, locationName, isDarkMode, onSearch }: { weather: any, locationName: string, isDarkMode: boolean, onSearch: (city: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
      setIsSearching(false);
    }
  };

  if (!weather) {
    return (
      <div className="glass-card p-8 rounded-[32px] flex flex-col items-center justify-center text-center animate-pulse">
        <div className="w-12 h-12 bg-slate-700/20 rounded-full mb-4" />
        <div className="h-4 w-24 bg-slate-700/20 rounded mb-2" />
        <div className="h-8 w-16 bg-slate-700/20 rounded" />
      </div>
    );
  }

  const current = weather.current;
  const daily = weather.daily;
  
  const getWeatherIcon = (code: number) => {
    if (code <= 3) return <Sun className="text-yellow-500" size={48} />;
    if (code <= 48) return <Cloud className="text-slate-400" size={48} />;
    if (code <= 67) return <CloudRain className="text-blue-400" size={48} />;
    if (code <= 77) return <CloudRain className="text-blue-200" size={48} />;
    if (code <= 82) return <CloudRain className="text-blue-500" size={48} />;
    if (code <= 99) return <CloudLightning className="text-purple-500" size={48} />;
    return <Sun className="text-yellow-500" size={48} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 rounded-[32px] flex flex-col justify-between relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        {getWeatherIcon(current.weather_code)}
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-500" />
            <span className="text-sm font-bold tracking-wider uppercase text-slate-400 truncate max-w-[150px]">{locationName}</span>
          </div>
          <button 
            onClick={() => setIsSearching(!isSearching)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <Search size={16} />
          </button>
        </div>

        {isSearching && (
          <motion.form 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSearchSubmit}
            className="mb-6 relative"
          >
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              autoFocus
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500">
              <ChevronRight size={18} />
            </button>
          </motion.form>
        )}
        
        <div className="flex items-end gap-2 mb-8">
          <span className="text-6xl font-black tracking-tighter tabular-nums">
            {Math.round(current.temperature_2m)}°
          </span>
          <span className="text-xl text-slate-500 font-medium mb-2">Celsius</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <Thermometer size={18} className="text-orange-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Feels Like</span>
              <span className="text-sm font-bold">{Math.round(current.apparent_temperature)}°</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <Droplets size={18} className="text-blue-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Humidity</span>
              <span className="text-sm font-bold">{current.relative_humidity_2m}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-white/5">
        <div className="flex justify-between items-center">
          {daily.time.slice(1, 4).map((date: string, i: number) => (
            <div key={date} className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(date))}
              </span>
              <div className="scale-75">
                {getWeatherIcon(daily.weather_code[i+1])}
              </div>
              <span className="text-xs font-black">
                {Math.round(daily.temperature_2m_max[i+1])}°
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// --- Constants ---
const DEFAULT_TIMEZONES: Timezone[] = [
  { city: 'Local Time', zone: Intl.DateTimeFormat().resolvedOptions().timeZone, isLocal: true },
  { city: 'London', zone: 'Europe/London' },
  { city: 'New York', zone: 'America/New_York' },
  { city: 'Tokyo', zone: 'Asia/Tokyo' },
];

export default function App() {
  // --- State ---
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(() => localStorage.getItem('is24Hour') === 'true');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [timezones, setTimezones] = useState<Timezone[]>(() => {
    const saved = localStorage.getItem('timezones');
    return saved ? JSON.parse(saved) : DEFAULT_TIMEZONES;
  });
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

  // Weather State
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(() => {
    const saved = localStorage.getItem('weatherLocation');
    return saved ? JSON.parse(saved) : null;
  });
  const [locationName, setLocationName] = useState(() => localStorage.getItem('weatherLocationName') || 'Detecting location...');

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
  
  useEffect(() => {
    localStorage.setItem('timezones', JSON.stringify(timezones));
  }, [timezones]);

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

  // Weather Fetching
  const fetchWeather = async (lat: number, lon: number, name?: string) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
      );
      const data = await response.json();
      setWeather(data);
      
      if (name) {
        setLocationName(name);
        localStorage.setItem('weatherLocationName', name);
      } else {
        // Reverse geocoding (approximate)
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const geoData = await geoResponse.json();
        const city = geoData.address.city || geoData.address.town || geoData.address.village || 'Unknown Location';
        setLocationName(city);
        localStorage.setItem('weatherLocationName', city);
      }
      
      const loc = { lat, lon };
      setLocation(loc);
      localStorage.setItem('weatherLocation', JSON.stringify(loc));
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  useEffect(() => {
    if (location) {
      fetchWeather(location.lat, location.lon, locationName);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        () => {
          // Fallback to London if geolocation fails
          fetchWeather(51.5074, -0.1278, 'London (Default)');
        }
      );
    }
  }, []);

  // --- Handlers ---
  const handleWeatherSearch = async (city: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const shortName = display_name.split(',')[0];
        fetchWeather(parseFloat(lat), parseFloat(lon), shortName);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const addTimezone = () => {
    const city = prompt('Enter city name (e.g., Paris):');
    if (!city) return;
    const zone = prompt('Enter timezone (e.g., Europe/Paris):');
    if (!zone) return;
    
    try {
      // Validate timezone
      new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(new Date());
      setTimezones([...timezones, { city, zone }]);
    } catch (e) {
      alert('Invalid timezone identifier. Please use a valid IANA timezone name.');
    }
  };

  const removeTimezone = (city: string) => {
    if (timezones.find(tz => tz.city === city)?.isLocal) return;
    setTimezones(timezones.filter(tz => tz.city !== city));
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
        <div className="p-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black italic">T</div>
            {!sidebarCollapsed && (
              <span className="text-xl font-black tracking-tighter italic">
                TIME<span className="text-blue-500">OS</span>
              </span>
            )}
          </div>
          {!sidebarCollapsed && (
            <span className="text-[8px] font-medium text-slate-500 tracking-[0.3em] uppercase text-center mt-1">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Hero Clock Card */}
                  <motion.section 
                    className="lg:col-span-2 glass-card p-12 rounded-[32px] flex flex-col items-center justify-center text-center relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-50" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />
                    
                    <span className="relative z-10 text-blue-500 font-black tracking-[0.5em] uppercase text-[10px] mb-6 animate-pulse">
                      {getGreeting()}
                    </span>
                    <h1 className="relative z-10 text-8xl md:text-[10rem] font-black tracking-tighter leading-none mb-6 tabular-nums drop-shadow-2xl">
                      {formatTime(time).split(' ')[0]}
                    </h1>
                    <div className="relative z-10 flex items-center gap-4">
                      <p className="text-xl text-slate-400 font-light tracking-[0.3em] uppercase">
                        {formatDate(time)}
                      </p>
                      {!is24Hour && (
                        <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-black uppercase tracking-widest">
                          {time.getHours() >= 12 ? 'PM' : 'AM'}
                        </span>
                      )}
                    </div>
                  </motion.section>

                  {/* Weather Widget */}
                  <WeatherWidget 
                    weather={weather} 
                    locationName={locationName} 
                    isDarkMode={isDarkMode} 
                    onSearch={handleWeatherSearch}
                  />
                </div>

                {/* Timezone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {timezones.map((tz) => (
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
                  <button 
                    onClick={addTimezone}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors text-white"
                  >
                    <Plus size={18} /> Add Timezone
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {timezones.map((tz) => (
                    <div key={tz.city} className="glass-card p-8 rounded-3xl relative group">
                      {!tz.isLocal && (
                        <button 
                          onClick={() => removeTimezone(tz.city)}
                          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
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
