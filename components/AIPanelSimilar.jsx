"use client";

import { useState } from "react";

export default function AIPanelSimilar() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);

  async function handleSimilar() {
    try {
      const res = await fetch("/api/ai/similar", {
        method: "POST",
        body: JSON.stringify({ input }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>AI Similar Movies</h2>

      <input
        type="text"
        placeholder="Enter movie name..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ padding: "8px", width: "60%", marginRight: "10px" }}
      />

      <button onClick={handleSimilar} style={{ padding: "8px 20px" }}>
        Find Similar
      </button>

      {response && (
        <pre
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "#111",
            color: "#ff0",
            borderRadius: "8px",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
