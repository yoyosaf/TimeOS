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
  Menu,
  X,
  Flame,
  Zap,
  BarChart3,
  Calendar,
  Music,
  Brain,
  Sparkles,
  LogOut,
  LogIn,
  Crown,
  CloudRain,
  Droplets,
  Wind,
  Coffee
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
import DashboardTab from './components/Dashboard/DashboardTab';
import FocusTab from './components/Focus/FocusTab';
import PlannerTab from './components/Planner/PlannerTab';
import AnalyticsTab from './components/Analytics/AnalyticsTab';
import ClockTab from './components/Clock/ClockTab';
import TimezonesTab from './components/Timezones/TimezonesTab';
import ToolsTab from './components/Tools/ToolsTab';
import SettingsTab from './components/Settings/SettingsTab';
import SidebarItem from './components/Sidebar/SidebarItem';

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
  const [spotifyPlaylist, setSpotifyPlaylist] = useState('37i9dQZF1DWZeKzbUnY3Yy'); // Lofi Beats default

  // --- Ambient Sound State ---
  const [ambientSound, setAmbientSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const sounds = [
    { id: 'rain', name: 'Rain', icon: <CloudRain size={18} />, mp3: 'https://www.soundjay.com/nature/sounds/rain-01.mp3' },
    { id: 'fireplace', name: 'Fireplace', icon: <Flame size={18} />, mp3: 'https://www.soundjay.com/ambient/sounds/fireplace-1.mp3' },
    { id: 'forest', name: 'Forest', icon: <Wind size={18} />, mp3: 'https://www.soundjay.com/nature/sounds/forest-1.mp3' },
    { id: 'cafe', name: 'Cafe', icon: <Coffee size={18} />, mp3: 'https://www.soundjay.com/ambient/sounds/coffee-shop-1.mp3' },
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleSound = async (soundId: string) => {
    if (!audioRef.current) return;

    const sound = sounds.find(s => s.id === soundId);
    if (!sound) return;

    const url = sound.mp3;
    const isPlaying = ambientSound === url;

    try {
      // If something is already playing, stop it first
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current;
        } catch (e) {
          // Ignore play promise errors
        }
      }
      
      audioRef.current.pause();
      
      if (isPlaying) {
        // Just stopping the current sound
        audioRef.current.src = '';
        setAmbientSound(null);
      } else {
        // Playing a new sound
        audioRef.current.src = url;
        audioRef.current.load();
        audioRef.current.loop = true;
        audioRef.current.volume = volume;
        
        const playPromise = audioRef.current.play();
        playPromiseRef.current = playPromise;
        setAmbientSound(url);

        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== 'AbortError') {
              console.error("Audio playback failed:", e);
              setAmbientSound(null);
            }
          });
        }
      }
    } catch (e) {
      console.error("Audio operation failed:", e);
      setAmbientSound(null);
    }
  };

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

  useEffect(() => {
    const path = window.location.pathname.substring(1); // Remove leading slash
    const tabMap: { [key: string]: string } = {
      'Dashboard': 'dashboard',
      'Focus': 'focus',
      'Planner': 'planner',
      'Analytics': 'analytics',
      'Clock': 'clock',
      'Timezones': 'timezones',
      'Tools': 'tools',
      'Settings': 'settings'
    };
    
    if (tabMap[path]) {
      setActiveTab(tabMap[path]);
    } else if (path.toLowerCase() === 'tools') {
      setActiveTab('tools');
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const urlMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'focus': 'Focus',
      'planner': 'Planner',
      'analytics': 'Analytics',
      'clock': 'Clock',
      'timezones': 'Timezones',
      'tools': 'Tools',
      'settings': 'Settings'
    };
    
    const path = urlMap[tab] || '';
    window.history.pushState({}, '', `/${path}`);
    setMobileMenuOpen(false);
  };

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

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setTodos([]);
      setStickyNote('Welcome to TimeOS! Write your notes here...');
      setShowProfileMenu(false);
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
                onClick={() => handleTabChange('dashboard')}
              />
              <SidebarItem 
                icon={<Brain size={20} />} 
                label="Focus" 
                active={activeTab === 'focus'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => handleTabChange('focus')}
              />
              <SidebarItem 
                icon={<Calendar size={20} />} 
                label="Planner" 
                active={activeTab === 'planner'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => handleTabChange('planner')}
              />
              <SidebarItem 
                icon={<BarChart3 size={20} />} 
                label="Analytics" 
                active={activeTab === 'analytics'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => handleTabChange('analytics')}
              />
              <SidebarItem 
                icon={<Clock size={20} />} 
                label="Clock" 
                active={activeTab === 'clock'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => handleTabChange('clock')}
              />
              <SidebarItem 
                icon={<Globe size={20} />} 
                label="Timezones" 
                active={activeTab === 'timezones'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => handleTabChange('timezones')}
              />
              <SidebarItem 
                icon={<TimerIcon size={20} />} 
                label="Tools" 
                active={activeTab === 'tools'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => handleTabChange('tools')}
              />
              <SidebarItem 
                icon={<Settings size={20} />} 
                label="Settings" 
                active={activeTab === 'settings'} 
                collapsed={sidebarCollapsed && !isMobile}
                onClick={() => handleTabChange('settings')}
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
        <audio 
          ref={audioRef} 
          preload="auto" 
          referrerPolicy="no-referrer"
          onError={(e) => {
            console.error("Audio playback error:", e);
            setAmbientSound(null);
          }}
        />
        
        {/* --- Top Navbar --- */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/5 bg-white/5 backdrop-blur-xl relative z-[60]">
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
                <div className="relative">
                  <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <img 
                      src={user.photoURL || ''} 
                      alt={user.displayName || ''} 
                      className="w-8 h-8 rounded-full border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <ChevronDown size={14} className={`text-slate-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </div>
                  
                  <AnimatePresence>
                    {showProfileMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-[90]" 
                          onClick={() => setShowProfileMenu(false)} 
                        />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full right-0 mt-2 w-56 glass-card rounded-2xl p-2 shadow-2xl z-[100] border border-white/10"
                        >
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
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
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
              <DashboardTab 
                getGreeting={getGreeting}
                time={time}
                formatTime={formatTime}
                formatDate={formatDate}
                is24Hour={is24Hour}
                weather={weather}
                locationName={locationName}
                isDarkMode={isDarkMode}
                handleWeatherSearch={handleWeatherSearch}
                dailyPlan={dailyPlan}
                handleGeneratePlan={handleGeneratePlan}
                isFocusRunning={isFocusRunning}
                focusTime={focusTime}
                focusType={focusType}
                startFocusSession={startFocusSession}
                setActiveTab={handleTabChange}
                timezones={timezones}
                globalSearch={globalSearch}
                stopwatchTime={stopwatchTime}
                isStopwatchRunning={isStopwatchRunning}
                startStopwatch={startStopwatch}
                resetStopwatch={resetStopwatch}
                formatStopwatch={formatStopwatch}
                timerSeconds={timerSeconds}
                timerInput={timerInput}
                isTimerRunning={isTimerRunning}
                startTimer={startTimer}
                resetTimer={resetTimer}
                setTimerInput={setTimerInput}
                formatTimer={formatTimer}
                todos={todos}
                newTodo={newTodo}
                addTodo={addTodo}
                toggleTodo={toggleTodo}
                deleteTodo={deleteTodo}
                setNewTodo={setNewTodo}
                stickyNote={stickyNote}
                setStickyNote={setStickyNote}
                reminders={reminders}
                newReminder={newReminder}
                setNewReminder={setNewReminder}
                setReminders={setReminders}
                isOnline={isOnline}
                batteryLevel={batteryLevel}
                ambientSound={ambientSound}
                sounds={sounds}
                toggleSound={toggleSound}
                spotifyPlaylist={spotifyPlaylist}
                setSpotifyPlaylist={setSpotifyPlaylist}
                volume={volume}
                setVolume={setVolume}
              />
            )}

            {activeTab === 'focus' && (
              <FocusTab 
                focusTime={focusTime}
                isFocusRunning={isFocusRunning}
                focusType={focusType}
                focusTask={focusTask}
                aiSuggestion={aiSuggestion}
                onStart={startFocusSession}
                onTaskChange={setFocusTask}
                formatTimer={formatTimer}
                ambientSound={ambientSound}
                toggleSound={toggleSound}
                sounds={sounds}
                spotifyPlaylist={spotifyPlaylist}
                setSpotifyPlaylist={setSpotifyPlaylist}
                volume={volume}
                setVolume={setVolume}
              />
            )}

            {activeTab === 'planner' && (
              <PlannerTab 
                dailyPlan={dailyPlan}
                handleGeneratePlan={handleGeneratePlan}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab 
                focusHistory={focusHistory}
                productivityStats={productivityStats}
              />
            )}

            {activeTab === 'clock' && (
              <ClockTab 
                isDarkMode={isDarkMode}
                toggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
                setActiveTab={handleTabChange}
                time={time}
                is24Hour={is24Hour}
                formatDate={formatDate}
              />
            )}

            {activeTab === 'timezones' && (
              <TimezonesTab 
                addTimezone={addTimezone}
                removeTimezone={removeTimezone}
                timezones={timezones}
                globalSearch={globalSearch}
                time={time}
                formatTime={formatTime}
              />
            )}

            {activeTab === 'tools' && (
              <ToolsTab />
            )}

            {activeTab === 'settings' && (
              <SettingsTab 
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                is24Hour={is24Hour}
                setIs24Hour={setIs24Hour}
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
              />
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





















// --- Sub-components ---


