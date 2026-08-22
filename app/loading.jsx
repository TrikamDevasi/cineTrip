export default function Loading() {
  return (
    <div className="container" style={{ paddingTop: "80px" }}>
      {/* Hero Skeleton */}
      <div className="skeleton" style={{ height: "70vh", width: "100%", borderRadius: "20px", marginBottom: "40px" }} />
      
      {/* Rows Skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="section" style={{ opacity: 1, transform: "none", animation: "none" }}>
          <div className="skeleton" style={{ height: "24px", width: "200px", marginBottom: "16px" }} />
          <div style={{ display: "flex", gap: "12px", overflow: "hidden" }}>
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <div key={j} className="skeleton" style={{ minWidth: "150px", height: "225px", borderRadius: "8px" }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
