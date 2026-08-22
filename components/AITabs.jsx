"use client";

import { useState } from "react";
import AIPanelAnalysis from "./AIPanelAnalysis";
import AIPanelRecommend from "./AIPanelRecommend";
import AIPanelSimilar from "./AIPanelSimilar";

export default function AITabs() {
  const [active, setActive] = useState("analysis");

  return (
    <div style={{ padding: "30px" }}>
      <h1>AI Tools</h1>

      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <button
          onClick={() => setActive("analysis")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            background: active === "analysis" ? "#444" : "#222",
            color: "#fff",
          }}
        >
          Analysis
        </button>

        <button
          onClick={() => setActive("recommend")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            background: active === "recommend" ? "#444" : "#222",
            color: "#fff",
          }}
        >
          Recommend
        </button>

        <button
          onClick={() => setActive("similar")}
          style={{
            padding: "10px 20px",
            background: active === "similar" ? "#444" : "#222",
            color: "#fff",
          }}
        >
          Similar
        </button>
      </div>

      <div style={{ border: "1px solid #333", padding: "20px", borderRadius: "8px" }}>
        {active === "analysis" && <AIPanelAnalysis />}
        {active === "recommend" && <AIPanelRecommend />}
        {active === "similar" && <AIPanelSimilar />}
      </div>
    </div>
  );
}
