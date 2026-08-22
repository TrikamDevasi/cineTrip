"use client";
import MovieCard from "./MovieCard";

export default function SimilarMovies({ movies = [] }) {
  if (!movies || movies.length === 0) return null;

  return (
    <section className="similar-movies-section" style={{ marginTop: "4rem" }}>
      <h2 style={{ 
        fontSize: "1.5rem", 
        fontWeight: 700, 
        marginBottom: "1.5rem",
        color: "var(--color-text-primary)" 
      }}>
        Similar Movies
      </h2>

      <div className="similar-grid">
        {movies.slice(0, 12).map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>

      <style jsx>{`
        .similar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.5rem;
        }
        @media (max-width: 640px) {
          .similar-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
