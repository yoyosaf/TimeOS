import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { DailyPlanWidget } from '../Dashboard/Widgets';

interface PlannerTabProps {
  dailyPlan: any;
  handleGeneratePlan: () => void;
}

const PlannerTab: React.FC<PlannerTabProps> = ({
  dailyPlan,
  handleGeneratePlan,
}) => {
  return (
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
  );
};

export default PlannerTab;
