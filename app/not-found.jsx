"use client";

import Link from "next/link";
import { Film, Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {

  return (
    <div className="not-found-page">
      <div className="not-found-glow" />

      <div className="not-found-content">
        <div className="not-found-icon">
          <Film size={64} />
        </div>

        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">This Scene Doesn&apos;t Exist</h2>
        <p className="not-found-desc">
          The page you&apos;re looking for has been moved, deleted, or never existed.
          Let&apos;s get you back to discovering great movies.
        </p>

        <div className="not-found-actions">
          <Link href="/" className="btn-primary not-found-btn">
            <Home size={18} />
            <span>Back to Home</span>
          </Link>
          <Link href="/search" className="btn-secondary not-found-btn">
            <Search size={18} />
            <span>Search Movies</span>
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="not-found-back"
        >
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
      </div>

      <style jsx>{`
        .not-found-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          padding: 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .not-found-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, var(--color-accent-glow), transparent 70%);
          opacity: 0.15;
          pointer-events: none;
        }
        .not-found-content {
          position: relative;
          z-index: 1;
          max-width: 480px;
        }
        .not-found-icon {
          color: var(--color-accent);
          opacity: 0.6;
          margin-bottom: 1.5rem;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .not-found-code {
          font-size: 6rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, var(--color-accent), #ff4d4d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        .not-found-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--color-text-primary);
        }
        .not-found-desc {
          font-size: 1rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .not-found-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .not-found-btn {
          min-height: 48px;
        }
        .not-found-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--color-text-muted);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.15s ease;
          padding: 8px;
          min-height: auto;
        }
        .not-found-back:hover {
          color: var(--color-text-primary);
        }
        @media (max-width: 480px) {
          .not-found-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}
