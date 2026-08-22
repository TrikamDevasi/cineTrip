export default function CastGrid({ cast = [] }) {
  if (!Array.isArray(cast)) return null;
  return (
    <div style={{ padding: "40px" }}>
      <h2>Cast</h2>

      <div
        style={{
          marginTop: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 120px)",
          gap: "20px",
        }}
      >
        {cast.slice(0, 12).map((actor) => (
          <div key={actor.id} style={{ textAlign: "center" }}>
            <img
              src={
                actor.profile_path
                  ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                  : "/avatar.png"
              }
              alt={actor.name}
              style={{
                width: "120px",
                height: "160px",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
            <p style={{ marginTop: "6px", fontSize: "14px" }}>
              {actor.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
