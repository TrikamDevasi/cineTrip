"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export default function Screenshots({ images = [] }) {
  const [selectedImg, setSelectedImg] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setSelectedImg(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (selectedImg) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedImg]);

  if (!Array.isArray(images) || images.length === 0) return null;

  return (
    <div style={{ marginTop: "40px" }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px", color: "var(--color-text-primary)" }}>
        Screenshots
      </h3>

      <div className="screenshots-scroll-container">
        {images.slice(0, 10).map((img, i) => (
          <div 
            key={i} 
            className="screenshot-item"
            onClick={() => setSelectedImg(`https://image.tmdb.org/t/p/original${img.file_path}`)}
          >
            <Image
              src={`https://image.tmdb.org/t/p/w780${img.file_path}`}
              alt={`Screenshot ${i + 1}`}
              fill
              sizes="(max-width: 640px) 240px, 320px"
              style={{ objectFit: "cover" }}
              priority={i < 2}
            />
          </div>
        ))}
      </div>

      {mounted && selectedImg && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedImg(null)} style={{ zIndex: 3000, padding: 0, background: "rgba(0,0,0,0.9)" }}>
          <button 
            onClick={() => setSelectedImg(null)}
            className="screenshot-close-btn"
            aria-label="Close fullscreen"
          >
            <X size={32} />
          </button>
          <div 
            style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImg}
              alt="Fullscreen screenshot"
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          </div>
        </div>,
        document.body
      )}

      <style jsx>{`
        .screenshot-close-btn {
          position: fixed;
          top: 24px;
          right: 24px;
          color: white;
          z-index: 3010;
          background: rgba(0,0,0,0.7);
          border-radius: 50%;
          padding: 10px;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .screenshot-close-btn:hover {
          background: rgba(255,0,0,0.8);
          border-color: rgba(255,255,255,0.8);
          transform: scale(1.1);
        }

        .screenshots-scroll-container {
          display: flex;
          overflow-x: auto;
          gap: 16px;
          padding-bottom: 16px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Hide scrollbar for cleaner look */
        .screenshots-scroll-container::-webkit-scrollbar {
          height: 6px;
        }
        .screenshots-scroll-container::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
        }
        .screenshots-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
        }

        .screenshot-item {
          position: relative;
          width: 320px;
          aspect-ratio: 16 / 9;
          flex-shrink: 0;
          border-radius: var(--radius-md);
          overflow: hidden;
          cursor: pointer;
          scroll-snap-align: start;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid var(--color-border);
        }

        .screenshot-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.4);
          border-color: var(--color-border-hover);
        }

        @media (max-width: 640px) {
          .screenshot-item {
            width: 240px;
          }
          .screenshot-close-btn {
            top: 16px;
            right: 16px;
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
}
