"use client";

import { useEffect, useState } from "react";

export default function SearchOverlay({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function searchMovies() {
      if (!query) return;

      try {
        const res = await fetch(`/api/tmdb/search?q=${query}`);
        const data = await res.json();
        setResults(data?.data?.results || []);
      } catch (error) {
        console.error("Search error:", error);
      }
    }

    searchMovies();
  }, [query]);

  return (
    <div
      style={{
        position: "absolute",
        right: "20px",
        top: "70px",
        width: "300px",
        background: "#111",
        padding: "10px",
        borderRadius: "8px",
        zIndex: 1000,
      }}
    >
      {results.length === 0 ? (
        <p style={{ opacity: 0.5 }}>No results...</p>
      ) : (
        results.map((movie) => (
          <div
            key={movie.id}
            onClick={() => (window.location.href = `/movie/${movie.id}`)}
            style={{
              padding: "8px",
              borderBottom: "1px solid #222",
              cursor: "pointer",
            }}
          >
            {movie.title}
          </div>
        ))
      )}
    </div>
  );
}
