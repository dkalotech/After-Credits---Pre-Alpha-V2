
export const RATING_WEIGHTS = {
  plot: 0.20,
  writing: 0.20,
  acting: 0.20,
  rewatch: 0.05,
  visuals: 0.15,
  emotion: 0.20
};

export const SQUAD_USERS = [
  { id: 'u_dpak', name: 'Dpak', pin: '6117', avatar: 'https://picsum.photos/seed/dpak/200/200', role: 'The Architect' },
  { id: 'u_chuy', name: 'Chuy', pin: '0708', avatar: 'https://picsum.photos/seed/chuy/200/200', role: 'The Vanguard' },
  { id: 'u_marbo', name: 'Marbo', pin: '0624', avatar: 'https://picsum.photos/seed/marbo/200/200', role: 'The Specialist' },
  { id: 'u_mono', name: 'Mono', pin: '1028', avatar: 'https://picsum.photos/seed/mono/200/200', role: 'The Enforcer' }
];

export const MOCK_FRIENDS = SQUAD_USERS;

export const MOCK_BADGES = [
  { id: 'b1', name: 'Genre Guru', icon: '🎬', color: 'bg-emerald-500/20', textColor: 'text-emerald-400', description: 'Reviewed 50+ Sci-Fi films' },
  { id: 'b2', name: 'Early Adopter', icon: '🚀', color: 'bg-blue-500/20', textColor: 'text-blue-400', description: 'Joined during the Alpha' },
  { id: 'b3', name: 'Review King', icon: '👑', color: 'bg-rose-500/20', textColor: 'text-rose-500', description: 'Top 1% Reviewer this month' },
  { id: 'b4', name: 'Night Owl', icon: '🦉', color: 'bg-purple-500/20', textColor: 'text-purple-400', description: 'Most active after midnight' },
];

export const INITIAL_MOVIES = [
  {
    id: 'm1',
    title: 'Inception',
    year: 2010,
    poster: 'https://picsum.photos/seed/inception-poster/400/600',
    genre: ['Sci-Fi', 'Action'],
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
    globalScore: 88
  },
  {
    id: 'm2',
    title: 'Parasite',
    year: 2019,
    poster: 'https://picsum.photos/seed/parasite-poster/400/600',
    genre: ['Thriller', 'Drama'],
    description: 'Greed and class discrimination threaten a symbiotic relationship.',
    globalScore: 92
  }
];

export const MOCK_MOVIES = INITIAL_MOVIES; // For backward compatibility in components

export const FOLLOWED_USER_IDS = ['u_dpak', 'u_chuy', 'u_marbo', 'u_mono'];
