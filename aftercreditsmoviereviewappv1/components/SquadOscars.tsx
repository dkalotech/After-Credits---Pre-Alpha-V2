
import React, { useState } from 'react';
import { Movie, OscarNomination } from '../types';

interface Props {
  nominations: OscarNomination[];
  movies: Movie[];
  onNominate: (nom: OscarNomination) => void;
  onVote: (id: string) => void;
}

const CATEGORIES = ["BEST PICTURE", "BEST PLOT", "BEST VISUALS", "MVP ACTING", "BIGGEST DISAPPOINTMENT"];

const SquadOscars: React.FC<Props> = ({ nominations, movies, onNominate, onVote }) => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [showPicker, setShowPicker] = useState(false);

  const filteredNoms = nominations.filter(n => n.category === activeCategory);

  const handlePickMovie = (movie: Movie) => {
    const isAlreadyNominated = nominations.find(n => n.movieId === movie.id && n.category === activeCategory);
    if (isAlreadyNominated) return;

    const newNom: OscarNomination = {
      id: 'nom-' + Date.now(),
      category: activeCategory,
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.poster,
      votes: []
    };
    onNominate(newNom);
    setShowPicker(false);
  };

  return (
    <div className="px-6 py-8 space-y-12 animate-reveal pb-24">
      <div className="text-center space-y-2">
        <p className="text-[10px] font-black text-[#bf953f] uppercase tracking-[0.5em] animate-pulse">Squad Integrity Ceremony</p>
        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">The Oscars</h2>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-4 -mx-6 px-6 pb-2">
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-[#bf953f] text-black shadow-[0_0_20px_rgba(191,149,63,0.3)]' : 'bg-white/5 text-[#48484a] border border-white/5'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredNoms.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-[#1c1c1e] rounded-[3rem]">
            <p className="text-[#2c2c2e] text-[10px] font-black uppercase tracking-[0.4em]">No Nominations Yet</p>
          </div>
        ) : (
          filteredNoms.sort((a,b) => b.votes.length - a.votes.length).map((nom, i) => (
            <div key={nom.id} className="relative group bg-[#0a0a0a] border border-white/5 rounded-[40px] p-6 flex items-center gap-6 shadow-premium transition-all hover:border-[#bf953f]/30">
               <div className="absolute top-4 right-6 text-[40px] font-black italic opacity-5 group-hover:opacity-20 transition-all pointer-events-none">#{i + 1}</div>
               <div className="w-20 aspect-[2/3] flex-shrink-0 antique-gold-frame">
                 <img src={nom.moviePoster} className="w-full h-full object-cover" />
               </div>
               <div className="flex-1 overflow-hidden">
                 <h3 className="text-white font-black text-lg uppercase truncate tracking-tighter">{nom.movieTitle}</h3>
                 <div className="mt-4 flex items-center gap-4">
                    <button 
                      onClick={() => onVote(nom.id)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${nom.votes.length > 0 ? 'bg-[#bf953f] text-black shadow-lg' : 'bg-white/5 text-white/40 border border-white/10'}`}
                    >
                      Cast Vote
                    </button>
                    <div className="flex -space-x-2">
                      {nom.votes.map(v => (
                        <img key={v} src={`https://esm.sh/avatar/${v}`} className="w-6 h-6 rounded-full border border-black" />
                      ))}
                    </div>
                    {nom.votes.length > 0 && <span className="text-[10px] font-black text-[#bf953f] mono">{nom.votes.length}</span>}
                 </div>
               </div>
            </div>
          ))
        )}

        <button 
          onClick={() => setShowPicker(true)}
          className="w-full py-10 bg-gradient-to-r from-black via-[#121212] to-black border border-white/5 rounded-[40px] flex flex-col items-center justify-center gap-3 group hover:border-[#bf953f]/40 transition-all"
        >
          <span className="text-3xl transition-transform group-hover:scale-110">🎭</span>
          <span className="text-[10px] font-black text-[#48484a] group-hover:text-[#bf953f] uppercase tracking-[0.4em]">Nominate Contender</span>
        </button>
      </div>

      {showPicker && (
        <div className="fixed inset-0 z-[80] bg-black/98 backdrop-blur-3xl p-8 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Select Nominee</h3>
            <button onClick={() => setShowPicker(false)} className="text-[#48484a] text-[10px] font-black uppercase tracking-widest">Close</button>
          </div>
          <div className="grid grid-cols-2 gap-8 overflow-y-auto">
            {movies.map(m => (
              <div key={m.id} onClick={() => handlePickMovie(m)} className="space-y-3 cursor-pointer group">
                <div className="aspect-[2/3] rounded-[2rem] overflow-hidden border-2 border-transparent group-hover:border-[#bf953f] transition-all relative">
                   <img src={m.poster} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Select</span>
                   </div>
                </div>
                <h4 className="text-xs font-black text-white uppercase truncate text-center">{m.title}</h4>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SquadOscars;
