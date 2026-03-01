
export interface WeightedRating {
  plot: number;      // 20%
  writing: number;   // 20%
  acting: number;    // 20%
  rewatch: number;   // 5%
  visuals: number;   // 15%
  emotion: number;   // 20%
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  rating: WeightedRating;
  comment: string;
  timestamp: string;
  finalScore: number;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  poster: string;
  genre: string[];
  description: string;
  globalScore: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  pin: string;
  role: string;
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: string[] }[]; // array of userIds
  authorId: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text?: string;
  sharedReview?: Review;
  sharedMovie?: Movie;
  poll?: Poll;
  emoji?: string;
  timestamp: string;
  replies?: ChatMessage[];
}

export interface OscarNomination {
  id: string;
  category: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  votes: string[]; // userIds
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  category: 'Plot' | 'Actor' | 'Director' | 'Date';
  movieTitle: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string;
  score: number;
  rank: number;
}
