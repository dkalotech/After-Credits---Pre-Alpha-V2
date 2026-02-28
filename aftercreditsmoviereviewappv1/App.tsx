
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SQUAD_USERS, RATING_WEIGHTS, INITIAL_MOVIES, MOCK_BADGES } from './constants';
import { Review, Movie, WeightedRating, ChatMessage, OscarNomination, Poll } from './types';
import { getMovieMetadata } from './services/geminiService';
import { sheetsService } from './services/sheetsService';
import ReviewModal from './components/ReviewModal';
import TriviaChallenge from './components/TriviaChallenge';
import MovieDetail from './components/MovieDetail';
import AnimatedScore from './components/AnimatedScore';
import GroupWatchlist from './components/GroupWatchlist';
import SquadChat from './components/SquadChat';
import SquadOscars from './components/SquadOscars';

const App: React.FC = () => {
  // Persistence Layer
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('ac_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [movies, setMovies] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('ac_movies');
    return saved ? JSON.parse(saved) : INITIAL_MOVIES;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('ac_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ac_chat');
    return saved ? JSON.parse(saved) : [];
  });

  const [oscarNoms, setOscarNoms] = useState<OscarNomination[]>(() => {
    const saved = localStorage.getItem('ac_oscars');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // Initial Data Fetch from Sheets
  const fetchAllData = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const data = await sheetsService.getAllData();
      if (data) {
        setSyncError(null);
        // Sanitize and validate data before setting state
        const validMovies = (data.movies || []).filter((m: any) => m && m.id && m.title);
        const validReviews = (data.reviews || []).filter((r: any) => r && r.id && r.rating && typeof r.rating === 'object');
        const validChat = (data.chatMessages || []).filter((c: any) => c && c.id);
        const validOscars = (data.oscarNoms || []).filter((o: any) => o && o.id);

        if (validMovies.length > 0) setMovies(validMovies);
        setReviews(validReviews);
        setChatMessages(validChat);
        setOscarNoms(validOscars);

        // Update squad users with latest avatars from sheet
        if (data.users && data.users.length > 0) {
          data.users.forEach((remoteUser: any) => {
            const localUser = SQUAD_USERS.find(u => u.id === remoteUser.id);
            if (localUser) {
              localUser.avatar = remoteUser.avatar;
            }
          });
          // Also update current user if their avatar changed remotely
          if (currentUser) {
            const remoteMe = data.users.find((u: any) => u.id === currentUser.id);
            if (remoteMe && remoteMe.avatar !== currentUser.avatar) {
              setCurrentUser({ ...currentUser, avatar: remoteMe.avatar });
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Sync failed, staying in local mode:", error);
      setSyncError(error.message || "Sync Protocol Interrupted");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Polling for squad updates every 15 seconds (Static Mode)
    const interval = setInterval(fetchAllData, 15000);
    return () => clearInterval(interval);
  }, []);

  // UI State
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'trivia' | 'watchlist' | 'profile' | 'chat' | 'oscars'>('feed');
  
  // Close overlays when switching tabs
  useEffect(() => {
    setIsArchiveOpen(false);
    setViewingMovie(null);
    setSelectedMovie(null);
    setEditingReview(null);
    setIsAddingMovie(false);
  }, [activeTab]);

  const [feedFilter, setFeedFilter] = useState<'live' | 'friends'>('live');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [viewingMovie, setViewingMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit State
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Login State
  const [loggingInUser, setLoggingInUser] = useState<any | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Add Movie State
  const [isAddingMovie, setIsAddingMovie] = useState(false);

  // Simple Scroll Lock for Modals
  useEffect(() => {
    const isModalOpen = isArchiveOpen || !!editingReview || isAddingMovie || !!viewingMovie || !!selectedMovie;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isArchiveOpen, editingReview, isAddingMovie, viewingMovie, selectedMovie]);
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [newMoviePoster, setNewMoviePoster] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Persistence Sync (Only for current user)
  useEffect(() => {
    if (currentUser) localStorage.setItem('ac_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const handleLogin = () => {
    if (loggingInUser && pinInput === loggingInUser.pin) {
      setCurrentUser(loggingInUser);
      setLoggingInUser(null);
      setPinInput('');
      setLoginError(false);
    } else {
      setLoginError(true);
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ac_current_user');
  };

  const handleReviewSubmit = (rating: WeightedRating, comment: string) => {
    if (!currentUser) return;

    console.log("Submitting review:", { rating, comment, editingReview, selectedMovie });

    if (editingReview) {
      const updatedReview: Review = { 
        ...editingReview, 
        rating, 
        comment, 
        timestamp: new Date().toISOString(),
        finalScore: Math.round(
          (rating.plot * RATING_WEIGHTS.plot) +
          (rating.writing * (RATING_WEIGHTS.writing || 0)) +
          (rating.acting * RATING_WEIGHTS.acting) +
          (rating.rewatch * RATING_WEIGHTS.rewatch) +
          (rating.visuals * RATING_WEIGHTS.visuals) +
          (rating.emotion * RATING_WEIGHTS.emotion)
        )
      };
      
      console.log("Updating existing review:", updatedReview);
      
      setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r));
      sheetsService.updateRecord('Reviews', updatedReview);
      setEditingReview(null);
    } else if (selectedMovie) {
      const exists = reviews.find(r => r.movieId === selectedMovie.id && r.userId === currentUser.id);
      if (exists) {
        alert("Already scored. Protocol: Edit existing record.");
        setSelectedMovie(null);
        return;
      }

      const newReview: Review = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        movieId: selectedMovie.id,
        movieTitle: selectedMovie.title,
        moviePoster: selectedMovie.poster,
        rating,
        comment,
        timestamp: new Date().toISOString(),
        finalScore: Math.round(
          (rating.plot * RATING_WEIGHTS.plot) +
          (rating.writing * (RATING_WEIGHTS.writing || 0)) +
          (rating.acting * RATING_WEIGHTS.acting) +
          (rating.rewatch * RATING_WEIGHTS.rewatch) +
          (rating.visuals * RATING_WEIGHTS.visuals) +
          (rating.emotion * RATING_WEIGHTS.emotion)
        )
      };
      
      console.log("Adding new review:", newReview);
      
      setReviews(prev => [newReview, ...prev]);
      sheetsService.addRecord('Reviews', newReview);
      setSelectedMovie(null);
      setViewingMovie(null);
    }
  };

  const sendChatMessage = (msg: Partial<ChatMessage>) => {
    if (!currentUser) return;
    const newMessage: ChatMessage = {
      id: 'chat-' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...msg
    };
    setChatMessages(prev => [...prev, newMessage]);
    sheetsService.addRecord('Chat', newMessage);
  };

  const handleShareReview = (review: Review) => {
    sendChatMessage({ sharedReview: review, text: `Check out this projection score!` });
    setActiveTab('chat');
  };

  const handlePollVote = (pollId: string, optionId: string) => {
    if (!currentUser) return;
    // Optimistic local update
    let updatedMsg: any = null;
    setChatMessages(prev => prev.map(m => {
      if (m.poll && m.poll.id === pollId) {
        const updatedOptions = m.poll.options.map(opt => {
          const filteredVotes = opt.votes.filter(id => id !== currentUser.id);
          if (opt.id === optionId) {
            return { ...opt, votes: [...filteredVotes, currentUser.id] };
          }
          return { ...opt, votes: filteredVotes };
        });
        updatedMsg = { ...m, poll: { ...m.poll, options: updatedOptions } };
        return updatedMsg;
      }
      return m;
    }));
    if (updatedMsg) sheetsService.updateRecord('Chat', updatedMsg);
  };

  const handleOscarVote = (nomId: string) => {
    if (!currentUser) return;
    // Optimistic local update
    let updatedNom: any = null;
    setOscarNoms(prev => prev.map(n => {
      if (n.id === nomId) {
        const hasVoted = n.votes.includes(currentUser.id);
        updatedNom = {
          ...n,
          votes: hasVoted ? n.votes.filter(id => id !== currentUser.id) : [...n.votes, currentUser.id]
        };
        return updatedNom;
      }
      return n;
    }));
    if (updatedNom) sheetsService.updateRecord('Oscars', updatedNom);
  };

  // Fix: Implemented missing updateAvatar function to allow users to update their profile picture
  const updateAvatar = () => {
    avatarInputRef.current?.click();
  };

  const compressImage = (base64Str: string, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality JPEG
      };
    });
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const compressedAvatar = await compressImage(base64String, 200, 200); // Small for avatars
        const updatedUser = { ...currentUser, avatar: compressedAvatar };
        setCurrentUser(updatedUser);
        
        // Sync to Google Sheet
        sheetsService.updateRecord('Users', updatedUser);
        
        // Propagate to local reviews
        setReviews(prev => prev.map(r => 
          r.userId === updatedUser.id ? { ...r, userAvatar: compressedAvatar } : r
        ));
        
        // Propagate to local chat
        setChatMessages(prev => prev.map(m => 
          m.userId === updatedUser.id ? { ...m, userAvatar: compressedAvatar } : m
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  // Fix: Implemented missing handleFileChange function to handle local image uploads for movie posters
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const compressedPoster = await compressImage(base64String, 600, 900); // Medium for posters
        setNewMoviePoster(compressedPoster);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fix: Implemented missing handleAddMovie function to integrate with Gemini for movie metadata and update global movie state
  const handleAddMovie = async () => {
    if (!newMovieTitle.trim()) return;
    setIsGenerating(true);
    try {
      const metadata = await getMovieMetadata(newMovieTitle);
      if (metadata) {
        const newMovie: Movie = {
          id: 'm-' + Date.now(),
          title: metadata.title || newMovieTitle,
          year: metadata.year || new Date().getFullYear(),
          poster: newMoviePoster || `https://picsum.photos/seed/${newMovieTitle}/400/600`,
          genre: metadata.genre || ['Drama'],
          description: metadata.description || 'No description available.',
          globalScore: metadata.predictedGlobalScore || 70
        };
        setMovies(prev => [newMovie, ...prev]);
        sheetsService.addRecord('Movies', newMovie);
        setIsAddingMovie(false);
        setNewMovieTitle('');
        setNewMoviePoster(null);
      } else {
        alert("Failed to synchronize movie data. Protocol failed.");
      }
    } catch (error) {
      console.error("Add Movie Error:", error);
      alert("Encryption error during synchronization.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateMovie = (updatedMovie: Movie) => {
    setMovies(prev => prev.map(m => m.id === updatedMovie.id ? updatedMovie : m));
    setViewingMovie(updatedMovie);
    sheetsService.updateRecord('Movies', updatedMovie);
  };

  const userReviews = useMemo(() => reviews.filter(r => r.userId === currentUser?.id), [reviews, currentUser]);
  const trophyCase = useMemo(() => [...userReviews].sort((a, b) => b.finalScore - a.finalScore).slice(0, 5), [userReviews]);
  const basement = useMemo(() => {
    return userReviews
      .filter(r => r.finalScore <= 65)
      .sort((a, b) => a.finalScore - b.finalScore)
      .slice(0, 3);
  }, [userReviews]);

  const viewingUserReview = useMemo(() => {
    if (!viewingMovie || !currentUser) return undefined;
    return reviews.find(r => r.movieId === viewingMovie.id && r.userId === currentUser.id);
  }, [viewingMovie, reviews, currentUser]);

  const getRatingHighlights = (rating: WeightedRating) => {
    if (!rating || typeof rating !== 'object') {
      return { 
        peak: { label: 'N/A', value: 0 }, 
        valley: { label: 'N/A', value: 0 } 
      };
    }
    const keys = Object.keys(rating) as Array<keyof WeightedRating>;
    if (keys.length === 0) {
      return { 
        peak: { label: 'N/A', value: 0 }, 
        valley: { label: 'N/A', value: 0 } 
      };
    }
    let peak = keys[0];
    let valley = keys[0];
    keys.forEach(key => {
      if (rating[key] > rating[peak]) peak = key;
      if (rating[key] < rating[valley]) valley = key;
    });
    return { 
      peak: { label: peak, value: rating[peak] }, 
      valley: { label: valley, value: rating[valley] } 
    };
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto bg-black min-h-screen flex flex-col items-center justify-center p-8 space-y-12 animate-reveal">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">AfterCredits</h1>
          <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Squad Authentication</p>
        </div>
        {!loggingInUser ? (
          <div className="w-full grid grid-cols-2 gap-4">
            {SQUAD_USERS.map(user => (
              <button key={user.id} onClick={() => setLoggingInUser(user)} className="bg-[#121212] p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-4 hover:bg-white/5 active:scale-95 transition-all group">
                <img src={user.avatar} className="w-16 h-16 rounded-full ring-2 ring-red-600/20 group-hover:ring-red-600 transition-all" />
                <span className="text-white text-xs font-black uppercase tracking-tight">{user.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="w-full space-y-8 text-center animate-reveal">
            <button onClick={() => {setLoggingInUser(null); setPinInput(''); setLoginError(false);}} className="text-[#48484a] text-[10px] font-black uppercase tracking-widest mb-4">← Back to Squad</button>
            <div className="flex flex-col items-center gap-4">
              <img src={loggingInUser.avatar} className="w-24 h-24 rounded-full ring-4 ring-red-600 shadow-glow-red" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{loggingInUser.name}</h2>
            </div>
            <div className="space-y-4">
              <input type="password" maxLength={4} placeholder="ENTER PIN" value={pinInput} onChange={(e) => setPinInput(e.target.value)} className={`w-full bg-[#121212] border ${loginError ? 'border-red-600' : 'border-white/10'} rounded-2xl p-6 text-white text-center text-2xl font-black tracking-[1em] focus:outline-none focus:ring-4 focus:ring-red-600/20`} />
              {loginError && <p className="text-red-600 text-[10px] font-black uppercase">Access Denied: Incorrect PIN</p>}
              <button onClick={handleLogin} className="w-full py-6 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow-red active:scale-95 transition-all">Establish Connection</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-black min-h-screen pb-24 relative overflow-x-hidden shadow-2xl">
      <header className="sticky top-0 z-40 premium-blur px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e50914] mb-0.5">{currentUser.role}</p>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">AfterCredits</h1>
            {syncError && (
              <button 
                onClick={() => alert(`Sync Error: ${syncError}`)}
                className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md max-w-[150px] truncate active:scale-95 transition-transform"
              >
                <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest leading-none">
                  {syncError.toLowerCase().includes("not configured") ? "Config Error" : "Offline"}
                </span>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : (syncError ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]')} transition-all`} title={isSyncing ? 'Syncing with Sheets...' : (syncError ? 'Vault Offline' : 'Squad Connected')}></div>
           <button onClick={handleLogout} className="text-[#48484a] text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Logout</button>
           <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden">
              <img src={currentUser.avatar} className="w-full h-full object-cover" />
           </div>
        </div>
      </header>

      <main>
        {activeTab === 'feed' && (
          <div className="space-y-0 animate-reveal">
            <div className="px-6 py-3 bg-black/60 backdrop-blur-md sticky top-[65px] z-30 border-b border-white/5">
              <div className="flex bg-[#1c1c1e] p-1 rounded-2xl">
                <button onClick={() => setFeedFilter('live')} className={`flex-1 py-1.5 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all ${feedFilter === 'live' ? 'bg-[#3a3a3c] text-white' : 'text-[#8e8e93]'}`}>Global</button>
                <button onClick={() => setFeedFilter('friends')} className={`flex-1 py-1.5 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all ${feedFilter === 'friends' ? 'bg-[#3a3a3c] text-white' : 'text-[#8e8e93]'}`}>Squad</button>
              </div>
            </div>
            <div className="space-y-0">
              {(() => {
                const filtered = feedFilter === 'friends' 
                  ? reviews.filter(r => r.userId !== currentUser.id) 
                  : reviews;
                
                // Safe sorting: Handle ISO and legacy timestamps
                return [...filtered].sort((a, b) => {
                  const timeA = new Date(a.timestamp).getTime() || 0;
                  const timeB = new Date(b.timestamp).getTime() || 0;
                  return timeB - timeA;
                });
              })().length === 0 ? (
                <div className="py-24 text-center px-6">
                  <span className="text-[#2c2c2e] text-5xl block mb-6">🎞️</span>
                  <p className="text-[#8e8e93] uppercase text-[10px] font-black tracking-[0.3em]">Intermission</p>
                </div>
              ) : (
                (() => {
                  const filtered = feedFilter === 'friends' 
                    ? reviews.filter(r => r.userId !== currentUser.id) 
                    : reviews;
                  
                  return [...filtered].sort((a, b) => {
                    const timeA = new Date(a.timestamp).getTime() || 0;
                    const timeB = new Date(b.timestamp).getTime() || 0;
                    return timeB - timeA;
                  });
                })().map(review => {
                  const highlights = getRatingHighlights(review.rating);
                  const dateObj = new Date(review.timestamp);
                  const displayTime = isNaN(dateObj.getTime()) ? review.timestamp : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const avatar = review.userId === currentUser?.id ? currentUser.avatar : review.userAvatar;
                  return (
                    <div key={review.id} className="relative bg-black group border-b border-white/10 last:border-b-0">
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={avatar} className="w-9 h-9 rounded-full object-cover" />
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-white tracking-tight">{review.userName}</span>
                            <span className="text-[8px] text-[#48484a] font-bold uppercase mono mt-0.5">{displayTime}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleShareReview(review)} className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
                           {review.userId === currentUser.id && (
                             <button onClick={() => setEditingReview(review)} className="text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/30 px-3 py-1 rounded-lg hover:bg-red-500/10 transition-all">Edit</button>
                           )}
                        </div>
                      </div>
                      <div className="px-6 py-12 flex flex-col items-center space-y-6">
                        <div className="relative w-full max-w-[180px] aspect-[2/3] shadow-premium rounded-2xl overflow-hidden cursor-pointer" onClick={() => {
                          const m = movies.find(movie => movie.id === review.movieId);
                          if (m) setViewingMovie(m);
                        }}>
                          <img src={review.moviePoster} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center space-y-3 w-full max-sm:max-w-sm">
                          <div className="flex items-center justify-center gap-4">
                             <AnimatedScore score={review.finalScore} size={48} />
                             <h3 className="text-xl font-black text-white uppercase tracking-tighter">{review.movieTitle}</h3>
                          </div>
                          <div className="flex justify-center gap-2 pb-2">
                             <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Peak</span>
                                <span className="text-[9px] font-black text-white uppercase tracking-tight">{highlights.peak.label}</span>
                                <span className="text-[9px] font-black text-emerald-400 mono">{highlights.peak.value}%</span>
                             </div>
                             <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-1.5">
                                <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Valley</span>
                                <span className="text-[9px] font-black text-white uppercase tracking-tight">{highlights.valley.label}</span>
                                <span className="text-[9px] font-black text-red-400 mono">{highlights.valley.value}%</span>
                             </div>
                          </div>
                          <p className="text-[#8e8e93] text-[13px] italic opacity-90">"{review.comment}"</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="px-6 py-8 space-y-8 animate-reveal">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-2">Vault</p>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Collection</h2>
              </div>
              <button onClick={() => setIsAddingMovie(true)} className="bg-red-600 p-3 rounded-2xl text-white shadow-glow-red active:scale-90 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
            <div className="relative">
              <input type="text" placeholder="Search collection..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1c1c1e] border border-white/10 rounded-2xl px-12 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all placeholder:text-[#48484a] font-bold" />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#48484a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-12">
              {movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map(movie => (
                <div key={movie.id} onClick={() => setViewingMovie(movie)} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-[2rem] bg-[#1c1c1e] aspect-[2/3] shadow-premium mb-4">
                    <img src={movie.poster} className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-4 premium-blur px-3 py-1.5 rounded-xl border border-white/10">
                       <span className="text-[11px] font-black text-white mono">{movie.globalScore}%</span>
                    </div>
                  </div>
                  <h3 className="text-[14px] font-black text-white truncate uppercase">{movie.title}</h3>
                  <p className="text-[10px] text-[#48484a] font-bold uppercase tracking-widest mt-1">{movie.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="animate-reveal">
            <SquadChat 
              messages={chatMessages} 
              currentUser={currentUser}
              onSendMessage={sendChatMessage} 
              onVote={handlePollVote}
              onOpenMovie={(m) => setViewingMovie(m)}
            />
          </div>
        )}

        {activeTab === 'oscars' && (
          <SquadOscars 
            nominations={oscarNoms} 
            movies={movies}
            onNominate={(nom) => setOscarNoms([...oscarNoms, nom])}
            onVote={handleOscarVote}
          />
        )}

        {activeTab === 'profile' && (
          <div className="px-6 space-y-20 pt-4 pb-24 animate-reveal">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <img src={currentUser.avatar} className="w-32 h-32 rounded-full ring-4 ring-black shadow-glow-red object-cover" />
                <button onClick={updateAvatar} className="absolute bottom-0 right-0 bg-white p-2 rounded-full border-4 border-black text-black shadow-xl hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
              </div>
              <h2 className="mt-8 text-3xl font-black text-white tracking-tighter uppercase">{currentUser.name}</h2>
              <div className="grid grid-cols-3 gap-12 mt-12 w-full text-center">
                <div><p className="text-2xl font-black text-white mono">{userReviews.length}</p><p className="text-[9px] font-black text-[#48484a] uppercase tracking-widest">Reviews</p></div>
                <button onClick={() => setActiveTab('oscars')} className="flex flex-col items-center"><p className="text-2xl font-black text-white mono">🏆</p><p className="text-[9px] font-black text-[#48484a] uppercase tracking-widest">Oscars</p></button>
                <div><p className="text-2xl font-black text-white mono">12</p><p className="text-[9px] font-black text-[#48484a] uppercase tracking-widest">Kudos</p></div>
              </div>
            </div>
            <section className="space-y-10">
              <div className="flex justify-between items-end px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#48484a]">The Trophy Case</h3>
                <span className="text-[10px] font-black text-white bg-red-600 px-3 py-1 rounded-full mono">TOP 5</span>
              </div>
              {trophyCase.length > 0 ? (
                <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar -mx-6 px-6">
                  {trophyCase.map(review => (
                    <div key={review.id} className="w-40 flex-shrink-0 group relative cursor-pointer" onClick={() => setEditingReview(review)}>
                      <div className="antique-gold-frame transition-transform duration-500 group-hover:scale-105 shadow-2xl relative z-10 aspect-[2/3] w-full">
                        <img src={review.moviePoster} className="w-full h-full object-cover rounded-[2px]" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-red-600 text-white px-3 py-1.5 rounded-xl text-[12px] font-black z-20 shadow-xl mono">{review.finalScore}%</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 bg-[#0a0a0a] rounded-[2rem] border border-white/5 text-center px-4">
                  <p className="text-[9px] font-black text-[#48484a] uppercase tracking-[0.3em]">Vault Empty: Rate high-tier cinema to populate</p>
                </div>
              )}
            </section>
            <section className="space-y-10 pb-12">
              <div className="flex justify-between items-end px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#48484a]">The Basement</h3>
                <span className="text-[10px] font-black text-[#48484a] bg-[#0a0a0a] px-3 py-1 rounded-full border border-white/5 mono">BOTTOM 3 (≤65%)</span>
              </div>
              {basement.length > 0 ? (
                <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar -mx-6 px-6">
                  {basement.map(review => (
                    <div key={review.id} className="w-32 flex-shrink-0 group relative opacity-60 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setEditingReview(review)}>
                      <div className="distressed-frame relative z-10 overflow-hidden aspect-[2/3] w-full">
                        <img src={review.moviePoster} className="w-full h-full object-cover rounded-[1px]" />
                        <div className="broken-glass-overlay"></div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-black z-20 shadow-lg mono">{review.finalScore}%</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 bg-[#0a0a0a] rounded-[2rem] border border-white/5 text-center px-4">
                  <p className="text-[9px] font-black text-[#48484a] uppercase tracking-[0.3em]">Clean Slate: No sub-65% records detected</p>
                </div>
              )}
            </section>
            <section className="space-y-10 pb-12">
              <div className="flex justify-between items-end px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#48484a]">The Archive</h3>
                <button onClick={() => setIsArchiveOpen(true)} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">View All {userReviews.length}</button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {userReviews.slice(0, 4).map(review => (
                  <div key={review.id} className="aspect-[2/3] rounded-lg overflow-hidden border border-white/10" onClick={() => setEditingReview(review)}>
                    <img src={review.moviePoster} className="w-full h-full object-cover" />
                  </div>
                ))}
                {userReviews.length > 4 && (
                  <button onClick={() => setIsArchiveOpen(true)} className="aspect-[2/3] rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-all">
                    <span className="text-white font-black">+{userReviews.length - 4}</span>
                    <span className="text-[8px] font-black text-[#48484a] uppercase">More</span>
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'watchlist' && <div className="px-6 py-6 animate-reveal"><GroupWatchlist /></div>}
        {activeTab === 'trivia' && <div className="px-6 animate-reveal"><TriviaChallenge /></div>}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black/95 backdrop-blur-xl border-t border-white/5 h-16 px-6 flex justify-between items-center z-[200]">
        <button onClick={() => setActiveTab('feed')} className={`flex flex-col items-center transition-all ${activeTab === 'feed' ? 'text-white' : 'text-[#48484a]'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></button>
        <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center transition-all ${activeTab === 'chat' ? 'text-white' : 'text-[#48484a]'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></button>
        <button onClick={() => setActiveTab('discover')} className={`flex flex-col items-center transition-all ${activeTab === 'discover' ? 'text-white' : 'text-[#48484a]'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
        <button onClick={() => setActiveTab('trivia')} className={`flex flex-col items-center transition-all ${activeTab === 'trivia' ? 'text-white' : 'text-[#48484a]'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg></button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center transition-all ${activeTab === 'profile' ? 'p-0.5 border-2 border-white rounded-full' : 'p-0.5 border-2 border-transparent'}`}><img src={currentUser.avatar} className="w-6 h-6 rounded-full" /></button>
      </nav>

      {/* Add Movie Modal */}
      {isAddingMovie && (
        <div className="fixed inset-0 h-full z-[150] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 overflow-y-auto">
          <div className="w-full max-sm:max-w-xs space-y-8 py-10">
            <div className="text-center space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Protocol</p>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Add Projection</h2>
            </div>
            <div className="space-y-6">
              <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-[2/3] max-w-[180px] mx-auto bg-[#121212] border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer group hover:border-red-600/40 transition-all overflow-hidden">
                {newMoviePoster ? <img src={newMoviePoster} className="w-full h-full object-cover" /> : <><span className="text-3xl mb-2 group-hover:scale-125 transition-transform">🖼️</span><span className="text-[9px] font-black text-[#48484a] uppercase tracking-widest text-center px-4">Tap to Upload Poster</span></>}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
              <input type="text" placeholder="Enter Movie Title..." value={newMovieTitle} onChange={(e) => setNewMovieTitle(e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded-2xl p-6 text-white text-center text-lg font-black focus:ring-4 focus:ring-red-600/20 outline-none uppercase" />
              <button onClick={handleAddMovie} disabled={isGenerating} className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow-red ${isGenerating ? 'bg-[#1c1c1e] text-[#48484a] animate-pulse' : 'bg-red-600 text-white hover:bg-red-500'}`}>
                {isGenerating ? 'AI Synchronizing...' : 'Initialize Record'}
              </button>
              <button onClick={() => {setIsAddingMovie(false); setNewMoviePoster(null); setNewMovieTitle('');}} className="w-full py-4 text-[#48484a] text-[10px] font-black uppercase tracking-widest">Abort</button>
            </div>
          </div>
        </div>
      )}

      {viewingMovie && (
        <MovieDetail 
          movie={viewingMovie} 
          userReview={viewingUserReview}
          onClose={() => setViewingMovie(null)} 
          onRate={() => { 
            if (viewingUserReview) setEditingReview(viewingUserReview);
            else setSelectedMovie(viewingMovie); 
          }} 
          onUpdateMovie={handleUpdateMovie}
        />
      )}
      {selectedMovie && <ReviewModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} onSubmit={handleReviewSubmit} />}
      {editingReview && <ReviewModal movie={{id: editingReview.movieId, title: editingReview.movieTitle, poster: editingReview.moviePoster, year: 0, genre: [], description: '', globalScore: 0}} initialRating={editingReview.rating} initialComment={editingReview.comment} onClose={() => setEditingReview(null)} onSubmit={handleReviewSubmit} />}

      {/* Full Archive Overlay */}
      {isArchiveOpen && (
        <div className="fixed inset-0 z-[130] bg-black overflow-y-auto pb-24">
          <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-6 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-1">Dossier</p>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Full Archive</h2>
            </div>
            <button onClick={() => setIsArchiveOpen(false)} className="p-3 bg-white/5 rounded-full text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="px-6 py-8 grid grid-cols-2 gap-x-6 gap-y-10">
            {[...userReviews].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(review => (
              <div key={review.id} onClick={() => setEditingReview(review)} className="space-y-3">
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-premium group">
                  <img src={review.moviePoster} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                    <span className="text-[10px] font-black text-white mono">{review.finalScore}%</span>
                  </div>
                </div>
                <h4 className="text-[12px] font-black text-white uppercase truncate">{review.movieTitle}</h4>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
