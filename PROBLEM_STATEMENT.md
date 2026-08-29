# 🎬 CineTrip — Project Problem Statement (Short Version)

**Project Title:** CineTrip — Theatrical Trip Planner & Cinephile Journal  
**Domain:** Mobile Application Development (React Native / Node.js / MongoDB)  

---

## 📌 Problem Statement

> **"Existing movie applications are strictly transactional—they focus only on selling tickets while neglecting the broader movie-going experience. Modern movie-goers face app fragmentation (switching between 4–5 apps for discovery, squad coordination, map navigation, and photos), a lack of premium format intelligence (IMAX 70mm, Dolby, 4DX), and no dedicated way to preserve theatrical memories once physical ticket stubs disappear."**

---

## ⚠️ Key Challenges (The Gaps)

1. **App Fragmentation:** Users must juggle multiple disconnected apps (IMDb $\rightarrow$ Ticketing $\rightarrow$ WhatsApp group chats $\rightarrow$ Maps $\rightarrow$ Photo Gallery) to organize a single movie outing.
2. **No Format Intelligence:** Standard apps treat regular screens the same as certified IMAX 70mm, Dolby Cinema, or 4DX, making it difficult for enthusiasts to find premium experiences.
3. **High Group Coordination Friction:** Planning showtimes, inviting friends, managing snack choices, and distributing passes creates constant back-and-forth communication.
4. **Lost Cinema Memories:** Physical ticket stubs have vanished. Users have no dedicated personal archive to log auditorium vibes, seat notes, companions, photos, and video memories.
5. **No Offline Reliability:** Many theater halls and basements lack network connectivity, causing standard web/cloud-only ticketing apps to fail.

---

## 💡 Proposed Solution: CineTrip

**CineTrip** is a unified, offline-capable mobile ecosystem that covers the entire cinema journey: **Discover $\rightarrow$ Plan $\rightarrow$ Experience $\rightarrow$ Preserve**.

* **Smart Discovery:** TMDB movie feeds with mood selectors and certified format badges (IMAX, Dolby Cinema, 4DX).
* **Movie Night Planner:** Interactive trip builder, concession picker, native device contact invitations, and digital boarding-pass tickets with QR codes.
* **Cinema Locator:** Live GPS proximity tracking and interactive maps to locate certified screens.
* **Cinephile Journal:** In-app camera, video recorder, auditorium rating, and companion logging with cloud synchronization.
* **Offline First & Secure:** Built with JWT authentication, hardware keychain storage (`expo-secure-store`), and offline data caching.

---

## 🎯 Key Objectives

* Eliminate multi-app switching by uniting discovery, planning, ticketing UI, and journaling in one app.
* Provide native smartphone integration (Camera, GPS, Contacts, Secure Storage).
* Ensure reliable offline access to passes and plans inside zero-signal auditoriums.
