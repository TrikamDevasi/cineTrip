"use client";

import { useEffect, useRef } from "react";

const TITLE_ID = "trailer-modal-title";

export default function TrailerModal({ videoKey, onClose }) {
  const closeBtnRef = useRef(null);

  // Escape key closes the modal
  useEffect(() => {
    if (!videoKey) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [videoKey, onClose]);

  // Lock body scroll and focus close button on open
  useEffect(() => {
    if (!videoKey) return;
    document.body.style.overflow = "hidden";
    setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => { document.body.style.overflow = ""; };
  }, [videoKey]);

  if (!videoKey) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
        padding: "1.5rem",
      }}
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        style={{
          width: "100%",
          maxWidth: "860px",
          background: "#0a0a0f",
          padding: "0",
          borderRadius: "var(--radius-lg)",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visually hidden title for screen readers */}
        <span
          id={TITLE_ID}
          style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)" }}
        >
          Movie Trailer
        </span>

        {/* 16:9 iframe wrapper */}
        <div style={{ position: "relative", paddingTop: "56.25%", background: "#000" }}>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
            title="Movie Trailer"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </div>

        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Close trailer"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "8px 14px",
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: 600,
            backdropFilter: "blur(4px)",
            zIndex: 1,
          }}
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
}
