"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Home,
  Compass,
  CalendarDays,
  Heart,
  History,
  User,
  Search, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Sparkles,
  ChevronRight,
  Film,
  MapPin
} from "lucide-react";
import AiRecommendations from "./AIPanelRecommend";
import AIWhatToWatchModal from "./AIWhatToWatchModal";
import useWatchlistStore from "@/store/useWatchlistStore";
import { usePlannerStore } from "@/store/usePlannerStore";
import { useThemeStore } from "@/store/useThemeStore";

let cachedPopular = null;
const cachedSearch = {};

const GENRES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  18: "Drama",
  27: "Horror",
  878: "Sci-Fi",
  10749: "Romance",
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [aiOpen, setAiOpen] = useState(false);
  const [whatToWatchOpen, setWhatToWatchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { watchlist } = useWatchlistStore();
  const { plans } = usePlannerStore();
  const { theme, toggleTheme } = useThemeStore();

  const abortRef = useRef(null);
  const boxRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  const upcomingPlansCount = plans?.filter((p) => p.status === "upcoming").length || 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (cachedPopular) {
      setPopular(cachedPopular);
      return;
    }
    fetch("/api/tmdb/trending?page=1")
      .then((r) => r.json())
      .then((d) => {
        const top = (d.results || []).slice(0, 5);
        cachedPopular = top;
        setPopular(top);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setResults([]);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    if (cachedSearch[q]) {
      setResults(cachedSearch[q]);
      setLoading(false);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(q)}&page=1`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        const items = (data.results || []).slice(0, 6);
        cachedSearch[q] = items;
        setResults(items);
      } catch (e) {
        if (e.name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  const handleKeyDown = (e) => {
    const list = results.length > 0 ? results : popular;
    if (!list.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && list[activeIndex]) {
        e.preventDefault();
        selectMovie(list[activeIndex]);
      } else if (query.trim()) {
        router.push(`/discover?q=${encodeURIComponent(query)}`);
        setResults([]);
        setQuery("");
      }
    } else if (e.key === "Escape") {
      setResults([]);
      setActiveIndex(-1);
    }
  };

  const selectMovie = (m) => {
    setResults([]);
    setQuery("");
    setActiveIndex(-1);
    router.push(m.media_type === "tv" ? `/series/${m.id}` : `/movie/${m.id}`);
  };

  return (
    <>
      <nav className={`main-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          {/* BRAND LOGO */}
          <Link href="/" className="navbar-brand">
            <div className="brand-icon-wrapper">
              <Film size={20} className="brand-film-icon" />
              <span className="brand-dot" />
            </div>
            <div className="brand-text-container">
              <span className="brand-name">Cine<span className="brand-accent">Trip</span></span>
              <span className="brand-tagline">CINEMA & OUTING COMPANION</span>
            </div>
          </Link>

          {/* SEARCH BAR (Desktop) */}
          <div className="navbar-search-wrapper" ref={boxRef}>
            <div className="navbar-search-input-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search movies, series, cinemas..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="navbar-search-input"
              />
              {loading && <div className="search-spinner" />}
            </div>

            {/* AUTOCOMPLETE DROPDOWN */}
            {(results.length > 0 || (query.trim() && popular.length > 0)) && (
              <div className="search-dropdown-menu">
                <div className="search-dropdown-list">
                  {(results.length > 0 ? results : popular).map((m, i) => (
                    <div
                      key={m.id}
                      onClick={() => selectMovie(m)}
                      className={`search-dropdown-item ${i === activeIndex ? "active" : ""}`}
                    >
                      <div className="search-item-poster">
                        <Image
                          src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : "/default-1778606634.jpg"}
                          alt={m.title || m.name || "Poster"}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div className="search-item-info">
                        <div className="search-item-title">
                          {m.title || m.name}
                        </div>
                        <div className="search-item-meta">
                          <span className="search-item-genre">
                            {GENRES[m.genre_ids?.[0]] || (m.media_type === "tv" ? "TV Series" : "Movie")}
                          </span>
                          <span className="search-item-year">
                            {(m.release_date || m.first_air_date)?.slice(0, 4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div 
                  onClick={() => {
                    router.push(`/discover?q=${encodeURIComponent(query)}`);
                    setResults([]);
                    setQuery("");
                  }}
                  className="search-dropdown-footer"
                >
                  <span>Explore all results in Discover</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            )}
          </div>

          {/* NAV LINKS (Desktop) */}
          <div className="nav-links">
            <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
              <Home size={17} />
              <span>Home</span>
            </Link>

            <Link href="/discover" className={`nav-link ${pathname.startsWith("/discover") || pathname.startsWith("/search") ? "active" : ""}`}>
              <Compass size={17} />
              <span>Discover</span>
            </Link>

            <Link href="/planner" className={`nav-link ${pathname.startsWith("/planner") ? "active" : ""}`}>
              <CalendarDays size={17} />
              <span>Planner</span>
              {upcomingPlansCount > 0 && (
                <span className="nav-badge count-badge">
                  {upcomingPlansCount}
                </span>
              )}
            </Link>

            <Link href="/watchlist" className={`nav-link ${pathname === "/watchlist" ? "active" : ""}`}>
              <Heart size={17} />
              <span>Watchlist</span>
              {watchlist.length > 0 && (
                <span className="nav-badge count-badge">
                  {watchlist.length}
                </span>
              )}
            </Link>

            <Link href="/history" className={`nav-link ${pathname === "/history" ? "active" : ""}`}>
              <History size={17} />
              <span>History</span>
            </Link>

            <Link href="/profile" className={`nav-link ${pathname === "/profile" ? "active" : ""}`}>
              <User size={17} />
              <span>Profile</span>
            </Link>
            
            <button
              onClick={() => setWhatToWatchOpen(true)}
              className="btn-primary mood-btn"
              title="AI Mood Recommendations"
            >
              <Sparkles size={15} />
              <span className="btn-text">AI Moods</span>
            </button>

            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>

          {/* MOBILE CONTROLS */}
          <div className="mobile-controls">
            <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-drawer">
            <div className="drawer-header">
              <div className="drawer-title">CineTrip Menu</div>
              <button className="close-drawer-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className={pathname === "/" ? "active" : ""}>
              <Home size={20} />
              <span>Home (Trending & Popular)</span>
            </Link>

            <Link href="/discover" onClick={() => setMobileMenuOpen(false)} className={pathname.startsWith("/discover") ? "active" : ""}>
              <Compass size={20} />
              <span>Discover (Genres & Search)</span>
            </Link>

            <Link href="/planner" onClick={() => setMobileMenuOpen(false)} className={pathname.startsWith("/planner") ? "active" : ""}>
              <CalendarDays size={20} />
              <span>Trip Planner {upcomingPlansCount > 0 ? `(${upcomingPlansCount})` : ""}</span>
            </Link>

            <Link href="/watchlist" onClick={() => setMobileMenuOpen(false)} className={pathname === "/watchlist" ? "active" : ""}>
              <Heart size={20} />
              <span>Watchlist ({watchlist.length})</span>
            </Link>

            <Link href="/history" onClick={() => setMobileMenuOpen(false)} className={pathname === "/history" ? "active" : ""}>
              <History size={20} />
              <span>History (Nights & Memories)</span>
            </Link>

            <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className={pathname === "/profile" ? "active" : ""}>
              <User size={20} />
              <span>Profile & Settings</span>
            </Link>
            
            <button onClick={() => { setWhatToWatchOpen(true); setMobileMenuOpen(false); }}>
              <Sparkles size={20} />
              <span>AI Mood Matcher</span>
            </button>

            <button onClick={() => { setAiOpen(true); setMobileMenuOpen(false); }}>
              <Sparkles size={20} />
              <span>Magic AI Film Breakdowns</span>
            </button>
            
            <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}>
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </>
      )}

      <AiRecommendations isOpen={aiOpen} onClose={() => setAiOpen(false)} />
      <AIWhatToWatchModal isOpen={whatToWatchOpen} onClose={() => setWhatToWatchOpen(false)} />
    </>
  );
}
