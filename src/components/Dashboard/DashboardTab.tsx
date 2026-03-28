import React from 'react';
import { motion } from 'motion/react';
import { 
  Clock as ClockIcon,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import { 
  WeatherWidget, 
  DailyPlanWidget, 
  FocusQuickWidget, 
  StopwatchWidget, 
  TimerWidget, 
  TodoWidget, 
  StickyNoteWidget, 
  ReminderWidget, 
  SystemWidget,
  MusicWidget
} from './Widgets';

interface DashboardTabProps {
  getGreeting: () => string;
  time: Date;
  formatTime: (date: Date, zone?: string) => string;
  formatDate: (date: Date) => string;
  is24Hour: boolean;
  weather: any;
  locationName: string;
  isDarkMode: boolean;
  handleWeatherSearch: (city: string) => void;
  dailyPlan: any;
  handleGeneratePlan: () => void;
  isFocusRunning: boolean;
  focusTime: number;
  focusType: string;
  startFocusSession: () => void;
  setActiveTab: (tab: string) => void;
  timezones: any[];
  globalSearch: string;
  stopwatchTime: number;
  isStopwatchRunning: boolean;
  startStopwatch: () => void;
  resetStopwatch: () => void;
  formatStopwatch: (ms: number) => string;
  timerSeconds: number;
  timerInput: string;
  isTimerRunning: boolean;
  startTimer: () => void;
  resetTimer: () => void;
  setTimerInput: (val: string) => void;
  formatTimer: (s: number) => string;
  todos: any[];
  newTodo: string;
  addTodo: () => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setNewTodo: (val: string) => void;
  stickyNote: string;
  setStickyNote: (val: string) => void;
  reminders: any[];
  newReminder: string;
  setNewReminder: (val: string) => void;
  setReminders: (reminders: any[]) => void;
  isOnline: boolean;
  batteryLevel: number | null;
  ambientSound: string | null;
  sounds: any[];
  toggleSound: (sound: any) => void;
  spotifyPlaylist: string;
  setSpotifyPlaylist: (id: string) => void;
  volume: number;
  setVolume: (v: number) => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  getGreeting,
  time,
  formatTime,
  formatDate,
  is24Hour,
  weather,
  locationName,
  isDarkMode,
  handleWeatherSearch,
  dailyPlan,
  handleGeneratePlan,
  isFocusRunning,
  focusTime,
  focusType,
  startFocusSession,
  setActiveTab,
  timezones,
  globalSearch,
  stopwatchTime,
  isStopwatchRunning,
  startStopwatch,
  resetStopwatch,
  formatStopwatch,
  timerSeconds,
  timerInput,
  isTimerRunning,
  startTimer,
  resetTimer,
  setTimerInput,
  formatTimer,
  todos,
  newTodo,
  addTodo,
  toggleTodo,
  deleteTodo,
  setNewTodo,
  stickyNote,
  setStickyNote,
  reminders,
  newReminder,
  setNewReminder,
  setReminders,
  isOnline,
  batteryLevel,
  ambientSound,
  sounds,
  toggleSound,
  spotifyPlaylist,
  setSpotifyPlaylist,
  volume,
  setVolume,
}) => {
  return (
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
        <MusicWidget 
          ambientSound={ambientSound}
          sounds={sounds}
          toggleSound={toggleSound}
          spotifyPlaylist={spotifyPlaylist}
          setSpotifyPlaylist={setSpotifyPlaylist}
          volume={volume}
          setVolume={setVolume}
        />
        <SystemWidget 
          isOnline={isOnline} 
          batteryLevel={batteryLevel} 
        />
      </div>
    </motion.div>
  );
};

export default DashboardTab;
