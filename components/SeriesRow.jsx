"use client";

import { useRef, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import SeriesCard from "./SeriesCard";

export default function SeriesRow({ title, series = [] }) {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 10);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (!series || series.length === 0) return null;

  return (
    <section className="section" style={{ marginBottom: "2rem" }}>
      <div className="row-header">
        <h2 className="row-title">{title}</h2>
        <button
          className="row-see-all"
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>View All</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="row-container" onMouseEnter={handleScroll}>
        {/* SCROLL BUTTONS */}
        {showLeft && (
          <button
            className="scroll-btn left"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(10, 10, 15, 0.9)",
              border: "1px solid var(--color-border)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {showRight && (
          <button
            className="scroll-btn right"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            style={{
              position: "absolute",
              right: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(10, 10, 15, 0.9)",
              border: "1px solid var(--color-border)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            <ChevronRight size={24} />
          </button>
        )}

        <div className="row-scroll" ref={scrollRef} onScroll={handleScroll}>
          {series.map((item) => (
            <SeriesCard key={item.id} series={item} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .row-see-all {
          opacity: 0;
          transition: var(--transition);
        }
        .section:hover .row-see-all {
          opacity: 1;
        }
        .scroll-btn {
          opacity: 0;
          transition: var(--transition);
        }
        .row-container:hover .scroll-btn {
          opacity: 1;
        }
        @media (max-width: 640px) {
          .scroll-btn {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
