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
  <img src="https://img.shields.io/badge/JWT%20%2B%20SecureStore-Protected-00F0FF?style=for-the-badge" alt="Security" />
</p>

---

## 🌟 Overview

**CineTrip** is a full-stack, mobile-first theatrical planning and journaling ecosystem built specifically for film enthusiasts and premium theater-goers (IMAX 70mm, Laser, Dolby Cinema, 4DX, ScreenX).

Whether you're coordinating opening night with your squad, choosing prime seats, generating digital wallet tickets, or capturing live photos and video memories from the theater lobby, CineTrip seamlessly connects your local device with a dedicated cloud backend while retaining offline functionality.

---

## 🚀 Key Features

### 🔐 1. Authentication & Security
- **JWT Authentication**: Full registration and login system with bcryptjs password hashing.
- **Secure Credential Storage**: Uses `expo-secure-store` to keep tokens in the hardware keychain/keystore (no plaintext `AsyncStorage` for secrets).
- **Protected Routing**: Navigation guards powered by Expo Router automatically route unauthenticated users to `/login` and authenticated users to main tabs.
- **Offline / Guest Mode**: Allows immediate exploratory access with persistent local caching.

### 🎥 2. Theatrical Discovery & TMDB Integration
- **Live Theatrical Feeds**: Trending, In Theatres (Now Playing), and Anticipated Releases fetched via TMDB with rich local fallbacks.
- **Format Intelligence**: Filters for **IMAX 70mm & Laser**, **Dolby Cinema**, **4DX Immersive**, and **RealD 3D**.
- **Infinite Scroll Pagination**: Smooth infinite pagination on Discover using TMDB pages with debounced search queries.
- **Curated Mood Selector**: Find films by vibe (Adrenaline, Mind-Bending, Visual Spectacle, Heartwarming).

### 🎟️ 3. Movie Night Planner & Digital Passes
- **Interactive Trip Builder**: Pick movie, theater format, date, and time slot (Morning Matinee, Afternoon Show, Prime Evening, Late Night Owl).
- **Squad Tagging**: Add companions directly from device contacts or custom entries with invitation tracking (`invited`, `accepted`, `declined`).
- **Snack Selector**: Customize theater refreshments (Caramel Popcorn, Nachos, Cold Brew, ICEE).
- **Digital Pass & QR Scanner**: Real-time pass generator with unique booking references, barcode/QR visualizer, and squad share sheet.

### 📸 4. Cinephile Journal & Advanced Camera
- **Theatrical Snapshot Camera**: Custom camera viewfinder with flip (front/back), flash modes (`off`, `on`, `auto`), and zoom stepping (`1x` to `5x`).
- **Video Recording**: Record video memories with real-time timers and instant preview/retake.
- **Gallery Media Picker**: Pick existing images and videos from your photo library via `expo-image-picker`.
- **Experience Logging**: Rate theaters, write auditorium crowd notes, capture best moments, and tag companions.
- **Journal Pagination**: Seamless pull-to-refresh and "Load Older Memories" backend pagination.

### 📍 5. Cinema Locator & Interactive Map
- **Live Location Tracking**: Accurate positioning via `expo-location` with memory-leak-free subscription management.
- **Interactive Maps**: Cinema pins, user marker, and "My Location" quick FAB with fallback support.
- **Nearby Screens**: Displays real distances to nearby certified IMAX Laser, Dolby Atmos, and VIP auditoriums.

### 👥 6. Squad & Contacts Hub
- **Device Address Book**: Fast contact access with permissions management, instant search, and filtering.
- **Direct Link to Planner**: One-tap addition of selected contacts into the active movie trip.
- **Direct Calling & Native Contacts**: Direct dialer and native address book integration.

### 🎨 7. Premium Dark/Light Design System
- **Theatrical Aesthetics**: Deep cinematic blacks (`#07090E`), Neon Cyan (`#00F0FF`), Cinema Gold (`#FFB800`), and IMAX Violet (`#8B5CF6`).
- **Theme Awareness**: Built-in support for Dark, Light, and System preference with typography tokens.

---

## 🏗️ Architecture & Data Flow

```
React Native / Expo App (UI)
        │
        ▼
Zustand State Layer (useAuth, usePlanner, useMemory, useWatchlist, usePreferences)
        │
        ▼
Centralized API Client (services/api.js + expo-secure-store JWT)
        │
        ▼  [REST API / JSON]
Node.js + Express Server (backend/src/app.js)
        │
        ├── Helmet Security + CORS + Rate Limiting
        ├── JWT Auth Middleware (authenticateToken)
        ├── Zod Request Validation
        └── REST Controllers (Auth, Memories, Planner, Watchlist, Profile)
        │
        ▼
Mongoose ODM / MongoDB (User, Memory, Plan, Watchlist)
```

---

## 📁 Repository Structure

```
cineTrip/
├── app/                        # Expo Router file-based routes
│   ├── (auth)/                 # Authentication screens
│   │   ├── _layout.js          # Auth stack navigator
│   │   ├── login.js            # Sign In with validation & guest mode
│   │   └── register.js         # Account creation & password validation
│   ├── (tabs)/                 # Main bottom-tab navigation
│   │   ├── _layout.js          # Tab bar layout & icons
│   │   ├── index.js            # Home screen (Hero, Trending, Cinemas)
│   │   ├── discover.js         # Search, formats, genres, infinite scroll
│   │   ├── planner.js          # Trip Builder & Active Tickets
│   │   ├── watchlist.js        # Saved films with filters & quick plan
│   │   ├── memories.js         # Journal feed & milestone stats
│   │   └── profile.js          # User identity, formats, settings, logout
│   ├── movie/[id].js           # Movie details, backdrop, cast & formats
│   ├── ticket/[id].js          # Digital pass, QR code & share sheet
│   ├── memory/create.js        # Advanced camera, video, gallery & logging
│   ├── map.js                  # Cinema locator & interactive map
│   ├── contacts.js             # Dedicated squad & device contacts screen
│   └── _layout.js              # Protected root layout & auth guard
│
├── backend/                    # Node.js + Express + MongoDB backend
│   ├── src/
│   │   ├── config/database.js  # Mongoose connection
│   │   ├── controllers/        # Auth, Memories, Planner, Watchlist, Profile
│   │   ├── middleware/         # JWT auth & centralized error handler
│   │   ├── models/             # User, Memory, Plan, Watchlist Mongoose schemas
│   │   ├── routes/             # Express API routes (/api/*)
│   │   ├── validators/         # Zod input validation schemas
│   │   ├── app.js              # Express app setup, CORS, Helmet, rate-limits
│   │   └── server.js           # Server startup script
│   ├── .env.example            # Backend environment template
│   └── package.json            # Backend dependencies
│
├── components/                 # Reusable UI components
│   ├── FormatBadge.js          # IMAX, Dolby, 4DX, Laser format pills
│   ├── Header.js               # Top app bar with search & profile triggers
│   ├── HeroBanner.js           # Featured marquee poster with trailers
│   ├── MemoryCard.js           # Theatrical memory card with photos/videos
│   ├── MoodSelector.js         # Mood pills for tailored recommendations
│   ├── MovieCard.js            # Poster card (horizontal & grid layouts)
│   ├── SectionHeader.js        # Screen section headers with action buttons
│   └── TicketCard.js           # Theatrical ticket mockup with perforation
│
├── constants/
│   └── theme.js                # Colors, Typography, Spacing, Radius, Shadows
│
├── hooks/                      # Custom reusable React hooks
│   ├── useAuth.js              # Login, register, logout & store sync
│   ├── useCamera.js            # Photo, video recording, zoom, flip & flash
│   ├── useLocation.js          # Location tracking with subscription cleanup
│   ├── useContacts.js          # Device contacts fetch, search & permissions
│   ├── useMediaPicker.js       # Gallery image/video picker
│   ├── useDebounce.js          # Search debounce hook
│   ├── useApi.js               # Generic API state executor
│   └── useTheme.js             # Theme mode listener
│
├── services/
│   ├── api.js                  # Centralized fetch wrapper with JWT injection
│   ├── auth.js                 # SecureStore token storage (Keychain/Keystore)
│   ├── tmdb.js                 # TMDB API + rich offline fallback dataset
│   ├── location.js             # Expo location & reverse geocoding
│   └── contacts.js             # Expo contacts & native address book
│
├── store/                      # Zustand state stores
│   ├── useAuthStore.js         # User state & token management
│   ├── usePreferencesStore.js  # User profile & format preferences
│   ├── useMemoryStore.js       # Journal memories + backend sync + pagination
│   ├── usePlannerStore.js      # Trip draft & plans + backend sync
│   └── useWatchlistStore.js    # Watchlist + backend sync
│
├── app.json                    # Expo config (permissions for camera/mic/geo)
├── package.json                # Frontend dependencies (Expo 54, React Native 0.81)
└── README.md                   # Project documentation
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **yarn**
- **Expo Go** app on your phone or iOS Simulator / Android Emulator
- **MongoDB**: Local instance (`mongodb://localhost:27017`) or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

---

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/TrikamDevasi/cineTrip.git
cd cineTrip

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

---

### 2. Configure Environment Variables

#### Frontend `.env` (in project root):
```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
EXPO_PUBLIC_TMDB_API_TOKEN=your_tmdb_read_access_token_here
```
> *Note: If `EXPO_PUBLIC_TMDB_API_KEY` is omitted, CineTrip will seamlessly use its built-in offline movie database.*

#### Backend `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cinetrip
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:8081
```

---

### 3. Run the Backend Server

```bash
cd backend
npm run dev
# Server will run on http://localhost:5000 (Health check: http://localhost:5000/health)
```

---

### 4. Start the Mobile App

```bash
# In the root directory:
npx expo start
```

- Press `a` for **Android emulator**
- Press `i` for **iOS simulator**
- Scan the QR code using the **Expo Go** app on your physical device

---

## 📡 API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register a new cinephile account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | **Yes** |
| `GET` | `/api/memories` | List journal memories (supports `page`, `limit`) | **Yes** |
| `POST` | `/api/memories` | Create a new theatrical memory | **Yes** |
| `PUT` | `/api/memories/:id` | Update an existing memory | **Yes** |
| `DELETE`| `/api/memories/:id` | Delete a memory | **Yes** |
| `GET` | `/api/plans` | List scheduled movie trips | **Yes** |
| `POST` | `/api/plans` | Lock in a new movie night plan | **Yes** |
| `PUT` | `/api/plans/:id` | Update plan status (upcoming/completed/cancelled) | **Yes** |
| `DELETE`| `/api/plans/:id` | Delete a planned trip | **Yes** |
| `GET` | `/api/watchlist` | Retrieve saved watchlist items | **Yes** |
| `POST` | `/api/watchlist` | Add movie to watchlist | **Yes** |
| `DELETE`| `/api/watchlist/:movieId`| Remove movie from watchlist | **Yes** |
| `GET` | `/api/profile` | Retrieve custom profile preferences | **Yes** |
| `PUT` | `/api/profile` | Update profile, favorite formats & genres | **Yes** |

---

## 🧪 Testing & Verification

- **Backend Syntax & Type Check**: `node --check src/server.js` (21/21 files verified).
- **Expo Config Resolution**: `npx expo config --type public` (All plugins & permissions verified).
- **Hardware Integrations**: Camera capture, live video recording, image gallery picker, GPS geocoding, contact picker, and clipboard pass copying verified.

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
  Built with passion for film lovers, 70mm enthusiasts, and theater connoisseurs. 🍿🎬
</p>
