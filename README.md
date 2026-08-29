# 🎬 CineTrip — The Ultimate Theatrical Companion & Cinephile Platform

<p align="center">
  <img src="./assets/images/icon.png" width="120" height="120" alt="CineTrip Logo" style="border-radius: 24px;" />
</p>

<p align="center">
  <b>Plan premium cinema trips, capture theater memories, discover films in certified IMAX/Dolby formats, and coordinate with your movie squad.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2054-000000?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 54" />
  <img src="https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Zustand-State%20Cache-4338CA?style=for-the-badge" alt="Zustand" />
  <img src="https://img.shields.io/badge/Google%20OAuth-PKCE%20Enabled-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google OAuth" />
  <img src="https://img.shields.io/badge/JWT%20%2B%20SecureStore-Protected-00F0FF?style=for-the-badge" alt="Security" />
</p>

---

## 🌟 Overview

**CineTrip** is a full-stack, cross-platform mobile and web application engineered specifically for cinephiles, premium theater-goers (IMAX 70mm, Laser, Dolby Cinema, 4DX, ScreenX), and movie night squads.

Instead of fragmented group chat screenshots, forgotten seat numbers, and lost movie memories, CineTrip organizes the entire cinema lifecycle into a focused, frictionless loop:

```
Discover (IMAX/Dolby) ──► Plan & Seats ──► Digital Pass ──► Share with Squad ──► Attend (Offline QR) ──► Journal Memory
```

---

## 📱 Cross-Platform Matrix

| Platform | Status | Native & Web Capabilities |
|---|---|---|
| **Web / Desktop (PC & Mac)** | 🟢 Full Support | Responsive desktop/mobile viewport, Google OAuth popup/redirect, offline caching, interactive seat selection |
| **Android (Emulator & Expo Go)** | 🟢 Full Support | Native Camera/Video, GPS geocoding, Device Contacts, Hardware Keystore (SecureStore), Deep Linking |
| **iOS (Simulator & Expo Go)** | 🟢 Full Support | Native Camera/Mic, Location Services, Address Book, Hardware Keychain, Native Share Sheet |

---

## 🚀 Key Features

### 🔐 1. Authentication & Security
- **Hybrid Auth Ecosystem**: Traditional email/password registration with bcryptjs password hashing alongside Google OAuth (via Supabase PKCE flow).
- **OAuth Callback Router (`/auth/callback`)**: Dedicated deep-link and web redirect handler preventing loading loops and ensuring seamless session synchronization.
- **Hardware-Backed Credential Storage**: Uses `expo-secure-store` on mobile (Android Keystore / iOS Keychain) and localized browser storage on Web.
- **Protected Navigation Guards**: Expo Router automatically manages routing between `/(auth)` and `/(tabs)` groups based on authenticated session state.
- **Offline / Guest Mode**: Instant exploration of movies, auditoriums, and seat maps without mandatory sign-in.

### 🎥 2. Theatrical Discovery & TMDB Integration
- **Live Theatrical Feeds**: Trending, In Theaters (Now Playing), and Upcoming Releases fetched via TMDB API with zero-config offline fallback datasets.
- **Format Intelligence**: Dedicated filtering for **IMAX 70mm & Laser**, **Dolby Cinema**, **4DX Dynamic Motion**, and **RealD 3D**.
- **Infinite Scroll Pagination**: Smooth infinite pagination on Discover using TMDB pages with debounced search queries and skeleton loaders.
- **Curated Mood Selector**: Discover films based on experience vibe (Adrenaline & Epic, Mind Benders, Pure Laughs, Cozy & Chill, Date Night).

### 🎟️ 3. Movie Night Planner & Digital Passes
- **Interactive Trip Builder**: Pick movie, cinema auditorium, date, and showtime slot (Morning Matinee, Afternoon Show, Prime Evening, Late Night Owl).
- **Interactive Seat Map**: Graphical seat layout with center-prime, recliner, and VIP tier selection.
- **Squad Tagging**: Direct integration with device address book via `expo-contacts` with RSVP tracking (`invited`, `accepted`, `declined`).
- **Snack Selector**: Customize concessions (Caramel Popcorn, Nachos, Cold Brew, ICEE).
- **Digital Pass & QR Visualizer**: Generates structured, cryptographically formatted passes with unique booking references, 1-tap clipboard copying, and share sheet dispatch.

### 👥 4. Human-Readable Squad Sharing
When you tap **"Share Pass with Squad"**, CineTrip formats all logistics into a clean text invitation ready for WhatsApp, iMessage, or SMS:

```text
🎬 Movie Night

Movie: Dune: Part Two
Cinema: PVR INOX IMAX with Laser
Format: IMAX Laser 3D
Date: 2026-08-29
Time: 07:30 PM
Seats: Row F (Center Prime)

🎟 Pass: CT-48291

See you there!
```

*Recipients get all essential details immediately even if they do not have CineTrip installed.*

### 📸 5. Cinephile Journal & Theatrical Viewfinder
- **Theatrical Camera**: Custom camera viewfinder with flip (front/back), multi-mode flash (`off`, `on`, `auto`), and live capture controls.
- **Video Recording**: High-definition video memories with real-time timers and instant preview/retake workflow.
- **Media Gallery Picker**: Import existing photos and videos directly from device albums via `expo-image-picker`.
- **1-Tap Direct Pass Pre-Fill**: Tapping "Log Screening Memory" on any pass pre-fills the movie title, cinema name, and screen format automatically.
- **Cloud & Local Storage**: Dual-tier media handling with optional Cloudinary upload integration and automatic local URI fallback.

### 📊 6. Theatrical Passport & Personal Milestones
The profile hub automatically tracks and calculates your lifetime theater milestones:
- **IMAX Screenings count**
- **Dolby Cinema Experiences count**
- **Total Unique Theaters Visited**
- **Personal Average Movie Rating**

### 📍 7. Cinema Locator & Geo Map
- **Location Engine**: Real-time GPS location via `expo-location` with memory-leak-safe subscriptions.
- **Haversine Distance Calculator**: Accurate distance computation from the user's current GPS coordinates to regional certified cinemas.
- **1-Tap Plan Here**: Tap any cinema on the map to pre-fill the theater directly into the trip planner.

---

## 🏗️ Technical Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   React Native / Expo Client (v54)                     │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │    Expo Router (v6)     │  │   UI Design System & Lucide Icons   │  │
│  │ (auth) / (tabs) / Modals│  │  Components, Skeletons, Theme Tokens│  │
│  └────────────┬────────────┘  └──────────────────┬──────────────────┘  │
│               │                                  │                     │
│               ▼                                  ▼                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │          Zustand Persistent Stores (AsyncStorage)                │  │
│  │ useAuthStore | usePlannerStore | useMemoryStore | useWatchlist   │  │
│  └────────────────────────────┬─────────────────────────────────────┘  │
└───────────────────────────────┼────────────────────────────────────────┘
                                │  REST API (JWT Bearer / JSON)
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Node.js + Express Backend Server                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Security Layer: Helmet + Dynamic CORS + Rate Limiting            │  │
│  └────────────────────────────┬─────────────────────────────────────┘  │
│  ┌────────────────────────────┴─────────────────────────────────────┐  │
│  │ Auth: JWT Middleware + Multi-Token Google OAuth Controller       │  │
│  │ Validators: Zod Request Schemas                                  │  │
│  │ Controllers: Auth, Memories, Planner, Watchlist, Profile         │  │
│  └────────────────────────────┬─────────────────────────────────────┘  │
│                               ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Mongoose ODM / MongoDB (User, Memory, Plan, Watchlist Schemas)   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
cineTrip/
├── app/                        # Expo Router file-based routes
│   ├── (auth)/                 # Authentication screens
│   │   ├── _layout.js          # Auth stack navigator
│   │   ├── login.js            # Sign In with email/password & Google OAuth
│   │   └── register.js         # Account registration screen
│   ├── (tabs)/                 # Main 6-tab navigation group
│   │   ├── _layout.js          # Tab bar styling & vector icons
│   │   ├── index.js            # Home screen (Hero Carousel, Trending, Cinemas)
│   │   ├── discover.js         # Movie discovery, mood selector & filters
│   │   ├── planner.js          # Movie night builder, seat selection & tickets
│   │   ├── watchlist.js        # Bookmarked films with search and quick actions
│   │   ├── memories.js         # Cinephile journal feed & milestone statistics
│   │   └── profile.js          # User preferences, formats, theme & session
│   ├── auth/
│   │   └── callback.js         # PKCE OAuth redirection handler
│   ├── movie/[id].js           # Dynamic movie details, cast, similar films
│   ├── ticket/[id].js          # Verifiable digital ticket & QR code pass
│   ├── memory/create.js        # Theatrical camera, video recording & logger
│   ├── map.js                  # Cinema locator map & auditorium directory
│   ├── contacts.js             # Native contacts manager & squad invite hub
│   └── _layout.js              # Root layout, theme provider & auth router
│
├── backend/                    # Node.js + Express + MongoDB backend
│   ├── src/
│   │   ├── config/database.js  # Mongoose database connection
│   │   ├── controllers/        # REST controllers (Auth, Memories, Planner, etc.)
│   │   ├── middleware/         # JWT verification & centralized error handler
│   │   ├── models/             # Mongoose schemas (User, Memory, Plan, Watchlist)
│   │   ├── routes/             # Express API endpoint definitions (/api/*)
│   │   ├── validators/         # Zod input validation schemas
│   │   ├── app.js              # Express app setup, CORS, Helmet, rate-limiting
│   │   └── server.js           # Server startup script
│   ├── .env.example            # Backend environment template
│   └── package.json            # Backend dependencies
│
├── components/                 # Reusable UI component library
│   ├── ui/                     # Atomic primitives (Button, Chip, Rating, Skeleton, QR)
│   ├── FormatBadge.js          # Format tags (IMAX, Dolby, 4DX, ScreenX)
│   ├── Header.js               # Main app header with search & profile buttons
│   ├── HeroBanner.js           # Marquee featured banner with trailers
│   ├── MemoryCard.js           # Theatrical memory card with media carousel
│   ├── MoodSelector.js         # Experience mood selector pills
│   ├── MovieCard.js            # Movie poster card (grid & horizontal)
│   ├── SectionHeader.js        # Section titles with action triggers
│   └── TicketCard.js           # Perforated ticket card component
│
├── constants/
│   └── theme.js                # Theme tokens: COLORS, TYPOGRAPHY, SPACING, RADIUS
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.js              # Authentication actions & store synchronization
│   ├── useCamera.js            # Camera viewfinder, flip, flash & video recording
│   ├── useLocation.js          # Geolocation tracking & address resolution
│   ├── useContacts.js          # Device contacts extraction & search
│   ├── useDebounce.js          # Search input debouncer
│   └── useTheme.js             # Theme mode observer
│
├── services/
│   ├── api.js                  # Dynamic host detection & fetch wrapper
│   ├── auth.js                 # Secure token storage (Keychain/Keystore/Web)
│   ├── googleAuth.js           # Supabase Google OAuth PKCE flow & exchange
│   ├── tmdb.js                 # TMDB API client with offline movie catalog
│   ├── location.js             # Expo Location & Haversine distance calculator
│   ├── contacts.js             # Native address book & squad presets
│   ├── cinema/                 # CinemaProvider interface & MockCinemaProvider
│   └── media/mediaUploader.js  # Cloudinary uploader with local URI fallback
│
├── store/                      # Zustand state stores
│   ├── useAuthStore.js         # User session, JWT tokens & guest state
│   ├── usePlannerStore.js      # Booking drafts, upcoming plans & cloud sync
│   ├── useMemoryStore.js       # Journal memories, media URLs & pagination
│   ├── useWatchlistStore.js    # Saved movies & optimistic toggling
│   └── usePreferencesStore.js  # User identity, format preferences & themes
│
├── app.json                    # Expo application configuration & native plugins
├── babel.config.js             # Babel preset configuration & import.meta polyfills
├── metro.config.js             # Metro bundler resolver with Web CJS fallbacks
└── package.json                # Project dependencies & scripts
```

---

## 🛠️ Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **yarn**
- **Expo Go** (Android/iOS) or modern web browser (Chrome, Safari, Edge)
- **MongoDB**: Local instance (`mongodb://localhost:27017`) or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

---

### 1. Installation

```bash
# 1. Clone repository
git clone https://github.com/TrikamDevasi/cineTrip.git
cd cineTrip

# 2. Install client dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install
cd ..
```

---

### 2. Configure Environment Variables

Create `.env` in the project root:
```env
# API Base URL (leave as default for automatic detection)
EXPO_PUBLIC_API_URL=http://localhost:5000

# TMDB Configuration (Required for verified "Now in Theaters" listings)
EXPO_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
EXPO_PUBLIC_TMDB_API_TOKEN=your_tmdb_bearer_token

# ----- Data Authenticity Flags ------------------------------------------
# DEMO_MODE gates ALL sample/simulated data (fallback catalog, sample
# theatres, simulated showtimes & seat maps). Keep false in production —
# the app then only presents data it can verify from a real source.
EXPO_PUBLIC_DEMO_MODE=false

# Cinema / showtime provider: 'none' (default) | 'mock' (demo only)
EXPO_PUBLIC_CINEMA_PROVIDER=none

# Supabase Authentication (For Google OAuth PKCE)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth Web Client ID
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_web_client_id.apps.googleusercontent.com

# Cloudinary (Optional - local storage fallback included)
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_PRESET=your_unsigned_preset
```

Create `backend/.env` in the `backend/` folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cinetrip
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id
CLIENT_URL=http://localhost:8081
```

---

### 3. Run the Application

#### Start Backend:
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

#### Start Expo Client:
```bash
# In the root directory:
npx expo start -c
```

- Press **`w`** for **Web browser preview** (`http://localhost:8081`)
- Press **`a`** for **Android emulator**
- Press **`i`** for **iOS simulator**
- Scan QR code with **Expo Go** app on your physical mobile device

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register new account with email/password | No |
| `POST` | `/api/auth/login` | Authenticate with email/password | No |
| `POST` | `/api/auth/google` | Exchange Supabase/Google OAuth token for JWT | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | **Yes** |
| `GET` | `/api/memories` | List journal memories with pagination (`?page=1&limit=20`) | **Yes** |
| `POST` | `/api/memories` | Create a new theatrical journal memory | **Yes** |
| `PUT` | `/api/memories/:id` | Update an existing journal entry | **Yes** |
| `DELETE`| `/api/memories/:id` | Delete a journal entry | **Yes** |
| `GET` | `/api/plans` | Fetch scheduled movie plans & passes | **Yes** |
| `POST` | `/api/plans` | Lock in a new movie trip | **Yes** |
| `PUT` | `/api/plans/:id` | Update plan status (`upcoming`, `completed`, `cancelled`) | **Yes** |
| `DELETE`| `/api/plans/:id` | Delete a scheduled movie trip | **Yes** |
| `GET` | `/api/watchlist` | Get user's saved watchlist items | **Yes** |
| `POST` | `/api/watchlist` | Save film to personal watchlist | **Yes** |
| `DELETE`| `/api/watchlist/:movieId` | Remove film from watchlist | **Yes** |
| `GET` | `/api/profile` | Fetch cinema format preferences & settings | **Yes** |
| `PUT` | `/api/profile` | Update profile, preferred chains & favorite genres | **Yes** |
| `GET` | `/health` | Server uptime and health status check | No |

---

## 💡 Troubleshooting & FAQ

#### 1. "Cannot use 'import.meta' outside a module" on Web
* **Fix**: Ensure `babel.config.js` is present and `metro.config.js` includes the CJS resolution mapping for `zustand`. Run `npx expo start -c` to clear Metro's transform cache.

#### 2. Physical Device cannot connect to Backend
* **Fix**: Ensure both your PC and mobile device are connected to the same Wi-Fi network. Make sure Windows Firewall allows inbound connections on port `5000`.

#### 3. Google Sign-In Redirects
* **Fix**: In your Supabase Dashboard under **Authentication > URL Configuration**, add `http://localhost:8081/auth/callback` (Web) and `cinetrip://auth/callback` (Mobile) to the Redirect URLs list.

---

## 📄 License

This project is licensed under the **MIT License**.

<p align="center">
  Crafted for cinema lovers, 70mm enthusiasts, and opening-night squads. 🍿🎬
</p>
