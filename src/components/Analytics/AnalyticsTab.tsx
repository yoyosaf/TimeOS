import React from 'react';
import { motion } from 'motion/react';
import { AnalyticsDashboard } from '../Dashboard/Widgets';

interface AnalyticsTabProps {
  focusHistory: any[];
  productivityStats: any;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  focusHistory,
  productivityStats,
}) => {
  return (
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
  );
};

export default AnalyticsTab;
