
import React, { useState } from 'react';
import { Movie, Review } from '../types';
import AnimatedScore from './AnimatedScore';
import CategoryBar from './CategoryBar';
import RatingRadar from './RadarChart';
import { MOCK_FRIENDS } from '../constants';

interface Props {
  movie: Movie;
  userReview?: Review;
  onClose: () => void;
  onRate: () => void;
  onUpdateMovie: (updatedMovie: Movie) => void;
}

const MovieDetail: React.FC<Props> = ({ movie, userReview, onClose, onRate, onUpdateMovie }) => {
  const [recommendedFriendIds, setRecommendedFriendIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(movie.title);
  const [editYear, setEditYear] = useState(movie.year);
  const [editDescription, setEditDescription] = useState(movie.description);

  const handleSaveEdit = () => {
    onUpdateMovie({
      ...movie,
      title: editTitle,
      year: editYear,
      description: editDescription
    });
    setIsEditing(false);
    setToastMessage("Record Updated");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRecommend = (friendId: string, friendName: string) => {
    if (recommendedFriendIds.includes(friendId)) return;
    setRecommendedFriendIds(prev => [...prev, friendId]);
    setToastMessage(`Echoed to ${friendName}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getStatusColor = (s: number) => {
    if (s >= 90) return '#22c55e';
    if (s >= 75) return '#facc15';
    if (s >= 60) return '#f97316';
    if (s >= 40) return '#ef4444';
    return '#e11d48';
  };

  const themeColor = getStatusColor(movie.globalScore);

  return (
    <div className="fixed inset-0 h-full z-[140] bg-black overflow-y-auto pb-40">
      {/* Dynamic Toast */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[70] bg-white text-black px-8 py-3.5 rounded-full font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl animate-reveal">
          {toastMessage}
        </div>
      )}

      {/* Immersive Hero */}
      <div className="relative h-[65vh] flex items-end">
        <div className="absolute inset-0 overflow-hidden">
          <img src={movie.poster} className="w-full h-full object-cover scale-125 blur-3xl opacity-20" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black"></div>
        </div>
        
        <button 
          onClick={onClose} 
          className="absolute top-8 left-8 p-4 premium-blur rounded-full text-white transition-all active:scale-90 border border-white/10 shadow-premium z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button 
          onClick={() => setIsEditing(true)} 
          className="absolute top-8 right-8 p-4 premium-blur rounded-full text-white/60 hover:text-white transition-all active:scale-90 border border-white/10 shadow-premium z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <div className="relative z-10 w-full px-8 pb-12 flex flex-col items-center text-center space-y-6">
           <div className="flex flex-col items-center space-y-4">
             <AnimatedScore score={movie.globalScore} size={160} strokeWidth={10} showEmoji />
             <div className="space-y-1">
               <div className="flex flex-col items-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40" style={{ color: themeColor }}>Consensus Score</p>
                  <p className="text-[12px] font-black text-white/60 uppercase tracking-[0.6em] mono mt-4 mb-1">PREMIERE · {movie.year}</p>
               </div>
               <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase">{movie.title}</h1>
             </div>
           </div>
           
           <div className="flex flex-wrap gap-2 justify-center">
              {movie.genre.map(g => (
                <span key={g} className="px-5 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-[#8e8e93] uppercase tracking-[0.3em]">
                  {g}
                </span>
              ))}
            </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="px-8 space-y-24 max-w-2xl mx-auto">
        
        {/* Plot Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-black text-[#48484a] uppercase tracking-[0.5em]">The Dossier</h3>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          <p className="text-[#8e8e93] text-[16px] font-medium leading-[1.6] opacity-90">{movie.description}</p>
        </section>

        {/* Squad Interaction */}
        <section className="space-y-10">
          <h3 className="text-[10px] font-black text-[#48484a] uppercase tracking-[0.5em]">Echo to Squad</h3>
          <div className="flex gap-8 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
            {MOCK_FRIENDS.map(friend => {
              const isRecommended = recommendedFriendIds.includes(friend.id);
              return (
                <button 
                  key={friend.id}
                  onClick={() => handleRecommend(friend.id, friend.name)}
                  className={`flex flex-col items-center gap-4 transition-all duration-700 ${isRecommended ? 'opacity-10 pointer-events-none' : 'hover:scale-110 active:scale-95'}`}
                >
                  <div className="relative">
                    <img src={friend.avatar} className="w-16 h-16 rounded-full ring-2 ring-white/5 object-cover" alt={friend.name} />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full border border-white/10 flex items-center justify-center text-[8px]">⚡</div>
                  </div>
                  <span className="text-[11px] font-black text-[#48484a] uppercase tracking-wider w-16 truncate text-center">{friend.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Analytics Matrix */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-black text-[#48484a] uppercase tracking-[0.5em]">Prism Index™</h3>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          <div className="bg-[#0a0a0a] p-10 rounded-[48px] border border-white/5 space-y-16 shadow-premium">
            <div className="relative group flex justify-center">
              <RatingRadar data={userReview ? userReview.rating : { plot: 92, acting: 88, rewatch: 45, visuals: 98, emotion: 85 }} size={260} />
            </div>
            
            <div className="grid grid-cols-1 gap-8">
               <CategoryBar label="Plot" value={userReview ? userReview.rating.plot : 92} />
               <CategoryBar label="Acting" value={userReview ? userReview.rating.acting : 88} />
               <CategoryBar label="Visuals" value={userReview ? userReview.rating.visuals : 98} />
               <CategoryBar label="Emotion" value={userReview ? userReview.rating.emotion : 85} />
            </div>
          </div>
        </section>

        {/* Action Button - Dynamic Text */}
        <button 
          onClick={onRate}
          className={`w-full py-6 text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.3em] shadow-glow-red hover:brightness-110 active:scale-[0.97] transition-all transform duration-300 border-2 ${userReview ? 'border-white/20' : 'border-transparent'}`}
          style={{ 
            backgroundColor: userReview ? '#121212' : themeColor,
            boxShadow: userReview ? 'none' : `0 20px 40px -10px ${themeColor}44`
          }}
        >
          {userReview ? 'Update My Review' : 'Rate This Film'}
        </button>
      </div>
      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-8 animate-reveal">
            <div className="text-center space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Calibration</p>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Edit Metadata</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#48484a] uppercase tracking-widest pl-2">Title</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded-2xl p-4 text-white font-bold focus:ring-2 focus:ring-red-600/50 outline-none uppercase" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#48484a] uppercase tracking-widest pl-2">Year</label>
                <input type="number" value={editYear} onChange={e => setEditYear(parseInt(e.target.value))} className="w-full bg-[#121212] border border-white/10 rounded-2xl p-4 text-white font-bold focus:ring-2 focus:ring-red-600/50 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#48484a] uppercase tracking-widest pl-2">Description</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded-2xl p-4 text-white text-sm focus:ring-2 focus:ring-red-600/50 outline-none min-h-[100px] resize-none" />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsEditing(false)} className="flex-1 py-4 text-[#48484a] text-[10px] font-black uppercase tracking-widest">Cancel</button>
                <button onClick={handleSaveEdit} className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow-red">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
