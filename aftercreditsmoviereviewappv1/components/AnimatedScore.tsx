
import React from 'react';

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  showEmoji?: boolean;
}

const AnimatedScore: React.FC<Props> = ({ score, size = 80, strokeWidth = 8, showEmoji = false }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 90) return '#22c55e'; // Neon Green
    if (s >= 75) return '#facc15'; // Lime/Yellow
    if (s >= 60) return '#f97316'; // Orange
    if (s >= 40) return '#ef4444'; // Red-Orange
    return '#991b1b'; // Deep Red
  };

  const color = getColor(score);

  return (
    <div className="relative inline-flex items-center justify-center transition-all duration-1000" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-white/10"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ filter: `drop-shadow(0 0 8px ${color}33)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        {showEmoji && <span className="text-2xl mb-1 animate-bounce duration-1000">
            {score >= 90 ? '🤯' : score >= 80 ? '🔥' : score >= 70 ? '✨' : score >= 50 ? '🍿' : '💀'}
        </span>}
        <span className="text-lg font-black text-white leading-none tracking-tight mono">{score}</span>
      </div>
    </div>
  );
};

export default AnimatedScore;
