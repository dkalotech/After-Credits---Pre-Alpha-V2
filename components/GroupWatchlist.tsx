
import React from 'react';
import { MOCK_MOVIES } from '../constants';

const GroupWatchlist: React.FC = () => {
  return (
    <div className="space-y-12 py-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-red-600 mb-1">Collaborative</p>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Squad Queue</h2>
        </div>
        <div className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest mono shadow-glow-red">4 LIVE</div>
      </div>

      <div className="space-y-6">
        {MOCK_MOVIES.slice(0, 3).map((movie, i) => (
          <div key={movie.id} className="group relative bg-[#0a0a0a] rounded-[40px] p-7 border border-white/5 flex items-center gap-7 overflow-hidden shadow-premium transition-all duration-500 hover:bg-[#121212]">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-all duration-1000">
               <span className="text-8xl font-black italic tracking-tighter">{i + 1}</span>
            </div>
            
            <div className="w-24 aspect-[2/3] flex-shrink-0 relative z-10">
                <img src={movie.poster} className="w-full h-full rounded-2xl object-cover shadow-2xl transition duration-700 group-hover:scale-105" alt="" />
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-lg">#1</div>
            </div>
            
            <div className="flex-1 relative z-10 pr-4">
              <h3 className="text-xl font-black text-white leading-tight tracking-tight uppercase group-hover:text-red-600 transition-colors duration-300">{movie.title}</h3>
              <p className="text-[11px] text-[#48484a] font-black uppercase tracking-widest mt-2">Echoed by <span className="text-white">Chen</span></p>
              
              <div className="flex gap-3 mt-6">
                <button className="flex-1 py-3 bg-white text-black text-[10px] font-black rounded-xl uppercase tracking-widest hover:brightness-90 transition-all active:scale-95 shadow-lg">Vote In</button>
                <button className="flex-1 py-3 bg-white/5 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 border border-white/5">Skip</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-10 border-2 border-dashed border-[#1c1c1e] rounded-[40px] flex flex-col items-center justify-center gap-4 group hover:border-red-600/40 hover:bg-red-600/5 transition-all duration-500">
        <span className="text-[#2c2c2e] group-hover:text-red-600 text-4xl font-light transition-colors">+</span>
        <span className="text-[#2c2c2e] group-hover:text-red-600 text-[11px] font-black uppercase tracking-[0.3em] transition-colors">Nominate Entry</span>
      </button>
    </div>
  );
};

export default GroupWatchlist;
