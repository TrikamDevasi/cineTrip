const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const getImageUri = (path, size = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY || '';
const API_TOKEN = process.env.EXPO_PUBLIC_TMDB_API_TOKEN || '';

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }
  return headers;
};

// Curated high-fidelity fallback dataset for offline/zero-config use
export const FALLBACK_MOVIES = [
  {
    id: 693134,
    title: 'Dune: Part Two',
    original_title: 'Dune: Part Two',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520b2e.jpg',
    vote_average: 8.2,
    vote_count: 5120,
    release_date: '2024-03-01',
    runtime: 166,
    genres: [{ id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }],
    formats: ['IMAX 70mm', 'IMAX Laser', 'Dolby Cinema', '4DX'],
    tagline: 'Long live the fighters.',
    status: 'Now Playing',
    mood: 'epic',
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    original_title: 'Oppenheimer',
    overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II and the subsequent security hearing in 1954.',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    vote_average: 8.1,
    vote_count: 8900,
    release_date: '2023-07-21',
    runtime: 180,
    genres: [{ id: 18, name: 'Drama' }, { id: 36, name: 'History' }],
    formats: ['IMAX 70mm', 'Dolby Cinema'],
    tagline: 'The world forever changes.',
    status: 'Theatrical Legend',
    mood: 'mindbending',
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    original_title: 'Deadpool & Wolverine',
    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.',
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/yDHYTfaA95BTy9qGIft8j90RKu4.jpg',
    vote_average: 7.7,
    vote_count: 4200,
    release_date: '2024-07-26',
    runtime: 128,
    genres: [{ id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }, { id: 878, name: 'Sci-Fi' }],
    formats: ['IMAX 3D', '4DX', 'Dolby Cinema'],
    tagline: 'Come together.',
    status: 'Now Playing',
    mood: 'laughs',
  },
  {
    id: 157336,
    title: 'Interstellar',
    original_title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    vote_average: 8.4,
    vote_count: 34500,
    release_date: '2014-11-05',
    runtime: 169,
    genres: [{ id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }, { id: 878, name: 'Sci-Fi' }],
    formats: ['IMAX 70mm', 'Laser 3D', 'Dolby Atmos'],
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    status: 'IMAX Re-Release',
    mood: 'epic',
  },
  {
    id: 1022789,
    title: 'Inside Out 2',
    original_title: 'Inside Out 2',
    overview: 'Teenager Riley\'s mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust aren\'t sure how to feel when Anxiety shows up.',
    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop_path: '/p5ozvmdgsmbWe0H8umkfOgojh44.jpg',
    vote_average: 7.6,
    vote_count: 4800,
    release_date: '2024-06-14',
    runtime: 96,
    genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }, { id: 35, name: 'Comedy' }],
    formats: ['RealD 3D', 'Dolby Cinema', '4DX'],
    tagline: 'Make room for new emotions.',
    status: 'Now Playing',
    mood: 'cozy',
  },
  {
    id: 558449,
    title: 'Gladiator II',
    original_title: 'Gladiator II',
    overview: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
    poster_path: '/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    backdrop_path: '/euYI6ub299Y5Urxd22MxxBEjh9P.jpg',
    vote_average: 6.8,
    vote_count: 2400,
    release_date: '2024-11-22',
    runtime: 148,
    genres: [{ id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 18, name: 'Drama' }],
    formats: ['IMAX Laser', 'Dolby Cinema', '4DX', 'ScreenX'],
    tagline: 'What we do in life echoes in eternity.',
    status: 'Upcoming / Presale',
    mood: 'epic',
  },
  {
    id: 569094,
    title: 'Spider-Man: Across the Spider-Verse',
    original_title: 'Spider-Man: Across the Spider-Verse',
    overview: 'After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider Society, a team of Spider-People charged with protecting the Multiverse’s very existence.',
    poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdrop_path: '/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    vote_average: 8.3,
    vote_count: 6700,
    release_date: '2023-06-02',
    runtime: 140,
    genres: [{ id: 16, name: 'Animation' }, { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }],
    formats: ['IMAX Laser', 'Dolby Vision', '4DX'],
    tagline: 'It’s how you wear the mask that matters.',
    status: 'Fan Favorite',
    mood: 'mindbending',
  },
  {
    id: 335984,
    title: 'Blade Runner 2049',
    original_title: 'Blade Runner 2049',
    overview: 'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what\'s left of society into chaos.',
    poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdrop_path: '/sAtoMqDVhNDQBc3QJL3RF6hlxGq.jpg',
    vote_average: 8.0,
    vote_count: 13000,
    release_date: '2017-10-06',
    runtime: 164,
    genres: [{ id: 878, name: 'Sci-Fi' }, { id: 18, name: 'Drama' }, { id: 9648, name: 'Mystery' }],
    formats: ['IMAX Laser', 'Dolby Atmos'],
    tagline: 'The key to the future is finally unearthed.',
    status: 'IMAX Masterpiece',
    mood: 'mindbending',
  },
];

export const FALLBACK_GENRES = [
  { id: 28, name: 'Action', icon: 'Zap' },
  { id: 12, name: 'Adventure', icon: 'Compass' },
  { id: 16, name: 'Animation', icon: 'Palette' },
  { id: 35, name: 'Comedy', icon: 'Smile' },
  { id: 18, name: 'Drama', icon: 'Film' },
  { id: 878, name: 'Sci-Fi', icon: 'Sparkles' },
  { id: 53, name: 'Thriller', icon: 'Eye' },
  { id: 27, name: 'Horror', icon: 'Flame' },
  { id: 10749, name: 'Romance', icon: 'Heart' },
];

export const MOODS = [
  { id: 'epic', label: 'Adrenaline & Epic', icon: 'Flame', gradient: ['#FF2E63', '#FFB800'] },
  { id: 'mindbending', label: 'Mind Benders', icon: 'Sparkles', gradient: ['#7928CA', '#00F0FF'] },
  { id: 'laughs', label: 'Pure Laughs', icon: 'Smile', gradient: ['#00F0FF', '#00DFD8'] },
  { id: 'cozy', label: 'Cozy & Chill', icon: 'Coffee', gradient: ['#FFB800', '#FF8E53'] },
  { id: 'date', label: 'Date Night', icon: 'Heart', gradient: ['#FF2E63', '#9B51E0'] },
];


export const CINEMA_CHAINS = [
  { id: 'imax', name: 'IMAX Laser 3D', brand: 'IMAX', tag: 'Ultimate Screen', color: '#0072CE' },
  { id: 'dolby', name: 'Dolby Cinema at AMC', brand: 'Dolby', tag: 'Atmos & Vision', color: '#FF1352' },
  { id: 'pvr', name: 'PVR INOX Director’s Cut', brand: 'PVR', tag: 'Luxury Dining', color: '#FFB800' },
  { id: '4dx', name: '4DX Dynamic Cinema', brand: '4DX', tag: 'Motion & FX', color: '#10B981' },
  { id: 'cinemark', name: 'Cinemark XD', brand: 'Cinemark', tag: 'Custom Sound', color: '#8B5CF6' },
  { id: 'regal', name: 'Regal ScreenX 270°', brand: 'Regal', tag: 'Panoramic View', color: '#00F0FF' },
];

// Service API Methods
export async function getTrendingMovies(page = 1) {
  if (API_KEY || API_TOKEN) {
    try {
      const url = API_KEY
        ? `${TMDB_BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`
        : `${TMDB_BASE_URL}/trending/movie/week?page=${page}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.results || FALLBACK_MOVIES;
      }
    } catch (e) {
      console.warn('TMDB Trending fetch failed, using fallback:', e.message);
    }
  }
  return FALLBACK_MOVIES;
}

export async function getNowPlayingMovies(page = 1) {
  if (API_KEY || API_TOKEN) {
    try {
      const url = API_KEY
        ? `${TMDB_BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`
        : `${TMDB_BASE_URL}/movie/now_playing?page=${page}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.results || FALLBACK_MOVIES;
      }
    } catch (e) {
      console.warn('TMDB Now Playing fetch failed, using fallback:', e.message);
    }
  }
  return FALLBACK_MOVIES.filter(m => m.status === 'Now Playing' || m.status.includes('IMAX'));
}

export async function getUpcomingMovies(page = 1) {
  if (API_KEY || API_TOKEN) {
    try {
      const url = API_KEY
        ? `${TMDB_BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=${page}`
        : `${TMDB_BASE_URL}/movie/upcoming?page=${page}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.results || FALLBACK_MOVIES;
      }
    } catch (e) {
      console.warn('TMDB Upcoming fetch failed, using fallback:', e.message);
    }
  }
  return FALLBACK_MOVIES;
}

export async function searchMovies(query) {
  if (!query || !query.trim()) return [];
  if (API_KEY || API_TOKEN) {
    try {
      const url = API_KEY
        ? `${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
        : `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return data.results || [];
      }
    } catch (e) {
      console.warn('TMDB search failed, fallback search:', e.message);
    }
  }
  const q = query.toLowerCase();
  return FALLBACK_MOVIES.filter(m => 
    m.title.toLowerCase().includes(q) || 
    (m.overview && m.overview.toLowerCase().includes(q))
  );
}

export async function getMovieDetails(id) {
  if (API_KEY || API_TOKEN) {
    try {
      const url = API_KEY
        ? `${TMDB_BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos,similar`
        : `${TMDB_BASE_URL}/movie/${id}?append_to_response=credits,videos,similar`;
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('TMDB Movie Details failed:', e.message);
    }
  }
  const fallback = FALLBACK_MOVIES.find(m => m.id === Number(id)) || FALLBACK_MOVIES[0];
  return {
    ...fallback,
    credits: {
      cast: [
        { id: 1, name: 'Timothée Chalamet', character: 'Paul Atreides', profile_path: '/BE2sdjpgsa2rNTFa66f7ikNVNZ.jpg' },
        { id: 2, name: 'Zendaya', character: 'Chani', profile_path: '/tyl20sE6qPzM0y6lWk6mN5V0xP1.jpg' },
        { id: 3, name: 'Rebecca Ferguson', character: 'Lady Jessica', profile_path: '/4qQnEvpL9HffN28x7hR8XpL2k0D.jpg' },
        { id: 4, name: 'Austin Butler', character: 'Feyd-Rautha', profile_path: '/b44e0078028f0807b5ec1e66c6b3e.jpg' },
        { id: 5, name: 'Javier Bardem', character: 'Stilgar', profile_path: '/3YpAeVrC4aDsm2j8uI3R3J2p7R8.jpg' },
      ],
    },
    similar: {
      results: FALLBACK_MOVIES.filter(m => m.id !== Number(id)).slice(0, 4),
    },
  };
}
