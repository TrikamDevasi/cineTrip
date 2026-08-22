"use client";

import Link from "next/link";
import { Film, Github, Heart, ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-glow" />
      <div className="container footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <Film size={20} />
              <span>
                CINEPHILES <span className="accent">WATCH</span>
              </span>
            </Link>
            <p className="footer-tagline">
              Your premium movie discovery companion. Powered by TMDB, Trakt & AI.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Browse</h4>
            <Link href="/" className="footer-link">Home</Link>
            <Link href="/series" className="footer-link">Series</Link>
            <Link href="/search" className="footer-link">Search</Link>
            <Link href="/watchlist" className="footer-link">Watchlist</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Resources</h4>
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              TMDB <ExternalLink size={12} />
            </a>
            <a
              href="https://trakt.tv/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Trakt <ExternalLink size={12} />
            </a>
            <a
              href="https://www.imdb.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              IMDb <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            <Heart size={14} style={{ color: "var(--color-accent)" }} />
            Built with passion for cinema. Data from TMDB & Trakt.
          </p>
          <p className="footer-copy">
            &copy; {currentYear} Cinephiles Watch. This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>

      <style jsx>{`
        .site-footer {
          position: relative;
          background: var(--color-surface);
          border-top: 1px solid var(--color-border);
          padding: 3rem 0 1.5rem;
          margin-top: 4rem;
          overflow: hidden;
        }
        .footer-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
          opacity: 0.5;
        }
        .footer-inner {
          position: relative;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 2.5rem;
        }
        .footer-brand {
          max-width: 340px;
        }
        .footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
          text-decoration: none;
        }
        .footer-logo .accent {
          color: var(--color-accent);
        }
        .footer-tagline {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          line-height: 1.6;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .footer-col-title {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
          margin-bottom: 0.5rem;
        }
        .footer-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .footer-link:hover {
          color: var(--color-text-primary);
        }
        .footer-bottom {
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .footer-copyright {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--color-text-secondary);
        }
        .footer-copy {
          font-size: 0.7rem;
          color: var(--color-text-muted);
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .footer-brand {
            max-width: none;
          }
        }
      `}</style>
    </footer>
  );
}
