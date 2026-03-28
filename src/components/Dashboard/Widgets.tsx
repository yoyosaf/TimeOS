import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Cloud, CloudRain, CloudLightning, MapPin, Search, ChevronDown, 
  Plus, Trash2, LayoutDashboard, Cpu, Wifi, Battery, Calendar, Sparkles,
  Brain, Music, Zap, Hourglass as TimerIcon, Flame, BarChart3, Bell, Timer as StopwatchIcon
} from 'lucide-react';

export function WeatherWidget({ weather, locationName, isDarkMode, onSearch }: { weather: any, locationName: string, isDarkMode: boolean, onSearch: (city: string) => void }) {
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
      <div className={`absolute inset-0 opacity-20 transition-colors duration-1000 pointer-events-none ${
        current.weather_code <= 3 ? 'bg-gradient-to-br from-yellow-500/30 to-orange-600/30' :
        current.weather_code <= 67 ? 'bg-gradient-to-br from-blue-500/30 to-indigo-600/30' :
        'bg-gradient-to-br from-slate-500/30 to-slate-800/30'
      }`} />

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

        <AnimatePresence>
          {isSearching && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSearchSubmit}
              className="mb-8 overflow-hidden"
            >
              <input 
                autoFocus
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </motion.form>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 blur-3xl bg-blue-500/20 rounded-full" />
            <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-500">
              {getWeatherIcon(current.weather_code, 80)}
            </div>
          </div>
          <div className="text-6xl font-black tracking-tighter mb-2 tabular-nums">
            {Math.round(current.temperature_2m)}°
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">
            {getWeatherDesc(current.weather_code)}
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-auto p-6 sm:p-8 bg-white/5 backdrop-blur-md border-t border-white/5">
        <div className="grid grid-cols-4 gap-4">
          {weather.daily.time.slice(1, 5).map((day: string, i: number) => (
            <div key={day} className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                {new Date(day).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <div className="text-slate-400">
                {getWeatherIcon(weather.daily.weather_code[i + 1], 20)}
              </div>
              <span className="text-xs font-bold">
                {Math.round(weather.daily.temperature_2m_max[i + 1])}°
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function DailyPlanWidget({ plan, onGenerate, fullView }: { plan: any, onGenerate: () => void, fullView?: boolean }) {
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

export function FocusQuickWidget({ isFocusRunning, focusTime, focusType, onStart, onTabChange }: any) {
  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card p-6 sm:p-8 rounded-[32px] flex flex-col min-h-[300px] relative overflow-hidden group border-none">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-50 pointer-events-none" />
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

export function StopwatchWidget({ stopwatchTime, isStopwatchRunning, onStart, onReset, formatStopwatch }: any) {
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

export function TimerWidget({ timerSeconds, timerInput, isTimerRunning, onStart, onReset, onInputChange, formatTimer }: any) {
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

export function TodoWidget({ todos, newTodo, onAdd, onToggle, onDelete, onInputChange }: any) {
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

export function StickyNoteWidget({ stickyNote, onStickyNoteChange }: any) {
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

export function ReminderWidget({ reminders, newReminder, onNewReminderChange, onAddReminder, onToggleReminder, onDeleteReminder }: any) {
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

export function SystemWidget({ isOnline, batteryLevel }: any) {
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

export function AnalyticsDashboard({ focusHistory, stats }: { focusHistory: any[], stats: any }) {
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

export function FlipUnit({ value, label, showLabel = true }: { value: number, label?: string, showLabel?: boolean }) {
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
