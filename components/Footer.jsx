"use client";

import Link from "next/link";
import { Film, Github, Heart, ExternalLink, Sparkles, CalendarDays, Compass, User } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-glow" />
      <div className="container footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <Film size={22} className="accent" />
              <span>
                Cine<span className="accent">Trip</span>
              </span>
            </Link>
            <p className="footer-tagline">
              Your ultimate cinema outing planner, mood discovery engine, and movie memories journal.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Navigation</h4>
            <Link href="/" className="footer-link">Home (Trending)</Link>
            <Link href="/discover" className="footer-link">Discover & Genres</Link>
            <Link href="/planner" className="footer-link">Trip Planner</Link>
            <Link href="/watchlist" className="footer-link">Watchlist</Link>
            <Link href="/history" className="footer-link">History & Memories</Link>
            <Link href="/profile" className="footer-link">Profile & Settings</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Features</h4>
            <span className="footer-link">🍿 Cinema Outing Planner</span>
            <span className="footer-link">🎯 AI Mood Matcher</span>
            <span className="footer-link">🧠 AI Film Breakdowns</span>
            <span className="footer-link">🎫 Digital Boarding Passes</span>
            <span className="footer-link">📸 Movie Nights Scrapbook</span>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Powered By</h4>
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              TMDB API <ExternalLink size={12} />
            </a>
            <a
              href="https://trakt.tv/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Trakt Intelligence <ExternalLink size={12} />
            </a>
            <a
              href="https://github.com/TrikamDevasi/cineTrip"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub Repository <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {currentYear} CineTrip. Built with passion for cinema lovers.
          </p>
          <div className="footer-badges">
            <span className="badge-pill">Next.js 14</span>
            <span className="badge-pill">AI Powered</span>
            <span className="badge-pill">MongoDB Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
