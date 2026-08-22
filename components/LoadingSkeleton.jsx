export default function LoadingSkeleton() {
  return (
    <div
      style={{
        width: "100%",
        height: "200px",
        background: "#222",
        borderRadius: "8px",
        animation: "pulse 1.2s infinite",
      }}
    />
  );
}
