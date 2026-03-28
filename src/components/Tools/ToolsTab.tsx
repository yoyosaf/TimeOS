import React from 'react';
import { motion } from 'motion/react';

const ToolsTab: React.FC = () => {
  return (
    <motion.div 
      key="tools"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-full min-h-[700px] glass-card rounded-[32px] overflow-hidden"
    >
      <iframe 
        src="https://timeos.netlify.app/Tools" 
        className="w-full h-full border-none"
        title="TimeOS Tools"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </motion.div>
  );
};

export default ToolsTab;
