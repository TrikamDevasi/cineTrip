export default function KeyboardHints() {
  return (
    <div
      style={{
        marginTop: "30px",
        padding: "10px 20px",
        background: "#111",
        borderRadius: "8px",
        color: "#aaa",
        fontSize: "14px",
      }}
    >
      <p><strong>Keyboard Shortcuts:</strong></p>
      <ul style={{ marginLeft: "20px", marginTop: "8px" }}>
        <li>Press <b>↑</b> or <b>↓</b> to scroll</li>
        <li>Press <b>/</b> to focus search</li>
        <li>Press <b>Esc</b> to close overlays</li>
      </ul>
    </div>
  );
}
