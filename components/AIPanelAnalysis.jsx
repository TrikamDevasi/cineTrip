"use client";

import { useState } from "react";

export default function AIPanelAnalysis() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);

  async function handleAnalyze() {
    try {
      const res = await fetch("/api/ai/analyze", {
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
      <h2>AI Analysis</h2>

      <input
        type="text"
        placeholder="Type something..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ padding: "8px", width: "60%", marginRight: "10px" }}
      />

      <button onClick={handleAnalyze} style={{ padding: "8px 20px" }}>
        Analyze
      </button>

      {response && (
        <pre
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "#111",
            color: "#0f0",
            borderRadius: "8px",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
