export default function MovieDetailLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        paddingTop: "80px",
        background: "var(--color-bg)",
      }}
    >
      {/* Hero skeleton */}
      <div
        style={{
          width: "100%",
          height: "65vh",
          background: "var(--skeleton-base)",
          animation: "skeleton-pulse 1.5s ease-in-out infinite",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, transparent 0%, var(--skeleton-shine) 50%, transparent 100%)",
            animation: "skeleton-shimmer 1.8s infinite",
          }}
        />
      </div>

      {/* Content skeleton */}
      <div
        className="container"
        style={{ paddingTop: "2rem", paddingBottom: "4rem" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: "2rem",
            marginTop: "-80px",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Poster skeleton */}
          <div
            style={{
              width: "200px",
              height: "300px",
              borderRadius: "var(--radius-lg)",
              background: "var(--skeleton-base)",
              animation: "skeleton-pulse 1.5s ease-in-out infinite",
              flexShrink: 0,
            }}
          />

          {/* Info skeleton */}
          <div style={{ paddingTop: "80px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[280, 180, 220, 160].map((w, i) => (
              <div
                key={i}
                style={{
                  height: i === 0 ? "32px" : "16px",
                  width: `${w}px`,
                  maxWidth: "100%",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--skeleton-base)",
                  animation: `skeleton-pulse 1.5s ${i * 0.1}s ease-in-out infinite`,
                }}
              />
            ))}
            <div style={{ display: "flex", gap: "8px", marginTop: "0.5rem" }}>
              {[80, 100, 70].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: "32px",
                    width: `${w}px`,
                    borderRadius: "var(--radius-pill)",
                    background: "var(--skeleton-base)",
                    animation: `skeleton-pulse 1.5s ${i * 0.15}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Row skeletons */}
        <div style={{ marginTop: "3rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          {[1, 2].map((row) => (
            <div key={row}>
              <div
                style={{
                  height: "20px",
                  width: "160px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--skeleton-base)",
                  marginBottom: "1rem",
                  animation: "skeleton-pulse 1.5s ease-in-out infinite",
                }}
              />
              <div style={{ display: "flex", gap: "12px", overflow: "hidden" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "130px",
                      height: "195px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--skeleton-base)",
                      flexShrink: 0,
                      animation: `skeleton-pulse 1.5s ${i * 0.08}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes skeleton-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @media (max-width: 640px) {
          .skeleton-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
