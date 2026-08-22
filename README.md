# 🎬 cineTrip
### Commercial-Grade Movie & TV Series Companion Platform

**cineTrip** is a flagship, production-ready movie and TV series companion platform built with **Next.js 14 (App Router)**, **MongoDB**, and multi-provider **AI Intelligence (Groq, Gemini, OpenAI)**. Designed to compete with IMDb, Letterboxd, and Netflix, it features cinematic glassmorphism UI, real-time AI film breakdowns, interactive side-by-side comparisons, streaming availability widgets, community reviews, and an administrative telemetry dashboard.

---

## 🌟 Key Highlights & Features

- 🤖 **Multi-Provider AI Intelligence**: Dynamic completion switching supporting **Groq (Llama 3.3)**, **Google Gemini 1.5 Flash**, and **OpenAI (GPT-4o)** via environment variables.
- 🎯 **AI "What Should I Watch?" Wizard**: Interactive prompt modal matching user moods, time limits, and genre preferences.
- 🧠 **AI Film Breakdowns**: Real-time AI explanation of movie endings, thematic deeper meaning, character archetype studies, and narrative arc analysis.
- ⚖️ **Side-by-Side Movie Comparison**: Compare two films side-by-side on plot, box office, ratings, and AI thematic contrast.
- 📺 **Watch Providers & Region Switcher**: Live streaming availability (Netflix, Prime Video, Disney+, Apple TV) with global region toggling.
- 📊 **Financial & Box Office Analytics**: Visual budget vs. revenue bar charts, ROI percentage indicators, and net profit margins.
- 🔄 **Infinite Trending Feed**: Continuous movie discovery powered by `IntersectionObserver`.
- 🛡️ **Admin & System Operations Dashboard**: Real-time analytics dashboard monitoring registered users, watchlist additions, top search terms, AI token usage, and system events.
- 💬 **Community Reviews & Ratings**: User rating form with star ratings, spoiler tags, and review feeds backed by MongoDB.
- 🌗 **Dark & Light Mode**: Curated HSL color palette, glassmorphism blur headers, micro-animations, and fluid responsive design.
- 🔒 **Security & Middleware**: Rate limiting on API routes, XSS sanitization, anti-clickjacking HTTP security headers, and safe iframe embeds.
- 🚀 **SEO Optimization**: Next.js Metadata API, Open Graph, Twitter Cards, JSON-LD structured data (Movie, TVSeries, Person, and WebSite schema), `sitemap.xml`, and `robots.txt`.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router, Server Components, Streaming, Route Handlers)
- **Language**: JavaScript (ES2023) / Node.js
- **Database**: MongoDB with Mongoose connection caching
- **AI Providers**: Groq SDK (`openai`), `@google/generative-ai`, `openai`
- **Styling**: Vanilla CSS tokens, Glassmorphism, Tailwind CSS utilities
- **Animations**: Framer Motion & Lucide React Icons
- **State Management**: Zustand
- **Media & External APIs**: TMDB API v3/v4, OMDB API, Trakt.tv API

---

## 📁 Repository Structure

```
cinephiles-watch/
├── app/
│   ├── admin/             # Admin & Operations Dashboard
│   ├── api/
│   │   ├── ai/            # AI Endpoints (character, compare, explain, mood, recommend, what-to-watch)
│   │   ├── admin/         # Telemetry & Admin API
│   │   ├── reviews/       # Community Reviews API
│   │   ├── tmdb/          # Centralized TMDB proxy routes
│   │   └── trakt/         # Trakt API routes
│   ├── movie/[id]/        # Movie detail page with AI tabs & Financial charts
│   ├── person/[id]/       # Cast & Director biography & filmography
│   ├── search/            # Infinite search suite with genre pills & sorting
│   ├── series/            # TV Series hub & season browser
│   ├── watchlist/         # User saved watchlist with grid/list view
│   ├── globals.css        # Global CSS design tokens & glassmorphism utilities
│   ├── layout.jsx         # Root layout with Navbar & Footer
│   ├── loading.jsx        # Global skeleton loader
│   ├── not-found.jsx      # Cinematic 404 interactive page
│   └── page.jsx           # Home Page with Hero Carousel & Infinite Feed
├── components/
│   ├── AIWhatToWatchModal.jsx
│   ├── MovieComparisonModal.jsx
│   ├── WatchProvidersPanel.jsx
│   ├── FinancialChart.jsx
│   ├── ReviewsSection.jsx
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── MovieCard.jsx
│   ├── MovieDetails.jsx
│   └── InfiniteTrending.jsx
├── lib/
│   ├── ai-provider.js    # Provider abstraction (Groq, Gemini, OpenAI)
│   ├── auth.js           # Session & Admin authorization helper
│   ├── mongodb.js        # Mongoose database connection caching
│   ├── tmdb.js           # Centralized TMDB API client with retry logic
│   └── validators.js     # Input sanitization & security helpers
├── models/
│   ├── User.js           # User schema
│   ├── Watchlist.js      # Watchlist schema
│   ├── Review.js         # Community review schema
│   ├── History.js        # Watch history schema
│   └── Series.js         # Series schema
└── public/               # Static assets & icons
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the project root:

```env
# TMDB Keys
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_API_TOKEN=your_tmdb_bearer_token_here

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/cinephiles

# AI Provider Configuration
LLM_PROVIDER=groq

# Groq Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o

# Admin Security
ADMIN_SECRET_KEY=admin-token-secret
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/TrikamDevasi/cinephiles-watch-react.js-.git
cd cinephiles-watch-react.js-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📜 License

Distributed under the **MIT License**.

---

## 👨‍💻 Author

**Trikam Devasi**  
GitHub: [https://github.com/TrikamDevasi](https://github.com/TrikamDevasi)
