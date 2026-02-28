
import React, { useState, useEffect } from 'react';
import { RATING_WEIGHTS } from '../constants';
import { Movie, WeightedRating } from '../types';
import AnimatedScore from './AnimatedScore';

interface Props {
  movie: Movie;
  initialRating?: WeightedRating;
  initialComment?: string;
  onClose: () => void;
  onSubmit: (rating: WeightedRating, comment: string) => void;
}

const ReviewModal: React.FC<Props> = ({ movie, initialRating, initialComment, onClose, onSubmit }) => {
  const [ratings, setRatings] = useState<WeightedRating>(() => {
    const base = initialRating ? { ...initialRating } : {
      plot: 75, writing: 75, acting: 75, rewatch: 50, visuals: 75, emotion: 75
    };
    // Ensure writing exists for legacy reviews
    if (base.writing === undefined) base.writing = 75;
    return base as WeightedRating;
  });
  const [comment, setComment] = useState(initialComment || '');
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    const score = (
      (ratings.plot * RATING_WEIGHTS.plot) +
      (ratings.writing * RATING_WEIGHTS.writing) +
      (ratings.acting * RATING_WEIGHTS.acting) +
      (ratings.rewatch * RATING_WEIGHTS.rewatch) +
      (ratings.visuals * RATING_WEIGHTS.visuals) +
      (ratings.emotion * RATING_WEIGHTS.emotion)
    );
    setFinalScore(Math.round(score));
  }, [ratings]);

  const handleSliderChange = (key: keyof WeightedRating, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 h-full z-[150] bg-black/95 backdrop-blur-2xl overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[56px] p-10 space-y-12 shadow-premium relative my-10">
          
          {/* Header Strip */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-[11px] font-black text-red-600 uppercase tracking-[0.5em]">{initialRating ? 'Update Record' : 'Calibrate Score'}</h2>
              <h1 className="text-3xl font-black text-white leading-none uppercase tracking-tighter">{movie.title}</h1>
            </div>
            <button onClick={onClose} className="p-4 bg-white/5 rounded-full text-[#48484a] hover:text-white transition-all active:scale-90">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Central Viz */}
          <div className="flex items-center justify-center py-4">
             <AnimatedScore score={finalScore} size={180} strokeWidth={12} showEmoji />
          </div>

          {/* Analytical Sliders */}
          <div className="space-y-10">
            {(Object.keys(RATING_WEIGHTS) as Array<keyof typeof RATING_WEIGHTS>).map(key => (
              <div key={key} className="space-y-4">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-[#48484a]">
                  <span>{key}</span>
                  <span className="text-white mono">{ratings[key]}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={ratings[key]}
                  onChange={(e) => handleSliderChange(key, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            ))}
          </div>

          {/* Verbiage */}
          <textarea
            placeholder="What's the consensus?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-[#121212] border border-white/5 rounded-[2rem] p-8 text-sm text-white placeholder:text-[#2c2c2e] focus:outline-none focus:ring-4 focus:ring-red-600/10 transition-all min-h-[160px] resize-none"
          />

          {/* CTA Stack */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-6 bg-[#121212] text-[#48484a] rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-[#1c1c1e] transition-all"
            >
              Abort
            </button>
            <button
              onClick={() => onSubmit(ratings, comment)}
              className="flex-[2] py-6 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-red-500 transition-all shadow-glow-red"
            >
              {initialRating ? 'Update Record' : 'Seal Record'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
