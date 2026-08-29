# 🎬 CineTrip

**CineTrip** is a full-stack cross-platform mobile/web application built with **Expo + React Native** (client) and **Node.js + Express + MongoDB** (backend). It helps movie-goers **discover films, plan premium cinema outings, coordinate with friends, and journal their theatre memories**.

> ⚠️ **Important distinction:** CineTrip currently implements **movie-night planning** — NOT real cinema ticket booking. There is **no payment flow, no real booking reference, and no cinema ticketing-provider integration**. The word "ticket/pass" throughout the UI refers to a *digital representation of a personal plan*, not a purchased admission. See [🎟️ Planning vs. Booking](#-planning-vs-booking).

---

## 📋 Feature Checklist Source

This README is an honest implementation audit of **CineTrip** against the supplied **`React Native Project Feature Checklist(1).pdf`** (the "137-feature checklist" referenced in `task.md`).

When counted against the actual source, the PDF contains **135 checklist items** (not 137):

| Section | Items |
|---|---:|
| Core React Native Components | 14 |
| Expo Router | 10 |
| Camera | 16 |
| Location | 13 |
| Contacts | 11 |
| Image & Media | 7 |
| Backend — Node.js, Express & MongoDB | 14 |
| API & Networking | 10 |
| UI/UX & Extra Features | 21 |
| Code Concepts to Explain | 19 |
| **Total** | **135** |

Every item below has exactly one audit row, is mapped to code, and is marked `✅ Implemented`, `⚠️ Partially implemented`, `❌ Not implemented`, or `🚫 Excluded`.

---

## 📊 Implementation Summary

```text
Total Features:            135
✅ Implemented:            118
⚠️ Partially Implemented:   12
❌ Not Implemented:          5
🚫 Excluded:                0
Implementation Percentage: 87.4%
```

| Metric | Result |
|---|--:|
| Total Features | 135 |
| ✅ Fully Implemented | 118 |
| ⚠️ Partially Implemented | 12 |
| ❌ Not Implemented | 5 |
| 🚫 Excluded (no real implementation found) | 0 |
| **Implementation Percentage (fully implemented only)** | **87.4%** |
| Percentage including partials at half credit | 91.9% |

> **Weighted score unavailable:** the supplied checklist defines feature categories but **does not provide category weights**. The percentages above are therefore **unweighted**. No weights were fabricated.

### 📈 Category Scores

Definition: `Score = Full items / Total items × 100`. Partial items are *not* counted as fully implemented.

| Category | Total | ✅ | ⚠️ | ❌ | Score |
|---|--:|--:|--:|--:|--:|
| Core React Native Components | 14 | 14 | 0 | 0 | 100.0% |
| Expo Router | 10 | 10 | 0 | 0 | 100.0% |
| Camera | 16 | 10 | 3 | 3 | 62.5% |
| Location | 13 | 12 | 1 | 0 | 92.3% |
| Contacts | 11 | 7 | 2 | 2 | 63.6% |
| Image & Media | 7 | 4 | 3 | 0 | 57.1% |
| Backend — Node.js, Express & MongoDB | 14 | 13 | 1 | 0 | 92.9% |
| API & Networking | 10 | 9 | 1 | 0 | 90.0% |
| UI/UX & Extra Features | 21 | 20 | 1 | 0 | 95.2% |
| Code Concepts to Explain | 19 | 19 | 0 | 0 | 100.0% |
| **Total** | **135** | **118** | **12** | **5** | **87.4%** |

---

## 📋 Complete 135-Feature Audit

Legend: ✅ Implemented · ⚠️ Partially implemented · ❌ Not implemented · 🚫 Excluded

| # | Section | Feature | Status | Evidence | File/Location |
|-:|---------|---------|:------:|----------|---------------|
| 1 | Core RN | View | ✅ | Every screen renders RN `View` | `app/**/*.jsx`, `components/**/*.jsx` |
| 2 | Core RN | Text | ✅ | Text used across all screens | `app/**/*.jsx` |
| 3 | Core RN | Image | ✅ | Posters, backdrops, cast, memory previews | `app/(tabs)/index.jsx`, `app/movie/[id].jsx`, `components/MovieCard.jsx` |
| 4 | Core RN | Pressable | ✅ | `AnimatedPressable` wraps RN `Pressable` | `components/ui/AnimatedPressable.jsx:40` |
| 5 | Core RN | TextInput | ✅ | Login, register, search, profile, journal, notes | `app/(auth)/login.jsx`, `app/contacts.jsx`, `app/memory/create.jsx` |
| 6 | Core RN | ScrollView | ✅ | Enables vertical/horizontal scrolls | `app/(tabs)/profile.jsx`, `app/ticket/[id].jsx`, `app/map.jsx` |
| 7 | Core RN | FlatList | ✅ | Contacts, discover grid, watchlist use FlatList | `app/contacts.jsx:160`, `app/(tabs)/discover.jsx`, `app/(tabs)/watchlist.jsx` |
| 8 | Core RN | Modal | ✅ | Planner uses two `Modal` overlays | `app/(tabs)/planner.jsx:798,875` |
| 9 | Core RN | ActivityIndicator | ✅ | Loading spinners in Button, map, movie detail | `components/ui/Button.jsx:100`, `app/map.jsx`, `app/movie/[id].jsx` |
| 10 | Core RN | SafeAreaView | ✅ | `react-native-safe-area-context` used | `app/ticket/[id].jsx`, `app/contacts.jsx`, `app/memory/create.jsx` |
| 11 | Core RN | Conditional rendering | ✅ | Ternaries/`&&` throughout all screens | `app/(tabs)/planner.jsx`, `app/movie/[id].jsx` |
| 12 | Core RN | Props and reusable components | ✅ | Component library accepts props | `components/MovieCard.jsx`, `components/ui/Button.jsx`, `components/TicketCard.jsx` |
| 13 | Core RN | useState | ✅ | State management in all screens/hooks | `app/**/*.jsx`, `hooks/*.js` |
| 14 | Core RN | useEffect | ✅ | Effects across screens & hooks (incl. cleanup) | `app/**/*.jsx`, `hooks/useLocation.js`, `hooks/useContacts.js` |
| 15 | Expo Router | File-based routing | ✅ | Route tree under `app/` | `app/_layout.jsx`, `app/(auth)/`, `app/(tabs)/`, `app/movie/[id].jsx` |
| 16 | Expo Router | Stack navigation | ✅ | Root & auth stacks via `Stack` | `app/_layout.jsx`, `app/(auth)/_layout.jsx` |
| 17 | Expo Router | Tab navigation | ✅ | 6-tab bottom bar via `Tabs` | `app/(tabs)/_layout.jsx` |
| 18 | Expo Router | Dynamic routes | ✅ | `[id]` routes for movie/ticket | `app/movie/[id].jsx`, `app/ticket/[id].jsx` |
| 19 | Expo Router | Route parameters | ✅ | `useLocalSearchParams` reads ids + query params | `app/movie/[id].jsx:26`, `app/memory/create.jsx:59` |
| 20 | Expo Router | router.push() | ✅ | Navigation to tabs/modals/callback | `app/ticket/[id].jsx:134`, `app/contacts.jsx:73` |
| 21 | Expo Router | router.replace() | ✅ | Splash redirect + post-logout redirect | `app/index.jsx`, `app/(tabs)/profile.jsx:116` |
| 22 | Expo Router | router.back() | ✅ | Back buttons on modals/screens | `app/ticket/[id].jsx:34`, `app/memory/create.jsx:366` |
| 23 | Expo Router | Link | ✅ | `Link` used on auth screens | `app/(auth)/login.jsx:203`, `app/(auth)/register.jsx:255` |
| 24 | Expo Router | Protected/auth routes | ✅ | `Stack.Protected` + auth redirects | `app/_layout.jsx`, `app/index.jsx` |
| 25 | Camera | Camera permission | ✅ | `useCameraPermissions` + request flow | `app/memory/create.jsx:60,183` |
| 26 | Camera | Camera preview | ✅ | `CameraView` full-screen viewfinder | `app/memory/create.jsx:272` |
| 27 | Camera | Capture image | ✅ | `takePictureAsync({quality:0.85})` | `app/memory/create.jsx:142` |
| 28 | Camera | Front/back camera flip | ✅ | `flipCamera` + `facing` prop | `app/memory/create.jsx:135,275` |
| 29 | Camera | Torch/flash | ⚠️ | Flash modes `off/on/auto` fully work; dedicated **torch** control is absent | `app/memory/create.jsx:55,130,276` |
| 30 | Camera | Zoom | ❌ | No zoom control/prop anywhere | — |
| 31 | Camera | Auto focus | ⚠️ | Relies on platform-default focus only; no explicit auto-focus handling | `app/memory/create.jsx` (no `autoFocus`) |
| 32 | Camera | Tap-to-focus | ❌ | Not implemented | — |
| 33 | Camera | Captured-image preview | ✅ | Photo preview card after capture | `app/memory/create.jsx:380-403` |
| 34 | Camera | Retake image | ✅ | `Retake` button reopens camera and clears media | `app/memory/create.jsx:384-391` |
| 35 | Camera | Save captured image | ✅ | Media uploads/stores via `addMemory` | `app/memory/create.jsx:219-257` |
| 36 | Camera | Scan/document scanning | ❌ | No barcode/QR/document scanner | — |
| 37 | Camera | Video recording | ✅ | `recordAsync({maxDuration:60})` | `app/memory/create.jsx:162` |
| 38 | Camera | Start/stop recording | ✅ | Shutter toggles record/`stopRecording` | `app/memory/create.jsx:153-180` |
| 39 | Camera | Video preview | ⚠️ | Captured video shown as static `Image` thumbnail; no video playback player | `app/memory/create.jsx:382` |
| 40 | Camera | Permission/error handling | ✅ | Camera/mic permission alerts + capture/record error alerts | `app/memory/create.jsx:148,168,183-193` |
| 41 | Location | Foreground location permission | ✅ | `requestForegroundPermissionsAsync` | `hooks/useLocation.js:21`, `services/location.js:78` |
| 42 | Location | Get current location | ✅ | `getCurrentPositionAsync` | `hooks/useLocation.js:37` |
| 43 | Location | Get previous/last known location | ✅ | `getLastKnownPositionAsync` | `hooks/useLocation.js:64`, `services/location.js:119` |
| 44 | Location | watchPositionAsync | ✅ | Live watcher with 5s/10m config | `hooks/useLocation.js:81`, `services/location.js:141` |
| 45 | Location | Stop/unsubscribe location watcher | ✅ | `subscription.remove()` + unmount cleanup | `hooks/useLocation.js:90-105` |
| 46 | Location | Latitude and longitude | ✅ | Coords used for map & cinema distances | `app/map.jsx`, `services/location.js` |
| 47 | Location | Map implementation | ✅ | `react-native-maps` (native) / OSM embed (web) | `app/map.jsx:236-264` |
| 48 | Location | Map marker | ✅ | Markers for user + cinemas | `app/map.jsx:247-263` |
| 49 | Location | Move map to current location | ✅ | Locate me → `animateToRegion` | `app/map.jsx:130-148` |
| 50 | Location | Reverse geocoding | ✅ | `reverseGeocodeAsync` | `hooks/useLocation.js:44`, `services/location.js:163` |
| 51 | Location | Convert coordinates to address | ✅ | `reverseGeocode()` → readable address string | `services/location.js:163-176` |
| 52 | Location | Location search/select | ⚠️ | Cinema *selection* works ("Plan Movie Night Here"); also a **location bypass**. Address *search* input is declared but not wired to a functional search | `app/map.jsx:52,124-128,150-153` |
| 53 | Location | Permission/services error handling | ✅ | Denied overlay, retry + browse-without-location | `app/map.jsx:179-215` |
| 54 | Contacts | Contacts permission | ✅ | `requestPermissionsAsync` | `hooks/useContacts.js:14`, `services/contacts.js:20` |
| 55 | Contacts | Get all contacts | ✅ | `getContactsAsync` (pageSize 100–200) | `hooks/useContacts.js:30`, `services/contacts.js:22` |
| 56 | Contacts | Display contacts with FlatList | ✅ | Contacts screen list | `app/contacts.jsx:160` |
| 57 | Contacts | Search/filter contacts | ✅ | Name/phone/email filter | `hooks/useContacts.js:60-72` |
| 58 | Contacts | Contact details | ⚠️ | Rows show name, phone, avatar; no dedicated detail view | `app/contacts.jsx:165-201` |
| 59 | Contacts | Add/create contact | ⚠️ | `createDeviceContact` helper exists (`addContactAsync`) but is **not wired to any screen/flow** | `services/contacts.js:51` |
| 60 | Contacts | Delete contact | ❌ | No delete implementation | — |
| 61 | Contacts | Edit/update contact | ❌ | No edit/update implementation | — |
| 62 | Contacts | Link contact | ✅ | Selected contacts added to plan squad (`toggleDraftFriend`) | `app/contacts.jsx:57-75` |
| 63 | Contacts | Open/link contact using device app | ✅ | `Linking.openURL('tel:...')` opens device dialer | `app/contacts.jsx:77-85` |
| 64 | Contacts | Permission handling | ✅ | Denied state → "Open Device Settings" | `app/contacts.jsx:87-109` |
| 65 | Image & Media | Pick image from gallery | ✅ | `launchImageLibraryAsync` (photo + video) with editing | `app/memory/create.jsx:196-217` |
| 66 | Image & Media | Upload image | ⚠️ | Real Cloudinary upload when env configured; otherwise honest local-URI fallback | `services/media/mediaUploader.js:27-83` |
| 67 | Image & Media | Display uploaded image | ✅ | Memory card + preview render media | `components/MemoryCard.jsx`, `app/memory/create.jsx:382` |
| 68 | Image & Media | Image compression/resizing | ✅ | `quality:0.85` + `allowsEditing` crop on capture & pick | `app/memory/create.jsx:142,200-201` |
| 69 | Image & Media | Video upload | ⚠️ | Same conditional Cloudinary path (uploads as `video/mp4`) | `services/media/mediaUploader.js:47` |
| 70 | Image & Media | Media validation | ⚠️ | Only photo-vs-video type check; no size/format validation | `app/memory/create.jsx:206` |
| 71 | Image & Media | Loading state during upload | ✅ | `isSaving` → button loading state | `app/memory/create.jsx:86,225,531-538` |
| 72 | Backend | Node.js + Express setup | ✅ | Express app, server entry, dotenv | `backend/src/app.js`, `backend/src/server.js` |
| 73 | Backend | MongoDB connection | ✅ | Mongoose connect with retry/DNS fallback | `backend/src/config/database.js` |
| 74 | Backend | REST APIs | ✅ | Routers mounted under `/api` | `backend/src/app.js`, `backend/src/routes/*.js` |
| 75 | Backend | User registration | ✅ | `POST /api/auth/register` (zod-validated) | `backend/src/routes/auth.js`, `backend/src/controllers/authController.js` |
| 76 | Backend | User login | ✅ | `POST /api/auth/login` (bcrypt compare + JWT) | `backend/src/controllers/authController.js` |
| 77 | Backend | Password hashing | ✅ | bcryptjs pre-save + `comparePassword` | `backend/src/models/User.js` |
| 78 | Backend | JWT authentication | ✅ | `jwt.sign` (30d) + `authenticateToken` verify | `backend/src/middleware/auth.js`, `backend/src/controllers/authController.js` |
| 79 | Backend | Protected routes | ✅ | Token guard on memories/plans/watchlist/profile routers | `backend/src/routes/memories.js:13`, `planner.js`, `watchlist.js`, `profile.js` |
| 80 | Backend | CRUD operations | ✅ | Full CRUD for memories, plans, watchlist; get/update profile | `backend/src/controllers/memoriesController.js`, `plannerController.js`, `watchlistController.js`, `profileController.js` |
| 81 | Backend | Image/media data storage | ⚠️ | Media stored as URI/URL reference strings (`photoUri`/`videoUri`); no server-side file/blob storage or multer | `backend/src/models/Memory.js` |
| 82 | Backend | Request validation | ✅ | Zod schemas + `validate` on all mutating routes | `backend/src/validators/*.js` |
| 83 | Backend | API error handling | ✅ | Centralized error handler (validation/dup-key/cast/JWT) | `backend/src/middleware/errorHandler.js` |
| 84 | Backend | Environment variables | ✅ | `dotenv` + `.env.example` templates | `backend/.env.example`, `.env.example` |
| 85 | Backend | Connect React Native app to backend | ✅ | `services/api.js` host detection + fetch wrapper; stores call live endpoints | `services/api.js`, `store/usePlannerStore.js`, `useMemoryStore.js`, `useWatchlistStore.js` |
| 86 | API & Net | GET request | ✅ | `/api/auth/me`, `/api/plans`, `/api/memories`, `/api/watchlist`, TMDB | `services/api.js`, `store/*.js`, `services/tmdb.js` |
| 87 | API & Net | POST request | ✅ | register/login/google, create plan/memory/watchlist | `store/useAuthStore.js`, `store/usePlannerStore.js` |
| 88 | API & Net | PUT/PATCH request | ✅ | update plan/memory/profile (PUT) | `store/usePlannerStore.js`, `store/usePreferencesStore.js` |
| 89 | API & Net | DELETE request | ✅ | delete plan/memory/watchlist item (DELETE) | `store/*.js`, `services/api.js` |
| 90 | API & Net | fetch/Axios | ✅ | Custom `fetch` wrapper (no axios) | `services/api.js` |
| 91 | API & Net | Loading states | ✅ | Skeletons + spinners on every data screen | `components/ui/Skeleton.jsx`, `app/(tabs)/index.jsx:97-145`, `app/map.jsx:290` |
| 92 | API & Net | Error states | ✅ | `ErrorState` used e.g. on memories | `components/ui/ErrorState.jsx`, `app/(tabs)/memories.jsx:123` |
| 93 | API & Net | Network error handling | ✅ | Timeout/abort in api.js; offline banner in planner | `services/api.js`, `components/ui/NetworkStatusBanner.jsx`, `app/(tabs)/planner.jsx:353` |
| 94 | API & Net | Multipart/form-data upload | ⚠️ | FormData upload exists for Cloudinary but only activates when env configured | `services/media/mediaUploader.js:35-52` |
| 95 | API & Net | Authentication token handling | ✅ | Bearer injection from SecureStore/localStorage + token restore | `services/api.js`, `services/auth.js`, `store/useAuthStore.js` |
| 96 | UI/UX | Login screen | ✅ | Email/password, Google OAuth, guest mode, validation | `app/(auth)/login.jsx` |
| 97 | UI/UX | Registration screen | ✅ | Name/email/password, Google OAuth, validation | `app/(auth)/register.jsx` |
| 98 | UI/UX | Home/dashboard | ✅ | Hero carousel, trending, cinemas, next plans | `app/(tabs)/index.jsx` |
| 99 | UI/UX | Camera screen | ✅ | Viewfinder + photo/video modes | `app/memory/create.jsx` |
| 100 | UI/UX | Map/location screen | ✅ | Map + cinema sheet + locate me | `app/map.jsx` |
| 101 | UI/UX | Contacts screen | ✅ | Squad manager + search + selection | `app/contacts.jsx` |
| 102 | UI/UX | Profile/settings | ✅ | Edit profile, formats, chains, genres, preferences | `app/(tabs)/profile.jsx` |
| 103 | UI/UX | Empty states | ✅ | `EmptyState` on memories, watchlist, discover, map, contacts, planner | `components/ui/EmptyState.jsx` |
| 104 | UI/UX | Permission-denied states | ✅ | Camera/mic, contacts, location denied UIs | `app/memory/create.jsx`, `app/contacts.jsx:87`, `app/map.jsx:179` |
| 105 | UI/UX | Form validation | ✅ | Client-side checks + backend zod validation | `app/(auth)/login.jsx`, `app/(auth)/register.jsx`, `backend/src/validators/*.js` |
| 106 | UI/UX | Pull-to-refresh | ✅ | `RefreshControl` on 4 tabs | `app/(tabs)/index.jsx`, `discover.jsx`, `memories.jsx`, `watchlist.jsx` |
| 107 | UI/UX | Search/filtering | ✅ | Discover search/moods, watchlist search/filters, contacts search | `app/(tabs)/discover.jsx`, `watchlist.jsx`, `app/contacts.jsx` |
| 108 | UI/UX | Pagination | ✅ | Discover infinite scroll; memories/plans paginated fetches | `app/(tabs)/discover.jsx`, `store/useMemoryStore.js`, `store/usePlannerStore.js` |
| 109 | UI/UX | Local data persistence | ✅ | zustand persist + AsyncStorage for all stores | `store/usePlannerStore.js`, `useMemoryStore.js`, `useWatchlistStore.js`, `usePreferencesStore.js` |
| 110 | UI/UX | Secure token storage | ✅ | `expo-secure-store` (native), `localStorage` (web), memory fallback | `services/auth.js` |
| 111 | UI/UX | Dark/light theme | ⚠️ | `themeMode` (dark/light/system) preference stored + `useTheme` hook exists, but palette tokens are static `COLORS` — **no screen actually swaps palettes** | `hooks/useTheme.js`, `constants/theme.js`, `store/usePreferencesStore.js` |
| 112 | UI/UX | Reusable custom hooks | ✅ | `useAuth`, `useLocation`, `useContacts`, `useDebounce`, `useApi`, `useMovieCatalog`, `useTheme` | `hooks/*.js` |
| 113 | UI/UX | Reusable UI components | ✅ | Button, Chip, Rating, Skeleton, EmptyState, ErrorState, MovieCard, MemoryCard, TicketCard… | `components/`, `components/ui/` |
| 114 | UI/UX | Confirmation dialogs | ✅ | Sign-out + cancel-trip confirmations via `Alert.alert` | `app/(tabs)/profile.jsx:105-121`, `app/(tabs)/planner.jsx:429` |
| 115 | UI/UX | Toast/alert notifications | ✅ | `Alert.alert` feedback throughout (no dedicated toast library) | `app/memory/create.jsx:260`, `app/ticket/[id].jsx:55`, `app/contacts.jsx:59` |
| 116 | UI/UX | Logout | ✅ | Clears token, resets auth state, redirects to login | `app/(tabs)/profile.jsx:105-121`, `store/useAuthStore.js` |
| 117 | Concepts | Components and JSX | ✅ | Component-based JSX throughout | `components/`, `app/**/*.jsx` |
| 118 | Concepts | Props | ✅ | All reusable components consume props | `components/ui/Button.jsx`, `components/MovieCard.jsx` |
| 119 | Concepts | useState | ✅ | Local state across screens | `app/**/*.jsx` |
| 120 | Concepts | useEffect | ✅ | Effects with proper cleanup | `hooks/useLocation.js`, `app/memory/create.jsx:124` |
| 121 | Concepts | Event handling | ✅ | `onPress`, `onChangeText`, `onValueChange`… | `app/**/*.jsx` |
| 122 | Concepts | onChangeText | ✅ | All TextInputs (search, forms, notes) | `app/contacts.jsx:144`, `app/(auth)/login.jsx` |
| 123 | Concepts | Conditional rendering | ✅ | Ternary/`&&` rendering patterns | `app/movie/[id].jsx`, `app/(tabs)/planner.jsx` |
| 124 | Concepts | map() vs FlatList | ✅ | Both used — `map` for memories & cinemas, `FlatList` for contacts/discover/watchlist | `app/(tabs)/memories.jsx`, `app/map.jsx`, `app/contacts.jsx` |
| 125 | Concepts | Promises | ✅ | Async APIs across services/stores | `services/api.js`, `services/tmdb.js` |
| 126 | Concepts | async/await | ✅ | Pervasive in hooks, services, stores | `store/useAuthStore.js`, `hooks/useLocation.js` |
| 127 | Concepts | API requests | ✅ | Centralized fetch wrapper + TMDB client | `services/api.js`, `services/tmdb.js` |
| 128 | Concepts | Permissions | ✅ | Camera, mic, location, contacts, media permissions handled | `app/memory/create.jsx`, `hooks/useLocation.js`, `hooks/useContacts.js` |
| 129 | Concepts | Navigation | ✅ | Expo Router stack/tab/dynamic navigation | `app/_layout.jsx`, `app/(tabs)/_layout.jsx` |
| 130 | Concepts | Camera lifecycle | ✅ | Open/close camera, capture, record, timer cleanup | `app/memory/create.jsx:124-128,269-357` |
| 131 | Concepts | Location watcher and cleanup | ✅ | subscription ref removed on stop + unmount | `hooks/useLocation.js:90-105` |
| 132 | Concepts | CRUD operations | ✅ | Backend + store sync for plans/memories/watchlist/profile | `backend/src/controllers/*.js`, `store/*.js` |
| 133 | Concepts | Authentication flow | ✅ | Register/login/Google/me/logout + token persistence | `store/useAuthStore.js`, `backend/src/controllers/authController.js` |
| 134 | Concepts | Frontend → API → Backend → Database | ✅ | Stores → `/api` → controllers → Mongoose models | `store/*.js` → `services/api.js` → `backend/src/routes/*` → `backend/src/models/*` |
| 135 | Concepts | Loading, permission and error states | ✅ | Skeletons, EmptyState, ErrorState, permission UIs | `components/ui/*`, `app/map.jsx`, `app/contacts.jsx` |

---

## ✅ Implemented Features

Genuinely working functionality, verified by code tracing:

**Core & Navigation**
- Full Expo Router navigation: root/auth stacks, 6-tab bar, dynamic `[id]` routes, protected/auth routing, `push/replace/back/Link`.
- Reusable design system: Button, Chip, Rating, Skeleton, EmptyState, ErrorState, NetworkStatusBanner, FormatBadge, MovieCard, MemoryCard, TicketCard and more.

**Authentication**
- Email/password registration + login with JWT (bcrypt hashing, 30-day token) against a real backend.
- Google OAuth (Supabase PKCE `WebBrowser` session + server-side verification, plus `/api/auth/google`).
- Guest mode without sign-in, protected route guards, SecureStore token persistence, logout.

**Movie Discovery & Details**
- TMDB live feeds: Now Playing, Trending, Upcoming + debounced search + mood/genre/format filters + infinite scroll.
- Movie detail with poster/backdrop, rating, year, runtime, genres, top cast, available formats, availability status, watchlist toggle, share.

**Watchlist** — add/remove with optimistic UI, favorite-format preference, filter/search, paginated local cache with backend sync.

**Plan / Pass (personal planning, not booking)**
- Movie → cinema → date/showtime-slot → interactive seat map → friends/snacks → notes → save personal plan.
- Digital pass UI with ticket-style card, share sheet + clipboard, "Log Screening Memory" pre-fill.

**Location & Map** — foreground permission, current/last-known GPS, live watcher with unsubscribe cleanup, reverse geocoding, Haversine distance, `react-native-maps` (native) / OSM embed (web), user + cinema markers, locate-me animation, permission-denied + bypass states.

**Contacts & Squad** — permission handling, device contacts via `expo-contacts`, FlatList, search, contact selection linked into the plan squad, call contact via `tel:` deep link.

**Camera & Memories** — camera/mic permission, live preview, capture with quality compression, front/back flip, flash modes, photo/video modes, start/stop recording, preview + retake, gallery picker, media uploader (Cloudinary when configured / local fallback), and full memory journaling (rating, story, companions, snack highlight, date) persisted locally + synced to backend.

**Profile & Preferences** — editable name/city, preferred format/chain/genres, notifications + calendar-sync *toggles*, milestones (IMAX/Dolby/theaters/average rating), sign-out.

**Backend** — Express REST API; JWT auth middleware; Zod validation; bcrypt password hashing; Helmet, CORS, rate limiting; centralized error handling; MongoDB (User, Memory, Plan, Watchlist) with paginated queries; full CRUD.

---

## ⚠️ Partial / Incomplete Features

Honest breakdown of what exists, what works, and what does not:

1. **Torch/flash — camera.** Flash modes `off/on/auto` work. A dedicated *torch* control does not exist. (`app/memory/create.jsx:55,130`)
2. **Auto focus — camera.** No explicit auto-focus handling; relies on the platform default. Tap-to-focus is entirely absent.
3. **Video preview.** Recorded/imported video appears as a static image thumbnail rendered with RN `Image`; there is no video playback (no `expo-video`/`expo-av` player). (`app/memory/create.jsx:382`)
4. **Location search/select.** Selecting a cinema from the list works ("Plan Movie Night Here"), and a no-location "browse" path exists. A functional *address search* is not wired (search input state exists but no search execution). (`app/map.jsx`)
5. **Contact details / add contact.** Rows show name, phone, avatar — but there is no dedicated detail view. `createDeviceContact()` exists in the service layer but is *not connected to any screen*; there is no delete or edit contact.
6. **Media upload (image/video).** `MediaUploader` performs a real Cloudinary multipart upload **only when** `EXPO_PUBLIC_CLOUDINARY_*` env vars are configured; the default is an honest "stored on device" local-URI fallback. Backend stores URI/URL strings only — no server-side file storage. (`services/media/mediaUploader.js`)
7. **Media validation.** Only a photo-vs-video type check; no size/format verification.
8. **Multipart/form-data upload.** Implemented but gated behind Cloudinary configuration (see #6).
9. **Dark/light theme.** The user preference (`dark`/`light`/`system`) is stored, and `useTheme` computes `isDark`, but all screens import a **static dark `COLORS` palette** — switching the preference does not re-theme the UI. (`constants/theme.js`, `hooks/useTheme.js`)
10. **Image/media storage on backend.** Stored as reference strings (local path or Cloudinary URL); no blob/file storage layer.
11. **"Digital pass" QR.** The pass shows an *icon-based decorative QR* (`QrCode` from lucide). It is **not** a scannable/verifiable booking QR — see [Known Bugs](#-known-bugs--technical-issues) below.
12. **Cinema/showtime data.** Real cinemas can come from the OSM/Overpass provider and simulated cinemas/showtimes from the mock provider (DEMO mode). There is **no live showtime or ticketing provider**, so showtimes/seat selection power a *plan*, not a purchase.

---

## ❌ Missing Features

From the checklist (no implementation found):

1. **Camera zoom** — no zoom control. ❌
2. **Camera tap-to-focus** — not implemented. ❌
3. **Scan / document scanning** — no barcode, QR, or document scanner. ❌
4. **Delete contact** — no delete contact implementation. ❌
5. **Edit/update contact** — no edit contact implementation. ❌

Project-level gaps (not in the checklist, but relevant to the app's marketing claims):

- **Forgot-password flow** — no reset screen or password-recovery endpoint.
- **Push notifications** — the profile toggle is stored only; no notification service is wired.
- **Calendar export** — the toggle is stored only; nothing exports to a calendar.
- **Real ticket booking / checkout / payment** — deliberately absent (see [Planning vs. Booking](#-planning-vs-booking)).
- **Trailer playback** in movie details — detail screen has no video/trailer.
- **Scannable booking QR** — the pass QR is decorative.

---

## 🐛 Known Bugs / Technical Issues

### 1. Ticket screen TDZ bug (confirmed) — `app/ticket/[id].jsx:37`

When a plan is **not found** (e.g. deleted plan, or deep-linking to a missing id), the screen renders the "not found" error UI:

```jsx
if (!plan) {
  return (
    ...
    <Text style={styles.headerTitle}>{isPlan ? 'Movie Plan' : 'Digital Cinema Pass'}</Text>
    ...
  );
}

const isPlan = !plan.bookingRef || plan.bookingStatus === 'plan'; // declared AFTER the early return
```

`isPlan` is a `const` declared *after* the `if (!plan)` block, so reading it inside that block throws:

```
ReferenceError: Cannot access 'isPlan' before initialization
```

**Impact:** instead of showing "Ticket pass not found", the app **crashes** when a plan lookup fails. It does not affect the normal happy path (plan exists), which is why it has gone unnoticed. Fix: compute `isPlan` before the guard (or render a static title in the error path).

### 2. Decorative QR (by design, but misleading)

`components/ui/QRCodeView.jsx` renders the Lucide `QrCode` glyph — it is **not a real, scannable QR code** and never encodes booking data. Combined with the backend refusing real `bookingRef`/`showtimeId`, the pass cannot be scanned at a cinema.

### 3. Demo/sample data fallbacks

`FALLBACK_MOVIES`, `PRESET_SQUAD`, and `SAMPLE_CINEMAS` are clearly-labelled demo datasets gated by `DEMO_MODE`/provider flags. They are used only when a real source (TMDB key, contacts permission, Overpass provider) is unavailable — but reviewers should not confuse them with production data.

---

## 🎟️ Planning vs Booking

**CineTrip currently implements cinema *planning*, not cinema *ticket booking*.**

### What users can do today

```
Movie → Cinema → Showtime-slot → Seats → Friends → Snacks → Save Personal Plan → View/Share Digital Pass
```

- Select a movie from the catalog.
- Select a cinema from available provider data (mock/demo or real Overpass OSM).
- Pick a date + showtime slot, seats on the interactive seat map, snacks, and squad from device contacts.
- Save a **personal plan** ("Movie Night Plan", status `plan`).
- View and share a digital pass card (share sheet / clipboard).

### What CineTrip does NOT do

```
Movie → Cinema → Showtime → Seats → Payment → Real Booking → Booking Reference → Real Ticket
```

- ❌ Purchase a ticket or process payment.
- ❌ Generate a real booking reference.
- ❌ Connect to any cinema ticketing provider.
- ❌ Generate a genuinely scannable booking QR.

The **backend deliberately enforces this**: `backend/src/controllers/plannerController.js` rejects any request containing `showtimeId`, a non-`plan` `bookingStatus`, a `bookingRef`, or `ticketingConnected: true`, explaining that live ticketing is not connected. Plans are stored as personal plans only. The UI states this honestly (e.g. *"Personal plan only — no live booking until a showtime provider is connected."*).

---

## 🏗️ Architecture

```
React Native / Expo client
  └── Expo Router (app/)                     navigation + protected routes
  └── Hooks (hooks/)                         useAuth, useLocation, useContacts, useDebounce, useApi…
  └── Reusable Components (components/)      Button, Chip, Rating, Skeleton, Cards, Empty/Error states
  └── Zustand Stores (store/)                AsyncStorage-persisted, local-first, backend-synced
        ↓ REST / JSON (JWT Bearer)
  └── services/api.js                        fetch wrapper, host detection, token injection, timeout
        ↓
Node.js + Express backend (backend/)
  ├── Security: Helmet, CORS, express-rate-limit
  ├── Auth: JWT middleware, bcrypt password hashing, Google controller
  ├── Validation: Zod request schemas
  └── Controllers: Auth, Memories, Planner, Watchlist, Profile
        ↓
MongoDB via Mongoose (User, Memory, Plan, Watchlist)
```

**External services actually used**
- **TMDB** (`services/tmdb.js`) — movie discovery data; demo fallback catalogue gated by `DEMO_MODE`.
- **Supabase** (`services/supabase.js`, `services/googleAuth.js`) — Google OAuth PKCE sign-in only (`Auth.OAuth`/`exchangeCodeForSession`). Supabase is **not** used for data storage.
- **Cloudinary** (optional, `services/media/mediaUploader.js`) — media upload when env configured; local URI fallback otherwise.
- **expo-camera / expo-image-picker / expo-location / expo-contacts / expo-secure-store / expo-clipboard** — native capabilities.
- **react-native-maps** (native) / **OpenStreetMap embed** (web) — mapping.
- **OSM Overpass provider** (`services/cinema/overpassCinemaProvider.js`) — real cinema locations (no showtimes); **mock provider** for demo; **noop provider** when none is configured.

**Client:** Expo SDK 54 · React Native 0.81 · Expo Router 6 · Zustand · AsyncStorage · expo-camera · expo-image-picker · expo-location · expo-contacts · expo-secure-store · expo-linear-gradient · react-native-maps · supabase-js · lucide-react-native.

**Backend:** Node.js · Express 4 · Mongoose 8 · JSON Web Tokens · bcryptjs · Zod · Helmet · express-rate-limit · google-auth-library (token verification).

---

## 📱 Screens & Routes

| Route | Purpose | Implemented | Status |
|---|---|---|:--:|
| `app/_layout.jsx` | Root stack, SafeAreaProvider, auth guard | Stack + `Stack.Protected` routing | ✅ |
| `app/index.jsx` | Splash/redirect to tabs or auth | Auth-aware redirect via `Redirect` | ✅ |
| `app/(auth)/_layout.jsx` | Auth stack | Stack navigator | ✅ |
| `app/(auth)/login.jsx` | Sign in (email/password, Google, guest) | Fully functional | ✅ |
| `app/(auth)/register.jsx` | Create account | Fully functional | ✅ |
| `app/auth/callback.jsx` | OAuth redirect handler | Processes PKCE session | ✅ |
| `app/(tabs)/_layout.jsx` | 6-tab bar (Home, Discover, Planner, Watchlist, Memories, Profile) | 6 tabs | ✅ |
| `app/(tabs)/index.jsx` | Home dashboard | Hero, trending, cinemas, next plans, pull-to-refresh | ✅ |
| `app/(tabs)/discover.jsx` | Movie discovery | Search, categories, moods, formats, infinite scroll | ✅ |
| `app/(tabs)/planner.jsx` | Movie-night planner | Showtime slots, seat map, friends, snacks, notes, save plan | ✅ |
| `app/(tabs)/watchlist.jsx` | Watchlist | Filters, search, refresh | ✅ |
| `app/(tabs)/memories.jsx` | Memory journal | Paginated feed, stats, refresh | ✅ |
| `app/(tabs)/profile.jsx` | Profile & preferences | Edit, formats, chains, genres, toggles, logout | ✅ |
| `app/movie/[id].jsx` | Movie details | Metadata, cast, formats, availability, watchlist, share | ✅ |
| `app/ticket/[id].jsx` | Digital pass | Pass card, decorative QR, copy/share, log memory | ⚠️ (TDZ bug) |
| `app/memory/create.jsx` | Camera + memory logger | Camera, video, gallery, journal form | ✅ |
| `app/map.jsx` | Cinema map | Map, markers, locate me, cinema list/select | ✅ |
| `app/contacts.jsx` | Contacts & squad | Search, select, call, add to plan | ✅ |

---

## 🔐 Authentication Flow (actual)

1. **Email/password** — `POST /api/auth/register` then `POST /api/auth/login`; bcrypt-verified; returns CineTrip JWT (30 days).
2. **Google OAuth** — `services/googleAuth.js` opens `WebBrowser` auth session against Supabase, exchanges the code for a session (`processAuthSessionFromUrl`), then `POST /api/auth/google` with the resulting token. The backend verifies via Google tokeninfo / userinfo / Supabase Auth and issues its own CineTrip JWT. `app/auth/callback.jsx` handles the redirect.
3. **Guest mode** — `useAuthStore.signInAsGuest()` allows full exploration + local data without an account.
4. **Token persistence** — `services/auth.js`: `expo-secure-store` (native) / `localStorage` (web) / in-memory fallback, key `cinetrip_auth_token`.
5. **Protected routes** — `app/_layout.jsx` uses `Stack.Protected`; `app/index.jsx` redirects based on `isAuthenticated`. Backend guards every non-auth route with `authenticateToken`; `services/api.js` injects `Authorization: Bearer <token>`.
6. **Session restore** — `useAuthStore.initialize()` restores the token and validates it against `GET /api/auth/me` (2.5 s timeout).
7. **Logout** — clears token + auth state and redirects to login.

---

## 🎬 Movie Discovery

- **TMDB client** (`services/tmdb.js`) with image URI builder; **live Now Playing** catalogue with AsyncStorage caching/freshness (`hooks/useMovieCatalog.js`).
- **Discover** (`app/(tabs)/discover.jsx`): debounced search (`hooks/useDebounce.js`), categories (Now Playing / Trending / Upcoming), format + genre/mood filters, infinite scroll pagination, skeleton loaders.
- **Movie detail** (`app/movie/[id].jsx`): rating, year, runtime, genres, top cast, available formats (FormatBadge), theatrical availability (can-book/upcoming/unavailable via provider), share, watchlist toggle, and **"Plan Movie Night"** → pre-fills the planner. **No trailer playback** — the checklist's "trailer" is not part of the supplied PDF, and none exists.
- **Watchlist** (`store/useWatchlistStore.js`): optimistic add/remove, format preference, filter/search, backend sync.
- Availability is driven by the cinema provider; in demo mode the sample catalogue is used with explicit DEMO labelling.

---

## 📍 Location & Cinema Discovery

- **Permissions:** foreground location permission requested on demand; denied state offers retry or a "browse without location" bypass (`app/map.jsx`).
- **Current + last-known location:** `useLocation` / `services/location.js`.
- **Live watcher:** `watchPositionAsync` with `subscription.remove()` cleanup on stop/unmount.
- **Reverse geocoding:** coordinates → readable address (city-level on Home; full address in `reverseGeocode()`).
- **Map:** `react-native-maps` `MapView` on native; OpenStreetMap iframe embed on web; markers for user and cinemas; `animateToRegion` for locate-me and per-cinema focus.
- **Cinema providers** (`services/cinema/`):
  - `noopCinemaProvider` — default when nothing is configured: truthful "no live showtimes" state.
  - `mockCinemaProvider` — simulated theatres/showtimes/seats, labelled DEMO, only honoured with `DEMO_MODE=true`.
  - `overpassCinemaProvider` — real OSM/Overpass cinema query results (real locations, **no showtimes/seats**).
- **Honest limits:** real device location is used; real OSM cinema data is used when the Overpass provider is selected; **live showtimes and real ticketing are not integrated** — seat/showtime selection feeds a personal plan.

---

## 📷 Camera & Memories

- **Permissions:** `useCameraPermissions`, `useMicrophonePermissions`; denied → explanatory alert.
- **Capture:** photo (`takePictureAsync`, quality 0.85), video (`recordAsync`, 60 s cap), start/stop shutter, front/back flip, flash modes.
- **Preview & retake:** captured media preview card with Retake / remove.
- **Gallery:** `launchImageLibraryAsync` accepts both photos and videos.
- **Upload:** `MediaUploader` → Cloudinary multipart upload when configured, otherwise honest local-URI storage (`mediaUploader.js`).
- **Persistence:** `useMemoryStore.addMemory` saves locally (AsyncStorage) and syncs to `POST /api/memories` when authenticated; memory list supports pagination (`page`/`limit`) and deletion.
- **Journal fields:** movie, cinema, format, rating, story, best moment, snack, companions, photo/video URI, watched date.

---

## 👥 Contacts & Squad

- **Permission:** `Contacts.requestPermissionsAsync`; denied state links to device settings (`app/contacts.jsx`).
- **Retrieval:** `getContactsAsync` (page size 100–200), mapped to id/name/phone/email/avatar.
- **Search:** client-side filter by name/phone/email (`useContacts.searchContacts`).
- **Selection/linking:** selected contacts are pushed into the planner draft friends via `toggleDraftFriend` ("Added to Plan!" → Planner).
- **Device app linking:** `Linking.openURL('tel:...')` opens the phone dialer for a contact.
- **Fallback (demo):** `PRESET_SQUAD` sample squad is used only when permission fails/returns nothing (clearly labelled as a preset).

**Not implemented:** contact create UI (helper only, unwired), delete contact, edit contact.

---

## 💾 Data Persistence

- **Zustand stores** with `persist` middleware using AsyncStorage for: planner, memories, watchlist, preferences, auth (token handled separately by `services/auth.js`).
- **Local-first behavior:** stores read/write locally immediately; when authenticated they sync to the backend (`/api/plans`, `/api/memories`, `/api/watchlist`, `/api/profile`). Guest/local data syncs once an account is created/signed in.
- **Backend sync:** `usePlannerStore.fetchPlans`, `useMemoryStore.fetchMemories` (paginated), `useWatchlistStore.fetchWatchlist`, `usePreferencesStore.updateProfile`.
- **Media:** stored as URI strings (local path or Cloudinary URL).
- **Catalogue cache:** TMDB Now Playing cached in AsyncStorage with TTL freshness.

---

## 🌐 API Documentation

All endpoints below exist in `backend/src/routes/`. No invented endpoints.

| Method | Endpoint | Purpose | Auth |
|---|---|---|:--:|
| `POST` | `/api/auth/register` | Create account (name/email/password) | No |
| `POST` | `/api/auth/login` | Login with email/password → JWT | No |
| `POST` | `/api/auth/google` | Verify Google/Supabase token → CineTrip JWT | No |
| `GET` | `/api/auth/me` | Fetch current user | Yes |
| `GET` | `/api/memories` | List memories (`?page&limit`, `hasNextPage`) | Yes |
| `GET` | `/api/memories/:id` | Get one memory | Yes |
| `POST` | `/api/memories` | Create memory | Yes |
| `PUT` | `/api/memories/:id` | Update memory | Yes |
| `DELETE` | `/api/memories/:id` | Delete memory | Yes |
| `GET` | `/api/plans` | List plans (`?page&limit`, `hasNextPage`) | Yes |
| `GET` | `/api/plans/:id` | Get one plan | Yes |
| `POST` | `/api/plans` | Create a **personal plan** (rejects ticketing fields) | Yes |
| `PUT` | `/api/plans/:id` | Update plan (rejects ticketing fields) | Yes |
| `DELETE` | `/api/plans/:id` | Delete plan | Yes |
| `GET` | `/api/watchlist` | List watchlist | Yes |
| `POST` | `/api/watchlist` | Add movie (upsert) | Yes |
| `DELETE` | `/api/watchlist/:movieId` | Remove movie | Yes |
| `GET` | `/api/profile` | Get profile | Yes |
| `PUT` | `/api/profile` | Update profile | Yes |
| `GET` | `/health` | Server health check | No |

---

## 🗄️ Database

MongoDB via Mongoose. Collections/models (`backend/src/models/`):

- **User** — name, email (unique), bcrypt `passwordHash` (select:false), `googleId`, `provider`, `avatar`, `profile` (city, preferredFormat, preferredChain, favoriteGenres, notificationsEnabled, autoExportCalendar, themeMode); pre-save hashing + `comparePassword`; `toSafeObject()` redacts the hash. CRUD: register, login, google, me, profile get/update.
- **Memory** — user ref, movie (id/title/posters), watchedDate, experienceType, cinemaName, rating, story, favoriteMoment, companions, snackHighlight, `photoUri`, `videoUri`, location. Full CRUD, paginated list.
- **Plan** — user ref, movie, cinema, date/time/slot, friends, notes, seats, snacks, status, `bookingStatus:'plan'`, `bookingRef:''`, `showtimeId:''`, `ticketingConnected:false`. Full CRUD; create/update **rejects live-ticketing fields**.
- **Watchlist** — user ref, movieId (unique per user), movieData, preferredFormat, addedAt. Add (upsert) / list / delete.

---

## 🔒 Security

Verified in code:

- **JWT** — signed 30-day tokens; `authenticateToken` middleware verifies on every protected route.
- **Password hashing** — bcryptjs (pre-save + compare).
- **Validation** — Zod schemas on all mutating endpoints; structured 400 responses.
- **Rate limiting** — `express-rate-limit`: auth routes (15 min / 100 req) plus a global `/api` limiter (1 min / 500 req).
- **Helmet** — security headers on the Express app.
- **CORS** — configured in `backend/src/app.js` (permissive for local dev).
- **Centralized error handling** — maps validation, duplicate-key, cast, and JWT errors (`errorHandler.js`).
- **Environment variables** — frontend `.env.example` and `backend/.env.example`; secrets via `process.env` (JWT_SECRET, Mongo URI, Supabase, Google, TMDB, Cloudinary).
- **Protected routes** — client (`Stack.Protected`) and server (`authenticateToken`).
- **Token storage** — `expo-secure-store` keychain/keystore on native.

**Not present:** password reset, push notification auth, payment processing (intentionally).

---

## 🎨 UI / UX

- **Design system:** dark cinematic theme with typography/spacing/radius/shadow tokens (`constants/theme.js`), reusable primitives and cards.
- **Responsive:** RN layouts + web iframe/map adapters; mobile-first but web viewport supported via Expo web + metro config.
- **States:** loading skeletons (movie/cinema/memory), full EmptyState and ErrorState components, permission-denied screens, offline/sync banner.
- **Forms:** login/register with validation; profile edit; journal form.
- **Dialogs:** confirmation alerts (logout, delete memory) and feedback alerts (saved/copied/added).
- **Notifications:** only `Alert.alert` in-app alerts. The "Notifications" toggle is a **stored preference only**; no push service.
- **Theme preference:** stored and exposed via `useTheme`, but **does not swap the rendered palette** (static `COLORS`) — see Partial Features.

---

## 🧪 Verification

### Verified from code
Every item above was confirmed by static code tracing (routes, hooks, services, stores, backend controllers/models/validators) on 29 Aug 2026.

### Runtime verified
**None.** The app and backend were **not executed** in this audit environment (no emulator/simulator/browser run, no live API calls, no device permission flows). No runtime claim is made.

### Not runtime verified
All device-dependent flows — camera permission/capture/recording, GPS fixes, contact permission, OSM/Overpass fetch, Cloudinary upload, Google OAuth round-trip, seat-map touch interactions, pull-to-refresh and pagination against a live backend — behave as traced in code but were not exercised at runtime. The ticket-screen TDZ bug is a code-path crash (plan missing) and was identified statically.

---

## 🚧 Roadmap

Prioritised by real-world impact:

### P0 — Critical
1. **Fix the ticket-screen TDZ bug** (`app/ticket/[id].jsx:37`) so the "plan not found" path renders instead of crashing.
2. **Decide on real ticketing** — either connect a real showtime/ticketing provider (then wire `showtimeId`/`bookingRef`/`ticketingConnected` through the backend) or keep the honest "personal plan" positioning.
3. **Generate a genuinely scannable QR** if admission passes are a goal (e.g. `react-native-qrcode-svg`); otherwise remove/re-label the decorative QR.

### P1 — Important
4. **Forgot-password flow** (UI + backend reset endpoint).
5. **Complete theme switching** — make `themeMode` actually swap palettes.
6. **Trailer playback** in movie details (currently absent).
7. **Location/cinema data** — wire a real showtime provider or richer Overpass usage; make the map address search functional.

### P2 — Improvements
8. **Notifications** — implement a real (remote/PN) notification path or remove the toggle.
9. **Calendar export** — implement or remove the stored toggle.
10. **Contacts CRUD** — wire `createDeviceContact` into UI; add edit/delete.
11. **Camera polish** — zoom, tap-to-focus, scan, torch, real video preview.
12. **Testing coverage** — add unit/integration tests for stores, API wrapper, and the backend (currently none).

---

## 🛠️ Quick Start

```bash
# 1. Install dependencies (root + backend)
npm install
cd backend && npm install && cd ..

# 2. Configure environment (see .env.example files)
#    - TMDB key/token (for verified feeds)
#    - EXPO_PUBLIC_DEMO_MODE, EXPO_PUBLIC_CINEMA_PROVIDER
#    - Supabase URL + anon key + Google client id (for Google sign-in)
#    - Optional Cloudinary credentials (for real media upload)

# 3. Run MongoDB, then the backend
cd backend && npm run dev          # http://localhost:5000

# 4. Run the client
npx expo start -c                  # press w / a / i, or scan with Expo Go
```

---

## 📄 License

MIT License.