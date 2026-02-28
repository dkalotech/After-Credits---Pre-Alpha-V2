
import React, { useState, useEffect } from 'react';
import { TriviaQuestion, LeaderboardEntry } from '../types';
import { generateTriviaQuestions } from '../services/geminiService';
import { MOCK_MOVIES } from '../constants';

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { userId: 'u1', userName: 'Alex Rivera', userAvatar: 'https://picsum.photos/seed/alex/100/100', score: 2450, rank: 1 },
  { userId: 'u2', userName: 'Sarah Chen', userAvatar: 'https://picsum.photos/seed/sarah/100/100', score: 2100, rank: 2 },
  { userId: 'u3', userName: 'CinephileX', userAvatar: 'https://picsum.photos/seed/me/100/100', score: 1850, rank: 3 },
];

const TriviaChallenge: React.FC = () => {
  const [gameState, setGameState] = useState<'intro' | 'loading' | 'playing' | 'results'>('intro');
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);

  const startNewGame = async () => {
    setGameState('loading');
    const movieTitles = MOCK_MOVIES.map(m => m.title);
    const newQuestions = await generateTriviaQuestions(movieTitles);
    setQuestions(newQuestions);
    setGameState('playing');
    setCurrentIdx(0);
    setScore(0);
    setTimeLeft(15);
  };

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing' && timeLeft > 0 && !selectedAnswer) {
      timer = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !selectedAnswer) {
      handleAnswer('');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, selectedAnswer]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentIdx].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + (timeLeft * 10) + 100);
    }
    
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setSelectedAnswer(null);
        setTimeLeft(15);
      } else {
        setGameState('results');
      }
    }, 1200);
  };

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-reveal">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#8e8e93] font-black animate-pulse uppercase tracking-[0.4em] text-[10px]">Generating Challenge</p>
      </div>
    );
  }

  if (gameState === 'playing') {
    const q = questions[currentIdx];
    return (
      <div className="space-y-10 animate-reveal pb-12">
        {/* Status Bar */}
        <div className="flex justify-between items-center bg-[#0a0a0a] p-6 rounded-[2rem] border border-white/5 shadow-premium">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#48484a] uppercase font-black tracking-widest mb-1">Entry {currentIdx + 1}/5</span>
            <span className="text-white font-black mono text-xl">{score} <span className="text-[10px] text-[#48484a]">PTS</span></span>
          </div>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${timeLeft < 5 ? 'border-red-600 text-red-600 animate-pulse shadow-glow-red' : 'border-white/10 text-white'}`}>
            <span className="text-lg font-black mono">{timeLeft}</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-[#0a0a0a] p-10 rounded-[48px] border border-white/5 shadow-premium text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <span className="px-5 py-2 bg-red-600/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-8 inline-block relative z-10">
            {q.category}
          </span>
          <h2 className="text-3xl font-black text-white leading-tight tracking-tighter relative z-10 uppercase">{q.question}</h2>
        </div>

        {/* Option Stack */}
        <div className="grid grid-cols-1 gap-4">
          {q.options.map((opt, i) => {
            const isCorrect = opt === q.correctAnswer;
            const isSelected = selectedAnswer === opt;
            let btnClass = "w-full p-6 rounded-[2rem] text-left font-black tracking-tight transition-all duration-300 border relative overflow-hidden ";
            
            if (selectedAnswer) {
              if (isCorrect) btnClass += "bg-emerald-600/20 border-emerald-600 text-emerald-500 scale-[1.03] shadow-glow-emerald";
              else if (isSelected) btnClass += "bg-red-600/20 border-red-600 text-red-500 scale-95 opacity-80";
              else btnClass += "bg-black border-white/5 text-[#2c2c2e] opacity-40";
            } else {
              btnClass += "bg-[#0a0a0a] border-white/5 text-white hover:border-white/30 active:scale-[0.98] hover:bg-[#121212]";
            }

            return (
              <button
                key={i}
                disabled={!!selectedAnswer}
                onClick={() => handleAnswer(opt)}
                className={btnClass}
              >
                <div className="relative z-10 flex justify-between items-center">
                  <span>{opt}</span>
                  {selectedAnswer && isCorrect && <span className="text-xl">✅</span>}
                  {selectedAnswer && isSelected && !isCorrect && <span className="text-xl">❌</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    return (
      <div className="text-center space-y-16 py-10 animate-reveal">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-red-600 blur-[100px] opacity-40 animate-pulse"></div>
          <h2 className="text-8xl font-black text-white tracking-tighter relative mono italic">{score}</h2>
          <p className="text-[#8e8e93] font-black uppercase tracking-[0.5em] text-[11px] mt-6">Cine-IQ Score</p>
        </div>

        <div className="bg-[#0a0a0a] rounded-[48px] border border-white/5 overflow-hidden shadow-premium text-left">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#48484a]">Global Rankings</h3>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mono">+12 PTS</span>
          </div>
          <div className="divide-y divide-white/5">
            {MOCK_LEADERBOARD.map(entry => (
              <div key={entry.userId} className={`p-8 flex items-center justify-between transition-colors ${entry.userName === 'CinephileX' ? 'bg-red-600/10' : 'hover:bg-white/5'}`}>
                <div className="flex items-center gap-5">
                  <span className="text-[#2c2c2e] font-black w-6 text-base mono">{entry.rank}</span>
                  <img src={entry.userAvatar} className="w-12 h-12 rounded-full border border-white/10 ring-2 ring-black" alt="" />
                  <span className="text-[15px] font-black text-white tracking-tight">{entry.userName}</span>
                </div>
                <span className="text-base font-black text-red-500 mono">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4">
            <button 
            onClick={startNewGame}
            className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black hover:bg-red-500 active:scale-[0.98] transition-all shadow-glow-red tracking-[0.3em] text-[12px] uppercase"
            >
            Restart Engine
            </button>
            <button className="text-[10px] font-black text-[#48484a] uppercase tracking-[0.2em] hover:text-white transition-colors">Return to Lobby</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-16 animate-reveal">
      <div className="text-center space-y-8">
        <div className="w-28 h-28 bg-red-600 rounded-[40px] flex items-center justify-center mx-auto shadow-glow-red rotate-12 hover:rotate-0 transition-transform duration-700 cursor-pointer group">
           <svg className="w-14 h-14 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
        </div>
        <div className="space-y-4 px-4">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Cine-Gauntlet</h2>
            <p className="text-[#8e8e93] text-[15px] max-w-[300px] mx-auto leading-relaxed font-medium">Calibrate your cinematic knowledge against the global consensus.</p>
        </div>
      </div>

      <div className="w-full space-y-5 px-4">
        <button 
          onClick={startNewGame}
          className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black tracking-[0.3em] text-[12px] hover:bg-red-500 active:scale-[0.97] transition-all shadow-glow-red uppercase"
        >
          Begin Solo Protocol
        </button>
        <button className="w-full py-6 bg-[#0a0a0a] text-white border border-white/10 rounded-[2rem] font-black tracking-[0.3em] text-[12px] hover:bg-[#121212] transition-all uppercase">
          Invite Squad
        </button>
      </div>
    </div>
  );
};

export default TriviaChallenge;
