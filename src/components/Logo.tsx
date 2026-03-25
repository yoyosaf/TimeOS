import React from 'react';

export function Logo({ className = "", showText = true }: { className?: string, showText?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xl"
      >
        {/* Browser Window Background */}
        <rect
          x="10"
          y="20"
          width="100"
          height="80"
          rx="12"
          fill="url(#windowGradient)"
        />
        
        {/* Browser Header Dots */}
        <circle cx="25" cy="35" r="3" fill="white" fillOpacity="0.8" />
        <circle cx="35" cy="35" r="3" fill="white" fillOpacity="0.8" />
        <circle cx="45" cy="35" r="3" fill="white" fillOpacity="0.8" />

        {/* Clock Outer Ring */}
        <circle
          cx="60"
          cy="60"
          r="35"
          fill="white"
          stroke="#004A8F"
          strokeWidth="4"
        />
        
        {/* Clock Face Details */}
        <circle cx="60" cy="40" r="1.5" fill="#111" />
        <circle cx="80" cy="60" r="1.5" fill="#111" />
        <circle cx="60" cy="80" r="1.5" fill="#111" />
        <circle cx="40" cy="60" r="1.5" fill="#111" />
        
        {/* Clock Hands */}
        <line
          x1="60"
          y1="60"
          x2="45"
          y2="45"
          stroke="#004A8F"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="60"
          y1="60"
          x2="75"
          y2="45"
          stroke="#00C2CB"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Center Pin */}
        <circle cx="60" cy="60" r="3" fill="#004A8F" />

        <defs>
          <linearGradient
            id="windowGradient"
            x1="10"
            y1="20"
            x2="110"
            y2="100"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#004A8F" />
            <stop offset="1" stopColor="#00C2CB" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className="mt-2 text-2xl font-black tracking-tight flex items-center">
          <span className="text-[#004A8F]">Time</span>
          <span className="text-[#00C2CB]">OS</span>
        </span>
      )}
    </div>
  );
}
