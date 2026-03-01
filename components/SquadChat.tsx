
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Poll, Review, Movie } from '../types';
import { SQUAD_USERS } from '../constants';
import AnimatedScore from './AnimatedScore';

interface Props {
  messages: ChatMessage[];
  currentUser: any;
  onSendMessage: (msg: Partial<ChatMessage>) => void;
  onVote: (pollId: string, optionId: string) => void;
  onOpenMovie: (m: Movie) => void;
}

const SquadChat: React.FC<Props> = ({ messages, currentUser, onSendMessage, onVote, onOpenMovie }) => {
  const [inputText, setInputText] = useState('');
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [emojiExplosion, setEmojiExplosion] = useState<{ x: number, y: number, char: string } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage({ text: inputText });
    setInputText('');
  };

  const createPoll = () => {
    if (!pollQuestion || pollOptions.some(o => !o)) return;
    const newPoll: Poll = {
      id: 'poll-' + Date.now(),
      question: pollQuestion,
      authorId: 'me', // handled by parent
      timestamp: 'Now',
      options: pollOptions.map((o, i) => ({ id: `opt-${i}`, text: o, votes: [] }))
    };
    onSendMessage({ poll: newPoll });
    setShowPollCreator(false);
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const triggerEmoji = (emoji: string, e: React.MouseEvent) => {
    setEmojiExplosion({ x: e.clientX, y: e.clientY, char: emoji });
    onSendMessage({ emoji });
    setTimeout(() => setEmojiExplosion(null), 1000);
  };

  const ANIMATED_EMOJIS = ['🔥', '🍿', '🤯', '🎬', '🏆', '💩'];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-reveal">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/40">
        <div className="flex -space-x-3">
          {SQUAD_USERS.map(user => {
            const isMe = user.id === currentUser?.id;
            const avatar = isMe ? currentUser.avatar : user.avatar;
            return (
              <img key={user.id} src={avatar} className="w-8 h-8 rounded-full border-2 border-black object-cover" alt={user.name} />
            );
          })}
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black text-white uppercase tracking-widest">SQUAD COMMS</p>
           <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">{SQUAD_USERS.length} ONLINE</p>
        </div>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.userId === currentUser?.id;
          const avatar = isMe ? currentUser.avatar : (msg.userAvatar || `https://esm.sh/avatar/${msg.userName}`);
          return (
            <div key={msg.id} className="flex flex-col space-y-2 group">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-[#1c1c1e]">
                  <img src={avatar} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-black text-[#48484a] uppercase tracking-widest">{msg.userName}</span>
                <span className="text-[8px] font-black text-[#2c2c2e] uppercase tracking-tighter">{msg.timestamp}</span>
              </div>
              
              <div className="pl-9 space-y-3">
                {msg.text && <p className="text-sm text-white font-medium leading-relaxed">{msg.text}</p>}
                
                {msg.emoji && <span className="text-4xl block animate-bounce">{msg.emoji}</span>}

                {msg.sharedReview && (
                  <div 
                    onClick={() => onOpenMovie({id: msg.sharedReview!.movieId, title: msg.sharedReview!.movieTitle, poster: msg.sharedReview!.moviePoster} as Movie)}
                    className="bg-[#121212] border border-white/10 rounded-3xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all active:scale-95"
                  >
                    <img src={msg.sharedReview.moviePoster} className="w-16 aspect-[2/3] rounded-xl object-cover shadow-2xl" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Projection Shared</p>
                      <h4 className="text-white font-black truncate text-sm uppercase">{msg.sharedReview.movieTitle}</h4>
                      <div className="mt-2"><AnimatedScore score={msg.sharedReview.finalScore} size={32} /></div>
                    </div>
                  </div>
                )}

                {msg.poll && (
                  <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-6 space-y-6 shadow-premium">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📊</span>
                      <h4 className="text-white font-black text-sm uppercase tracking-tight">{msg.poll.question}</h4>
                    </div>
                    <div className="space-y-3">
                      {msg.poll.options.map(opt => {
                        const totalVotes = msg.poll!.options.reduce((acc, o) => acc + o.votes.length, 0);
                        const percent = totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100);
                        return (
                          <button 
                            key={opt.id}
                            onClick={() => onVote(msg.poll!.id, opt.id)}
                            className="w-full relative h-12 rounded-2xl overflow-hidden bg-white/5 group border border-white/5 hover:border-white/20 transition-all"
                          >
                            <div 
                              className="absolute inset-y-0 left-0 bg-red-600/20 transition-all duration-1000" 
                              style={{ width: `${percent}%` }}
                            />
                            <div className="relative px-4 h-full flex justify-between items-center">
                              <span className="text-[11px] font-black text-white uppercase">{opt.text}</span>
                              <span className="text-[10px] font-black text-[#48484a] mono">{percent}%</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-[#0a0a0a]/80 backdrop-blur-2xl border-t border-white/5">
        {showPollCreator && (
          <div className="mb-6 bg-[#121212] p-6 rounded-[2rem] border border-red-600/20 animate-reveal space-y-4">
             <input 
               placeholder="POLL QUESTION" 
               className="w-full bg-transparent text-white font-black text-xs uppercase focus:outline-none"
               value={pollQuestion}
               onChange={e => setPollQuestion(e.target.value)}
             />
             {pollOptions.map((opt, i) => (
               <input 
                 key={i}
                 placeholder={`OPTION ${i+1}`}
                 className="w-full bg-black/40 p-3 rounded-xl text-white text-[10px] focus:outline-none"
                 value={opt}
                 onChange={e => {
                   const newOpts = [...pollOptions];
                   newOpts[i] = e.target.value;
                   setPollOptions(newOpts);
                 }}
               />
             ))}
             <div className="flex gap-2">
                <button onClick={() => setPollOptions([...pollOptions, ''])} className="px-4 py-2 bg-white/5 text-[#48484a] text-[8px] font-black rounded-lg uppercase">Add Option</button>
                <button onClick={createPoll} className="flex-1 py-3 bg-red-600 text-white text-[9px] font-black rounded-xl uppercase shadow-glow-red">Launch Poll</button>
                <button onClick={() => setShowPollCreator(false)} className="px-4 py-2 text-[#48484a] text-[8px] font-black uppercase">Cancel</button>
             </div>
          </div>
        )}

        <div className="flex gap-4 items-center mb-4 overflow-x-auto no-scrollbar py-2">
           <button onClick={() => setShowPollCreator(true)} className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all">📊</button>
           {ANIMATED_EMOJIS.map(e => (
             <button key={e} onClick={(ev) => triggerEmoji(e, ev)} className="text-2xl hover:scale-125 transition-transform">{e}</button>
           ))}
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Type transmission..." 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="w-full bg-[#121212] border border-white/5 rounded-full px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600/30 placeholder:text-[#2c2c2e] font-medium"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 p-3 rounded-full text-white shadow-glow-red active:scale-90 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </button>
        </div>
      </div>

      {emojiExplosion && (
        <div 
          className="fixed pointer-events-none z-[100] animate-pop-and-fade"
          style={{ left: emojiExplosion.x - 20, top: emojiExplosion.y - 100 }}
        >
          <span className="text-6xl">{emojiExplosion.char}</span>
        </div>
      )}

      <style>{`
        @keyframes pop-and-fade {
          0% { transform: scale(0.5) translateY(0); opacity: 0; }
          20% { transform: scale(1.5) translateY(-20px); opacity: 1; }
          100% { transform: scale(1) translateY(-100px); opacity: 0; }
        }
        .animate-pop-and-fade {
          animation: pop-and-fade 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default SquadChat;
