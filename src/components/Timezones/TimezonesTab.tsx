import React from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2 } from 'lucide-react';

interface TimezonesTabProps {
  addTimezone: () => void;
  removeTimezone: (city: string) => void;
  timezones: any[];
  globalSearch: string;
  time: Date;
  formatTime: (date: Date, zone?: string) => string;
}

const TimezonesTab: React.FC<TimezonesTabProps> = ({
  addTimezone,
  removeTimezone,
  timezones,
  globalSearch,
  time,
  formatTime
}) => {
  return (
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
  );
};

export default TimezonesTab;
