# CineTrip Implementation Tasks

## Phase 1 — Dependencies
- [x] Install expo-secure-store
- [x] Install expo-image-picker
- [x] Create backend package.json and install backend deps

## Phase 2 — Backend Foundation
- [x] backend/package.json
- [x] backend/src/app.js
- [x] backend/src/server.js
- [x] backend/src/config/database.js
- [x] backend/src/models/User.js
- [x] backend/src/models/Memory.js
- [x] backend/src/models/Plan.js
- [x] backend/src/models/Watchlist.js
- [x] backend/src/middleware/auth.js
- [x] backend/src/middleware/errorHandler.js
- [x] backend/src/validators/authValidators.js
- [x] backend/src/validators/memoryValidators.js
- [x] backend/src/validators/planValidators.js
- [x] backend/src/validators/profileValidators.js
- [x] backend/src/controllers/authController.js
- [x] backend/src/controllers/memoriesController.js
- [x] backend/src/controllers/plannerController.js
- [x] backend/src/controllers/watchlistController.js
- [x] backend/src/controllers/profileController.js
- [x] backend/src/routes/auth.js
- [x] backend/src/routes/memories.js
- [x] backend/src/routes/planner.js
- [x] backend/src/routes/watchlist.js
- [x] backend/src/routes/profile.js
- [x] backend/.env.example

## Phase 3 — Frontend Auth
- [x] services/auth.js (SecureStore token management)
- [x] services/api.js (centralized API client)
- [x] store/useAuthStore.js
- [x] app/(auth)/_layout.js
- [x] app/(auth)/login.js
- [x] app/(auth)/register.js
- [x] app/_layout.js (protected routing)

## Phase 4 — Connect Stores to Backend
- [x] store/useMemoryStore.js (backend sync)
- [x] store/usePlannerStore.js (backend sync)
- [x] store/useWatchlistStore.js (backend sync)
- [x] store/usePreferencesStore.js (remove hardcoded identity)

## Phase 5 — Camera Enhancements
- [x] app/memory/create.js (flip, flash, zoom, video, gallery)
- [x] app.json (microphone permission)

## Phase 6 — Location & Map
- [x] services/location.js (watch, lastKnown, search)
- [x] app/map.js (map screen)

## Phase 7 — Contacts
- [x] services/contacts.js (create, edit, delete, open native)
- [x] app/contacts.js (dedicated contacts screen)

## Phase 8 — Custom Hooks
- [x] hooks/useAuth.js
- [x] hooks/useCamera.js
- [x] hooks/useLocation.js
- [x] hooks/useContacts.js
- [x] hooks/useMediaPicker.js
- [x] hooks/useDebounce.js
- [x] hooks/useApi.js
- [x] hooks/useTheme.js

## Phase 9 — Theme System
- [x] constants/theme.js (light/dark tokens, TYPOGRAPHY)
- [x] Update all screens for theme awareness

## Phase 10 — Pagination
- [x] discover.js pagination (infinite scroll)
- [x] memories.js pagination

## Phase 11 — Error/Loading/Empty States
- [x] Audit all screens

## Phase 12 — Environment Files
- [x] .env.example (frontend)
- [x] backend/.env.example

## Phase 13 — Final Audit
- [x] Run 137-feature checklist
- [x] Final report
