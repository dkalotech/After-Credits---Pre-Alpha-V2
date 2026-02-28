
import React from 'react';

interface Props {
  label: string;
  value: number;
  color?: string;
  delay?: number;
  friendAvg?: number;
}

const CategoryBar: React.FC<Props> = ({ label, value, delay = 0, friendAvg }) => {
  const getDynamicColor = (s: number) => {
    if (s >= 90) return '#22c55e'; // Neon Green
    if (s >= 75) return '#facc15'; // Lime/Yellow
    if (s >= 60) return '#f97316'; // Orange
    if (s >= 40) return '#ef4444'; // Red-Orange
    return '#991b1b'; // Deep Red
  };

  const barColor = getDynamicColor(value);

  return (
    <div className="space-y-3 animate-reveal" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex justify-between items-end px-0.5">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8e8e93]">{label}</span>
        <div className="flex items-center gap-4">
          {friendAvg !== undefined && (
            <span className="text-[10px] font-bold text-red-500/40 uppercase tracking-widest mono">Squad {friendAvg}%</span>
          )}
          <span className="text-xs font-black text-white mono" style={{ color: barColor }}>{value}%</span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-1000 ease-out rounded-full"
          style={{ 
            width: `${value}%`, 
            backgroundColor: barColor,
            boxShadow: `0 0 16px ${barColor}22`
          }}
        />
      </div>
    </div>
  );
};

export default CategoryBar;
