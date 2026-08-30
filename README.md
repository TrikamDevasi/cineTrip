# 🎬 CineTrip — The Complete Theatrical Movie-Night Experience

**CineTrip** is an editorial, full-stack, cross-platform movie companion built with **Expo + React Native** (client) and **Node.js + Express + MongoDB** (backend). It orchestrates the complete physical cinema ritual:

$$\textbf{DISCOVER} \longrightarrow \textbf{DECIDE} \longrightarrow \textbf{PLAN} \longrightarrow \textbf{GO} \longrightarrow \textbf{WATCH} \longrightarrow \textbf{REMEMBER}$$

---

## 🌟 Key Product Features

### 1. 🎞️ Theatrical Movie Discovery
* **TMDB Live Feeds**: Real-time *Now Playing*, *Trending*, and *Upcoming* cinematic releases with trailer playback.
* **Premium Format Intelligence**: Clear labeling and filtering for **IMAX 70mm & Laser**, **Dolby Cinema (Vision + Atmos)**, **4DX Immersive**, and **ScreenX 270°**.
* **Cinephile Watchlist**: Cloud-synced, release-date sorted watchlist with 1-tap "Plan Trip" bridge.

### 2. 🏛️ Cinema Radar & Map Navigation
* **OpenStreetMap Overpass Integration**: Live venue discovery in a 10km radius with Haversine distance calculations.
* **Turn-by-Turn Navigation**: Direct Apple Maps (iOS) and Google Maps (Android/Web) routing to the cinema auditorium.
* **Format & Hall Classification**: Identifies premium auditoriums across major chains (PVR INOX, Cinepolis, AMC, Regal).

### 3. 🎟️ 3-Step Trip Planner & Digital Pass
* **Curved Seat Map**: Interactive theater seating matrix with aisle separation and real-time seat assignment (`Row F • Seats 4, 5`).
* **Concession Pre-Selector**: Giant caramel popcorn, nachos, ICEE, and artisanal snack checklists.
* **Offline-Ready Digital Pass**: 0ms hardware cached pass with scannable vector QR code for group entry and turnstile verification.

### 4. 📅 1-Tap Calendar Export
* **Universal Calendar Integration (`services/calendar.js`)**: RFC-compliant iCal and direct Google Calendar export.
* **Runtime Duration Awareness**: Automatically calculates screening start/end times based on the film's verified runtime.

### 5. 👥 Shared Movie Night Outings (`/p/:id`) & Live Guest RSVP
* **Frictionless Web Previews**: Standalone responsive web route (`https://cinetrip.app/p/[id]`) for invited squad friends on WhatsApp/iMessage.
* **Unauthenticated Guest RSVP**: Friends type their name/handle and tap **"RSVP: I'M IN!"** to persist their attendance directly to the organizer's live roster (`POST /api/plans/public/:id/rsvp`).
* **Zero-IDOR Data Privacy**: Strict field whitelisting ensures private user credentials, emails, and payment tokens are never exposed.

### 6. 🏆 Cinephile Journal & Yearly Recap
* **Theatrical Memories**: Photo & video memory journaling with 5-star acoustic, screen clarity, and companion logging.
* **Year in Cinema Recap Modal (`components/CinephileRecapModal.jsx`)**: Filter by year (*All-Time*, *2026*, *2025*, *2024*) to view screenings watched, top cinema, preferred formats, and shareable social story cards.

---

## 🏗️ Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CINETRIP ARCHITECTURE                         │
├───────────────────────────────────┬────────────────────────────────────┤
│ FRONTEND (CLIENT)                 │ BACKEND (SERVER)                   │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Expo SDK 52 / React Native 0.81 │ • Node.js + Express 4.x            │
│ • Expo Router v6 (File-Based)     │ • MongoDB Atlas via Mongoose       │
│ • Zustand State (Local + Cloud)   │ • JWT Bearer Auth (bcrypt 12 rds)  │
│ • Lucide React Native Icons       │ • Joi & Zod Request Validation     │
│ • react-native-qrcode-svg         │ • Express Rate Limit + Helmet      │
│ • AsyncStorage + SecureStore      │ • Render Production Cloud API      │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 🌐 Complete API Endpoints

### 🔐 Authentication & Profile (`/api/auth`, `/api/profile`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:--:|
| `POST` | `/api/auth/register` | Create account (name, email, password) | No |
| `POST` | `/api/auth/login` | Email/password login $\rightarrow$ returns JWT | No |
| `POST` | `/api/auth/google` | Google / OAuth authentication | No |
| `POST` | `/api/auth/forgot-password`| Anti-enumeration password reset link generator | No |
| `POST` | `/api/auth/reset-password` | Complete password reset with secure token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user details | **Yes** |
| `GET` | `/api/profile` | Fetch user cinephile preferences & stats | **Yes** |
| `PUT` | `/api/profile` | Update profile, preferred formats, and home city | **Yes** |

### 🎟️ Movie Night Planner & Public Outings (`/api/plans`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:--:|
| `GET` | `/api/plans/public/:id` | Sanitized public outing itinerary for guests | No |
| `POST` | `/api/plans/public/:id/rsvp`| Guest RSVP attendance submission | No |
| `GET` | `/api/plans` | List authenticated user's planned trips (paginated) | **Yes** |
| `GET` | `/api/plans/:id` | Fetch specific private plan details | **Yes** |
| `POST` | `/api/plans` | Create a new movie night plan | **Yes** |
| `PUT` | `/api/plans/:id` | Update plan details (seats, snacks, showtime) | **Yes** |
| `DELETE` | `/api/plans/:id` | Delete plan | **Yes** |

### 📸 Theatrical Memories Journal (`/api/memories`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:--:|
| `GET` | `/api/memories` | List user's logged theatrical memories | **Yes** |
| `GET` | `/api/memories/:id` | Get specific memory details | **Yes** |
| `POST` | `/api/memories` | Log a new screening memory (sound/screen ratings) | **Yes** |
| `PUT` | `/api/memories/:id` | Update story, favorite moment, or photo URI | **Yes** |
| `DELETE` | `/api/memories/:id` | Delete memory | **Yes** |

### 📑 Watchlist (`/api/watchlist`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:--:|
| `GET` | `/api/watchlist` | List user's saved movies | **Yes** |
| `POST` | `/api/watchlist` | Add film to watchlist (upsert) | **Yes** |
| `DELETE` | `/api/watchlist/:movieId`| Remove film from watchlist | **Yes** |

---

## 🔒 Security & Quality Standards

* **Strict Authorization**: All user data queries scope strictly to `req.user._id` preventing IDOR attacks.
* **Production Startup Protection**: Express server halts automatically on boot if `JWT_SECRET` is unset or matches default placeholders in production mode.
* **Anti-Token Leakage**: `forgotPassword` responses never leak reset tokens into HTTP response bodies.
* **File Upload Constraints**: Media uploads validate against allowed MIME types (`jpg`, `jpeg`, `png`, `webp`, `mp4`, `mov`).
* **Zero Fake Data**: The application never manufactures fake screenings, fake showtimes, or fake stats. When memory history is empty, clean zero-states guide the user.

---

## 🛠️ Quick Start & Local Development

### 1. Prerequisites
* Node.js v18+
* MongoDB database (local or MongoDB Atlas connection string)
* Free TMDB API Key from [themoviedb.org](https://www.themoviedb.org/)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/TrikamDevasi/cineTrip.git
cd cineTrip

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
EXPO_PUBLIC_CINEMA_PROVIDER=osm
EXPO_PUBLIC_DEMO_MODE=false
```

Create a `backend/.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secure_random_jwt_secret_key_here
```

### 4. Running the Development Servers
```bash
# Terminal 1: Start Backend Server
cd backend
npm run dev

# Terminal 2: Start Expo Client
npx expo start -c
```

Press:
* `w` to open in **Web Browser**
* `a` to launch **Android Emulator**
* `i` to launch **iOS Simulator**

### 5. Production Web Export
```bash
npm run build:web
```
Produces an optimized static bundle in `dist/` ready for hosting on Vercel, Netlify, or AWS S3.

---

## 📄 License
MIT License. Created for film enthusiasts and cinephiles worldwide.