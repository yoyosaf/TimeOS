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
  ChevronDown,
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
  MapPin,
  Menu,
  X,
  Navigation,
  Flame,
  Zap,
  BarChart3,
  Calendar,
  Music,
  Coffee,
  Brain,
  Sparkles,
  LogOut,
  LogIn,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  handleFirestoreError,
  OperationType,
  FirebaseUser
} from './firebase';
import { generateDailyPlan, getFocusSuggestion, getProductivityScore } from './services/aiService';

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

const BANGLADESH_DISTRICTS = [
  "Dhaka", "Chittagong", "Sylhet", "Khulna", "Rajshahi", "Barisal", "Rangpur", "Mymensingh",
  "Comilla", "Narayanganj", "Gazipur", "Brahmanbaria", "Noakhali", "Feni", "Chandpur",
  "Lakshmipur", "Cox's Bazar", "Khagrachhari", "Rangamati", "Bandarban", "Sirajganj",
  "Pabna", "Bogra", "Joypurhat", "Naogaon", "Natore", "Chapai Nawabganj", "Kushtia",
  "Meherpur", "Chuadanga", "Jhenaidah", "Magura", "Narail", "Jessore", "Satkhira",
  "Bagerhat", "Barguna", "Patuekhali", "Bhola", "Jhalokati", "Pirojpur", "Tangail",
  "Manikganj", "Munshiganj", "Faridpur", "Madaripur", "Shariatpur", "Gopalganj",
  "Rajbari", "Netrokona", "Kishoreganj", "Sherpur", "Jamalpur", "Sunamganj",
  "Habiganj", "Moulvibazar", "Kurigram", "Gaibandha", "Lalmonirhat", "Nilphamari",
  "Dinajpur", "Thakurgaon", "Panchagarh"
];

// --- Components ---
function WeatherWidget({ weather, locationName, isDarkMode, onSearch }: { weather: any, locationName: string, isDarkMode: boolean, onSearch: (city: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);

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
      <div className="glass-card p-6 sm:p-8 rounded-[32px] flex flex-col items-center justify-center text-center animate-pulse min-h-[400px]">
        <div className="w-16 h-16 bg-slate-700/20 rounded-full mb-6" />
        <div className="h-4 w-32 bg-slate-700/20 rounded mb-3" />
        <div className="h-10 w-24 bg-slate-700/20 rounded" />
      </div>
    );
  }

  const current = weather.current;
  const daily = weather.daily;
  
  const getWeatherIcon = (code: number, size = 48) => {
    if (code <= 3) return <Sun className="text-yellow-500" size={size} />;
    if (code <= 48) return <Cloud className="text-slate-400" size={size} />;
    if (code <= 67) return <CloudRain className="text-blue-400" size={size} />;
    if (code <= 77) return <CloudRain className="text-blue-200" size={size} />;
    if (code <= 82) return <CloudRain className="text-blue-500" size={size} />;
    if (code <= 99) return <CloudLightning className="text-purple-500" size={size} />;
    return <Sun className="text-yellow-500" size={size} />;
  };

  const getWeatherDesc = (code: number) => {
    if (code === 0) return 'Clear Sky';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 67) return 'Rainy';
    if (code <= 77) return 'Snowy';
    if (code <= 82) return 'Heavy Rain';
    if (code <= 99) return 'Thunderstorm';
    return 'Sunny';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-[32px] flex flex-col relative overflow-hidden group min-h-[400px] border-none shadow-2xl"
    >
      {/* Dynamic Background based on weather */}
      <div className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${
        current.weather_code <= 3 ? 'bg-gradient-to-br from-yellow-500/30 to-orange-600/30' :
        current.weather_code <= 67 ? 'bg-gradient-to-br from-blue-500/30 to-indigo-600/30' :
        'bg-gradient-to-br from-slate-500/30 to-slate-800/30'
      }`} />

      {/* Header Section */}
      <div className="relative z-10 p-6 sm:p-8 pb-0">
        <div className="flex items-center justify-between mb-8">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 -ml-2 rounded-xl transition-all"
            onClick={() => setShowDistricts(!showDistricts)}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <MapPin size={16} className="text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold truncate max-w-[120px]">{locationName}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${showDistricts ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsSearching(!isSearching)}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-slate-400 hover:text-white"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Bangladesh Districts Dropdown */}
        <AnimatePresence>
          {showDistricts && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-24 left-6 right-6 z-50 glass-card rounded-2xl p-4 max-h-64 overflow-y-auto shadow-2xl border-white/10"
            >
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3 px-2">Bangladesh Districts</div>
              <div className="grid grid-cols-2 gap-1">
                {BANGLADESH_DISTRICTS.map((district) => (
                  <button
                    key={district}
                    onClick={() => {
                      onSearch(district + ", Bangladesh");
                      setShowDistricts(false);
                    }}
                    className="text-left px-3 py-2 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 text-xs transition-all truncate"
                  >
                    {district}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Input */}
        <AnimatePresence>
          {isSearching && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSearchSubmit}
              className="mb-8 relative"
            >
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any city..."
                className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-md"
                autoFocus
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                <ChevronRight size={16} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Main Weather Display */}
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="mb-4"
          >
            {getWeatherIcon(current.weather_code, 80)}
          </motion.div>
          <div className="flex flex-col">
            <span className="text-7xl font-black tracking-tighter tabular-nums leading-none">
              {Math.round(current.temperature_2m)}°
            </span>
            <span className="text-lg font-medium text-slate-400 mt-2 uppercase tracking-[0.2em]">
              {getWeatherDesc(current.weather_code)}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
            <Thermometer size={16} className="text-orange-400 mb-2" />
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Feels</span>
            <span className="text-sm font-bold">{Math.round(current.apparent_temperature)}°</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
            <Droplets size={16} className="text-blue-400 mb-2" />
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Humid</span>
            <span className="text-sm font-bold">{current.relative_humidity_2m}%</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
            <Wind size={16} className="text-emerald-400 mb-2" />
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Wind</span>
            <span className="text-sm font-bold">{Math.round(current.wind_speed_10m)} <span className="text-[10px]">km/h</span></span>
          </div>
        </div>
      </div>

      {/* Forecast Section */}
      <div className="mt-auto bg-black/20 backdrop-blur-md p-6 sm:p-8 border-t border-white/5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">3-Day Forecast</span>
          <button className="text-[10px] font-bold text-blue-500 uppercase hover:underline">Details</button>
        </div>
        <div className="space-y-4">
          {daily.time.slice(1, 4).map((date: string, i: number) => (
            <div key={date} className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 w-12">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <div className="flex items-center gap-3 flex-1 justify-center">
                {getWeatherIcon(daily.weather_code[i + 1], 20)}
                <div className="h-1 w-16 bg-white/10 rounded-full overflow-hidden relative">
                  <div 
                    className="absolute inset-y-0 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full"
                    style={{ 
                      left: '20%', 
                      right: '20%' 
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 w-16 justify-end">
                <span className="text-xs font-black">{Math.round(daily.temperature_2m_max[i + 1])}°</span>
                <span className="text-xs font-medium text-slate-500">{Math.round(daily.temperature_2m_min[i + 1])}°</span>
              </div>
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
  // --- Auth State ---
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // --- UI State ---
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(() => localStorage.getItem('is24Hour') === 'true');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [newReminder, setNewReminder] = useState('');
  
  // --- Data State ---
  const [todos, setTodos] = useState<Todo[]>([]);
  const [reminders, setReminders] = useState<Todo[]>([]);
  const [timezones, setTimezones] = useState<Timezone[]>(DEFAULT_TIMEZONES);
  const [stickyNote, setStickyNote] = useState('Welcome to TimeOS! Write your notes here...');
  const [dailyPlan, setDailyPlan] = useState<any>(null);
  const [focusHistory, setFocusHistory] = useState<any[]>([]);
  const [productivityStats, setProductivityStats] = useState<any>(null);

  // --- Focus Mode State ---
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusTask, setFocusTask] = useState('');
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [focusType, setFocusType] = useState<'work' | 'break'>('work');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const focusTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Stopwatch State ---
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);

  // --- Timer State ---
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerInput, setTimerInput] = useState('05:00');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- System Info State ---
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // --- Weather State ---
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(() => {
    const saved = localStorage.getItem('weatherLocation');
    return saved ? JSON.parse(saved) : null;
  });
  const [locationName, setLocationName] = useState(() => localStorage.getItem('weatherLocationName') || 'Detecting location...');

  // --- Auth & Data Fetching ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
      if (firebaseUser) {
        // Sync User Profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            // Create initial profile
            const initialProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              theme: isDarkMode ? 'dark' : 'light',
              streak: 1,
              lastActive: Timestamp.now(),
              isPro: false,
              role: 'user',
              settings: {
                pomodoroWork: 25,
                pomodoroBreak: 5,
                autoPause: true
              }
            };
            setDoc(userDocRef, initialProfile).catch(e => handleFirestoreError(e, OperationType.CREATE, 'users'));
          }
        }, (e) => handleFirestoreError(e, OperationType.GET, `users/${firebaseUser.uid}`));

        // Sync Tasks
        const tasksQuery = query(collection(db, 'users', firebaseUser.uid, 'tasks'), orderBy('createdAt', 'desc'));
        onSnapshot(tasksQuery, (snap) => {
          setTodos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Todo)));
        }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${firebaseUser.uid}/tasks`));

        // Sync Notes
        const notesQuery = query(collection(db, 'users', firebaseUser.uid, 'notes'), orderBy('createdAt', 'desc'), limit(1));
        onSnapshot(notesQuery, (snap) => {
          if (!snap.empty) {
            setStickyNote(snap.docs[0].data().content);
          }
        }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${firebaseUser.uid}/notes`));

        // Sync Focus History
        const focusQuery = query(collection(db, 'users', firebaseUser.uid, 'focusSessions'), orderBy('timestamp', 'desc'), limit(20));
        onSnapshot(focusQuery, (snap) => {
          setFocusHistory(snap.docs.map(d => d.data()));
        }, (e) => handleFirestoreError(e, OperationType.LIST, `users/${firebaseUser.uid}/focusSessions`));
      }
    });
    return () => unsubscribe();
  }, []);

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
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.error(e));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

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
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
  };

  const startTimer = () => {
    if (isTimerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (timerSeconds === 0) {
        const [m, s] = timerInput.split(':').map(Number);
        const total = (m || 0) * 60 + (s || 0);
        if (total === 0) return;
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
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const addTimezone = () => {
    const city = prompt('Enter city name:');
    const zone = prompt('Enter timezone (e.g., America/Los_Angeles):');
    if (city && zone) {
      setTimezones([...timezones, { city, zone }]);
    }
  };

  const removeTimezone = (city: string) => {
    setTimezones(timezones.filter(tz => tz.city !== city));
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-by-user') {
        console.info('Login cancelled by the user.');
        return;
      }
      if (error.code === 'auth/unauthorized-domain') {
        console.error('Firebase Error: Unauthorized Domain. Please add the current domain to your Firebase Console (Authentication > Settings > Authorized domains).');
        alert('Login failed: This domain is not authorized in your Firebase project. Please check the console for instructions.');
        return;
      }
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setTodos([]);
      setStickyNote('Welcome to TimeOS! Write your notes here...');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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

  // Todo Logic
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !user) return;
    const taskData = {
      uid: user.uid,
      title: newTodo,
      completed: false,
      priority: 'medium',
      createdAt: Timestamp.now()
    };
    const taskRef = doc(collection(db, 'users', user.uid, 'tasks'));
    await setDoc(taskRef, taskData).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/tasks`));
    setNewTodo('');
  };

  const toggleTodo = async (id: string) => {
    if (!user) return;
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    await updateDoc(taskRef, { completed: !todo.completed }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/tasks/${id}`));
  };

  const deleteTodo = async (id: string) => {
    if (!user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    await deleteDoc(taskRef).catch(e => handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/tasks/${id}`));
  };

  // Sticky Note Logic
  const saveStickyNote = async (content: string) => {
    setStickyNote(content);
    if (!user) return;
    const notesRef = collection(db, 'users', user.uid, 'notes');
    const q = query(notesRef, limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
      await setDoc(doc(notesRef), { uid: user.uid, content, createdAt: Timestamp.now() });
    } else {
      await updateDoc(doc(db, 'users', user.uid, 'notes', snap.docs[0].id), { content });
    }
  };

  // AI Daily Planner Logic
  const handleGeneratePlan = async () => {
    if (!user) return;
    try {
      const tasks = todos.filter(t => !t.completed).map(t => t.title);
      const habits = ['Exercise', 'Reading', 'Meditation']; // Example habits
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const plan = await generateDailyPlan(tasks, habits, timezone);
      setDailyPlan(plan);
      
      // Save to Firestore
      const planRef = doc(collection(db, 'users', user.uid, 'dailyPlans'));
      await setDoc(planRef, {
        uid: user.uid,
        date: new Date().toISOString().split('T')[0],
        schedule: plan,
        createdAt: Timestamp.now()
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/dailyPlans`));
    } catch (error) {
      console.error('Plan generation error:', error);
    }
  };

  // Focus Mode Logic
  const startFocusSession = () => {
    if (isFocusRunning) {
      if (focusTimerRef.current) clearInterval(focusTimerRef.current);
    } else {
      focusTimerRef.current = setInterval(() => {
        setFocusTime(prev => {
          if (prev <= 1) {
            completeFocusSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    setIsFocusRunning(!isFocusRunning);
  };

  const completeFocusSession = async () => {
    if (focusTimerRef.current) clearInterval(focusTimerRef.current);
    setIsFocusRunning(false);
    
    if (user && focusType === 'work') {
      const sessionData = {
        uid: user.uid,
        duration: 25,
        type: 'work',
        timestamp: Timestamp.now(),
        productivityScore: 85 // Mock score for now
      };
      const sessionRef = doc(collection(db, 'users', user.uid, 'focusSessions'));
      await setDoc(sessionRef, sessionData).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/focusSessions`));

      // Get AI Suggestion
      const suggestion = await getFocusSuggestion(25, focusTask);
      setAiSuggestion(suggestion);
    }

    // Toggle type
    setFocusType(focusType === 'work' ? 'break' : 'work');
    setFocusTime(focusType === 'work' ? 5 * 60 : 25 * 60);
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
      <AnimatePresence>
        {(mobileMenuOpen || !isMobile) && (
          <motion.aside 
            initial={isMobile ? { x: -300 } : false}
            animate={{ 
              x: mobileMenuOpen ? 0 : (isMobile ? -300 : 0),
              width: sidebarCollapsed && !isMobile ? 80 : 256
            }}
            exit={isMobile ? { x: -300 } : {}}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`glass-card h-full border-r flex flex-col z-50 fixed lg:relative ${sidebarCollapsed && !isMobile ? 'w-20' : 'w-64'}`}
          >
            <div className="p-6 flex flex-col items-center gap-2">
              <div className="flex items-center justify-between w-full lg:justify-center">
                <div className="flex items-center gap-2 select-none">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black italic">T</div>
                  {(!sidebarCollapsed || isMobile) && (
                    <span className="text-xl font-black tracking-tighter italic">
                      TIME<span className="text-blue-500">OS</span>
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="lg:hidden p-2 rounded-xl hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <nav className="flex-1 px-3 space-y-1">
              <SidebarItem 
                icon={<LayoutDashboard size={20} />} 
                label="Dashboard" 
                active={activeTab === 'dashboard'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              />
              <SidebarItem 
                icon={<Brain size={20} />} 
                label="Focus Mode" 
                active={activeTab === 'focus'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => { setActiveTab('focus'); setMobileMenuOpen(false); }}
              />
              <SidebarItem 
                icon={<Calendar size={20} />} 
                label="Daily Planner" 
                active={activeTab === 'planner'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => { setActiveTab('planner'); setMobileMenuOpen(false); }}
              />
              <SidebarItem 
                icon={<BarChart3 size={20} />} 
                label="Analytics" 
                active={activeTab === 'analytics'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
              />
              <SidebarItem 
                icon={<Clock size={20} />} 
                label="Clock" 
                active={activeTab === 'clock'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => { setActiveTab('clock'); setMobileMenuOpen(false); }}
              />
              <SidebarItem 
                icon={<Globe size={20} />} 
                label="Timezones" 
                active={activeTab === 'timezones'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => { setActiveTab('timezones'); setMobileMenuOpen(false); }}
              />
              <SidebarItem 
                icon={<TimerIcon size={20} />} 
                label="Tools" 
                active={activeTab === 'tools'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => { setActiveTab('tools'); setMobileMenuOpen(false); }}
              />
              <SidebarItem 
                icon={<Settings size={20} />} 
                label="Settings" 
                active={activeTab === 'settings'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
              />
            </nav>

            <div className="p-4 border-t border-white/5 hidden lg:block">
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* --- Top Navbar --- */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/5 glass-card">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/5"
            >
              <Menu size={20} />
            </button>
            <div className="relative w-full max-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder={`Search...`} 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {userProfile?.streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                <Flame size={14} className="fill-current" />
                <span className="text-xs font-black">{userProfile.streak}</span>
              </div>
            )}
            <button 
              onClick={() => setIs24Hour(!is24Hour)}
              className="text-[10px] sm:text-xs font-mono px-1.5 sm:px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              {is24Hour ? '24H' : '12H'}
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/5 transition-colors hidden sm:block"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <div className="w-px h-6 bg-white/10 mx-1 sm:mx-2" />
            
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-xs font-semibold">{user.displayName}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    {userProfile?.isPro ? <Crown size={10} className="text-yellow-500" /> : null}
                    {userProfile?.isPro ? 'Pro Plan' : 'Free Plan'}
                  </span>
                </div>
                <div className="relative group">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <img 
                      src={user.photoURL || ''} 
                      alt={user.displayName || ''} 
                      className="w-8 h-8 rounded-full border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <ChevronDown size={14} className="text-slate-500 group-hover:rotate-180 transition-transform" />
                  </div>
                  
                  <div className="absolute top-full right-0 mt-2 w-56 glass-card rounded-2xl p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all shadow-2xl z-50 border border-white/10">
                    <div className="px-3 py-2 mb-2 border-bottom border-white/5">
                      <p className="text-xs font-bold truncate">{user.displayName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    
                    {!userProfile?.isPro ? (
                      <button 
                        onClick={() => {
                          if (user) {
                            updateDoc(doc(db, 'users', user.uid), { isPro: true }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/10 text-yellow-500 text-xs font-bold hover:bg-yellow-500/20 transition-all mb-1"
                      >
                        <Crown size={14} /> Upgrade to Pro
                      </button>
                    ) : (
                      <div className="px-3 py-2 mb-1 flex items-center gap-2 text-yellow-500 bg-yellow-500/5 rounded-xl">
                        <Crown size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pro Member</span>
                      </div>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-500 text-xs font-bold transition-all"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all text-white shadow-lg shadow-blue-500/20"
              >
                <LogIn size={16} /> Sign In
              </button>
            )}
          </div>
        </header>

        {/* --- Dynamic Content Area --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {/* Hero Clock Card */}
                  <motion.section 
                    className="md:col-span-2 lg:col-span-2 glass-card p-6 sm:p-12 rounded-[32px] flex flex-col items-center justify-center text-center relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-50" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />
                    
                    <span className="relative z-10 text-blue-500 font-black tracking-[0.5em] uppercase text-[10px] mb-6 animate-pulse">
                      {getGreeting()}
                    </span>
                    <h1 className="relative z-10 text-[clamp(3rem,12vw,8rem)] font-black tracking-tighter leading-none mb-6 tabular-nums drop-shadow-2xl w-full text-center">
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

                {/* AI Planner Quick Access */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                  <div className="lg:col-span-2">
                    <DailyPlanWidget plan={dailyPlan} onGenerate={handleGeneratePlan} />
                  </div>
                  <FocusQuickWidget 
                    isFocusRunning={isFocusRunning} 
                    focusTime={focusTime} 
                    focusType={focusType} 
                    onStart={startFocusSession}
                    onTabChange={() => setActiveTab('focus')}
                  />
                </div>

                {/* Timezone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {timezones.filter(tz => tz.city.toLowerCase().includes(globalSearch.toLowerCase())).map((tz) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pb-12">
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
                    todos={todos.filter(t => t.text.toLowerCase().includes(globalSearch.toLowerCase()))} 
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
                    reminders={reminders.filter(r => r.text.toLowerCase().includes(globalSearch.toLowerCase()))} 
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

            {activeTab === 'focus' && (
              <motion.div 
                key="focus"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <FocusModeTab 
                  focusTime={focusTime}
                  isFocusRunning={isFocusRunning}
                  focusType={focusType}
                  focusTask={focusTask}
                  aiSuggestion={aiSuggestion}
                  onStart={startFocusSession}
                  onTaskChange={setFocusTask}
                  formatTimer={formatTimer}
                />
              </motion.div>
            )}

            {activeTab === 'planner' && (
              <motion.div 
                key="planner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold tracking-tight">AI Daily Planner</h2>
                  <button 
                    onClick={handleGeneratePlan}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all text-white shadow-lg shadow-blue-500/20"
                  >
                    <Sparkles size={18} /> Regenerate Plan
                  </button>
                </div>
                <DailyPlanWidget plan={dailyPlan} onGenerate={handleGeneratePlan} fullView />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-bold tracking-tight">Personal Analytics</h2>
                <AnalyticsDashboard focusHistory={focusHistory} stats={productivityStats} />
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
                  {timezones.filter(tz => tz.city.toLowerCase().includes(globalSearch.toLowerCase())).map((tz) => (
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
    <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col h-[300px]">
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
    <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col h-[300px]">
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
    <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col h-[400px]">
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
    <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col h-[400px]">
      <div className="flex items-center gap-3 mb-6">
        <Cpu className="text-orange-500" size={24} />
        <h3 className="font-bold">System Status</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
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

function DailyPlanWidget({ plan, onGenerate, fullView }: { plan: any, onGenerate: () => void, fullView?: boolean }) {
  if (!plan) {
    return (
      <div className={`glass-card p-8 rounded-[32px] flex flex-col items-center justify-center text-center ${fullView ? 'min-h-[500px]' : 'min-h-[300px]'}`}>
        <Calendar className="text-blue-500 mb-4 opacity-20" size={48} />
        <h3 className="text-xl font-bold mb-2">No Daily Plan Yet</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-xs">Let AI generate a personalized schedule based on your tasks and habits.</p>
        <button 
          onClick={onGenerate}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all text-white shadow-lg shadow-blue-500/20"
        >
          <Sparkles size={18} /> Plan My Day
        </button>
      </div>
    );
  }

  return (
    <div className={`glass-card p-6 sm:p-8 rounded-[32px] flex flex-col ${fullView ? 'min-h-[500px]' : 'min-h-[300px]'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="text-blue-500" size={24} />
          <h3 className="font-bold">AI Daily Schedule</h3>
        </div>
        {!fullView && (
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Today</span>
        )}
      </div>
      
      <div className={`flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar`}>
        {plan.map((item: any, i: number) => (
          <div key={i} className="flex gap-4 group">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
              {i !== plan.length - 1 && <div className="w-px flex-1 bg-white/10 my-1" />}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">{item.time}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  item.activity.toLowerCase().includes('work') ? 'bg-blue-500/10 text-blue-500' :
                  item.activity.toLowerCase().includes('break') ? 'bg-emerald-500/10 text-emerald-500' :
                  'bg-white/5 text-slate-400'
                }`}>
                  {item.activity.toLowerCase().includes('work') ? 'Focus' : 'Routine'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-200">{item.activity}</h4>
              {fullView && item.description && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FocusQuickWidget({ isFocusRunning, focusTime, focusType, onStart, onTabChange }: any) {
  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card p-6 sm:p-8 rounded-[32px] flex flex-col min-h-[300px] relative overflow-hidden group border-none">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-50" />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="text-purple-500" size={24} />
            <h3 className="font-bold">Focus Session</h3>
          </div>
          <button onClick={onTabChange} className="text-[10px] font-bold text-purple-500 uppercase hover:underline">Open Full</button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-5xl sm:text-6xl font-black tracking-tighter tabular-nums mb-4">
            {format(focusTime)}
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">
            {focusType === 'work' ? 'Deep Work' : 'Rest Period'}
          </span>
          <button 
            onClick={onStart}
            className={`w-full py-3 rounded-2xl font-bold transition-all ${
              isFocusRunning ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20'
            }`}
          >
            {isFocusRunning ? 'Pause Session' : 'Start Focus'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FocusModeTab({ focusTime, isFocusRunning, focusType, focusTask, aiSuggestion, onStart, onTaskChange, formatTimer }: any) {
  const [ambientSound, setAmbientSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sounds = [
    { id: 'rain', name: 'Rain', icon: <CloudRain size={18} />, url: 'https://actions.google.com/sounds/v1/water/rain_heavy_loud.ogg' },
    { id: 'waves', name: 'Waves', icon: <Droplets size={18} />, url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_shore.ogg' },
    { id: 'forest', name: 'Forest', icon: <Wind size={18} />, url: 'https://actions.google.com/sounds/v1/ambient/morning_forest.ogg' },
    { id: 'cafe', name: 'Cafe', icon: <Coffee size={18} />, url: 'https://actions.google.com/sounds/v1/ambient/coffee_shop.ogg' },
  ];

  const toggleSound = (url: string) => {
    if (ambientSound === url) {
      audioRef.current?.pause();
      setAmbientSound(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.loop = true;
        audioRef.current.play().catch(e => {
          console.error("Audio playback failed:", e);
          setAmbientSound(null);
        });
      }
      setAmbientSound(url);
    }
  };

  return (
    <div className="space-y-8">
      <audio ref={audioRef} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 sm:p-12 rounded-[32px] sm:rounded-[48px] flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[500px]">
          <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 ${focusType === 'work' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
          
          <div className="relative z-10 w-full max-w-md">
            <input 
              type="text" 
              value={focusTask}
              onChange={(e) => onTaskChange(e.target.value)}
              placeholder="What are you focusing on?"
              className="w-full bg-transparent text-center text-xl sm:text-2xl font-bold placeholder:text-slate-600 focus:outline-none mb-8 sm:mb-12"
            />

            <div className="relative mb-8 sm:mb-12 flex justify-center">
              <svg className="w-48 h-48 sm:w-64 sm:h-64 transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="283%"
                  animate={{ strokeDashoffset: `${283 - (283 * focusTime) / (focusType === 'work' ? 25 * 60 : 5 * 60)}%` }}
                  className={focusType === 'work' ? 'text-blue-500' : 'text-emerald-500'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-6xl font-black tracking-tighter tabular-nums">
                  {formatTimer(focusTime)}
                </span>
                <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.4em] mt-2">
                  {focusType === 'work' ? 'Focus' : 'Break'}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={onStart}
                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl ${
                  isFocusRunning ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 
                  (focusType === 'work' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20')
                }`}
              >
                {isFocusRunning ? 'Pause' : 'Start Session'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8 rounded-[32px]">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Music size={20} className="text-purple-500" />
              Ambient Sounds
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {sounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => toggleSound(sound.url)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                    ambientSound === sound.url ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400'
                  }`}
                >
                  {sound.icon}
                  <span className="text-[10px] font-bold uppercase tracking-widest">{sound.name}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {aiSuggestion && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 rounded-[32px] bg-blue-500/5 border-blue-500/20"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles size={20} className="text-blue-500" />
                  AI Insight
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{aiSuggestion}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function AnalyticsDashboard({ focusHistory, stats }: { focusHistory: any[], stats: any }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[32px] flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
            <Zap size={24} />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Productivity Score</span>
          <span className="text-5xl font-black tracking-tighter">85</span>
          <span className="text-xs text-emerald-500 font-bold mt-2">+12% from last week</span>
        </div>
        <div className="glass-card p-8 rounded-[32px] flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
            <TimerIcon size={24} />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Focus Time</span>
          <span className="text-5xl font-black tracking-tighter">12.5h</span>
          <span className="text-xs text-slate-400 font-bold mt-2">This week</span>
        </div>
        <div className="glass-card p-8 rounded-[32px] flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4">
            <Flame size={24} />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Current Streak</span>
          <span className="text-5xl font-black tracking-tighter">5</span>
          <span className="text-xs text-slate-400 font-bold mt-2">Days active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-[32px]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <BarChart3 size={24} className="text-blue-500" />
            Focus History
          </h3>
          <div className="space-y-4">
            {focusHistory.length > 0 ? focusHistory.map((session, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Brain size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Focus Session</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                      {session.timestamp?.toDate().toLocaleDateString()} • {session.duration} mins
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-500">+{session.productivityScore} pts</span>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-slate-600">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-sm font-medium">No sessions recorded yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-8 rounded-[32px] bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-none">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Sparkles size={24} className="text-blue-500" />
            AI Performance Review
          </h3>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "Your focus has been exceptionally high during morning sessions. You tend to lose momentum after 3 PM. Consider scheduling your most demanding tasks before noon for maximum efficiency."
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Peak Focus</span>
                <span className="text-lg font-bold">10:00 AM</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Avg Session</span>
                <span className="text-lg font-bold">38 mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StickyNoteWidget({ stickyNote, onStickyNoteChange }: any) {
  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col bg-yellow-500/5 border-yellow-500/20">
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
    <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col bg-purple-500/5 border-purple-500/20">
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
