import React from 'react';
import { motion } from 'motion/react';

interface SettingsTabProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  is24Hour: boolean;
  setIs24Hour: (val: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  isDarkMode,
  setIsDarkMode,
  is24Hour,
  setIs24Hour,
  sidebarCollapsed,
  setSidebarCollapsed
}) => {
  return (
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
  );
};

export default SettingsTab;
