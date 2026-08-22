export default function Badge({ text }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        background: "#222",
        borderRadius: "6px",
        color: "#fff",
        marginRight: "5px",
        fontSize: "12px",
      }}
    >
      {text}
    </span>
  );
}
