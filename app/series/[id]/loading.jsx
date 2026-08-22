export default function SeriesDetailLoading() {
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

      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
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
          {/* Poster */}
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

          {/* Info */}
          <div style={{ paddingTop: "80px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[260, 160, 200, 140].map((w, i) => (
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

            {/* Season tabs skeleton */}
            <div style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
              {[70, 70, 70, 70].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: "32px",
                    width: `${w}px`,
                    borderRadius: "var(--radius-pill)",
                    background: "var(--skeleton-base)",
                    animation: `skeleton-pulse 1.5s ${i * 0.1}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Episode list skeleton */}
        <div style={{ marginTop: "3rem" }}>
          <div
            style={{
              height: "20px",
              width: "140px",
              borderRadius: "var(--radius-sm)",
              background: "var(--skeleton-base)",
              marginBottom: "1rem",
              animation: "skeleton-pulse 1.5s ease-in-out infinite",
            }}
          />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: "80px",
                borderRadius: "var(--radius-md)",
                background: "var(--skeleton-base)",
                marginBottom: "10px",
                animation: `skeleton-pulse 1.5s ${i * 0.08}s ease-in-out infinite`,
              }}
            />
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
      `}</style>
    </div>
  );
}
